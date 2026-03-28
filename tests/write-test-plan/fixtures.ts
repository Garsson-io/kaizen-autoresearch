/** Shared fixture paths used across multiple test files. */
import { join, resolve } from "path";

export const REPO_ROOT = resolve(import.meta.dirname, "../..");
export const EXP_DIR = join(REPO_ROOT, "experiments/write-test-plan");
export const EXP_SCRIPTS = join(EXP_DIR, "scripts");

export const FIXTURES_DIR = join(import.meta.dirname, "fixtures");
export const FIXTURE_RUN = join(FIXTURES_DIR, "runs/test-run-001");
export const FIXTURE_LOG = join(FIXTURE_RUN, "out-treatment-ec01.log");
export const FIXTURE_OUTPUT = join(FIXTURE_RUN, "out-treatment-ec01.json");
export const FIXTURE_GT_DIR = join(FIXTURES_DIR, "ground-truth");
export const FIXTURE_GT = join(FIXTURE_GT_DIR, "ec-01.json");
export const FIXTURE_IDEAS_DIR = join(FIXTURES_DIR, "ideas");
export const FIXTURE_RESULTS = join(FIXTURES_DIR, "results.jsonl");
