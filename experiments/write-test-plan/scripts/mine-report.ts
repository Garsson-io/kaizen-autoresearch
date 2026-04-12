#!/usr/bin/env npx tsx
/**
 * mine-report.ts — One-command comprehensive mining report.
 *
 * Four sections:
 *   1. LOSS BREAKDOWN  — by confusion pair, Δ vs baseline and previous run
 *   2. BEHAVIORAL DIFF — what changed between current and previous run
 *   3. CROSS-RUN PERSISTENCE — which behaviors are wrong across most runs
 *   4. MINE DIGEST TEMPLATE — pre-filled with quotes, ready to complete before IDEATE
 *
 * Usage:
 *   npx tsx scripts/mine-report.ts                     # latest run
 *   npx tsx scripts/mine-report.ts --run-dir 20260330-200818
 *   npx tsx scripts/mine-report.ts --history N         # N recent runs for persistence (default 8)
 */

import { readdirSync, readFileSync, existsSync, realpathSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { PATHS, getRunDir } from "./paths.js";
import {
  loadGT,
  getDirection,
  extractThinkingFromLog,
  extractBehaviorThinking,
} from "./extract-thinking.js";
import { ROW_WEIGHT, computeCrossEntropyLoss } from "./score.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BehaviorRecord {
  task: string;
  bid: number;
  predicted: string;
  gt: string | null;
  direction: "correct" | "under" | "over" | "unknown";
  justification: string;
  level_probs: Record<string, number> | null;
  thinking_excerpt?: string;
}

interface IterRecord {
  iteration: number;
  run_dir: string | null;
  status: string;
  loss: number | null;
}

function getPredictedLevel(b: { required_reality_check_level?: string; minimum_level?: string; behavior_id: number }): string {
  const level = b.required_reality_check_level ?? b.minimum_level;
  if (!level) throw new Error(`Missing required_reality_check_level for behavior_id ${b.behavior_id}`);
  return level;
}

// ─── Loaders ──────────────────────────────────────────────────────────────────

function loadIterations(): IterRecord[] {
  if (!existsSync(PATHS.results)) return [];
  return readFileSync(PATHS.results, "utf8")
    .split("\n").filter(Boolean)
    .map(l => JSON.parse(l) as IterRecord);
}

function loadRun(runDir: string, includeThinking = false): BehaviorRecord[] {
  if (!existsSync(runDir)) return [];
  const files = readdirSync(runDir).filter(f => f.endsWith(".json")).sort();
  const records: BehaviorRecord[] = [];

  for (const file of files) {
    const m = file.match(/out-\w+-(ec\d+)\.json$/);
    if (!m) continue;
    const taskId = m[1].toUpperCase().replace(/(\d+)/, "-$1");
    const outputPath = join(runDir, file);
    let output: { behaviors?: any[] };
    try { output = JSON.parse(readFileSync(outputPath, "utf8")); } catch { continue; }
    const gt = loadGT(taskId);

    let thinking = "";
    if (includeThinking) {
      const logPath = outputPath.replace(/\.json$/, ".log");
      thinking = extractThinkingFromLog(logPath);
    }

    for (const b of output.behaviors ?? []) {
      const predLevel = getPredictedLevel(b);
      const gtLevel = gt[b.behavior_id] ?? null;
      const direction = gtLevel ? getDirection(predLevel, gtLevel) : "unknown";
      const rec: BehaviorRecord = {
        task: taskId,
        bid: b.behavior_id,
        predicted: predLevel,
        gt: gtLevel,
        direction,
        justification: b.justification ?? "",
        level_probs: b.level_probabilities ?? null,
      };
      if (includeThinking && thinking) {
        const excerpt = extractBehaviorThinking(thinking, b.behavior_id, b.description ?? "");
        if (excerpt && excerpt !== "(behavior not found in thinking)") {
          rec.thinking_excerpt = excerpt;
        }
      }
      records.push(rec);
    }
  }
  return records;
}

// ─── Loss computation ─────────────────────────────────────────────────────────

function lossFor(r: BehaviorRecord): number {
  if (!r.gt) return 0;
  const w = ROW_WEIGHT[r.gt] ?? 1;
  const { ceLoss } = computeCrossEntropyLoss(r.level_probs, r.gt, w);
  return ceLoss;
}

function totalLoss(records: BehaviorRecord[]): number {
  return records.reduce((s, r) => s + lossFor(r), 0);
}

function bkey(r: BehaviorRecord): string {
  return `${r.task}_b${r.bid}`;
}

// ─── Section printers ─────────────────────────────────────────────────────────

function divider(title: string) {
  const pad = Math.max(0, 68 - title.length);
  console.log(`\n${"─".repeat(3)} ${title} ${"─".repeat(pad)}`);
}

