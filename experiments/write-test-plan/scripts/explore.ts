#!/usr/bin/env npx tsx
/**
 * explore.ts — Modular pre-screening toolkit for prompt variation experiments.
 *
 * USER DOCUMENTATION: docs/explore-tool.md
 *   Read that file for CLI reference, algorithm explanation, JSON schema,
 *   signal classification rules, and modular API usage examples.
 *
 * AGENT WORKFLOW: .agents/skills/explore/SKILL.md
 *   Read that file for the step-by-step workflow: create variations, run this
 *   script, interpret results, decide next steps.
 *
 * This file is the implementation. All functions are exported for programmatic use.
 *
 * Exit codes: 0 = signal, 1 = error, 2 = no-signal, 3 = concentrated-signal
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { Command, InvalidArgumentError } from "commander";
import { PATHS, EXP_DIR } from "./paths.js";
import { parseFrontmatter } from "./ideas-index.js";
import { scoreOutput } from "./score.js";
import { ProbeOutput, GroundTruth, ExploreResult } from "../src/schema.js";

// -- Zod schemas (canonical definitions — types are inferred) --

export const SignalZ = z.enum(["signal", "concentrated-signal", "no-signal"]);
export type Signal = z.infer<typeof SignalZ>;

export const DirectionZ = z.enum(["improved", "hurt", "flat"]);
export type Direction = z.infer<typeof DirectionZ>;

export const TaskLossZ = z.object({
  taskId: z.string().regex(/^ec-\d+$/),
  loss: z.number().min(0),
});
export type TaskLoss = z.infer<typeof TaskLossZ>;

export const VariationDirZ = z.object({
  label: z.string().min(1),
  dir: z.string().min(1),
  treatmentPath: z.string().min(1),
});
export type VariationDir = z.infer<typeof VariationDirZ>;

export const PerTaskResultZ = z.object({
  taskId: z.string(),
  baselineLoss: z.number(),
  variationLoss: z.number(),
  delta: z.number(),
  direction: DirectionZ,
});
export type PerTaskResult = z.infer<typeof PerTaskResultZ>;

export const VariationResultZ = z.object({
  variation: VariationDirZ,
  totalLoss: z.number(),
  delta: z.number(),
  perTask: z.array(PerTaskResultZ).min(1),
  improved: z.number().int().min(0),
  hurt: z.number().int().min(0),
  flat: z.number().int().min(0),
  concentrationTask: z.string().nullable(),
  concentrationPct: z.number().min(0).max(1),
});
export type VariationResult = z.infer<typeof VariationResultZ>;

export const ExploreOutputZ = z.object({
  ideaId: z.string(),
  tasks: z.array(z.string()).min(1),
  taskTiers: z.record(z.string(), z.string()),
  baselineLoss: z.number().min(0),
  variations: z.array(VariationResultZ).min(1),
  winner: VariationResultZ.nullable(),
  signal: SignalZ,
});
export type ExploreOutput = z.infer<typeof ExploreOutputZ>;

/** JSON output schema (serializable — no absolute paths, just labels) */
const PerTaskJsonZ = z.object({
  task: z.string(),
  baseline: z.number(),
  variation: z.number(),
  delta: z.number(),
  direction: DirectionZ,
});

const VariationJsonZ = z.object({
  variation: z.string(),
  loss: z.number(),
  delta: z.number(),
  improved: z.number().int(),
  hurt: z.number().int(),
  flat: z.number().int(),
  concentration_task: z.string().nullable(),
  concentration_pct: z.number(),
  per_task: z.array(PerTaskJsonZ),
});

const WinnerJsonZ = VariationJsonZ.pick({
  variation: true, loss: true, delta: true, improved: true,
  concentration_task: true, concentration_pct: true,
});

export const ExploreJsonOutputZ = z.object({
  idea_id: z.string(),
  tasks: z.array(z.string()),
  baseline_loss: z.number(),
  signal: SignalZ,
  winner: WinnerJsonZ.nullable(),
  variations: z.array(VariationJsonZ),
});
export type ExploreJsonOutput = z.infer<typeof ExploreJsonOutputZ>;

export const CatalogEntryZ = z.object({
  task_id: z.string(),
  labels: z.array(z.string()),
});
export type CatalogEntry = z.infer<typeof CatalogEntryZ>;

export const StratificationOptsZ = z.object({
  /** How many tasks to select (default: 6) */
  count: z.number().int().min(2).max(36).default(6),
  /** Target composition: {mid, high}. Defaults derived from count. */
  composition: z.object({
    mid: z.number().int().min(0),
    high: z.number().int().min(0),
  }).optional(),
  /** Max fraction of subset baseline any single task can represent (default: 0.35) */
  concentrationCap: z.number().min(0).max(1).default(0.35),
  /** Seed for deterministic shuffling within tiers (undefined = no shuffle) */
  seed: z.number().int().optional(),
  /** Priority weights per task — higher = more likely to be selected within tier. */
  priorities: z.record(z.string(), z.number().min(0)).default({}),
}).partial();
export type StratificationOpts = z.infer<typeof StratificationOptsZ>;

