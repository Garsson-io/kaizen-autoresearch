#!/usr/bin/env npx tsx
import { existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import { ExploreResult } from "../src/schema.js";
import { PATHS } from "./paths.js";
import { scoreRunDir, scoreVariation } from "./explore.js";
import { readJsonl, writeJsonl } from "./jsonl.js";

type Row = ReturnType<typeof ExploreResult.parse>;

function keyOf(r: Row): string {
  return `${r.timestamp}::${r.idea_id}`;
}

function parseRunLikeTimestamp(s: string): number | null {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;
  // Parse as local time; run directories are created in local timezone.
  const dt = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6]),
  );
  return Number.isNaN(dt.getTime()) ? null : dt.getTime();
}

function taskFileName(task: string): string {
  return `out-treatment-${task.replace(/-/g, "").toLowerCase()}.json`;
}

function direction(delta: number): "improved" | "hurt" | "flat" {
  if (delta < -1.0) return "improved";
  if (delta > 1.0) return "hurt";
  return "flat";
}

function computeConcentration(perTask: Array<{ task: string; delta: number }>) {
  const improvements = perTask.filter(p => p.delta < 0);
  if (improvements.length === 0) {
    return { concentrationTask: null as string | null, concentrationPct: null as number | null };
  }
  const totalImprovement = improvements.reduce((s, p) => s + Math.abs(p.delta), 0);
  if (totalImprovement <= 0) {
    return { concentrationTask: null as string | null, concentrationPct: null as number | null };
  }
  const maxImprover = improvements.reduce((a, b) => Math.abs(a.delta) > Math.abs(b.delta) ? a : b);
  const concentrationPct = Math.abs(maxImprover.delta) / totalImprovement;
  return {
    concentrationTask: concentrationPct > 0.6 ? maxImprover.task : null,
    concentrationPct,
  };
}

