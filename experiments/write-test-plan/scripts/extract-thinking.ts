#!/usr/bin/env npx tsx
/**
 * extract-thinking.ts — Extract thinking blocks and justifications from probe logs + outputs.
 *
 * Pairs each behavior's structured output (justification, predicted level) with the
 * model's internal thinking from the .log file. Flags self-aware cases where thinking
 * contains correct reasoning the model overrides.
 *
 * Usage:
 *   npx tsx scripts/extract-thinking.ts                    # latest run, all tasks
 *   npx tsx scripts/extract-thinking.ts --run 20260328-150512
 *   npx tsx scripts/extract-thinking.ts --task EC-04       # one task
 *   npx tsx scripts/extract-thinking.ts --self-aware-only  # only show contradictions
 *   npx tsx scripts/extract-thinking.ts --json             # machine-readable
 *   npx tsx scripts/extract-thinking.ts --taxonomy-lines   # output ready to append to taxonomy/
 */

import { readdirSync, readFileSync, existsSync, realpathSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { PATHS, getRunDir } from "./paths.js";
import { LEVELS } from "../src/schema.js";
import { LEVEL_WEIGHTS, serializeEntry, type TaxonomyEntry } from "./taxonomy-schema.js";

interface BehaviorThinking {
  task: string;
  behavior_id: number;
  predicted: string;
  gt: string | null;
  direction: "correct" | "under" | "over" | "unknown";
  justification: string;
  thinking_excerpt: string;
  self_aware: boolean;
  self_aware_evidence: string | null;
}

const AGENTIC_KEYWORDS = [
  "non-deterministic", "nondeterministic", "varies", "vary", "different results",
  "real model", "real LLM", "real AI", "model output", "LLM output",
  "mock would hide", "mock would mask", "mock returns the same",
  "mock always returns", "mock can't catch", "mock cannot catch",
  "agentic", "model variability", "model non-determinism",
];
const WORKFLOW_KEYWORDS = [
  "multiple steps", "multi-step", "pipeline", "sequence of", "chain of",
  "step depends on", "feeds into", "output of step",
];

export function extractThinkingFromLog(logPath: string): string {
  if (!existsSync(logPath)) return "";
  const content = readFileSync(logPath, "utf8");
  const blocks: string[] = [];

  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line);
      if (e.type === "assistant") {
        for (const b of e.message?.content ?? []) {
          if (b.type === "thinking" && b.thinking) {
            blocks.push(b.thinking);
          }
        }
      }
    } catch { /* skip */ }
  }

  return blocks.join("\n\n");
}

export function extractBehaviorThinking(
  thinking: string,
  behaviorId: number,
  behaviorDesc: string,
): string {
  // Try to find the section about this specific behavior
  const lines = thinking.split("\n");
  const patterns = [
    new RegExp(`\\b${behaviorId}\\b.*?\\b(behavior|test|level|minimum)`, "i"),
    new RegExp(`\\*\\*.*?${behaviorId}`, "i"),
    new RegExp(`Behavior\\s*${behaviorId}`, "i"),
    new RegExp(behaviorDesc.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
  ];

  let startIdx = -1;
  for (const pattern of patterns) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        startIdx = i;
        break;
      }
    }
    if (startIdx >= 0) break;
  }

  if (startIdx < 0) return "(behavior not found in thinking)";

  // Grab lines until the next behavior section or end
  const nextBehaviorPattern = /^\s*(\d+\.|##|\*\*\d)/;
  let endIdx = startIdx + 1;
  while (endIdx < lines.length && endIdx < startIdx + 30) {
    if (endIdx > startIdx + 2 && nextBehaviorPattern.test(lines[endIdx])) break;
    endIdx++;
  }

  return lines.slice(startIdx, endIdx).join("\n").trim();
}

