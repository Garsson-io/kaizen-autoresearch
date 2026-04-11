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
 *   npx tsx experiments/write-test-plan/scripts/verify.ts --cli codex --model gpt-5.3-codex
 *   npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.loss'
 *   npx tsx experiments/write-test-plan/scripts/verify.ts --mock 0.895 --mock-loss 23.4
 */

import { z } from "zod";
import { fileURLToPath } from "node:url";
import { runEvalProcess } from "./run-eval-process.js";
import { consumeFlag, consumeFlagValue } from "./cli-args.js";

const VerifyResult = z.object({
  score: z.number().min(0).max(100),
  loss: z.number().min(0),
  /** Experiment-specific sub-metrics from the scorer (keys are scorer-defined) */
  metrics: z.record(z.string(), z.number()).optional(),
});

type ParsedMetrics = { score: number; loss: number; metrics?: Record<string, number> };
type VerifyArgs = {
  dryCheck: boolean;
  timeoutMs: number;
  mockValue?: string;
  mockLossValue?: string;
  passThroughArgs: string[];
};

const args = process.argv.slice(2);

function fail(message: string, details?: string): never {
  console.error(message);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

export function buildVerifyArgs(allArgs: string[]): VerifyArgs {
  const consumed = new Set<number>();
  const mockValue = consumeFlagValue(allArgs, "--mock", consumed);
  const mockLossValue = consumeFlagValue(allArgs, "--mock-loss", consumed);
  const timeoutValue = consumeFlagValue(allArgs, "--timeout-ms", consumed);
  const dryCheck = consumeFlag(allArgs, "--dry-check", consumed) || consumeFlag(allArgs, "--no-run", consumed);

  const timeoutNum = timeoutValue === undefined ? NaN : Number(timeoutValue);
  const timeoutMs = Number.isFinite(timeoutNum) && timeoutNum > 0 ? timeoutNum : 3_600_000;
  const passThroughArgs = allArgs.filter((_, idx) => !consumed.has(idx));

  return { dryCheck, timeoutMs, mockValue, mockLossValue, passThroughArgs };
}

export function parseAndValidateResult(raw: string): z.infer<typeof VerifyResult> {
  const parsed = parseOutput(raw);
  return VerifyResult.parse({
    score: Math.min(100, Math.max(0, parsed.score)),
    loss: Math.max(0, parsed.loss),
    metrics: parsed.metrics,
  });
}

export function parseOutput(raw: string): ParsedMetrics {
  // Prefer structured METRICS_JSON line (emitted by score.ts --json via run-eval.sh)
  const metricsJsonMatch = raw.match(/^METRICS_JSON:\s*(.+)$/m);
  if (metricsJsonMatch) {
    let parsed: { score?: number; loss?: number; metrics?: Record<string, number> };
    try {
      parsed = JSON.parse(metricsJsonMatch[1]);
    } catch {
      throw new Error("Failed to parse METRICS_JSON line");
    }
    return {
      score: parsed.score ?? 0,
      loss: parsed.loss ?? 0,
      metrics: parsed.metrics,
    };
  }

  // Legacy fallback: parse separate SCORE: and LOSS: text lines
  const scoreMatch = raw.match(/SCORE:\s*([\d.]+)/);
  if (!scoreMatch) {
    throw new Error("No SCORE line or METRICS_JSON found in run-eval.sh output");
  }
  const lossMatch = raw.match(/LOSS:\s*([\d.]+)/);
  return {
    score: parseFloat(scoreMatch[1]) * 100,
    loss: lossMatch ? parseFloat(lossMatch[1]) : 0,
  };
}

export async function main() {
  const { dryCheck, timeoutMs, mockValue, mockLossValue, passThroughArgs } = buildVerifyArgs(args);
  let raw: string;
  if (dryCheck) {
    // Parser-only mode: validates parsing contract without invoking run-eval.sh.
    raw = 'METRICS_JSON: {"score":89.5,"loss":23.4,"metrics":{"strict_accuracy":89.5}}';
  } else if (mockValue !== undefined) {
    raw = `SCORE: ${mockValue}\nLOSS: ${mockLossValue ?? "0.0"}`;
  } else {
    console.error(`verify.ts timeout_ms=${timeoutMs}`);
    try {
      const result = await runEvalProcess({
        args: passThroughArgs,
        timeoutMs,
        streamStdout: true,
        streamStderr: true,
      });
      raw = result.stdout;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      fail(`run-eval.sh failed: ${msg}`);
    }
  }

  let result: z.infer<typeof VerifyResult>;
  try {
    result = parseAndValidateResult(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    fail(msg, `--- last 500 chars ---\n${raw.slice(-500)}`);
  }

  console.log(JSON.stringify(result));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
