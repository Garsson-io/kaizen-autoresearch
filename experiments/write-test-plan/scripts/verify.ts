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
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVAL_DIR = resolve(__dirname, "..");

const VerifyResult = z.object({
  score: z.number().min(0).max(100),
  loss: z.number().min(0),
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

const scoreMatch = raw.match(/SCORE:\s*([\d.]+)/);
if (!scoreMatch) {
  console.error("No SCORE line found in run-eval.sh output");
  console.error("--- last 500 chars ---");
  console.error(raw.slice(-500));
  process.exit(1);
}

const lossMatch = raw.match(/LOSS:\s*([\d.]+)/);

const score = parseFloat(scoreMatch[1]) * 100;
const loss = lossMatch ? parseFloat(lossMatch[1]) : -1;

let result: z.infer<typeof VerifyResult>;
try {
  result = VerifyResult.parse({ score, loss: Math.max(0, loss) });
} catch (err) {
  console.error(`Validation failed: ${err}`);
  process.exit(1);
}

console.log(JSON.stringify(result));
