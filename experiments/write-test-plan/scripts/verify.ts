#!/usr/bin/env npx tsx
/**
 * verify.ts — Run the eval and output a validated JSON score object.
 *
 * Outputs: {"score": 74.2}  (0–100, higher is better)
 * Exits 1 if run-eval.sh fails or produces no parseable SCORE line.
 *
 * Use instead of grep/awk to parse eval output — Zod validates the boundary
 * so the autoresearch loop fails loudly instead of passing garbage downstream.
 *
 * Usage:
 *   npx tsx experiments/write-test-plan/scripts/verify.ts
 *   npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score'
 *
 * From repo root (autoresearch verify command):
 *   npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score'
 */

import { execSync } from "node:child_process";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVAL_DIR = resolve(__dirname, "..");

const VerifyResult = z.object({
  score: z.number().min(0).max(100),
});

const args = process.argv.slice(2);

// --mock <fraction>  e.g. --mock 0.664
// Fast smoke test: skip running run-eval.sh, validate parsing/schema only.
const mockIdx = args.indexOf("--mock");
const mockValue = mockIdx >= 0 ? args[mockIdx + 1] : undefined;

let raw: string;
if (mockValue !== undefined) {
  raw = `SCORE: ${mockValue}`;
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

const match = raw.match(/SCORE:\s*([\d.]+)/);
if (!match) {
  console.error("No SCORE line found in run-eval.sh output");
  console.error("--- raw output ---");
  console.error(raw.slice(-500));
  process.exit(1);
}

const score = parseFloat(match[1]) * 100;

let result: z.infer<typeof VerifyResult>;
try {
  result = VerifyResult.parse({ score });
} catch (err) {
  console.error(`Score validation failed: ${err}`);
  process.exit(1);
}

console.log(JSON.stringify(result));