function printLossBreakdown(
  current: BehaviorRecord[],
  baseline: BehaviorRecord[],
  prev: BehaviorRecord[],
  labels: { baseline: string; prev: string },
) {
  divider("LOSS BREAKDOWN BY CONFUSION PAIR");

  const pairLoss = (records: BehaviorRecord[]) => {
    const m = new Map<string, number>();
    for (const r of records) {
      if (!r.gt) continue;
      const key = r.direction === "correct" ? "✓correct" : `${r.predicted}→${r.gt}`;
      m.set(key, (m.get(key) ?? 0) + lossFor(r));
    }
    return m;
  };
  const pairCount = (records: BehaviorRecord[]) => {
    const m = new Map<string, number>();
    for (const r of records) {
      if (!r.gt || r.direction === "correct") continue;
      const key = `${r.predicted}→${r.gt}`;
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  };

  const curLossMap = pairLoss(current);
  const baseLossMap = baseline.length ? pairLoss(baseline) : null;
  const prevLossMap = prev.length ? pairLoss(prev) : null;
  const curCountMap = pairCount(current);

  const curTotal = totalLoss(current);
  const baseTotal = baseline.length ? totalLoss(baseline) : null;
  const prevTotal = prev.length ? totalLoss(prev) : null;

  const dBase = baseTotal !== null ? ` | Δbaseline: ${(curTotal - baseTotal) >= 0 ? "+" : ""}${(curTotal - baseTotal).toFixed(2)}` : "";
  const dPrev = prevTotal !== null ? ` | Δprev (${labels.prev.slice(-6)}): ${(curTotal - prevTotal) >= 0 ? "+" : ""}${(curTotal - prevTotal).toFixed(2)}` : "";
  console.log(`\nTotal loss: ${curTotal.toFixed(2)}${dBase}${dPrev}`);
  if (baseTotal !== null) console.log(`Baseline (${labels.baseline.slice(-6)}): ${baseTotal.toFixed(2)}`);

  const allPairs = [...new Set([...curCountMap.keys(), ...(baseLossMap ? [...baseLossMap.keys()].filter(k => k !== "✓correct") : [])])];
  const sorted = allPairs.sort((a, b) => (curLossMap.get(b) ?? 0) - (curLossMap.get(a) ?? 0));

  console.log();
  console.log(`  ${"Pair".padEnd(26)} ${"Cnt".padStart(4)} ${"Loss".padStart(8)} ${"Δbaseline".padStart(11)} ${"Δprev".padStart(8)}`);
  console.log(`  ${"-".repeat(60)}`);
  for (const pair of sorted) {
    const cnt = curCountMap.get(pair) ?? 0;
    const cl = curLossMap.get(pair) ?? 0;
    const bl = baseLossMap?.get(pair) ?? 0;
    const pl = prevLossMap?.get(pair) ?? 0;
    const db = baseLossMap ? `${(cl - bl) >= 0 ? "+" : ""}${(cl - bl).toFixed(1)}` : "—";
    const dp = prevLossMap ? `${(cl - pl) >= 0 ? "+" : ""}${(cl - pl).toFixed(1)}` : "—";
    console.log(`  ${pair.padEnd(26)} ${String(cnt).padStart(4)} ${cl.toFixed(1).padStart(8)} ${db.padStart(11)} ${dp.padStart(8)}`);
  }
}

function printBehavioralDiff(
  current: BehaviorRecord[],
  prev: BehaviorRecord[],
  prevLabel: string,
) {
  divider(`BEHAVIORAL DIFF — current vs ${prevLabel.slice(-6) || "previous"}`);

  if (prev.length === 0) {
    console.log("\n  (no previous run available for diff)");
    return;
  }

  const prevMap = new Map(prev.map(r => [bkey(r), r]));

  const regressions: Array<{ cur: BehaviorRecord; was: string }> = [];
  const improvements: Array<{ cur: BehaviorRecord; was: string }> = [];

  for (const cur of current) {
    const p = prevMap.get(bkey(cur));
    if (!p) continue;
    if (p.direction === "correct" && cur.direction !== "correct") {
      regressions.push({ cur, was: "correct" });
    } else if (p.direction !== "correct" && cur.direction === "correct") {
      improvements.push({ cur, was: `${p.predicted}→${p.gt}` });
    }
  }

  const persistent = current.filter(r => {
    const p = prevMap.get(bkey(r));
    return r.direction !== "correct" && p && p.direction !== "correct";
  });

  const byWeight = (a: BehaviorRecord, b: BehaviorRecord) =>
    (ROW_WEIGHT[b.gt ?? "Unit"] ?? 1) - (ROW_WEIGHT[a.gt ?? "Unit"] ?? 1);

  console.log(`\n  NEW REGRESSIONS (${regressions.length} — were correct, now wrong):`);
  if (regressions.length === 0) {
    console.log("    none");
  } else {
    for (const { cur } of [...regressions].sort((a, b) => byWeight(a.cur, b.cur))) {
      const w = ROW_WEIGHT[cur.gt ?? "Unit"] ?? 1;
      console.log(`    ${cur.task} b${cur.bid} (${cur.predicted}→${cur.gt}) [w=${w}]`);
      console.log(`      "${cur.justification.slice(0, 180)}"`);
    }
  }

  console.log(`\n  NEW IMPROVEMENTS (${improvements.length} — were wrong, now correct):`);
  if (improvements.length === 0) {
    console.log("    none");
  } else {
    for (const { cur, was } of [...improvements].sort((a, b) => byWeight(a.cur, b.cur))) {
      const w = ROW_WEIGHT[cur.gt ?? "Unit"] ?? 1;
      console.log(`    ${cur.task} b${cur.bid} [w=${w}]: was ${was} → now correct`);
    }
  }

  console.log(`\n  PERSISTENT ERRORS: ${persistent.length} behaviors wrong in both runs`);

  // Show net loss change from diff
  const regressLoss = regressions.reduce((s, { cur }) => s + lossFor(cur), 0);
  const improveLoss = improvements.reduce((s, { cur }) => {
    // What was the loss in prev? Approximate from improvement
    return s + lossFor(cur); // cur is now correct, so this is near-zero; compare against prev loss
  }, 0);
  const netEffect = regressLoss > 0 || improvements.length > 0
    ? `  Net: regressions added ${regressLoss.toFixed(1)} loss, improvements removed ~${improvements.length} errors`
    : "";
  if (netEffect) console.log(`\n${netEffect}`);
}

function printCrossRunPersistence(
  histRuns: Array<{ label: string; records: BehaviorRecord[] }>,
  current: BehaviorRecord[],
) {
  const N = histRuns.length;
  divider(`CROSS-RUN PERSISTENCE — last ${N} runs`);

  if (N === 0) {
    console.log("\n  (no historical runs available)");
    return;
  }

  const wrongCounts = new Map<string, number>();
  for (const { records } of histRuns) {
    for (const r of records) {
      if (r.direction !== "correct" && r.direction !== "unknown") {
        wrongCounts.set(bkey(r), (wrongCounts.get(bkey(r)) ?? 0) + 1);
      }
    }
  }

  const errors = current.filter(r => r.direction !== "correct" && r.gt);
  const annotated = errors.map(r => ({
    r,
    wrongN: wrongCounts.get(bkey(r)) ?? 0,
    w: ROW_WEIGHT[r.gt ?? "Unit"] ?? 1,
  })).sort((a, b) => {
    const fa = a.wrongN / N, fb = b.wrongN / N;
    if (Math.abs(fa - fb) > 0.01) return fb - fa;
    return b.w - a.w;
  });

  const always = annotated.filter(x => x.wrongN === N);
  const high = annotated.filter(x => x.wrongN < N && x.wrongN / N >= 0.5);
  const volatile_ = annotated.filter(x => x.wrongN / N < 0.5 && x.wrongN > 0);
  const newErrors = annotated.filter(x => x.wrongN === 0);

  function printGroup(items: typeof annotated, limit: number) {
    for (const { r, wrongN, w } of items.slice(0, limit)) {
      console.log(`    ${r.task} b${r.bid} (${r.predicted}→${r.gt}) [w=${w}, ${wrongN}/${N} runs wrong]`);
      console.log(`      "${r.justification.slice(0, 200)}"`);
    }
    if (items.length > limit) console.log(`    ... and ${items.length - limit} more`);
  }

  console.log(`\n  ALWAYS WRONG (${always.length}) — core problem, no treatment has fixed these:`);
  if (always.length === 0) console.log("    none (good!)");
  else printGroup(always, 12);

  if (high.length > 0) {
    console.log(`\n  HIGH PERSISTENCE ≥50% (${high.length}):`);
    printGroup(high, 6);
  }

  if (volatile_.length > 0) {
    console.log(`\n  VOLATILE <50% (${volatile_.length}) — sensitive to treatments, sometimes fixable:`);
    printGroup(volatile_, 4);
  }

  if (newErrors.length > 0) {
    console.log(`\n  NEW THIS RUN (${newErrors.length}) — not seen in previous ${N} runs:`);
    printGroup(newErrors, 4);
  }
}

function printMineDigestTemplate(
  current: BehaviorRecord[],
  histRuns: Array<{ records: BehaviorRecord[] }>,
) {
  divider("MINE DIGEST TEMPLATE — complete this, then paste into IDEATE as {REASONING_PATTERNS}");

  const N = histRuns.length;
  const wrongCounts = new Map<string, number>();
  for (const { records } of histRuns) {
    for (const r of records) {
      if (r.direction !== "correct") {
        wrongCounts.set(bkey(r), (wrongCounts.get(bkey(r)) ?? 0) + 1);
      }
    }
  }

  const errors = current.filter(r => r.direction !== "correct" && r.gt);
  const sorted = [...errors].sort((a, b) =>
    (ROW_WEIGHT[b.gt ?? "Unit"] ?? 1) - (ROW_WEIGHT[a.gt ?? "Unit"] ?? 1),
  ).slice(0, 12);

  console.log("\nMINE DIGEST:");
  for (const r of sorted) {
    const w = ROW_WEIGHT[r.gt ?? "Unit"] ?? 1;
    const wrongN = wrongCounts.get(bkey(r)) ?? 0;
    const persist = N > 0 ? `, ${wrongN}/${N} runs` : "";
    console.log(`- [${r.task} b${r.bid}] [${r.predicted}→${r.gt}] [w=${w}${persist}]:`);
    console.log(`  Justification: "${r.justification.slice(0, 350)}"`);
    if (r.thinking_excerpt) {
      console.log(`  Thinking: "${r.thinking_excerpt.slice(0, 200)}"`);
    }
    console.log(`  Pattern: <FILL IN — what reasoning trap caused this>`);
    console.log(`  Trap: <FILL IN — which prompt section/phrase led to this>`);
  }
  console.log(`Dominant pattern: <FILL IN>`);
  console.log(`Fix hypothesis: <FILL IN — what specific prompt change would fix the dominant pattern>`);
  console.log(`\n(Paste the completed digest above into the {REASONING_PATTERNS} field when spawning the IDEATE subagent.)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const runArg = args.includes("--run-dir") ? args[args.indexOf("--run-dir") + 1] : undefined;
  const historyN = args.includes("--history")
    ? parseInt(args[args.indexOf("--history") + 1] ?? "8", 10)
    : 8;

  const runDir = getRunDir(runArg);
  if (!existsSync(runDir)) {
    console.error(`Run directory not found: ${runDir}`);
    process.exit(1);
  }

  // Resolve symlinks to get the actual directory name
  const resolvedDir = existsSync(runDir) ? realpathSync(runDir) : runDir;
  const runLabel = basename(resolvedDir);

  const iterations = loadIterations();

  // Find baseline
  const baselineIter = [...iterations].reverse().find(r => r.status === "baseline" && r.run_dir);

  // Non-baseline runs with actual run_dirs, in iteration order
  const runsWithDirs = iterations.filter(r => r.run_dir && r.status !== "baseline");

  // Find current run in the list; fall back to last if not found
  let currentIdx = runsWithDirs.findIndex(r => r.run_dir === runLabel);
  if (currentIdx < 0) currentIdx = runsWithDirs.length - 1;

  const prevIter = currentIdx > 0 ? runsWithDirs[currentIdx - 1] : null;
  const histStart = Math.max(0, currentIdx + 1 - historyN);
  const histSlice = runsWithDirs.slice(histStart, currentIdx + 1);

  const iterNum = runsWithDirs[currentIdx]?.iteration ?? "?";

  console.log(`\nMINE REPORT — ${runLabel} (iter ${iterNum})`);
  console.log(`Using ${histSlice.length} runs for persistence, baseline: ${baselineIter?.run_dir ?? "none"}`);

  const current = loadRun(resolvedDir, true);
  const baseline = baselineIter ? loadRun(getRunDir(baselineIter.run_dir!), false) : [];
  const prev = prevIter ? loadRun(getRunDir(prevIter.run_dir!), false) : [];
  const histRuns = histSlice.map(r => ({
    label: r.run_dir!,
    records: loadRun(getRunDir(r.run_dir!), false),
  }));

  const errors = current.filter(r => r.direction !== "correct");
  console.log(`${current.length} behaviors | ${errors.length} errors | ${current.filter(r => r.direction === "under").length} under | ${current.filter(r => r.direction === "over").length} over`);

  printLossBreakdown(current, baseline, prev, {
    baseline: baselineIter?.run_dir ?? "—",
    prev: prevIter?.run_dir ?? "—",
  });

  printBehavioralDiff(current, prev, prevIter?.run_dir ?? "");

  printCrossRunPersistence(histRuns, current);

  printMineDigestTemplate(current, histRuns);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
