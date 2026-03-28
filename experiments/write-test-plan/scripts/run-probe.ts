#!/usr/bin/env npx tsx
/**
 * run-probe-native.ts — Run a single eval-probe task using Claude or Codex CLI.
 *
 * Supports:
 * - Claude Code CLI structured output (--json-schema)
 * - Codex CLI structured output (--output-schema)
 *
 * Usage:
 *   npx tsx scripts/run-probe-native.ts --task EC-04 --issue-body "..." \
 *     --condition treatment --out out-treatment-ec04.json
 *
 *   npx tsx scripts/run-probe-native.ts --task EC-04 \
 *     --issue-body "$(gh issue view 28 --repo Garsson-io/kaizen-test-fixture --json body -q .body)" \
 *     --condition baseline --out out.json
 */

import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { z } from "zod";
import { ProbeOutput, BehaviorOutput } from "../src/schema.js";

const LEVEL_DEFS = `
Level definitions — choose the LOWEST level that can catch a real failure:
  Unit        — one local function or object boundary, no I/O
  Integration — several modules wired together, local DB or filesystem
  System      — subprocess, OS behavior, real HTTP, or real external API call
  Agentic     — result depends on real LLM non-determinism or a real model call
  Workflow    — multiple agentic steps in sequence, or a full agent pipeline
`.trim();

const BASELINE_PROMPT = (taskId: string, issueBody: string) => `\
You are writing a test strategy for a software engineering task.

For each behavior listed in the issue below, determine what infrastructure is
actually needed to observe a real failure. Use the StructuredOutput tool to
record your answer — one entry per behavior.

Definitions for minimum_level — pick the LOWEST that applies:
  Unit        — in-process only, no I/O, pure function boundary
  Integration — needs local filesystem, real database, or wired real modules
  System      — needs subprocess, OS behavior, real HTTP, real external API
  Agentic     — outcome depends on real LLM output or model non-determinism
  Workflow    — multiple agentic steps or full pipeline in sequence

For plan_consistent: set true only if your test_description actually exercises
the minimum_level you declared (not a lower level).

Issue (task_id: ${taskId}):
---
${issueBody}`;

const TREATMENT_PROMPT = (taskId: string, issueBody: string) => `\
You are writing a test plan for a software engineering issue.

For each behavior, reason about the minimum test infrastructure needed to catch
a real failure — not just to verify happy-path logic.

${LEVEL_DEFS}

Key questions per behavior:
- Could a pure in-process mock miss this failure? If yes → at least Integration.
- Does the behavior depend on OS, real network, or real subprocess? → System.
- Does correctness depend on what a real LLM produces? → Agentic.
- Does it require multiple real agentic steps in sequence? → Workflow.

After deciding each level, self-check (plan_consistent): does your
test_description actually require that level, or would it pass at a lower one?

Issue (task_id: ${taskId}):
---
${issueBody}`;

