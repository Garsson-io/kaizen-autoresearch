#!/usr/bin/env npx tsx
/**
 * log-iteration.ts — Mechanically append one iteration result to autoresearch-results.jsonl.
 *
 * Eliminates the error-prone inline Node.js script used for logging.
 * Handles: next iteration number, delta computation, idea status update.
 *
 * Usage:
 *   npx tsx scripts/log-iteration.ts \
 *     --idea <idea-id>                     # from ideas/ (use "baseline" or omit for baseline)
 *     --status keep|discard|no-op|crash    \
 *     --loss <number>                      \
 *     --score <number>                     \
 *     --run-dir <timestamp>                \
 *     --model <model-id>                   \
 *     --description "<one sentence>"       \
 *     [--section "<section name>"]         \
 *     [--edit-type add|remove|replace]     \
 *     [--commit <7-char hash>]             # defaults to git HEAD
 *     [--metrics '<json string>']          # e.g. '{"sufficiency":0.87}'
 *
 * Example (discard):
 *   npx tsx scripts/log-iteration.ts \
 *     --idea top-down-elimination --status discard \
 *     --loss 423.91 --score 89.6 \
 *     --run-dir 20260330-200818 --model gpt-5.3-codex \
 *     --description "top-down-elimination: regression (+26.87 vs baseline)" \
 *     --section "TOP-DOWN-ELIMINATION" --edit-type add
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { PATHS, EXP_DIR } from "./paths.js";
import { IterationResult } from "../src/schema.js";

// ─── Arg parsing ──────────────────────────────────────────────────────────────

function arg(name: string, required = false): string | null {
  const args = process.argv.slice(2);
  const idx = args.indexOf(`--${name}`);
  if (idx < 0) {
    if (required) { console.error(`Missing required arg --${name}`); process.exit(1); }
    return null;
  }
  const val = args[idx + 1];
  if (!val || val.startsWith("--")) {
    if (required) { console.error(`Missing value for --${name}`); process.exit(1); }
    return null;
  }
  return val;
}

// ─── Load existing results ────────────────────────────────────────────────────

function loadResults(): IterationResult[] {
  if (!existsSync(PATHS.results)) return [];
  return readFileSync(PATHS.results, "utf8")
    .split("\n").filter(Boolean)
    .map(l => IterationResult.parse(JSON.parse(l)));
}

// ─── Compute reference loss ───────────────────────────────────────────────────

/**
 * The reference loss is the minimum of:
 *   - The latest baseline loss for this model
 *   - The best kept loss SINCE that latest baseline (if any)
 *
 * A new baseline resets the reference — old keeps from before the baseline
 * are not comparable (different prompt version or model config).
 */
function computeReference(results: IterationResult[], model: string): number | null {
  const forModel = results.filter(r => r.loss !== null && (r.model === model || !model));

  // Latest baseline for this model
  const baselines = forModel.filter(r => r.status === "baseline" && r.loss !== null);
  if (baselines.length === 0) return null;
  const latestBaseline = baselines[baselines.length - 1];
  const baselineLoss = latestBaseline.loss!;
  const baselineIter = latestBaseline.iteration;

  // Best kept AFTER the latest baseline
  const keepsSinceBaseline = forModel.filter(
    r => r.status === "keep" && r.loss !== null && r.iteration > baselineIter,
  );
  const bestKeptLoss = keepsSinceBaseline.length > 0
    ? Math.min(...keepsSinceBaseline.map(r => r.loss!))
    : null;

  if (bestKeptLoss === null) return baselineLoss;
  return Math.min(baselineLoss, bestKeptLoss);
}

// ─── Update idea status in ideas/ ────────────────────────────────────────────

function updateIdeaStatus(ideaId: string, status: string): boolean {
  if (!ideaId || ideaId === "baseline") return false;
  const ideaPath = join(PATHS.ideas, `${ideaId}.md`);
  if (!existsSync(ideaPath)) return false;

  const content = readFileSync(ideaPath, "utf8");
  const ideaStatus = status === "keep" ? "kept"
    : status === "discard" ? "rejected"
    : status === "no-op" ? "parked"
    : null;
  if (!ideaStatus) return false;

  const updated = content.replace(/^status: proposed$/m, `status: ${ideaStatus}`);
  if (updated === content) return false; // already updated or not found

  writeFileSync(ideaPath, updated, "utf8");
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const ideaId = arg("idea") ?? null;
  const status = arg("status", true)! as IterationResult["status"];
  const lossStr = arg("loss");
  const scoreStr = arg("score");
  const runDir = arg("run-dir");
  const model = arg("model") ?? null;
  const description = arg("description", true)!;
  const section = arg("section") ?? null;
  const editTypeStr = arg("edit-type") ?? null;
  const commitArg = arg("commit");
  const metricsStr = arg("metrics");

  const loss = lossStr !== null ? parseFloat(lossStr) : null;
  const score = scoreStr !== null ? parseFloat(scoreStr) : null;
  const editType = editTypeStr as IterationResult["edit_type"] ?? null;

  // Get commit hash
  let commit: string | null = commitArg;
  if (!commit) {
    try {
      commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    } catch {
      commit = null;
    }
  }

  // Load existing results
  const results = loadResults();

  // Next iteration number
  const nextIteration = results.length > 0
    ? Math.max(...results.map(r => r.iteration)) + 1
    : 0;

  // Compute delta
  const referenceModel = model ?? "";
  const referenceLoss = computeReference(results, referenceModel);
  const delta = (loss !== null && referenceLoss !== null)
    ? parseFloat((loss - referenceLoss).toFixed(4))
    : null;

  // Parse metrics
  let metrics: Record<string, number> | undefined;
  if (metricsStr) {
    try { metrics = JSON.parse(metricsStr); } catch { metrics = undefined; }
  }

  // Build entry
  const entry: IterationResult = {
    iteration: nextIteration,
    timestamp: new Date().toISOString(),
    commit,
    run_dir: runDir ?? null,
    idea_id: ideaId,
    score,
    loss,
    delta,
    status,
    description,
    section,
    edit_type: editType,
    model,
    ...(metrics ? { metrics } : {}),
  };

  // Validate
  IterationResult.parse(entry); // throws if invalid

  // Append to JSONL
  appendFileSync(PATHS.results, JSON.stringify(entry) + "\n", "utf8");

  // Update idea status
  const ideaUpdated = ideaId ? updateIdeaStatus(ideaId, status) : false;

  // Output summary
  const deltaStr = delta !== null
    ? ` | Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} vs reference (${referenceLoss?.toFixed(2)})`
    : "";
  const ideaStr = ideaUpdated ? ` | idea status → ${status === "keep" ? "kept" : status === "discard" ? "rejected" : "parked"}` : "";
  console.log(`[iter ${nextIteration}] ${status} | loss=${loss?.toFixed(2) ?? "—"} score=${score?.toFixed(1) ?? "—"}${deltaStr}${ideaStr}`);
  console.log(`  → appended to autoresearch-results.jsonl`);
  if (ideaUpdated) console.log(`  → updated ideas/${ideaId}.md`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