interface CliOpts {
  ideaId: string;
  tasks: string[] | null;
  selectCount: number | undefined;
  seed: number | undefined;
  dryRun: boolean;
  scoreOnly: boolean;
  summary: boolean;
  json: boolean;
  force: boolean;
  persist: boolean;  // --no-persist sets this to false
}

// -- Seeded PRNG (mulberry32) --

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Shuffle array using weighted probabilities. Higher weight = picked earlier. */
function weightedShuffle<T>(
  arr: T[],
  weightFn: (item: T) => number,
  rng: () => number,
): T[] {
  const result: T[] = [];
  const pool = [...arr];
  while (pool.length > 0) {
    const weights = pool.map(weightFn);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) { idx = i; break; }
    }
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// -- Exported functions: Variation discovery --

/**
 * Discover variation directories matching the naming convention:
 *   runs/explore/{ideaId}-v{N}-{label}-{YYYYMMDD-HHMMSS}/treatment.md
 *
 * The match requires a `v\d` segment after the idea-id prefix to avoid
 * greedy matches (e.g. "my-idea-extended" matching "my-idea").
 */
export function discoverVariations(ideaId: string): VariationDir[] {
  const exploreDir = PATHS.exploreRuns;
  if (!existsSync(exploreDir)) return [];

  const prefix = `${ideaId}-`;
  const dirs = readdirSync(exploreDir, { withFileTypes: true })
    .filter(d => {
      if (!d.isDirectory() || !d.name.startsWith(prefix)) return false;
      // Variation label must start with v<digit> after the idea-id prefix
      const rest = d.name.slice(prefix.length);
      return /^v\d/.test(rest);
    })
    .map(d => d.name)
    .sort();

  const variations: VariationDir[] = [];
  for (const dirName of dirs) {
    const dir = join(exploreDir, dirName);
    const treatmentPath = join(dir, "treatment.md");
    if (!existsSync(treatmentPath)) continue;

    // Extract label: remove idea-id prefix and timestamp suffix
    // "integration-middle-anchor-v1-anchor-basic-20260328-225104" -> "v1-anchor-basic"
    const withoutIdea = dirName.slice(prefix.length);
    const tsMatch = withoutIdea.match(/-(\d{8}-\d{6})$/);
    const label = tsMatch ? withoutIdea.slice(0, -tsMatch[0].length) : withoutIdea;

    variations.push(VariationDirZ.parse({ label, dir, treatmentPath }));
  }

  return variations;
}

// -- Exported functions: Per-task loss from any run dir --

/** Score a run directory and return per-task losses. Works with any dir. */
export function scoreRunDir(runDir: string): TaskLoss[] {
  if (!existsSync(runDir)) {
    throw new Error(`Run directory not found: ${runDir}`);
  }

  const gtDir = PATHS.groundTruth;
  const files = readdirSync(runDir)
    .filter(f => f.endsWith(".json") && f.startsWith("out-"))
    .sort();

  const results: TaskLoss[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const taskMatch = file.match(/out-[a-z]+-(.+)\.json$/);
    if (!taskMatch) continue;
    const rawId = taskMatch[1];
    const taskId = rawId.replace(/^(ec)(\d+)$/, "$1-$2");
    const gtFile = join(gtDir, `${taskId}.json`);

    if (!existsSync(gtFile)) { skipped.push(`${file} (no GT)`); continue; }

    try {
      const output = ProbeOutput.parse(JSON.parse(readFileSync(join(runDir, file), "utf-8")));
      const gt = GroundTruth.parse(JSON.parse(readFileSync(gtFile, "utf-8")));
      const score = scoreOutput(output, gt);
      results.push({ taskId, loss: score.total_loss });
    } catch (err) {
      skipped.push(`${file}: ${(err as Error).message?.slice(0, 80)}`);
    }
  }

  if (skipped.length > 0) {
    process.stderr.write(`scoreRunDir: skipped ${skipped.length} file(s): ${skipped.join("; ")}\n`);
  }

  return results;
}

/** Convenience: score runs/latest/ */
export function scoreLatestRun(): TaskLoss[] {
  return scoreRunDir(join(PATHS.runs, "latest"));
}

// -- Exported functions: Tier computation --

/** Compute tiers (low/mid/high) for all tasks based on loss distribution. */
export function computeTiers(perTaskLoss: TaskLoss[]): Record<string, string> {
  const sorted = [...perTaskLoss].sort((a, b) => a.loss - b.loss);
  const n = sorted.length;
  const lowCut = Math.floor(n * 0.25);
  const highCut = Math.floor(n * 0.75);

  const tiers: Record<string, string> = {};
  for (let i = 0; i < n; i++) {
    tiers[sorted[i].taskId] = i < lowCut ? "low" : i < highCut ? "mid" : "high";
  }
  return tiers;
}

// -- Exported functions: Task selection --

export function loadCatalog(): CatalogEntry[] {
  const raw = readFileSync(join(PATHS.corpus, "catalog.json"), "utf-8");
  return z.array(CatalogEntryZ).parse(JSON.parse(raw));
}