function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = (schema as any)._def;
  const t = def?.typeName;

  const unwrap = (s: z.ZodTypeAny): { base: z.ZodTypeAny; nullable: boolean; optional: boolean } => {
    let cur: any = s;
    let nullable = false;
    let optional = false;
    while (cur?._def?.typeName === "ZodOptional" || cur?._def?.typeName === "ZodDefault" || cur?._def?.typeName === "ZodNullable") {
      const k = cur._def.typeName;
      if (k === "ZodNullable") nullable = true;
      if (k === "ZodOptional" || k === "ZodDefault") optional = true;
      cur = cur._def.innerType;
    }
    return { base: cur as z.ZodTypeAny, nullable, optional };
  };

  if (t === "ZodString") {
    const out: Record<string, unknown> = { type: "string" };
    for (const c of def.checks ?? []) {
      if (c.kind === "min") out.minLength = c.value;
      if (c.kind === "max") out.maxLength = c.value;
      if (c.kind === "regex") out.pattern = c.regex.source;
    }
    return out;
  }
  if (t === "ZodNumber") {
    const out: Record<string, unknown> = { type: "number" };
    for (const c of def.checks ?? []) {
      if (c.kind === "int") out.type = "integer";
      if (c.kind === "min") out.minimum = c.value;
      if (c.kind === "max") out.maximum = c.value;
    }
    return out;
  }
  if (t === "ZodBoolean") {
    return { type: "boolean" };
  }
  if (t === "ZodEnum") {
    return { type: "string", enum: def.values };
  }
  if (t === "ZodArray") {
    const out: Record<string, unknown> = { type: "array", items: zodToJsonSchema(def.type) };
    if (def.minLength?.value !== undefined) out.minItems = def.minLength.value;
    if (def.maxLength?.value !== undefined) out.maxItems = def.maxLength.value;
    return out;
  }
  if (t === "ZodObject") {
    const shape = def.shape();
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, childRaw] of Object.entries(shape)) {
      const child = childRaw as z.ZodTypeAny;
      const u = unwrap(child);
      const baseSchema = zodToJsonSchema(u.base);
      properties[key] = u.nullable || u.optional ? { anyOf: [baseSchema, { type: "null" }] } : baseSchema;
      // Codex output-schema requires all properties appear in required.
      required.push(key);
    }

    const out: Record<string, unknown> = {
      type: "object",
      additionalProperties: false,
      properties,
    };
    if (required.length > 0) out.required = required;
    return out;
  }

  throw new Error(`Unsupported Zod schema node in JSON schema conversion: ${String(t)}`);
}

const ProbeModelOutput = z.object({
  behaviors: z.array(BehaviorOutput).min(1).max(10),
});

const PROBE_SCHEMA = JSON.stringify(zodToJsonSchema(ProbeModelOutput));

function renderTemplate(template: string, taskId: string, issueBody: string): string {
  return template.replace(/\{\{TASK_ID\}\}/g, taskId).replace(/\{\{ISSUE_BODY\}\}/g, issueBody);
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("No output to parse");

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with fallbacks
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      // Continue with fallbacks
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const slice = trimmed.slice(start, end + 1);
    return JSON.parse(slice);
  }

  throw new Error("Could not parse JSON object from model output");
}

