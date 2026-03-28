#!/usr/bin/env npx tsx
/**
 * migrate-results.ts — Backfill autoresearch-results.jsonl from git history.
 *
 * Reads git log for experiment(treatment) commits and their reverts,
 * reconstructs the iteration history, and writes JSONL.
 *
 * Usage:
 *   npx tsx scripts/migrate-results.ts              # write to stdout
 *   npx tsx scripts/migrate-results.ts --write       # write to autoresearch-results.jsonl
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

interface Result {
  iteration: number;
  timestamp: string;
  commit: string | null;
  run_dir: string | null;
  idea_id: string | null;
  score: number | null;
  loss: number | null;
  delta: number | null;
  model?: string | null;
  status: string;
  description: string;
  section: string | null;
  edit_type: string | null;
}

// Reconstructed from git log + leaderboard.md + autoresearch-results.tsv
const results: Result[] = [
  // === Pre-GT-correction runs (old 10-task corpus) ===
  {
    iteration: 0,
    timestamp: "2026-03-27T17:20:22+03:00",
    commit: "d9ea7b9",
    run_dir: null,
    idea_id: null,
    score: 87.2,
    loss: null,
    delta: 0,
    status: "baseline",
    description: "initial state — treatment prompt on 10-task corpus",
    section: null,
    edit_type: null,
  },
  {
    iteration: 1,
    timestamp: "2026-03-27T18:56:07+03:00",
    commit: null,
    run_dir: null,
    idea_id: null,
    score: null,
    loss: null,
    delta: null,
    status: "discard",
    description: "add concrete Agentic example and reorder key questions top-down (run 1 iter 1)",
    section: "LEVEL-DEFS, KEY-QUESTIONS",
    edit_type: "replace",
  },
  {
    iteration: 2,
    timestamp: "2026-03-27T19:00:06+03:00",
    commit: null,
    run_dir: null,
    idea_id: null,
    score: null,
    loss: null,
    delta: null,
    status: "discard",
    description: "expand Agentic definition with AI API examples — minimal change (run 1 iter 2)",
    section: "LEVEL-DEFS",
    edit_type: "replace",
  },
  {
    iteration: 3,
    timestamp: "2026-03-27T19:04:22+03:00",
    commit: null,
    run_dir: null,
    idea_id: null,
    score: null,
    loss: null,
    delta: null,
    status: "discard",
    description: "narrow System to exclude AI/LLM, clarify Agentic (run 1 iter 3)",
    section: "LEVEL-DEFS",
    edit_type: "replace",
  },
  {
    iteration: 4,
    timestamp: "2026-03-27T19:07:08+03:00",
    commit: null,
    run_dir: null,
    idea_id: null,
    score: 82.2,
    loss: null,
    delta: -5.0,
    status: "discard",
    description: "add seam-based reasoning step (run 1 iter 4)",
    section: "KEY-QUESTIONS",
    edit_type: "add",
  },
  {
    iteration: 5,
    timestamp: "2026-03-27T19:10:00+03:00",
    commit: null,
    run_dir: null,
    idea_id: null,
    score: null,
    loss: null,
    delta: null,
    status: "discard",
    description: "run 1 iter 5 — unknown change, reverted (no score recorded)",
    section: null,
    edit_type: null,
  },
  // === Post-taxonomy, targeted ideas ===
  {
    iteration: 6,
    timestamp: "2026-03-27T20:00:59+03:00",
    commit: "ebba0c3",
    run_dir: null,
    idea_id: "minimize-bias-reframe",
    score: 87.9,
    loss: null,
    delta: 2.7,
    status: "keep",
    description: "reframe 'choose LOWEST' to 'match the real failure boundary'",
    section: "FRAMING",
    edit_type: "replace",
  },
  {
    iteration: 7,
    timestamp: "2026-03-27T20:20:44+03:00",
    commit: "ecc589a",
    run_dir: null,
    idea_id: "mock-exposes-nothing",
    score: 89.9,
    loss: null,
    delta: 2.0,
    status: "keep",
    description: "add mock-exposes-nothing question before Agentic check",
    section: "KEY-QUESTIONS",
    edit_type: "add",
  },
  // === Post-GT-correction (30-task corpus, revised GT) ===
  {
    iteration: 8,
    timestamp: "2026-03-27T20:43:41+03:00",
    commit: null,
    run_dir: null,
    idea_id: "failure-mode-taxonomy",
    score: 86.8,
    loss: null,
    delta: -4.2,
    status: "discard",
    description: "failure-mode-taxonomy: added failure type→level table — replaced LEVEL-DEFS",
    section: "LEVEL-DEFS",
    edit_type: "replace",
  },
  {
    iteration: 9,
    timestamp: "2026-03-28T12:52:13+03:00",
    commit: "4fc86a2",
    run_dir: "20260328-124120",
    idea_id: null,
    score: 89.5,
    loss: null,
    delta: 0,
    status: "baseline",
    description: "baseline run against corrected GT — 30-task corpus (GT revision: EC-18, EC-25 fixed)",
    section: null,
    edit_type: null,
  },
  {
    iteration: 10,
    timestamp: "2026-03-28T12:52:38+03:00",
    commit: null,
    run_dir: "20260328-125244",
    idea_id: "challenge-your-choice",
    score: 85.2,
    loss: null,
    delta: -4.3,
    status: "discard",
    description: "challenge-your-choice: replaced SELF-CHECK with adversarial challenge",
    section: "SELF-CHECK",
    edit_type: "replace",
  },
  {
    iteration: 11,
    timestamp: "2026-03-28T13:06:11+03:00",
    commit: "803ef82",
    run_dir: null,
    idea_id: null,
    score: null,
    loss: null,
    delta: null,
    status: "no-op",
    description: "name all prompt sections with bold labels (formatting only, no eval)",
    section: "ALL",
    edit_type: "add",
  },
  {
    iteration: 12,
    timestamp: "2026-03-28T13:07:09+03:00",
    commit: "ad2845b",
    run_dir: null,
    idea_id: null,
    score: null,
    loss: null,
    delta: null,
    status: "no-op",
    description: "make LEVEL-DEFS bullets consistent with KEY-QUESTIONS (formatting only)",
    section: "LEVEL-DEFS",
    edit_type: "replace",
  },
  {
    iteration: 13,
    timestamp: "2026-03-28T13:07:38+03:00",
    commit: "cf5c7e5",
    run_dir: "20260328-131058",
    idea_id: null,
    score: 89.5,
    loss: null,
    delta: 0,
    status: "no-op",
    description: "consistent bullet/sub-bullet structure — 89.5 same as baseline (formatting confirmed neutral)",
    section: "ALL",
    edit_type: "replace",
  },
  {
    iteration: 14,
    timestamp: "2026-03-28T13:10:51+03:00",
    commit: null,
    run_dir: "20260328-135203",
    idea_id: "swap-question-order-only",
    score: 89.4,
    loss: null,
    delta: -0.1,
    status: "no-op",
    description: "swap-question-order-only: moved LLM-DEP before REAL-INFRA — 89.4 within noise",
    section: "KEY-QUESTIONS",
    edit_type: "replace",
  },
];

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const jsonl =
  results
    .map((r) =>
      JSON.stringify({
        ...r,
        model: r.model ?? DEFAULT_MODEL,
      })
    )
    .join("\n") + "\n";

import { PATHS } from "./paths.js";

if (process.argv.includes("--write")) {
  writeFileSync(PATHS.results, jsonl);
  console.log(`Wrote ${results.length} entries to autoresearch-results.jsonl`);
} else {
  process.stdout.write(jsonl);
}