function main() {
  const program = new Command();
  program
    .option("--enrich-from-artifacts", "reconstruct per-task/concentration from committed run artifacts", false)
    .option("--baseline-tolerance <n>", "max allowed |recomputed - logged baseline_loss| (default: 1.0)", (v) => Number(v), 1.0)
    .option("--write", "write changes in place (default: dry-run)", false)
    .parse(process.argv);
  const opts = program.opts<{ write?: boolean; enrichFromArtifacts?: boolean; baselineTolerance?: number }>();

  if (!existsSync(PATHS.exploreLog)) {
    console.error(`Missing file: ${PATHS.exploreLog}`);
    process.exit(1);
  }

  const rows = readJsonl(PATHS.exploreLog, (l, i) => {
    try {
      return ExploreResult.parse(JSON.parse(l));
    } catch (err) {
      throw new Error(`Line ${i + 1} parse error: ${(err as Error).message}`);
    }
  });

  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = keyOf(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }

  let touched = 0;
  let setSelectCount = 0;
  let setNoSignal = 0;
  let inconsistent = 0;
  let enrichedRows = 0;
  let enrichedBatches = 0;
  let skippedNoBaseline = 0;
  let skippedNoVariation = 0;
  let skippedVariationMismatch = 0;
  let skippedBaselineMismatch = 0;

  for (const [, group] of groups) {
    const winners = group.filter(r => r.winner);
    const hasWinner = winners.length > 0;
    if (winners.length > 1) {
      inconsistent += 1;
    }

    for (const r of group) {
      let changed = false;

      if (r.select_count === undefined) {
        r.select_count = r.tasks.length;
        setSelectCount += 1;
        changed = true;
      }

      // Safe deterministic backfill: only infer no-signal when there is no winner in batch.
      if (!hasWinner && r.signal === undefined) {
        r.signal = "no-signal";
        setNoSignal += 1;
        changed = true;
      }

      if (changed) touched += 1;
    }
  }

  if (opts.enrichFromArtifacts) {
    const exploreRoot = join(PATHS.runs, "explore");
    const runDirs = readdirSync(PATHS.runs)
      .filter(d => /^\d{8}-\d{6}$/.test(d))
      .map(d => ({ name: d, ts: parseRunLikeTimestamp(d), dir: join(PATHS.runs, d) }))
      .filter(d => d.ts !== null) as Array<{ name: string; ts: number; dir: string }>;
    runDirs.sort((a, b) => a.ts - b.ts);

    const baselineCache = new Map<string, Record<string, number>>();

    for (const [, group] of groups) {
      const first = group[0];
      const batchTs = new Date(first.timestamp).getTime();
      const tasks = first.tasks;

      const candidateBaselineRuns = runDirs
        .filter(r => r.ts <= batchTs)
        .filter(r => tasks.every(t => existsSync(join(r.dir, taskFileName(t)))))
        .slice(-12); // Search recent candidates only; enough for close-time matching.

      if (candidateBaselineRuns.length === 0) {
        skippedNoBaseline += 1;
        continue;
      }

      let picked: { name: string; ts: number; dir: string; losses: Record<string, number>; baselineLoss: number } | null = null;
      let bestGap = Number.POSITIVE_INFINITY;
      for (const cand of candidateBaselineRuns) {
        let losses = baselineCache.get(cand.dir);
        if (!losses) {
          losses = Object.fromEntries(scoreRunDir(cand.dir).map(x => [x.taskId, x.loss]));
          baselineCache.set(cand.dir, losses);
        }
        const baselineLoss = tasks.reduce((s, t) => s + (losses![t] ?? 0), 0);
        const gap = Math.abs(baselineLoss - first.baseline_loss);
        if (gap < bestGap) {
          bestGap = gap;
          picked = { ...cand, losses, baselineLoss };
        }
      }

      if (!picked || bestGap > (opts.baselineTolerance ?? 1.0)) {
        skippedBaselineMismatch += 1;
        continue;
      }

      let batchEnriched = false;

      for (const r of group) {
        const variationPrefix = `${r.idea_id}-${r.prompt_diff}-`;
        const candidates = readdirSync(exploreRoot)
          .filter(d => d.startsWith(variationPrefix))
          .map(d => {
            const tsSuffix = d.match(/-(\d{8}-\d{6})$/)?.[1];
            const ts = tsSuffix ? parseRunLikeTimestamp(tsSuffix) : null;
            return { name: d, dir: join(exploreRoot, d), ts: ts ?? Number.NaN };
          })
          .filter(c => tasks.every(t => existsSync(join(c.dir, taskFileName(t)))));

        if (candidates.length === 0) {
          skippedNoVariation += 1;
          continue;
        }

        let pickedVar:
          | { dir: string; losses: Record<string, number>; totalLoss: number; gap: number }
          | null = null;
        for (const c of candidates) {
          const losses = scoreVariation(c.dir, tasks);
          const totalLoss = tasks.reduce((s, t) => s + losses[t], 0);
          const gap = Math.abs(totalLoss - r.variation_loss);
          if (!pickedVar || gap < pickedVar.gap) {
            pickedVar = { dir: c.dir, losses, totalLoss, gap };
          }
        }

        if (!pickedVar || pickedVar.gap > 1.0) {
          skippedVariationMismatch += 1;
          continue;
        }

        const perTask = tasks.map(task => {
          const baseline = picked!.losses[task];
          const variation = pickedVar!.losses[task];
          const delta = variation - baseline;
          return { task, baseline, variation, delta, direction: direction(delta) };
        });

        const improved = perTask.filter(p => p.direction === "improved").length;
        const hurt = perTask.filter(p => p.direction === "hurt").length;
        const flat = perTask.filter(p => p.direction === "flat").length;
        const { concentrationTask, concentrationPct } = computeConcentration(
          perTask.map(p => ({ task: p.task, delta: p.delta })),
        );

        const existingVarGap = r.per_task
          ? Math.abs(r.per_task.reduce((s, p) => s + p.variation, 0) - r.variation_loss)
          : Number.POSITIVE_INFINITY;
        const shouldReplacePerTask = r.per_task === undefined || existingVarGap > 0.25;

        let changed = false;
        if (shouldReplacePerTask) {
          r.per_task = perTask;
          changed = true;
        }
        if (shouldReplacePerTask || r.improved === undefined) {
          r.improved = improved;
          changed = true;
        }
        if (shouldReplacePerTask || r.hurt === undefined) {
          r.hurt = hurt;
          changed = true;
        }
        if (shouldReplacePerTask || r.flat === undefined) {
          r.flat = flat;
          changed = true;
        }
        if (shouldReplacePerTask || r.concentration_task === undefined) {
          r.concentration_task = concentrationTask;
          changed = true;
        }
        if (shouldReplacePerTask || r.concentration_pct === undefined) {
          r.concentration_pct = concentrationPct;
          changed = true;
        }
        if (changed) {
          touched += 1;
          enrichedRows += 1;
          batchEnriched = true;
        }
      }

      if (batchEnriched) enrichedBatches += 1;
    }
  }

  console.log(`Rows: ${rows.length}`);
  console.log(`Groups: ${groups.size}`);
  console.log(`Touched rows: ${touched}`);
  console.log(`Backfilled select_count: ${setSelectCount}`);
  console.log(`Backfilled signal=no-signal: ${setNoSignal}`);
  console.log(`Inconsistent groups (>1 winner row): ${inconsistent}`);
  if (opts.enrichFromArtifacts) {
    console.log(`Artifact-enriched rows: ${enrichedRows}`);
    console.log(`Artifact-enriched batches: ${enrichedBatches}`);
    console.log(`Skipped batches (no baseline run): ${skippedNoBaseline}`);
    console.log(`Skipped batches (baseline mismatch): ${skippedBaselineMismatch}`);
    console.log(`Skipped rows (no matching variation dir): ${skippedNoVariation}`);
    console.log(`Skipped rows (variation loss mismatch): ${skippedVariationMismatch}`);
  }
  console.log(`Mode: ${opts.write ? "WRITE" : "DRY-RUN"}`);

  if (opts.write) {
    writeJsonl(PATHS.exploreLog, rows);
    console.log(`Wrote: ${PATHS.exploreLog}`);
  }
}

main();
