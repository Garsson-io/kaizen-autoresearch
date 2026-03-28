#!/usr/bin/env npx tsx
/**
 * run-stats.ts — Parse .log files from a run and report cost/time/token stats.
 *
 * Usage:
 *   npx tsx scripts/run-stats.ts                        # latest run
 *   npx tsx scripts/run-stats.ts --run 20260328-142302  # specific run
 *   npx tsx scripts/run-stats.ts --all                  # all runs, one summary per run
 *   npx tsx scripts/run-stats.ts --json                 # JSON output
 */

import { readdirSync, readFileSync, existsSync, appendFileSync, realpathSync } from "fs";
import { join, basename } from "path";

interface ProbeStats {
  task: string;
  duration_s: number;
  cost_usd: number;
  input_tokens: number;
  cache_read_tokens: number;
  cache_create_tokens: number;
  output_tokens: number;
  total_input: number;
  num_turns: number;
  tools_available: number;
  tools_used: string[];
  mcp_servers: number;
  slash_commands: number;
  stop_reason: string;
  model: string;
}

interface RunSummary {
  run_dir: string;
  probes: number;
  total_duration_s: number;
  total_cost_usd: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_duration_s: number;
  avg_cost_usd: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  model: string;
  tools_available: number;
  mcp_servers: number;
}

function parseLog(logPath: string): ProbeStats | null {
  const content = readFileSync(logPath, "utf8");
  const lines = content.split("\n").filter((l) => l.trim());

  let stats: Partial<ProbeStats> = {
    task: basename(logPath, ".log").replace("out-treatment-", "").replace("out-baseline-", "").toUpperCase(),
    tools_used: [],
  };

  for (const line of lines) {
    try {
      const e = JSON.parse(line);

      if (e.type === "system") {
        stats.tools_available = e.tools?.length ?? 0;
        stats.mcp_servers = e.mcp_servers?.length ?? 0;
        stats.slash_commands = e.slash_commands?.length ?? 0;
        stats.model = e.model ?? "unknown";
      }

      if (e.type === "assistant") {
        for (const block of e.message?.content ?? []) {
          if (block.type === "tool_use" && block.name !== "StructuredOutput") {
            stats.tools_used!.push(block.name);
          }
        }
      }

      if (e.type === "result") {
        stats.duration_s = (e.duration_ms ?? 0) / 1000;
        stats.cost_usd = e.total_cost_usd ?? 0;
        stats.num_turns = e.num_turns ?? 0;
        stats.stop_reason = e.stop_reason ?? "unknown";
        const u = e.usage ?? {};
        stats.input_tokens = u.input_tokens ?? 0;
        stats.cache_read_tokens = u.cache_read_input_tokens ?? 0;
        stats.cache_create_tokens = u.cache_creation_input_tokens ?? 0;
        stats.output_tokens = u.output_tokens ?? 0;
        stats.total_input = stats.input_tokens + stats.cache_read_tokens + stats.cache_create_tokens;
      }
    } catch {
      // skip non-JSON lines
    }
  }

  if (stats.duration_s === undefined) return null;
  return stats as ProbeStats;
}

function getRunDir(runsBase: string, runName?: string): string {
  if (runName) return join(runsBase, runName);
  // Follow latest symlink
  const latest = join(runsBase, "latest");
  if (existsSync(latest)) return latest;
  // Fall back to most recent timestamped dir
  const dirs = readdirSync(runsBase).filter((d) => /^\d{8}-\d{6}$/.test(d)).sort();
  return join(runsBase, dirs[dirs.length - 1]);
}

function printProbeTable(probes: ProbeStats[]) {
  console.log(
    `${"TASK".padEnd(8)} ${"TIME".padStart(6)} ${"COST".padStart(7)} ${"IN".padStart(7)} ${"CACHED".padStart(7)} ${"OUT".padStart(7)} ${"TURNS".padStart(5)} ${"TOOLS".padStart(5)} ${"MCP".padStart(4)} EXTRA TOOLS`
  );
  console.log("-".repeat(90));

  for (const p of probes) {
    const extra = p.tools_used.length > 0 ? p.tools_used.join(", ") : "-";
    console.log(
      `${p.task.padEnd(8)} ${(p.duration_s.toFixed(0) + "s").padStart(6)} ${("$" + p.cost_usd.toFixed(3)).padStart(7)} ${String(p.total_input).padStart(7)} ${String(p.cache_read_tokens).padStart(7)} ${String(p.output_tokens).padStart(7)} ${String(p.num_turns).padStart(5)} ${String(p.tools_available).padStart(5)} ${String(p.mcp_servers).padStart(4)} ${extra}`
    );
  }
}