/**
 * Stratified task selection with priority-weighted randomization.
 *
 * Algorithm:
 * 1. Sort tasks by loss, divide into tiers (low 25% / mid 25-75% / high 25%)
 * 2. Filter to tasks whose catalog labels overlap with confusion_pairs
 * 3. Within each tier, order by priority weight (higher = picked first)
 * 4. If seed is set, use weighted random shuffle instead of deterministic sort
 * 5. Select composition.mid from middle + composition.high from high
 * 6. Post-selection guardrail: remove any task > concentrationCap of subset, backfill
 */
export function selectTasksStratified(
  perTaskLoss: TaskLoss[],
  catalog: CatalogEntry[],
  confusionPairs: string[],
  rawOpts: StratificationOpts = {},
): { tasks: string[]; tiers: Record<string, string>; reasoning: string[] } {
  const opts = StratificationOptsZ.parse(rawOpts);
  const count = opts.count ?? 6;
  const composition = opts.composition ?? {
    mid: Math.max(3, count - 2),
    high: Math.max(1, count - Math.max(3, count - 2)),
  };
  const concentrationCap = opts.concentrationCap ?? 0.35;
  const seed = opts.seed;
  const priorities = opts.priorities ?? {};

  const tiers = computeTiers(perTaskLoss);
  const reasoning: string[] = [];

  const rng = seed !== undefined ? mulberry32(seed) : undefined;

  // Extract levels from confusion pairs
  const targetLevels = new Set<string>();
  for (const pair of confusionPairs) {
    for (const level of pair.split("-")) {
      targetLevels.add(level);
    }
  }

  const catalogMap = new Map(catalog.map(c => [c.task_id.toLowerCase(), c]));

  function matchesConfusion(taskId: string): boolean {
    const entry = catalogMap.get(taskId);
    if (!entry) return false;
    return entry.labels.some(l => targetLevels.has(l));
  }

  function weightFn(t: TaskLoss): number {
    const base = priorities[t.taskId] ?? 1.0;
    return matchesConfusion(t.taskId) ? base * 2 : base;
  }

  // Split by tier
  const byTier: Record<string, TaskLoss[]> = { low: [], mid: [], high: [] };
  for (const t of perTaskLoss) {
    const tier = tiers[t.taskId];
    if (tier in byTier) byTier[tier].push(t);
  }

  // Order within each tier
  for (const tier of Object.keys(byTier)) {
    if (rng) {
      byTier[tier] = weightedShuffle(byTier[tier], weightFn, rng);
    } else {
      byTier[tier].sort((a, b) => weightFn(b) - weightFn(a));
    }
  }

  const selected: TaskLoss[] = [];
  const usedIds = new Set<string>();

  function tryAdd(t: TaskLoss, reason: string): boolean {
    if (usedIds.has(t.taskId)) return false;
    selected.push(t);
    usedIds.add(t.taskId);
    reasoning.push(`+ ${t.taskId} (${tiers[t.taskId]}, loss ${t.loss.toFixed(2)}): ${reason}`);
    return true;
  }

  // Phase 1: fill from middle tier
  let midAdded = 0;
  for (const t of byTier.mid) {
    if (midAdded >= composition.mid) break;
    const match = matchesConfusion(t.taskId);
    if (tryAdd(t, match ? "mid-tier, matches confusion pair" : "mid-tier fill")) {
      midAdded++;
    }
  }

  // Phase 2: fill from high tier
  let highAdded = 0;
  for (const t of byTier.high) {
    if (highAdded >= composition.high) break;
    if (selected.length >= count) break;
    const match = matchesConfusion(t.taskId);
    if (tryAdd(t, match ? "high-tier, matches confusion pair" : "high-tier fill")) {
      highAdded++;
    }
  }

  // Phase 3: fill remaining from any tier
  if (selected.length < count) {
    const all = [...byTier.mid, ...byTier.high, ...byTier.low];
    for (const t of all) {
      if (selected.length >= count) break;
      tryAdd(t, "fill (insufficient matching tasks)");
    }
  }

  // Post-selection guardrail: iteratively remove concentrated tasks
  let changed = true;
  while (changed) {
    changed = false;
    const total = selected.reduce((s, t) => s + t.loss, 0);
    for (let i = selected.length - 1; i >= 0; i--) {
      if (selected.length <= 2) break;
      if (selected[i].loss / total > concentrationCap) {
        reasoning.push(`removed ${selected[i].taskId}: ${((selected[i].loss / total) * 100).toFixed(0)}% of subset > ${(concentrationCap * 100).toFixed(0)}% cap`);
        usedIds.delete(selected[i].taskId);
        selected.splice(i, 1);
        changed = true;
        break;  // Recompute total after each removal
      }
    }
  }

  // Backfill if we lost tasks to the guardrail
  if (selected.length < count) {
    const all = [...byTier.mid, ...byTier.high, ...byTier.low];
    for (const t of all) {
      if (selected.length >= count) break;
      const newTotal = selected.reduce((s, x) => s + x.loss, 0) + t.loss;
      if (t.loss / newTotal > concentrationCap) continue;
      tryAdd(t, "backfill (replaced concentrated task)");
    }
  }

  return { tasks: selected.map(t => t.taskId), tiers, reasoning };
}

// -- Exported functions: Baseline --