export function checkSelfAware(
  thinkingExcerpt: string,
  predicted: string,
  gt: string | null,
): { selfAware: boolean; evidence: string | null } {
  if (!gt || predicted === gt) return { selfAware: false, evidence: null };

  const gtIdx = LEVELS.indexOf(gt as (typeof LEVELS)[number]);
  const predIdx = LEVELS.indexOf(predicted as (typeof LEVELS)[number]);
  if (predIdx >= gtIdx) return { selfAware: false, evidence: null }; // over-predicted, not under

  const lower = thinkingExcerpt.toLowerCase();

  // Check if thinking mentions the correct level or its characteristics
  const keywords = gt === "Agentic" ? AGENTIC_KEYWORDS
    : gt === "Workflow" ? WORKFLOW_KEYWORDS
    : [];

  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      // Find the sentence containing the keyword
      const sentences = thinkingExcerpt.split(/[.!?]\s/);
      const match = sentences.find((s) => s.toLowerCase().includes(kw.toLowerCase()));
      return { selfAware: true, evidence: match?.trim() || kw };
    }
  }

  // Also check if thinking explicitly mentions the GT level
  if (lower.includes(gt.toLowerCase())) {
    const sentences = thinkingExcerpt.split(/[.!?]\s/);
    const match = sentences.find((s) => s.toLowerCase().includes(gt.toLowerCase()));
    return { selfAware: true, evidence: match?.trim() || gt };
  }

  return { selfAware: false, evidence: null };
}

export function loadGT(taskId: string): Record<number, string> {
  const gtPath = join(PATHS.groundTruth, `${taskId.toLowerCase().replace("-", "-")}.json`);
  if (!existsSync(gtPath)) return {};
  const data = JSON.parse(readFileSync(gtPath, "utf8"));
  const map: Record<number, string> = {};
  for (const b of data.behaviors ?? []) {
    map[b.behavior_id] = b.ground_truth_level;
  }
  return map;
}

export function getDirection(predicted: string, gt: string): "correct" | "under" | "over" {
  if (predicted === gt) return "correct";
  const predIdx = LEVELS.indexOf(predicted as (typeof LEVELS)[number]);
  const gtIdx = LEVELS.indexOf(gt as (typeof LEVELS)[number]);
  return predIdx < gtIdx ? "under" : "over";
}

export function processRun(runDir: string): BehaviorThinking[] {
  const results: BehaviorThinking[] = [];
  const files = readdirSync(runDir).filter((f) => f.endsWith(".json")).sort();

  for (const jsonFile of files) {
    const taskMatch = jsonFile.match(/out-\w+-(ec\d+)\.json/);
    if (!taskMatch) continue;
    const taskId = taskMatch[1].toUpperCase().replace(/(\d+)/, "-$1");

    const outputPath = join(runDir, jsonFile);
    const logPath = outputPath.replace(/\.json$/, ".log");

    const output = JSON.parse(readFileSync(outputPath, "utf8"));
    const thinking = extractThinkingFromLog(logPath);
    const gt = loadGT(taskId);

    for (const b of output.behaviors ?? []) {
      const thinkingExcerpt = extractBehaviorThinking(thinking, b.behavior_id, b.description ?? "");
      const gtLevel = gt[b.behavior_id] ?? null;
      const direction = gtLevel ? getDirection(b.minimum_level, gtLevel) : "unknown";
      const { selfAware, evidence } = checkSelfAware(thinkingExcerpt, b.minimum_level, gtLevel);

      results.push({
        task: taskId,
        behavior_id: b.behavior_id,
        predicted: b.minimum_level,
        gt: gtLevel,
        direction,
        justification: b.justification ?? "",
        thinking_excerpt: thinkingExcerpt,
        self_aware: selfAware,
        self_aware_evidence: evidence,
      });
    }
  }

  return results;
}

const ROW_WEIGHT: Record<string, number> = {
  Unit: 1, Integration: 2, System: 3, Agentic: 4, Workflow: 4,
};