function printSummary(probes: ProbeStats[], runDir: string) {
  const totalTime = probes.reduce((s, p) => s + p.duration_s, 0);
  const totalCost = probes.reduce((s, p) => s + p.cost_usd, 0);
  const totalIn = probes.reduce((s, p) => s + p.total_input, 0);
  const totalOut = probes.reduce((s, p) => s + p.output_tokens, 0);
  const totalCached = probes.reduce((s, p) => s + p.cache_read_tokens, 0);

  console.log("");
  console.log(`=== Run: ${basename(runDir)} (${probes.length} probes) ===`);
  console.log(`Total time:   ${totalTime.toFixed(0)}s (${(totalTime / 60).toFixed(1)}min)`);
  console.log(`Total cost:   $${totalCost.toFixed(3)}`);
  console.log(`Total input:  ${totalIn} tokens (${totalCached} cached, ${((totalCached / totalIn) * 100).toFixed(0)}% cache hit)`);
  console.log(`Total output: ${totalOut} tokens`);
  console.log(`Avg per probe: ${(totalTime / probes.length).toFixed(0)}s, $${(totalCost / probes.length).toFixed(4)}, ${Math.round(totalIn / probes.length)} in, ${Math.round(totalOut / probes.length)} out`);
  if (probes[0]?.model) console.log(`Model: ${probes[0].model}`);
  if (probes[0]?.tools_available !== undefined) console.log(`Tools available: ${probes[0].tools_available}, MCP servers: ${probes[0].mcp_servers ?? 0}`);

  // Flag any probes that used extra tools (not StructuredOutput)
  const withExtraTools = probes.filter((p) => p.tools_used.length > 0);
  if (withExtraTools.length > 0) {
    console.log(`\n⚠ ${withExtraTools.length} probes used extra tools:`);
    for (const p of withExtraTools) {
      console.log(`  ${p.task}: ${p.tools_used.join(", ")}`);
    }
  }
}

// Main
import { PATHS } from "./paths";
const runsBase = PATHS.runs;

function buildSummary(probes: ProbeStats[], runDirName: string): RunSummary {
  return {
    run_dir: runDirName,
    probes: probes.length,
    total_duration_s: probes.reduce((s, p) => s + p.duration_s, 0),
    total_cost_usd: probes.reduce((s, p) => s + p.cost_usd, 0),
    total_input_tokens: probes.reduce((s, p) => s + p.total_input, 0),
    total_output_tokens: probes.reduce((s, p) => s + p.output_tokens, 0),
    avg_duration_s: probes.reduce((s, p) => s + p.duration_s, 0) / probes.length,
    avg_cost_usd: probes.reduce((s, p) => s + p.cost_usd, 0) / probes.length,
    avg_input_tokens: probes.reduce((s, p) => s + p.total_input, 0) / probes.length,
    avg_output_tokens: probes.reduce((s, p) => s + p.output_tokens, 0) / probes.length,
    model: probes[0]?.model ?? "unknown",
    tools_available: probes[0]?.tools_available ?? 0,
    mcp_servers: probes[0]?.mcp_servers ?? 0,
  };
}

const args = process.argv.slice(2);
const runArg = args.includes("--run") ? args[args.indexOf("--run") + 1] : undefined;
const showAll = args.includes("--all");
const jsonOut = args.includes("--json");
const appendLog = args.includes("--append-log");

// --append-log: parse latest run, append one JSON line to run-stats.jsonl, print summary
if (appendLog) {
  const runDir = getRunDir(runsBase, runArg);
  const runDirName = basename(realpathSync(runDir));
  const logs = readdirSync(runDir).filter((f) => f.endsWith(".log")).sort();

  if (logs.length === 0) {
    console.error(`No .log files in ${runDir} — skipping stats`);
    process.exit(0);
  }

  const probes = logs.map((f) => parseLog(join(runDir, f))).filter(Boolean) as ProbeStats[];
  if (probes.length === 0) {
    console.error(`No parseable logs in ${runDir} — skipping stats`);
    process.exit(0);
  }

  const summary = buildSummary(probes, runDirName);
  const logPath = join(PATHS.runs, "..", "run-stats.jsonl");
  appendFileSync(logPath, JSON.stringify(summary) + "\n");

  printSummary(probes, runDir);
  console.log(`\n→ Appended to run-stats.jsonl`);
  process.exit(0);
}

if (showAll) {
  const dirs = readdirSync(runsBase).filter((d) => /^\d{8}-\d{6}$/.test(d)).sort();
  const summaries: RunSummary[] = [];

  for (const dir of dirs) {
    const runPath = join(runsBase, dir);
    const logs = readdirSync(runPath).filter((f) => f.endsWith(".log"));
    const probes = logs.map((f) => parseLog(join(runPath, f))).filter(Boolean) as ProbeStats[];
    if (probes.length === 0) continue;

    if (jsonOut) {
      summaries.push(buildSummary(probes, dir));
    } else {
      printSummary(probes, runPath);
    }
  }

  if (jsonOut) console.log(JSON.stringify(summaries, null, 2));
} else {
  const runDir = getRunDir(runsBase, runArg);
  const logs = readdirSync(runDir).filter((f) => f.endsWith(".log")).sort();

  if (logs.length === 0) {
    console.error(`No .log files found in ${runDir}`);
    process.exit(1);
  }

  const probes = logs.map((f) => parseLog(join(runDir, f))).filter(Boolean) as ProbeStats[];

  if (jsonOut) {
    console.log(JSON.stringify(probes, null, 2));
  } else {
    printProbeTable(probes);
    printSummary(probes, runDir);
  }
}
