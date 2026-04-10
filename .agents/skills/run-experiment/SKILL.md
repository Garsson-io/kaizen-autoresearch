---
name: run-experiment
description: Run the full experiment iteration loop with mandatory MINE, META, and IDEATE steps.
argument-hint: "<experiment-name> [--iterations N]"
---

## Canonical ownership (this file)

- **Canonical for:** skill-level execution checklist for `/run-experiment` (how to run the loop reliably).
- **Not canonical for:** experiment policy decisions or idea schema definitions.
- **Refer to for experiment policy authority:** `experiments/<name>/program.md`.
- **Refer to for idea schema and explore field meanings:** `experiments/<name>/ideas/README.md`.
- **Conflict rule:** if this file conflicts with `program.md`, `program.md` wins.

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

## Architecture: perception → cognition → action

Every step is either **perception** (tools compute structured evidence), **cognition** (LLM reads evidence and forms judgment), or **action** (tools execute decisions). Never mix them.

→ **Taxonomy system reference**: `experiments/write-test-plan/taxonomy/README.md`

**Mechanical tool steps** — run commands, do not reason about them:
- MINE: `mine-report.ts` produces structured evidence (loss breakdown, diff, persistence, MINE DIGEST template)
- SCORE: arithmetic — `loss < reference_loss` → keep, otherwise revert
- LOG: `log-iteration.ts` handles delta, JSONL append, idea status
- TAXONOMY ROUTE: `extract-thinking --taxonomy-lines | taxonomy-append.ts` routes matched blocks, persists unmatched to `taxonomy/unmatched.md`
- TAXONOMY SUMMARY: `taxonomy-append.ts --summary` shows cumulative confusion pair counts across all files + unmatched
- TAXONOMY REPROCESS: `taxonomy-append.ts --reprocess-unmatched` backfills unmatched.md into newly created/updated taxonomy files
- COMMIT/GIT: pure commands

**Your cognitive steps** — where judgment actually matters:
1. **Complete the MINE DIGEST** (light): read the pre-filled template from mine-report.ts, fill in `Pattern:`, `Trap:`, `Dominant pattern:`, `Fix hypothesis:`. This is the only place you form judgment in MINE/DIAGNOSE/META.
2. **Apply dominant-loss targeting** (hard gate): from the latest mine-report loss table, identify top-2 confusion pairs by weighted loss. IDEATE candidates must explicitly target at least one of these pairs. If not, reject and ideate again. Do not substitute raw taxonomy counts for this step.
3. **Apply promotion-evidence gating** (hard gate): promote an explored idea to EDIT only when explore evidence is stable/distributed. Treat concentrated or split evidence as `no-promote` unless a holdout rerun (different subset/seed) confirms the same winner without sign flip.
4. **Taxonomy pattern discovery** (after `--summary`): for each confusion pair with ≥3 cumulative unmatched occurrences, read those full blocks from `unmatched.md` (full justification + thinking — no truncation) and the existing taxonomy file descriptions. Decide: does this fit an existing pattern (update its `confusion_pair` list) or is it a new reasoning trap (create new file)? After any change, run `--reprocess-unmatched` to backfill history. → Full procedure: `taxonomy/README.md` § "The three-step MINE taxonomy flow".
5. **Package context for IDEATE**: pre-run `ideas-index.ts --table`, read treatment.md, read top taxonomy files, read meta-failures.md. Paste everything into the IDEATE subagent prompt so the subagent does ZERO file reading.
6. **META write-back is mandatory**: after each run, update `experiments/<name>/meta-failures.md` with whether the current result confirms, weakens, or falsifies a process hypothesis (with concrete run IDs and deltas). If no meta update is warranted, add a brief "no new meta evidence" note in the iteration log/commit message.

**Subagent cognitive step** — IDEATE is pure creative generation:
- Prefer a Codex subagent (`model: gpt-5.3-codex`) by default; Claude is also valid when explicitly chosen for this run
- The subagent receives all context pre-assembled — it should NOT need to run any tool calls except optionally reading specific idea files or writing new ones
- It returns: idea id, specific edit (with diff), rationale, skeptic view, optional meta-note

You execute the subagent's recommendation. If it sounds wrong, document why in the commit message.

## MINE checkpoint — gate before IDEATE

**You must produce a MINE DIGEST before spawning the IDEATE subagent.** The digest proves you read individual behaviors, not just aggregate stats.

Signs you have NOT actually mined (common failure modes):
- You only ran `results.ts` or looked at loss/score numbers
- You ran extract-thinking but only read the first screen of output
- You can describe the confusion pair counts but cannot quote any justification text
- You ran extract-thinking with `| head` or `| sed -n '1,32p'`

If you cannot produce the MINE DIGEST format (from program.md) with direct justification quotes, **stop and re-run**:
```bash
# Read the top errors — they are now sorted by weight, HIGH IMPACT first
npx tsx experiments/<name>/scripts/extract-thinking.ts --run-dir latest

# Focus on a specific high-impact task if needed
npx tsx experiments/<name>/scripts/extract-thinking.ts --run-dir latest --task EC-30
```

Only after producing the MINE DIGEST should you proceed to DIAGNOSE → META → IDEATE.
Before IDEATE, explicitly record the top-2 weighted-loss confusion pairs and ensure the chosen idea targets one of them.

## Edit-type discipline (always)

- Before editing `treatment.md`, declare intended edit type: `ADD`, `REPLACE`, or `DELETE`.
- Validate the actual diff shape before commit:
  - `ADD` = insert-only
  - `REPLACE` = remove+add
  - `DELETE` = remove-only
- Never describe a change as additive if any relevant line was removed or modified.
- If declared type and observed diff type do not match, stop and return to IDEATE; do not proceed to RUN/SCORE on that edit.

## Task list = inner loop visibility

Use tasks to show the CURRENT iteration's progress. Each iteration creates tasks for its inner loop steps (MINE, DIAGNOSE, META, IDEATE, EDIT+COMMIT, RUN+SCORE, LOG+COMMIT RUNS, → Next iteration). Mark each complete as you go. At "→ Next iteration", clear and recreate for the next iteration. Include iteration number and current score in task names.

## Execute

Follow `program.md`. If no baseline run exists, run one first. If `--iterations N`, stop after N and run `/post-run-report <experiment>`.
Do not proceed to EDIT until META has been consulted **and** write-back (or explicit no-update decision) is completed.

## Run-artifact hygiene (mandatory)

- Never leave `runs/<timestamp>/` and `run-stats.jsonl` uncommitted after a run.
- Immediately after each run + score decision, do `COMMIT RUNS`, then `COMMIT STATE`, before any new IDEATE/EDIT/RUN step.
- On session start, if `git status` shows uncommitted run artifacts from a prior interrupted run, recover first:
  1. Commit recovered run artifacts (`runs/<timestamp>/`, `run-stats.jsonl`) with a recovery message.
  2. Update result logs or explicitly mark partial runs as interrupted in the commit message.
  3. Only then continue the iteration loop.