/** Extract baseline losses for specific tasks from a per-task loss array. */
export function computeBaseline(perTaskLoss: TaskLoss[], tasks: string[]): Record<string, number> {
  const lossMap = new Map(perTaskLoss.map(t => [t.taskId, t.loss]));
  const result: Record<string, number> = {};
  const missing: string[] = [];
  for (const task of tasks) {
    const loss = lossMap.get(task);
    if (loss === undefined) {
      missing.push(task);
    } else {
      result[task] = loss;
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `No baseline loss for: ${missing.join(", ")}. ` +
      `Available tasks: ${perTaskLoss.map(t => t.taskId).sort().join(", ")}`
    );
  }
  return result;
}

// -- Exported functions: Run execution --

/** Run a variation via run-eval.sh. Returns stdout. */
export function runVariation(variation: VariationDir, tasks: string[], outDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "--corpus", tasks.join(","),
      "--prompt", variation.treatmentPath,
      "--no-latest",
      "--out-dir", outDir,
      "-j", "6",
    ];

    const child = spawn("bash", [PATHS.runEval, ...args], {
      cwd: EXP_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`run-eval.sh failed (exit ${code}):\n${stderr.slice(0, 1000)}`));
      }
    });

    child.on("error", reject);
  });
}

/** Check which tasks are missing output files in a variation dir. */
export function checkExistingOutputs(dir: string, tasks: string[]): string[] {
  const missing: string[] = [];
  for (const task of tasks) {
    const normalized = task.replace(/-/g, "");
    const outFile = join(dir, `out-treatment-${normalized}.json`);
    if (!existsSync(outFile)) {
      missing.push(task);
    }
  }
  return missing;
}

// -- Exported functions: Scoring --

/** Score a variation dir on specific tasks, returning per-task losses. */
export function scoreVariation(dir: string, tasks: string[]): Record<string, number> {
  const gtDir = PATHS.groundTruth;
  const result: Record<string, number> = {};

  for (const task of tasks) {
    const normalized = task.replace(/-/g, "");
    const outFile = join(dir, `out-treatment-${normalized}.json`);
    const gtFile = join(gtDir, `${task}.json`);

    if (!existsSync(outFile)) {
      throw new Error(`Missing output: ${outFile}`);
    }

    const output = ProbeOutput.parse(JSON.parse(readFileSync(outFile, "utf-8")));
    const gt = GroundTruth.parse(JSON.parse(readFileSync(gtFile, "utf-8")));
    const score = scoreOutput(output, gt);
    result[task] = score.total_loss;
  }

  return result;
}

// -- Exported functions: Analysis --

/** Analyze a single variation against baseline. */
export function analyzeVariation(
  variation: VariationDir,
  baselineLosses: Record<string, number>,
  variationLosses: Record<string, number>,
  tasks: string[],
): VariationResult {
  const perTask: PerTaskResult[] = [];
  let totalBaseline = 0;
  let totalVariation = 0;

  for (const task of tasks) {
    const bl = baselineLosses[task];
    const vl = variationLosses[task];
    const delta = vl - bl;
    const direction: Direction =
      delta < -1.0 ? "improved" : delta > 1.0 ? "hurt" : "flat";

    perTask.push({ taskId: task, baselineLoss: bl, variationLoss: vl, delta, direction });
    totalBaseline += bl;
    totalVariation += vl;
  }

  const totalDelta = totalVariation - totalBaseline;

  let concentrationTask: string | null = null;
  let concentrationPct = 0;

  if (totalDelta < 0) {
    const improvements = perTask.filter(t => t.delta < 0);
    if (improvements.length > 0) {
      const totalImprovement = improvements.reduce((s, t) => s + Math.abs(t.delta), 0);
      const maxImprover = improvements.reduce((a, b) => Math.abs(a.delta) > Math.abs(b.delta) ? a : b);
      concentrationPct = Math.abs(maxImprover.delta) / totalImprovement;
      if (concentrationPct > 0.6) {
        concentrationTask = maxImprover.taskId;
      }
    }
  }

  return VariationResultZ.parse({
    variation,
    totalLoss: totalVariation,
    delta: totalDelta,
    perTask,
    improved: perTask.filter(t => t.direction === "improved").length,
    hurt: perTask.filter(t => t.direction === "hurt").length,
    flat: perTask.filter(t => t.direction === "flat").length,
    concentrationTask,
    concentrationPct,
  });
}

/** Classify signal quality for a variation result. */
export function classifySignal(result: VariationResult): Signal {
  if (result.delta >= 0) return "no-signal";
  const majority = result.improved > result.perTask.length / 2;
  if (majority && !result.concentrationTask) return "signal";
  if (result.delta < 0) return "concentrated-signal";
  return "no-signal";
}

/** Pick the best variation from a set of results. */
export function pickWinner(results: VariationResult[]): VariationResult | null {
  const improving = results.filter(r => r.delta < 0);
  if (improving.length === 0) return null;

  const signaled = improving.filter(r => classifySignal(r) === "signal");
  if (signaled.length > 0) {
    return signaled.reduce((a, b) => a.delta < b.delta ? a : b);
  }

  return improving.reduce((a, b) => {
    if (Math.abs(a.delta - b.delta) < 0.5) {
      return a.improved > b.improved ? a : b;
    }
    return a.delta < b.delta ? a : b;
  });
}