function runProbe(opts: {
  taskId: string;
  condition: "baseline" | "treatment";
  issueBody: string;
  model: string;
  outFile: string;
  cli: "claude" | "codex";
  promptFile?: string;
}) {
  const startedAtMs = Date.now();
  let prompt: string;
  if (opts.promptFile) {
    const template = readFileSync(opts.promptFile, "utf-8");
    prompt = renderTemplate(template, opts.taskId, opts.issueBody);
  } else {
    prompt =
      opts.condition === "baseline"
        ? BASELINE_PROMPT(opts.taskId, opts.issueBody)
        : TREATMENT_PROMPT(opts.taskId, opts.issueBody);
  }

  // Append probability instruction (measurement concern — NOT part of treatment.md)
  prompt += `\n\nFor each behavior, also provide level_probabilities: your confidence (0.0 to 1.0) that each of the 5 levels is the minimum needed to catch a real failure. The 5 values must sum to 1.0.`;

  let stdout = "";
  let structuredInput: unknown = null;
  let parserSource: "claude_structured_output" | "codex_last_message" = "claude_structured_output";

  if (opts.cli === "claude") {
    // Run claude -p with stdin piped from prompt string
    // --tools "": disable all built-in tools (Bash, Edit, Read, etc.)
    // --disable-slash-commands: remove slash commands from context
    // --strict-mcp-config: block all MCP servers (no Sentry, Linear, etc.)
    // --max-turns 1: one response only (structured output)
    const result = spawnSync("claude", [
      "-p",
      "--json-schema", PROBE_SCHEMA,
      "--output-format", "stream-json",
      "--verbose",
      "--tools", "",
      "--disable-slash-commands",
      "--strict-mcp-config",
      "--max-turns", "1",
      "--model", opts.model,
    ], {
      input: prompt,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 300_000,
    });

    stdout = result.stdout ?? "";
    if (result.error) throw new Error(`claude -p spawn failed: ${result.error.message}`);
    if (!stdout && result.status !== 0) {
      throw new Error(`claude -p exited ${result.status}: ${result.stderr?.slice(0, 500)}`);
    }

    // Extract StructuredOutput tool_use input from stream-json
    for (const line of stdout.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        if (event.type === "assistant") {
          for (const block of event.message?.content ?? []) {
            if (block.type === "tool_use" && block.name === "StructuredOutput") {
              structuredInput = block.input;
            }
          }
        }
      } catch {
        // skip non-JSON lines
      }
    }
  } else {
    // Run codex exec with JSON schema file and capture final message to file.
    // We use read-only sandbox to keep behavior deterministic for probe evals.
    const tmp = mkdtempSync(join(tmpdir(), "run-probe-codex-"));
    const schemaFile = join(tmp, "schema.json");
    const lastMessageFile = join(tmp, "last-message.txt");
    try {
      writeFileSync(schemaFile, PROBE_SCHEMA, "utf-8");
      const result = spawnSync("codex", [
        "exec",
        "--config", "model_reasoning_effort=\"medium\"",
        "--output-schema", schemaFile,
        "--output-last-message", lastMessageFile,
        "--sandbox", "read-only",
        "--model", opts.model,
        "-",
      ], {
        input: prompt,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 300_000,
      });

      stdout = result.stdout ?? "";
      if (result.error) throw new Error(`codex exec spawn failed: ${result.error.message}`);
      if (result.status !== 0) {
        throw new Error(`codex exec exited ${result.status}: ${result.stderr?.slice(0, 500)}`);
      }

      const finalMessage = existsSync(lastMessageFile)
        ? readFileSync(lastMessageFile, "utf-8")
        : stdout;
      structuredInput = extractJsonObject(finalMessage);
      parserSource = "codex_last_message";
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  // Save raw CLI output next to the parsed output for debugging
  const logFile = opts.outFile.replace(/\.json$/, ".log");
  const probeMeta = {
    type: "probe_meta",
    cli: opts.cli,
    model: opts.model,
    duration_ms: Date.now() - startedAtMs,
    parser_source: parserSource,
  };
  const logBody = stdout.length > 0 ? (stdout.endsWith("\n") ? stdout : `${stdout}\n`) : "";
  writeFileSync(logFile, `${logBody}${JSON.stringify(probeMeta)}\n`, "utf-8");

  if (!structuredInput) {
    throw new Error(`No structured JSON found in ${opts.cli} output`);
  }

  // Inject task_id and condition, then validate with Zod
  const raw = { ...(structuredInput as object), task_id: opts.taskId, condition: opts.condition };
  const parsed = ProbeOutput.parse(raw);

  writeFileSync(opts.outFile, JSON.stringify(parsed, null, 2), "utf-8");
  console.log(`✓ ${opts.taskId}/${opts.condition} → ${opts.outFile}  (${parsed.behaviors.length} behaviors)`);
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

const taskId = get("--task");
const condition = get("--condition") as "baseline" | "treatment" | undefined;
const cli = (get("--cli") ?? "claude") as "claude" | "codex";
const outFile = get("--out") ?? `out-${condition}-${taskId?.toLowerCase().replace("-", "")}.json`;
const model = get("--model") ?? (cli === "codex" ? "gpt-5.3-codex" : "claude-haiku-4-5-20251001");
const issueFile = get("--issue-file");
const promptFile = get("--prompt-file");
const issueBody = get("--issue-body") ?? (issueFile ? readFileSync(issueFile, "utf-8") : undefined);

if (!taskId || !condition || !issueBody) {
  console.error("Usage: run-probe-native.ts --task EC-04 --condition treatment --issue-body '...' [--cli claude|codex] [--out out.json] [--model ...] [--prompt-file prompts/probe-treatment.md]");
  process.exit(1);
}
if (!["baseline", "treatment"].includes(condition)) {
  console.error("--condition must be 'baseline' or 'treatment'");
  process.exit(1);
}
if (!["claude", "codex"].includes(cli)) {
  console.error("--cli must be 'claude' or 'codex'");
  process.exit(1);
}
if (promptFile && !existsSync(promptFile)) {
  console.error(`--prompt-file not found: ${promptFile}`);
  process.exit(1);
}

runProbe({ taskId, condition, issueBody, model, outFile, cli, promptFile });