function printTable(results: BehaviorThinking[], selfAwareOnly: boolean, runLabel: string) {
  const filtered = selfAwareOnly ? results.filter((r) => r.self_aware) : results.filter((r) => r.direction !== "correct");

  if (filtered.length === 0) {
    console.log(selfAwareOnly ? "No self-aware contradictions found." : "All predictions correct.");
    return;
  }

  // Sort by GT level weight descending — highest-impact errors first
  const sorted = [...filtered].sort((a, b) => {
    const wa = ROW_WEIGHT[a.gt ?? "Unit"] ?? 1;
    const wb = ROW_WEIGHT[b.gt ?? "Unit"] ?? 1;
    return wb - wa;
  });

  const HIGH_IMPACT_THRESHOLD = 10;
  console.log(`\nERRORS SORTED BY WEIGHT — read each justification and thinking excerpt:\n`);

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    const weight = ROW_WEIGHT[r.gt ?? "Unit"] ?? 1;
    const arrow = `${r.predicted}→${r.gt}`;
    const flag = r.self_aware ? " ⚠ SELF-AWARE" : "";
    const impact = i < HIGH_IMPACT_THRESHOLD ? ` [w=${weight} HIGH IMPACT]` : ` [w=${weight}]`;
    console.log(`\n${r.task} b${r.behavior_id} (${arrow})${impact}${flag}`);
    // Full justification for high-impact errors, truncated for the rest
    const justTrunc = i < HIGH_IMPACT_THRESHOLD ? 400 : 200;
    const thinkTrunc = i < HIGH_IMPACT_THRESHOLD ? 500 : 250;
    console.log(`  Justification: "${r.justification.slice(0, justTrunc)}"`);
    if (r.self_aware && r.self_aware_evidence) {
      console.log(`  Thinking KNEW: "${r.self_aware_evidence.slice(0, thinkTrunc)}"`);
    }
    if (!r.self_aware && r.thinking_excerpt !== "(behavior not found in thinking)") {
      console.log(`  Thinking: "${r.thinking_excerpt.slice(0, thinkTrunc)}"`);
    }
  }

  const saCount = filtered.filter((r) => r.self_aware).length;
  // Aggregate summary at END so agents must read behaviors before seeing totals
  console.log(`\n--- Run: ${runLabel} — ${results.length} behaviors, ${filtered.length} errors, ${saCount} self-aware ---`);
}

function printTaxonomyLines(results: BehaviorThinking[], runLabel: string) {
  const errors = results.filter((r) => r.direction !== "correct");

  for (const r of errors) {
    if (!r.gt) continue;
    const thinkText = r.self_aware && r.self_aware_evidence
      ? r.self_aware_evidence
      : r.thinking_excerpt;
    const entry: TaxonomyEntry = {
      run: runLabel,
      task: r.task,
      b: r.behavior_id,
      pred: r.predicted as TaxonomyEntry["pred"],
      gt: r.gt as TaxonomyEntry["gt"],
      w: LEVEL_WEIGHTS[r.gt as keyof typeof LEVEL_WEIGHTS] ?? 1,
      j: r.justification,
      ...(thinkText && thinkText !== "(behavior not found in thinking)" ? { t: thinkText } : {}),
      ...(r.self_aware ? { sa: true } : {}),
    };
    console.log(serializeEntry(entry));
  }
}

function main() {
const args = process.argv.slice(2);
const runArg = args.includes("--run-dir") ? args[args.indexOf("--run-dir") + 1]
             : args.includes("--run") ? args[args.indexOf("--run") + 1]
             : undefined;
const taskFilter = args.includes("--task") ? args[args.indexOf("--task") + 1]?.toUpperCase() : undefined;
const selfAwareOnly = args.includes("--self-aware-only");
const jsonOut = args.includes("--json");
const taxonomyLines = args.includes("--taxonomy-lines");

if (!runArg) {
  console.error("Error: --run-dir <timestamp> is required. Example: npx tsx scripts/extract-thinking.ts --run-dir 20260328-155121");
  process.exit(1);
}

const runDir = getRunDir(runArg);

if (!existsSync(runDir)) {
  console.error(`Run directory not found: ${runDir}`);
  process.exit(1);
}

const runDirName = basename(existsSync(join(runDir, ".")) ? realpathSync(runDir) : runDir);
let results = processRun(runDir);

if (taskFilter) {
  results = results.filter((r) => r.task === taskFilter || r.task === `EC-${taskFilter.replace("EC-", "")}`);
}

if (jsonOut) {
  console.log(JSON.stringify(results, null, 2));
} else if (taxonomyLines) {
  printTaxonomyLines(results, `run-${runDirName.slice(-6)}`);
} else {
  printTable(results, selfAwareOnly, runDirName);
}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