// -- Exported functions: Output formatting --

/** Print the per-task heatmap comparison table. */
export function printHeatmap(output: ExploreOutput) {
  const { tasks, variations, baselineLoss, taskTiers } = output;

  console.log(`\n=== EXPLORE: ${output.ideaId} (${variations.length} variation${variations.length !== 1 ? "s" : ""} x ${tasks.length} tasks) ===\n`);

  const taskDescs = tasks.map(t => {
    const tier = taskTiers[t] || "?";
    const bl = variations[0]?.perTask.find(p => p.taskId === t)?.baselineLoss ?? 0;
    return `${t} (${tier}, ${bl.toFixed(2)})`;
  });
  console.log(`Tasks: ${taskDescs.join(", ")}`);

  const tierCounts: Record<string, number> = {};
  for (const t of tasks) {
    const tier = taskTiers[t] || "?";
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  }
  console.log(`Selection: ${Object.entries(tierCounts).map(([t, c]) => `${c} ${t}`).join(" + ")}`);
  console.log(`Baseline loss: ${baselineLoss.toFixed(2)}\n`);

  if (variations.length === 0) { console.log("No variations found."); return; }

  const colWidth = 14;
  const taskCol = 8;
  const labels = variations.map(v => v.variation.label);

  let header = "Task".padEnd(taskCol) + "Baseline".padStart(colWidth);
  for (const label of labels) header += label.slice(0, colWidth - 2).padStart(colWidth);
  console.log(header);

  for (const task of tasks) {
    let row = task.padEnd(taskCol);
    const bl = variations[0].perTask.find(p => p.taskId === task)?.baselineLoss ?? 0;
    row += bl.toFixed(2).padStart(colWidth);
    for (const v of variations) {
      const pt = v.perTask.find(p => p.taskId === task);
      row += pt ? pt.variationLoss.toFixed(2).padStart(colWidth) : "—".padStart(colWidth);
    }
    console.log(row);
  }

  console.log("─".repeat(taskCol + colWidth * (1 + labels.length)));

  const summaryRow = (label: string, baseFn: () => string, varFn: (v: VariationResult) => string) => {
    let row = label.padEnd(taskCol) + baseFn().padStart(colWidth);
    for (const v of variations) row += varFn(v).padStart(colWidth);
    console.log(row);
  };

  summaryRow("TOTAL", () => baselineLoss.toFixed(2), v => v.totalLoss.toFixed(2));
  summaryRow("Delta", () => "—", v => `${v.delta >= 0 ? "+" : ""}${v.delta.toFixed(2)}`);
  summaryRow("Impr.", () => "—", v => `${v.improved}/${tasks.length}`);
  summaryRow("Conc.", () => "—", v =>
    v.concentrationTask ? `${v.concentrationTask} ${(v.concentrationPct * 100).toFixed(0)}%`
    : v.delta < 0 ? "none" : "—"
  );

  console.log("");
  const { winner, signal } = output;

  if (signal === "signal" && winner) {
    console.log(`Signal: signal`);
    console.log(`  Winner: ${winner.variation.label} (delta ${winner.delta.toFixed(2)}, ${winner.improved}/${tasks.length} improved, no concentration)`);
    console.log(`  => SIGNAL: Apply ${winner.variation.label} diff in EDIT step.`);
  } else if (signal === "concentrated-signal" && winner) {
    console.log(`Signal: concentrated-signal`);
    console.log(`  Winner: ${winner.variation.label} (delta ${winner.delta.toFixed(2)}) — but ${winner.concentrationTask} drives ${(winner.concentrationPct * 100).toFixed(0)}% of improvement`);
    console.log(`  => CONCENTRATED: Re-run with different tasks or proceed with caution.`);
  } else {
    console.log(`Signal: no-signal`);
    console.log(`  All variations flat or worse.`);
    console.log(`  => NO SIGNAL: Return to IDEATE.`);
  }
}

/** Output machine-readable JSON (validated against ExploreJsonOutputZ). */
export function printJson(output: ExploreOutput) {
  const json = {
    idea_id: output.ideaId,
    tasks: output.tasks,
    baseline_loss: output.baselineLoss,
    signal: output.signal,
    winner: output.winner ? {
      variation: output.winner.variation.label,
      loss: output.winner.totalLoss,
      delta: output.winner.delta,
      improved: output.winner.improved,
      concentration_task: output.winner.concentrationTask,
      concentration_pct: output.winner.concentrationPct,
    } : null,
    variations: output.variations.map(v => ({
      variation: v.variation.label,
      loss: v.totalLoss,
      delta: v.delta,
      improved: v.improved,
      hurt: v.hurt,
      flat: v.flat,
      concentration_task: v.concentrationTask,
      concentration_pct: v.concentrationPct,
      per_task: v.perTask.map(pt => ({
        task: pt.taskId,
        baseline: pt.baselineLoss,
        variation: pt.variationLoss,
        delta: pt.delta,
        direction: pt.direction,
      })),
    })),
  };
  const validated = ExploreJsonOutputZ.parse(json);
  console.log(JSON.stringify(validated, null, 2));
}

// -- Exported functions: Summary from log --

