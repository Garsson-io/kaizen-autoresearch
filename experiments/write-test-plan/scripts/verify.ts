#!/usr/bin/env npx tsx
/**
 * verify.ts — Run the eval and output validated JSON with score and loss.
 *
 * Outputs: {"score": 89.5, "loss": 23.4}
 *   score: 0–100, higher is better (aggregate %)
 *   loss: weighted cross-entropy loss, lower is better (sum of -log(P(correct)) * weight)
 * Exits 1 if run-eval.sh fails or produces no parseable output.
 *
 * Usage:
 *   npx tsx experiments/write-test-plan/scripts/verify.ts
 *   npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.loss'
 *   npx tsx experiments/write-test-plan/scripts/verify.ts --mock 0.895 --mock-loss 23.4
 */

import { execSync } from "node:child_process";
import { z } from "zod";
import { EXP_DIR } from "./paths";

const EVAL_DIR = EXP_DIR;

const VerifyResult = z.object({
  score: z.number().min(0).max(100),
  loss: z.number().min(0),
  /** Experiment-specific sub-metrics from the scorer (keys are scorer-defined) */
  metrics: z.record(z.string(), z.number()).optional(),
});

const args = process.argv.slice(2);

const mockIdx = args.indexOf("--mock");
const mockValue = mockIdx >= 0 ? args[mockIdx + 1] : undefined;
const mockLossIdx = args.indexOf("--mock-loss");
const mockLossValue = mockLossIdx >= 0 ? args[mockLossIdx + 1] : undefined;

let raw: string;
if (mockValue !== undefined) {
  raw = `SCORE: ${mockValue}\nLOSS: ${mockLossValue ?? "0.0"}`;
} else {
  try {
    raw = execSync("./run-eval.sh", {
      cwd: EVAL_DIR,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 600_000,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`run-eval.sh failed: ${msg}`);
    process.exit(1);
  }
}

// Prefer structured METRICS_JSON line (emitted by score.ts --json via run-eval.sh)
const metricsJsonMatch = raw.match(/^METRICS_JSON:\s*(.+)$/m);

let score: number;
let loss: number;
let metrics: Record<string, number> | undefined;

if (metricsJsonMatch) {
  let parsed: { score?: number; loss?: number; metrics?: Record<string, number> };
  try {
    parsed = JSON.parse(metricsJsonMatch[1]);
  } catch {
    console.error("Failed to parse METRICS_JSON line");
    console.error(metricsJsonMatch[1]);
    process.exit(1);
  }
  score = parsed.score ?? 0;
  loss = parsed.loss ?? 0;
  metrics = parsed.metrics;
} else {
  // Legacy fallback: parse separate SCORE: and LOSS: text lines
  const scoreMatch = raw.match(/SCORE:\s*([\d.]+)/);
  if (!scoreMatch) {
    console.error("No SCORE line or METRICS_JSON found in run-eval.sh output");
    console.error("--- last 500 chars ---");
    console.error(raw.slice(-500));
    process.exit(1);
  }
  const lossMatch = raw.match(/LOSS:\s*([\d.]+)/);
  score = parseFloat(scoreMatch[1]) * 100;
  loss = lossMatch ? parseFloat(lossMatch[1]) : 0;
}

let result: z.infer<typeof VerifyResult>;
try {
  result = VerifyResult.parse({ score: Math.min(100, Math.max(0, score)), loss: Math.max(0, loss), metrics });
} catch (err) {
  console.error(`Validation failed: ${err}`);
  process.exit(1);
}

console.log(JSON.stringify(result));
