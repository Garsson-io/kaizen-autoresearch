#!/usr/bin/env npx tsx
/**
 * results.ts — Read and display autoresearch-results.jsonl
 *
 * Usage:
 *   npx tsx scripts/results.ts              # table view (default)
 *   npx tsx scripts/results.ts --last 5     # last 5 entries
 *   npx tsx scripts/results.ts --keeps      # only kept iterations
 *   npx tsx scripts/results.ts --summary    # aggregate stats
 *   npx tsx scripts/results.ts --json       # raw JSON array
 *   npx tsx scripts/results.ts --model gpt-5.3-codex --last 10
 */

import { IterationResult } from "../src/schema.js";
import { PATHS } from "./paths.js";
import { readJsonl } from "./jsonl.js";
import { getFlagValue, hasFlag } from "./cli-args.js";

const resultsPath = PATHS.results;

function loadResults(): IterationResult[] {
  return readJsonl(resultsPath, (line) => IterationResult.parse(JSON.parse(line)));
}

function printTable(results: IterationResult[]) {
  const statusIcon: Record<string, string> = {
    baseline: "=",
    keep: "+",
    discard: "x",
    crash: "!",
    "no-op": ".",
    "hook-blocked": "#",
  };

  const formatModel = (model: string | null | undefined): string =>
    (model ?? "-").slice(0, 16).padEnd(16);

  console.log(
    `${"#".padStart(3)} ${"ST".padEnd(3)} ${"LOSS".padStart(7)} ${"SCORE".padStart(6)} ${"Δloss".padStart(7)} ${"MODEL".padEnd(16)} ${"IDEA".padEnd(26)} DESCRIPTION`
  );
  console.log("-".repeat(128));

  for (const r of results) {
    const icon = statusIcon[r.status] || "?";
    const loss = r.loss !== null ? r.loss.toFixed(3) : "   -  ";
    const score = r.score !== null ? r.score.toFixed(1) : "  -  ";
    const delta =
      r.delta !== null
        ? (r.delta >= 0 ? "+" : "") + r.delta.toFixed(1)
        : "   -  ";
    const model = formatModel(r.model);
    const idea = (r.idea_id || "").padEnd(26);
    const desc = r.description.slice(0, 40);
    console.log(
      `${String(r.iteration).padStart(3)} [${icon}] ${loss.padStart(7)} ${score.padStart(6)} ${delta.padStart(7)} ${model} ${idea} ${desc}`
    );
  }
}

function printSummary(results: IterationResult[]) {
  const counts = results.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const scores = results.filter((r) => r.score !== null).map((r) => r.score!);
  const losses = results.filter((r) => r.loss !== null).map((r) => r.loss!);
  const baselines = results.filter((r) => r.status === "baseline");
  const latest = baselines[baselines.length - 1];
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const bestLoss = losses.length > 0 ? Math.min(...losses) : null;

  console.log(`=== Results Summary ===`);
  console.log(`Total iterations: ${results.length}`);
  console.log(
    `Breakdown: ${Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ")}`
  );
  if (bestLoss !== null) {
    console.log(`Best loss: ${bestLoss.toFixed(3)} (lower is better)`);
  }
  if (bestScore !== null) {
    console.log(`Best score: ${bestScore.toFixed(1)} (legacy, higher is better)`);
  }
  console.log(`Latest baseline — loss: ${latest?.loss ?? "none"}, score: ${latest?.score ?? "none"}`);
  console.log(
    `Keep rate: ${(((counts["keep"] || 0) / (results.length - (counts["baseline"] || 0))) * 100).toFixed(0)}%`
  );

  const keeps = results.filter((r) => r.status === "keep");
  const byModel = results.reduce(
    (acc, r) => {
      const key = r.model ?? "unknown";
      (acc[key] ||= []).push(r);
      return acc;
    },
    {} as Record<string, IterationResult[]>
  );

  console.log(`\nBy model:`);
  for (const [model, rows] of Object.entries(byModel)) {
    const modelLosses = rows.filter((r) => r.loss !== null).map((r) => r.loss!);
    const modelBestLoss = modelLosses.length ? Math.min(...modelLosses).toFixed(3) : "n/a";
    console.log(`  ${model}: ${rows.length} runs, best loss ${modelBestLoss}`);
  }

  if (keeps.length > 0) {
    console.log(`\nKept changes:`);
    for (const k of keeps) {
      const dStr =
        k.delta !== null
          ? k.delta < 0
            ? `${k.delta.toFixed(1)}`
            : `+${k.delta.toFixed(1)}`
          : "—";
      console.log(`  [${k.iteration}] ${dStr} loss — ${k.idea_id}: ${k.description}`);
    }
  }
}

// Main
const allResults = loadResults();
const args = process.argv.slice(2);

const modelFilter = getFlagValue(args, "--model") ?? null;
const showKeeps = hasFlag(args, "--keeps");
const showSummary = hasFlag(args, "--summary");
const showJson = hasFlag(args, "--json");
const lastRaw = getFlagValue(args, "--last");
const lastN = hasFlag(args, "--last") ? (lastRaw ? parseInt(lastRaw, 10) : 5) : null;

let results = allResults;
if (modelFilter) {
  results = results.filter((r) => (r.model ?? "") === modelFilter);
}

if (showKeeps) {
  results = results.filter((r) => r.status === "keep");
}

if (lastN !== null) {
  results = results.slice(-lastN);
}

if (showSummary) {
  printSummary(results);
} else if (showJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  printTable(results);
}