/** Print summary from explore-log.jsonl. Returns false if no entries found. */
export function printSummary(ideaId: string): boolean {
  if (!existsSync(PATHS.exploreLog)) {
    console.error("No explore-log.jsonl found.");
    return false;
  }

  const lines = readFileSync(PATHS.exploreLog, "utf-8")
    .trim().split("\n").filter(l => l.trim())
    .map(l => ExploreResult.parse(JSON.parse(l)))
    .filter(r => r.idea_id === ideaId);

  if (lines.length === 0) {
    console.error(`No explore results found for idea '${ideaId}'.`);
    return false;
  }

  const tasks = lines[0].tasks;
  const baselineLoss = lines[0].baseline_loss;
  const winner = lines.find(l => l.winner);

  console.log(`\n=== EXPLORE SUMMARY: ${ideaId} ===\n`);
  console.log(`Tasks: ${tasks.join(", ")}`);
  console.log(`Baseline loss: ${baselineLoss.toFixed(2)}\n`);

  console.log("Variation".padEnd(20) + "Loss".padStart(10) + "Delta".padStart(10) + "Winner".padStart(10) + "  Diff");
  console.log("─".repeat(70));

  for (const r of lines) {
    const sign = r.delta >= 0 ? "+" : "";
    const w = r.winner ? " *" : "  ";
    console.log(
      `${r.variation.padEnd(20)}${r.variation_loss.toFixed(2).padStart(10)}${(sign + r.delta.toFixed(2)).padStart(10)}${w.padStart(10)}  ${r.prompt_diff}`
    );
  }

  if (winner) {
    console.log(`\nWinner: ${winner.variation} (delta ${winner.delta >= 0 ? "+" : ""}${winner.delta.toFixed(2)})`);
  } else {
    console.log("\nNo winner — all variations flat or worse.");
  }
  return true;
}

// -- Exported functions: Persistence --

export function writeExploreLog(
  ideaId: string,
  variations: VariationResult[],
  tasks: string[],
  baselineLoss: number,
  winner: VariationResult | null,
) {
  const timestamp = new Date().toISOString();

  for (const v of variations) {
    const relDir = relative(EXP_DIR, v.variation.dir);
    const entry = ExploreResult.parse({
      timestamp,
      idea_id: ideaId,
      variation: v.variation.label,
      run_dir: relDir,
      tasks,
      baseline_loss: baselineLoss,
      variation_loss: v.totalLoss,
      delta: v.delta,
      prompt_diff: v.variation.label,
      winner: winner?.variation.label === v.variation.label,
    });
    appendFileSync(PATHS.exploreLog, JSON.stringify(entry) + "\n");
  }
}

export function updateIdeaFrontmatter(
  ideaId: string,
  tasks: string[],
  baselineLoss: number,
  winner: VariationResult | null,
  signal: Signal,
  variations: VariationResult[],
) {
  const ideaPath = join(PATHS.ideas, `${ideaId}.md`);
  if (!existsSync(ideaPath)) return;

  let content = readFileSync(ideaPath, "utf-8");

  const updates: Record<string, string> = {
    explore_status: signal,
    explore_tasks: `[${tasks.join(", ")}]`,
    explore_baseline_loss: baselineLoss.toFixed(2),
    explore_loss: winner ? winner.totalLoss.toFixed(2) : "null",
    explore_delta: winner ? winner.delta.toFixed(2) : "null",
    explore_date: new Date().toISOString().split("T")[0],
  };

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^(${key}:)\\s*.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `$1 ${value}`);
    }
  }

  const epiHeader = "## Epistemological status";
  const epiContent = buildEpistemologicalSection(tasks, baselineLoss, variations, winner, signal);

  if (content.includes(epiHeader)) {
    content = content.replace(
      new RegExp(`${epiHeader}[\\s\\S]*?(?=\n## |$)`),
      epiContent
    );
  } else {
    content = content.trimEnd() + "\n\n" + epiContent + "\n";
  }

  writeFileSync(ideaPath, content);
}

function buildEpistemologicalSection(
  tasks: string[],
  baselineLoss: number,
  variations: VariationResult[],
  winner: VariationResult | null,
  signal: string,
): string {
  let s = `## Epistemological status\n\n`;
  s += `Explore subset (stratified): \`${tasks.join(", ")}\`  \n`;
  s += `Baseline subset loss: \`${baselineLoss.toFixed(2)}\`\n\n`;
  s += `| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |\n`;
  s += `|---|---:|---:|---|---|\n`;

  for (const v of variations) {
    const sign = v.delta >= 0 ? "+" : "";
    const dirStr = `improved ${v.improved}, hurt ${v.hurt}, flat ${v.flat}`;
    const concStr = v.concentrationTask
      ? `${v.concentrationTask} drives ${(v.concentrationPct * 100).toFixed(0)}% of gain`
      : v.delta < 0 ? "distributed" : "n/a";
    s += `| ${v.variation.label} | ${v.totalLoss.toFixed(4)} | ${sign}${v.delta.toFixed(4)} | ${dirStr} | ${concStr} |\n`;
  }

  s += "\n";
  if (winner) {
    s += `Winner: \`${winner.variation.label}\` by aggregate loss, classification is \`${signal}\`.  \n`;
    if (signal === "concentrated-signal") {
      s += `Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.\n`;
    }
  } else {
    s += `No winner — all variations flat or worse. Classification: \`${signal}\`.\n`;
  }
  return s;
}

