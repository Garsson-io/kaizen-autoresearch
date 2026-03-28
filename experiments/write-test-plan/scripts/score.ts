#!/usr/bin/env npx tsx
/**
 * score-probe.ts — Mechanistic scorer for eval-probe JSON/YAML outputs.
 *
 * Usage:
 *   npx tsx scripts/score-probe.ts --output <file.json> --gt <ground-truth.json>
 *   npx tsx scripts/score-probe.ts --output-dir <dir/> --gt-dir <gt-dir/>
 *
 * Both files are Zod-validated before scoring. JSON and YAML both accepted.
 * Exits non-zero if validation fails.
 *
 * Scoring model (from kaizen #1016):
 *   Boundary sufficiency    55%  — did predicted level clear the GT minimum?
 *   Minimum-level precision 20%  — how close to the minimum (symmetric)?
 *   Plan consistency        15%  — does test_description match declared level?
 *   Required structure      10%  — all required fields present (Zod-guaranteed)
 *
 * Row weights by GT level: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { ProbeOutput, GroundTruth, LEVEL_INDEX } from "../src/schema.js";

function parseFile(path: string): unknown {
  const raw = readFileSync(path, "utf-8");
  return path.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw);
}

export { LEVEL_INDEX } from "../src/schema.js";
const ROW_WEIGHT: Record<string, number> = {
  Unit: 1, Integration: 2, System: 3, Agentic: 4, Workflow: 4,
};

export function sufficiency(pred: string, gt: string): number {
  const diff = LEVEL_INDEX[pred] - LEVEL_INDEX[gt];
  if (diff >= 0) return 1.0;
  if (diff === -1) return 0.4;
  if (diff === -2) return 0.15;
  return 0.05;
}

export function precision(pred: string, gt: string): number {
  const dist = Math.abs(LEVEL_INDEX[pred] - LEVEL_INDEX[gt]);
  if (dist === 0) return 1.0;
  if (dist === 1) return 0.65;
  if (dist === 2) return 0.3;
  return 0.0;
}

interface RowResult {
  behavior_id: number;
  predicted: string;
  ground_truth: string;
  suff: number;
  prec: number;
  cons: number;
  weight: number;
  direction: "exact" | "over" | "under";
  p_correct: number;  // normalized probability assigned to GT level (0-1)
  ce_loss: number;    // -log(p_correct) * weight
}

interface ScoreResult {
  task_id: string;
  condition: string;
  sufficiency: number;
  precision: number;
  consistency: number;
  structure: number;
  total: number;
  rows: RowResult[];
  under_test_count: number;
  over_test_count: number;
  critical_miss_count: number;  // System+ behaviors predicted below GT
  critical_total: number;
  total_loss: number;           // sum of ce_loss across all behaviors
}

function loadAndValidate<T>(path: string, schema: z.ZodType<T>): T {
  let parsed: unknown;
  try {
    parsed = parseFile(path);
  } catch {
    console.error(`Cannot read file: ${path}`);
    process.exit(1);
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(`\n✗ Zod validation FAILED for ${path}:`);
    for (const issue of result.error.issues) {
      console.error(`  [${issue.path.join(".")}] ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export function scoreOutput(output: z.infer<typeof ProbeOutput>, gt: z.infer<typeof GroundTruth>): ScoreResult {
  if (output.task_id !== gt.task_id) {
    throw new Error(`task_id mismatch: output=${output.task_id} gt=${gt.task_id}`);
  }

  const gtMap = new Map(gt.behaviors.map((b) => [b.behavior_id, b.ground_truth_level]));
  const rows: RowResult[] = [];
  let totalWeight = 0, wSuff = 0, wPrec = 0, wCons = 0;
  let underCount = 0, overCount = 0, critMiss = 0, critTotal = 0;

  let totalLoss = 0;

  for (const b of output.behaviors) {
    const gtLevel = gtMap.get(b.behavior_id);
    if (!gtLevel) throw new Error(`No GT for behavior_id ${b.behavior_id} in ${output.task_id}`);

    const w = ROW_WEIGHT[gtLevel];
    const s = sufficiency(b.minimum_level, gtLevel);
    const p = precision(b.minimum_level, gtLevel);
    // plan_consistent: true=1.0, false with note=0.5 (partial), false without note=0.0
    const c = b.plan_consistent ? 1.0 : (b.plan_consistent_note ? 0.5 : 0.0);
    const diff = LEVEL_INDEX[b.minimum_level] - LEVEL_INDEX[gtLevel];
    const dir = diff === 0 ? "exact" : diff > 0 ? "over" : "under";

    // Cross-entropy loss from level_probabilities (mandatory field)
    const probs = b.level_probabilities as Record<string, number>;
    const rawSum = Object.values(probs).reduce((a, v) => a + Math.max(0, v), 0);
    const pCorrect = rawSum > 0 ? Math.max(0, probs[gtLevel] ?? 0) / rawSum : 0.2;
    // Clamp to avoid -log(0) = Infinity
    const pClamped = Math.max(pCorrect, 0.001);
    const ceLoss = -Math.log(pClamped) * w;
    totalLoss += ceLoss;

    totalWeight += w;
    wSuff += s * w;
    wPrec += p * w;
    wCons += c * w;

    if (dir === "under") underCount++;
    if (dir === "over") overCount++;
    if (LEVEL_INDEX[gtLevel] >= 2) {  // System+
      critTotal++;
      if (s < 1.0) critMiss++;
    }

    rows.push({ behavior_id: b.behavior_id, predicted: b.minimum_level, ground_truth: gtLevel, suff: s, prec: p, cons: c, weight: w, direction: dir, p_correct: pCorrect, ce_loss: ceLoss });
  }

  const sf = wSuff / totalWeight;
  const pr = wPrec / totalWeight;
  const co = wCons / totalWeight;
  const st = 1.0;  // Zod guarantees structure
  const total = 0.55 * sf + 0.20 * pr + 0.15 * co + 0.10 * st;

  return {
    task_id: output.task_id, condition: output.condition,
    sufficiency: sf, precision: pr, consistency: co, structure: st, total,
    rows, under_test_count: underCount, over_test_count: overCount,
    critical_miss_count: critMiss, critical_total: critTotal,
    total_loss: totalLoss,
  };
}

function fmt(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}


/**
 * Build a metrics object from a list of ScoreResults.
 * Keys are experiment-defined (whatever this scorer computes); consumers treat them as opaque.
 */
