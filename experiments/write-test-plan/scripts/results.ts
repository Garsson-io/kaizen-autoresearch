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
 */

import { readFileSync } from "fs";
import { IterationResult } from "../src/schema.js";
import { PATHS } from "./paths.js";

const resultsPath = PATHS.results;

function loadResults(): IterationResult[] {
  const content = readFileSync(resultsPath, "utf8").trim();
  if (!content) return [];
  return content.split("\n").map((line) => {
    const parsed = IterationResult.parse(JSON.parse(line));
    return parsed;
  });
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

  console.log(
    `${"#".padStart(3)} ${"ST".padEnd(3)} ${"LOSS".padStart(7)} ${"SCORE".padStart(6)} ${"DELTA".padStart(7)} ${"IDEA".padEnd(26)} DESCRIPTION`
  );
  console.log("-".repeat(110));

  for (const r of results) {
    const icon = statusIcon[r.status] || "?";
    const loss = r.loss !== null ? r.loss.toFixed(3) : "   -  ";
    const score = r.score !== null ? r.score.toFixed(1) : "  -  ";
    const delta =
      r.delta !== null
        ? (r.delta >= 0 ? "+" : "") + r.delta.toFixed(1)
        : "   -  ";
    const idea = (r.idea_id || "").padEnd(26);
    const desc = r.description.slice(0, 55);
    console.log(
      `${String(r.iteration).padStart(3)} [${icon}] ${loss.padStart(7)} ${score.padStart(6)} ${delta.padStart(7)} ${idea} ${desc}`
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
  if (keeps.length > 0) {
    console.log(`\nKept changes:`);
    for (const k of keeps) {
      console.log(`  [${k.iteration}] +${k.delta} — ${k.idea_id}: ${k.description}`);
    }
  }
}

// Main
const results = loadResults();
const flag = process.argv[2];

switch (flag) {
  case "--last": {
    const n = parseInt(process.argv[3] || "5");
    printTable(results.slice(-n));
    break;
  }
  case "--keeps":
    printTable(results.filter((r) => r.status === "keep"));
    break;
  case "--summary":
    printSummary(results);
    break;
  case "--json":
    console.log(JSON.stringify(results, null, 2));
    break;
  default:
    printTable(results);
}