// -- CLI (commander) --

function parseTasksCsv(value: string): string[] {
  const tasks = value.split(",").map(t => t.trim().toLowerCase());
  const invalid = tasks.filter(t => !/^ec-\d+$/.test(t));
  if (invalid.length > 0) {
    throw new InvalidArgumentError(`invalid task IDs: ${invalid.join(", ")} (expected ec-NN)`);
  }
  return tasks;
}

function parsePositiveInt(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1) throw new InvalidArgumentError(`"${value}" is not a positive integer`);
  return n;
}

function parseInt2Plus(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 2) throw new InvalidArgumentError(`"${value}" must be an integer >= 2`);
  return n;
}

const program = new Command()
  .name("explore")
  .description(
    "Pre-screen prompt variations on stratified task subsets.\n\n" +
    "Docs:     docs/explore-tool.md (full reference)\n" +
    "Workflow: .agents/skills/explore/SKILL.md (agent steps)"
  )
  .argument("<idea-id>", "idea ID to explore (must have a file in ideas/)")
  .option("--tasks <ids>", "override task selection (comma-separated ec-NN)", parseTasksCsv)
  .option("--select-count <n>", "pick N tasks instead of default 6", parseInt2Plus)
  .option("--seed <n>", "seed for deterministic weighted randomization", parsePositiveInt)
  .option("--dry-run", "show the plan without executing")
  .option("--score-only", "skip eval, just score existing outputs")
  .option("--summary", "reprint results from explore-log.jsonl")
  .option("--json", "machine-readable JSON on stdout (status to stderr)")
  .option("--force", "re-run even if explore_status is already set")
  .option("--no-persist", "skip writing to explore-log.jsonl and idea file")
  .addHelpText("after", "\nExit codes: 0=signal  1=error  2=no-signal  3=concentrated-signal")
  .showHelpAfterError(true);