export function buildMetrics(results: ScoreResult[]): Record<string, number> {
  if (results.length === 0) return {};
  const avg = (key: keyof ScoreResult) =>
    results.reduce((s, r) => s + (r[key] as number), 0) / results.length;
  const sumLoss = results.reduce((s, r) => s + r.total_loss, 0);
  const critMiss = results.reduce((s, r) => s + r.critical_miss_count, 0);
  const critTotal = results.reduce((s, r) => s + r.critical_total, 0);
  return {
    sufficiency: avg("sufficiency"),
    precision: avg("precision"),
    consistency: avg("consistency"),
    structure: avg("structure"),
    critical_miss_rate: critTotal > 0 ? critMiss / critTotal : 0,
    loss: sumLoss,
    score: avg("total") * 100,
  };
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag: string) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
  const jsonMode = args.includes("--json");

  const outputFile = get("--output");
  const gtFile = get("--gt");
  const outputDir = get("--output-dir");
  const gtDir = get("--gt-dir");

  const results: ScoreResult[] = [];
  // In --json mode, send human-readable display to stderr so stdout carries only JSON
  const display = jsonMode
    ? (...args: unknown[]) => process.stderr.write(args.map(String).join(" ") + "\n")
    : (...args: unknown[]) => console.log(...args);

  if (outputFile && gtFile) {
    const output = loadAndValidate(outputFile, ProbeOutput);
    const gt = loadAndValidate(gtFile, GroundTruth);
    results.push(scoreOutput(output, gt));
  } else if (outputDir && gtDir) {
    const files = readdirSync(outputDir).filter(f => f.endsWith(".yaml") || f.endsWith(".yml") || f.endsWith(".json")).sort();
    for (const file of files) {
      const base = file.replace(/^out-[a-z]+-/, "").replace(/\.(yaml|yml|json)$/, "").replace(/^(ec)(\d+)$/, "$1-$2");
      const gtExt = ["json", "yaml", "yml"].find(e => existsSync(`${gtDir}/${base}.${e}`)) ?? "json";
      const gtPath = `${gtDir}/${base}.${gtExt}`;
      try {
        const output = loadAndValidate(`${outputDir}/${file}`, ProbeOutput);
        const gt = loadAndValidate(gtPath, GroundTruth);
        results.push(scoreOutput(output, gt));
      } catch (e) {
        console.error(`Skipping ${file}: ${(e as Error).message}`);
      }
    }
  } else {
    console.error("Usage:");
    console.error("  score-probe.ts --output <file.yaml> --gt <gt.yaml>");
    console.error("  score-probe.ts --output-dir <dir/> --gt-dir <gt-dir/>");
    process.exit(1);
  }

  for (const r of results) {
    const dir = (d: "exact" | "over" | "under") => d === "exact" ? "✓" : d === "over" ? "↑" : "✗";
    display(`\n── ${r.task_id} / ${r.condition} ──`);
    display(`  Sufficiency : ${fmt(r.sufficiency)}`);
    display(`  Precision   : ${fmt(r.precision)}`);
    display(`  Consistency : ${fmt(r.consistency)}`);
    display(`  Structure   : ${fmt(r.structure)}`);
    display(`  TOTAL       : ${fmt(r.total)}`);
    display(`  LOSS        : ${r.total_loss.toFixed(2)}`);
    display(`  Under/Over  : ${r.under_test_count} under, ${r.over_test_count} over`);
    if (r.critical_total > 0) {
      display(`  Crit-miss   : ${r.critical_miss_count}/${r.critical_total} System+ behaviors missed`);
    }
    display(`\n  ${"ID".padEnd(4)} ${"Predicted".padEnd(14)} ${"GT".padEnd(14)} ${"Suff".padEnd(7)} ${"Prec".padEnd(7)} ${"Cons".padEnd(6)} Wt`);
    for (const row of r.rows) {
      const pred = `${row.predicted} ${dir(row.direction)}`;
      display(`  ${String(row.behavior_id).padEnd(4)} ${pred.padEnd(14)} ${row.ground_truth.padEnd(14)} ${fmt(row.suff).padEnd(7)} ${fmt(row.prec).padEnd(7)} ${fmt(row.cons).padEnd(6)} ${row.weight}`);
    }
  }

  if (results.length > 1) {
    const avg = (key: keyof ScoreResult) =>
      results.reduce((s, r) => s + (r[key] as number), 0) / results.length;
    const sumLoss = results.reduce((s, r) => s + r.total_loss, 0);
    display(`\n══ AGGREGATE (${results.length} tasks) ══`);
    display(`  Sufficiency : ${fmt(avg("sufficiency"))}`);
    display(`  Precision   : ${fmt(avg("precision"))}`);
    display(`  Consistency : ${fmt(avg("consistency"))}`);
    display(`  TOTAL       : ${fmt(avg("total"))}`);
    display(`  LOSS        : ${sumLoss.toFixed(2)}`);

    const byCond: Record<string, ScoreResult[]> = {};
    for (const r of results) (byCond[r.condition] ??= []).push(r);
    for (const [cond, rs] of Object.entries(byCond)) {
      const t = rs.reduce((s, r) => s + r.total, 0) / rs.length;
      const l = rs.reduce((s, r) => s + r.total_loss, 0);
      display(`  ${cond}: ${fmt(t)} (loss: ${l.toFixed(2)})`);
    }
  }

  if (jsonMode) {
    const metrics = buildMetrics(results);
    console.log(JSON.stringify({ score: metrics.score, loss: metrics.loss, metrics }));
  }
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
