---
name: run-experiment
description: Run the full experiment iteration loop with mandatory MINE, META, and IDEATE steps.
argument-hint: "<experiment-name> [--iterations N]"
---

## Setup

Parse `$ARGUMENTS` for experiment name (default: `write-test-plan`) and optional `--iterations N` (default: unbounded).

**Working directory**: Stay at repo root. All paths in program.md are relative to the repo root.

## You MUST read these files and follow their instructions

| File | Why |
|------|-----|
| `experiments/<name>/program.md` | **Your instructions.** The iteration loop, metric, edit rules. This is the authority — follow it. |
| `experiments/<name>/meta-failures.md` | Process mistakes to avoid repeating. |
| `experiments/<name>/leaderboard.md` | What's been tried and what scored what. |
| `experiments/<name>/justification-taxonomy.md` | Impact-ranked failure patterns — what goes wrong and why. |

## Architecture: you are the EXECUTOR, the subagent is the THINKER

The loop in program.md has two kinds of steps:

**Mechanical steps (you do these):** MINE, DIAGNOSE, META, EDIT, COMMIT, RUN, SCORE, LOG, COMMIT RUNS. These are deterministic — follow the instructions exactly.

**Creative step (subagent does this):** IDEATE (step 4). Spawn an opus subagent with the prompt template from program.md's "IDEATE subagent" section. Give it the latest scores (from `npx tsx scripts/results.ts --last 10`) and per-task totals. It runs `npx tsx scripts/ideas-index.ts --table`, reads treatment.md, taxonomy/, meta-failures.md, and returns: idea id, specific edit with diff, rationale, skeptic view, optional meta-note.

You execute the subagent's recommendation. If it sounds wrong, you can override — but document why in the commit message.

## Execute

Follow `program.md`. If no baseline run exists, run one first. If `--iterations N`, stop after N and run `/post-run-report <experiment>`.