async function main() {
  program.parse();
  const ideaId: string = program.args[0];
  const flags = program.opts<{
    tasks?: string[];
    selectCount?: number;
    seed?: number;
    dryRun?: boolean;
    scoreOnly?: boolean;
    summary?: boolean;
    json?: boolean;
    force?: boolean;
    persist?: boolean;  // commander: --no-persist sets this to false
  }>();

  const opts: CliOpts = {
    ideaId,
    tasks: flags.tasks ?? null,
    selectCount: flags.selectCount,
    seed: flags.seed,
    dryRun: flags.dryRun ?? false,
    scoreOnly: flags.scoreOnly ?? false,
    summary: flags.summary ?? false,
    json: flags.json ?? false,
    force: flags.force ?? false,
    persist: flags.persist ?? true,
  };

  // In --json mode, status messages go to stderr so stdout is clean JSON
  const log = opts.json
    ? (...a: unknown[]) => process.stderr.write(a.map(String).join(" ") + "\n")
    : (...a: unknown[]) => console.log(...a);

  if (opts.summary) {
    if (!printSummary(opts.ideaId)) process.exit(1);
    return;
  }

  const ideaPath = join(PATHS.ideas, `${opts.ideaId}.md`);
  if (!existsSync(ideaPath)) {
    console.error(`Idea file not found: ${ideaPath}`);
    process.exit(1);
  }

  const ideaContent = readFileSync(ideaPath, "utf-8");
  const fm = parseFrontmatter(ideaContent);

  if (fm.explore_status && !opts.force) {
    log(`Idea '${opts.ideaId}' already has explore_status: ${fm.explore_status}`);
    log("Use --force to re-run, or --summary to view results.");
    printSummary(opts.ideaId);
    return;
  }

  const variations = discoverVariations(opts.ideaId);
  if (variations.length === 0) {
    console.error(`No variation dirs found. Expected: runs/explore/${opts.ideaId}-v<N>-<label>-<timestamp>/treatment.md`);
    console.error("Create variation dirs with treatment.md files first, then re-run.");
    process.exit(1);
  }

  log(`Found ${variations.length} variation(s): ${variations.map(v => v.label).join(", ")}`);

  const perTaskLoss = scoreLatestRun();
  if (perTaskLoss.length === 0) {
    console.error("No scoreable tasks found in runs/latest/. Run a full eval first.");
    process.exit(1);
  }

  // Validate --tasks against available tasks
  if (opts.tasks) {
    const available = new Set(perTaskLoss.map(t => t.taskId));
    const unknown = opts.tasks.filter(t => !available.has(t));
    if (unknown.length > 0) {
      console.error(`Unknown task(s) not in runs/latest/: ${unknown.join(", ")}`);
      console.error(`Available: ${[...available].sort().join(", ")}`);
      process.exit(1);
    }
  }

  let tasks: string[];
  let taskTiers: Record<string, string>;

  if (opts.tasks) {
    tasks = opts.tasks;
    taskTiers = computeTiers(perTaskLoss);
    log(`Using explicit tasks: ${tasks.join(", ")}`);
  } else if (fm.explore_tasks && Array.isArray(fm.explore_tasks) && fm.explore_tasks.length > 0
    && !opts.selectCount && opts.seed === undefined) {
    // Validate frontmatter tasks — filter to ec-NN format and non-empty
    const rawTasks = (fm.explore_tasks as string[]).map(t => String(t).trim().toLowerCase()).filter(t => /^ec-\d+$/.test(t));
    if (rawTasks.length === 0) {
      // Frontmatter tasks are malformed — fall through to auto-selection
      log("Warning: explore_tasks in frontmatter are empty or malformed, auto-selecting...");
      const confusionPairs = (fm.confusion_pairs as string[]) || [];
      const catalog = loadCatalog();
      const selection = selectTasksStratified(perTaskLoss, catalog, confusionPairs, {
        count: opts.selectCount,
        seed: opts.seed,
      });
      tasks = selection.tasks;
      taskTiers = selection.tiers;
      log(`Auto-selected ${tasks.length} tasks:`);
      for (const line of selection.reasoning) log(`  ${line}`);
    } else {
      tasks = rawTasks;
      taskTiers = computeTiers(perTaskLoss);
      log(`Using tasks from idea frontmatter: ${tasks.join(", ")}`);
    }
  } else {
    const confusionPairs = (fm.confusion_pairs as string[]) || [];
    const catalog = loadCatalog();
    const selection = selectTasksStratified(perTaskLoss, catalog, confusionPairs, {
      count: opts.selectCount,
      seed: opts.seed,
    });
    tasks = selection.tasks;
    taskTiers = selection.tiers;
    log(`Auto-selected ${tasks.length} tasks:`);
    for (const line of selection.reasoning) log(`  ${line}`);
  }

  const baselineLosses = computeBaseline(perTaskLoss, tasks);
  const baselineLoss = Object.values(baselineLosses).reduce((s, v) => s + v, 0);

  if (opts.dryRun) {
    log(`\n=== DRY RUN: ${opts.ideaId} ===\n`);
    log(`Variations: ${variations.map(v => v.label).join(", ")}`);
    log(`Tasks: ${tasks.map(t => `${t} (${taskTiers[t] || "?"})`).join(", ")}`);
    log(`Baseline loss: ${baselineLoss.toFixed(2)}`);
    for (const [task, loss] of Object.entries(baselineLosses)) {
      log(`  ${task}: ${loss.toFixed(2)}`);
    }
    log(`\nWould run ${variations.length} x run-eval.sh --corpus ${tasks.join(",")} --no-latest`);
    for (const v of variations) {
      const missing = checkExistingOutputs(v.dir, tasks);
      if (missing.length === 0) log(`  ${v.label}: all outputs exist (score only)`);
      else if (missing.length < tasks.length) log(`  ${v.label}: ${tasks.length - missing.length}/${tasks.length} exist (run ${missing.length} missing)`);
      else log(`  ${v.label}: no outputs (run all ${tasks.length})`);
    }
    return;
  }

  if (!opts.scoreOnly) {
    const runPromises: Promise<void>[] = [];

    for (const v of variations) {
      const missing = checkExistingOutputs(v.dir, tasks);
      if (missing.length === 0) {
        log(`${v.label}: all outputs exist, skipping eval`);
        continue;
      }
      if (missing.length < tasks.length) {
        log(`${v.label}: ${tasks.length - missing.length}/${tasks.length} exist, running ${missing.length} missing`);
      } else {
        log(`${v.label}: running ${tasks.length} tasks...`);
      }

      runPromises.push(
        runVariation(v, missing, v.dir)
          .then(() => { log(`${v.label}: done`); })
          .catch(err => { console.error(`${v.label}: FAILED — ${(err as Error).message}`); throw err; })
      );
    }

    if (runPromises.length > 0) {
      log(`\nRunning ${runPromises.length} variation(s) in parallel...`);
      await Promise.all(runPromises);
      log("All evaluations complete.\n");
    }
  }

  const results: VariationResult[] = [];
  for (const v of variations) {
    try {
      const losses = scoreVariation(v.dir, tasks);
      results.push(analyzeVariation(v, baselineLosses, losses, tasks));
    } catch (err) {
      console.error(`Scoring failed for ${v.label}: ${(err as Error).message}`);
    }
  }

  if (results.length === 0) { console.error("No variations could be scored."); process.exit(1); }

  const winner = pickWinner(results);
  const signal = winner ? classifySignal(winner) : "no-signal";

  const output = ExploreOutputZ.parse({
    ideaId: opts.ideaId, tasks, taskTiers, baselineLoss,
    variations: results, winner, signal,
  });

  if (opts.json) printJson(output);
  else printHeatmap(output);

  if (opts.persist) {
    writeExploreLog(opts.ideaId, results, tasks, baselineLoss, winner);
    updateIdeaFrontmatter(opts.ideaId, tasks, baselineLoss, winner, signal, results);
    log("\nResults written to explore-log.jsonl and idea frontmatter updated.");
  }

  if (signal === "no-signal") process.exit(2);
  if (signal === "concentrated-signal") process.exit(3);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(`Fatal: ${(err as Error).message}`); process.exit(1); });
}
