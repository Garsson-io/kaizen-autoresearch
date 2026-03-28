/**
 * paths.ts — Shared path resolution. Always relative to git repo root.
 *
 * Works regardless of cwd (repo root, experiment dir, or anywhere else).
 */

import { execSync } from "child_process";
import { join, resolve } from "path";
import { existsSync, readdirSync } from "fs";

/** Git repo root (absolute path) */
export const REPO_ROOT = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();

/** Experiment directory (absolute path) */
export const EXP_DIR = join(REPO_ROOT, "experiments", "write-test-plan");

/** Commonly used paths */
export const PATHS = {
  ideas: join(EXP_DIR, "ideas"),
  taxonomy: join(EXP_DIR, "taxonomy"),
  corpus: join(EXP_DIR, "corpus"),
  groundTruth: join(EXP_DIR, "ground-truth"),
  prompts: join(EXP_DIR, "prompts"),
  runs: join(EXP_DIR, "runs"),
  scripts: join(EXP_DIR, "scripts"),
  src: join(EXP_DIR, "src"),
  results: join(EXP_DIR, "autoresearch-results.jsonl"),
  leaderboard: join(EXP_DIR, "leaderboard.md"),
  metaFailures: join(EXP_DIR, "meta-failures.md"),
  justificationTaxonomy: join(EXP_DIR, "justification-taxonomy.md"),
  treatment: join(EXP_DIR, "prompts", "treatment.md"),
  runEval: join(EXP_DIR, "run-eval.sh"),
} as const;

/**
 * Resolve a run directory from a name/timestamp or absolute path.
 * Falls back to `latest` symlink, then most-recent timestamped dir.
 */
export function getRunDir(runName?: string): string {
  const runsBase = PATHS.runs;
  if (runName) return resolve(runsBase, runName);
  const latest = join(runsBase, "latest");
  if (existsSync(latest)) return latest;
  const dirs = readdirSync(runsBase).filter((d) => /^\d{8}-\d{6}$/.test(d)).sort();
  if (dirs.length === 0) throw new Error(`No run directories found in ${runsBase}`);
  return join(runsBase, dirs[dirs.length - 1]);
}
