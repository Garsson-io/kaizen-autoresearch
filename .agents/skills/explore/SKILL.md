---
name: explore
description: Pre-screen a prompt idea with cheap N-variation × M-task subset runs before committing a full corpus run.
argument-hint: "<experiment> <idea-id> [--tasks ec-04,ec-10,...] [--variations N]"
---

## Setup

Parse `$ARGUMENTS`:
- `EXPERIMENT` — first positional (default: `write-test-plan`)
- `IDEA_ID` — second positional (required)
- `--tasks` — comma-separated task IDs (optional; auto-selected if omitted)
- `--variations N` — number of prompt variations to test (default: 3)

Paths:
- `EXP_DIR = experiments/$EXPERIMENT`
- `EXPLORE_DIR = $EXP_DIR/runs/explore`
- `GT_DIR = $EXP_DIR/ground-truth`

## Read these before proceeding

1. `$EXP_DIR/ideas/$IDEA_ID.md` — the idea: `targets`, `confusion_pairs`, existing `explore_status`
2. `$EXP_DIR/prompts/treatment.md` — the base prompt to vary
3. `$EXP_DIR/corpus/catalog.json` — task labels for auto-selection

If `explore_status` is already set (`signal` or `no-signal`), print the existing result and stop — do not re-run.

## Step 1 — Auto-select tasks (if --tasks not provided)

1. Run `npx tsx $EXP_DIR/scripts/score.ts --output-dir $EXP_DIR/runs/latest/ --gt-dir $GT_DIR` and parse per-task LOSS values.
2. Read idea's `targets:` and `confusion_pairs:` from frontmatter.
3. From `corpus/catalog.json`, find which tasks have `labels` that overlap with the idea's `confusion_pairs`.
4. **Stratified selection** — do NOT simply take the top N by loss. High-loss tasks are outliers; a biased sample produces misleading aggregates (see meta-failures.md: explore-selection-bias).
   - Sort all corpus tasks by per-task loss. Divide into tiers: **high** (top 25%), **middle** (25th–75th percentile), **low** (bottom 25%).
   - Prioritize matching tasks from the **middle tier** — these are representative of typical corpus behavior.
   - Target composition: **2–3 tasks from middle tier + 1 from high tier**. Total: 4 tasks, at least 2 from middle.
   - AVOID taking more than 1 task from the very top of the distribution (the single highest-loss task, e.g. EC-30). If adding it would make any single task's baseline loss exceed 35% of the total subset baseline, skip it and take the next-highest matching task instead.
   - If fewer than 2 matching tasks exist in the middle tier, fill with middle-tier tasks ignoring confusion_pair match, then add matching tasks from other tiers.
5. Print reasoning: which tier each task came from, loss value, matching label (or "fill" if no label match).

## Step 2 — Score baseline on selected tasks

Extract per-task losses from the score.ts output (Step 1). Sum only the selected task losses → `BASELINE_LOSS`.

## Step 3 — Pre-create run dirs and write prompts directly into them

Pre-compute a shared timestamp, create each run dir immediately, and write the variation prompt directly into it as `treatment.md`. No temp files in `prompts/` — the prompt lives in its final location from the start.

```bash
EXPLORE_TS=$(date +%Y%m%d-%H%M%S)
for i in 1..N:
  OUT_DIR = $EXPLORE_DIR/$IDEA_ID-v<i>-$EXPLORE_TS
  mkdir -p $OUT_DIR
  # Write variation i's prompt directly here:
  write_variation_prompt > $OUT_DIR/treatment.md
```

Each variation should:
- Be a minimal, focused change to `treatment.md`
- Differ from the others in mechanism (not just wording)
- Have a short label embedded in the dir name: e.g. `v1-anti-lazy`, `v2-role-anchor`, `v3-precision`

## Step 4 — Run N batches in parallel

For each variation i, point `--prompt` at the treatment already inside the run dir, and use the same dir as `--out-dir`:

```bash
bash experiments/$EXPERIMENT/run-eval.sh \
  --corpus <selected tasks> \
  --prompt $EXPLORE_DIR/$IDEA_ID-v<i>-$EXPLORE_TS/treatment.md \
  --no-latest \
  --out-dir $EXPLORE_DIR/$IDEA_ID-v<i>-$EXPLORE_TS \
  -j 4
```

Run all N in parallel (bash `&` + `wait`). Capture stdout/stderr per variation.

**CRITICAL**: `--no-latest` must always be passed to prevent overwriting `runs/latest/`.

The run dir is created in Step 3 before the eval starts, so `mkdir -p` in run-eval.sh is a no-op (directory already exists with the prompt inside).

## Step 5 — Score each variation

For each variation's output dir:
```bash
npx tsx $EXP_DIR/scripts/score.ts \
  --output-dir $EXPLORE_DIR/$IDEA_ID-v<i>-$EXPLORE_TS/ \
  --gt-dir $GT_DIR
```

Parse the aggregate LOSS. Compute `delta = variation_loss - baseline_loss`.

Also record **per-task direction** for each task in the selected set:
- Compare each task's variation loss vs baseline loss.
- Classify as: improved (delta < -1.0), hurt (delta > +1.0), flat (|delta| ≤ 1.0).
- Count improved/hurt/flat. Identify if any single task accounts for >60% of the total aggregate improvement — this is the concentration flag.

## Step 6 — Print comparison table

```
=== EXPLORE: <idea-id> ===
Tasks: ec-10 (mid, 23.11), ec-17 (mid, 10.50), ec-19 (mid, 24.64), ec-04 (high, 22.10)
       (selection: 3 mid + 1 high — tier breakdown shown)
Baseline loss: 80.35

Variation       | Loss  | Delta   | Improved | Concentration      | Change
----------------|-------|---------|----------|--------------------|------------------
v1-anti-lazy    | 97.30 | +16.95  | 1/4      | —                  | "don't mock..."
v2-role-anchor  | 62.80 | -17.55  | 3/4      | none               | "staff engineer..."
v3-precision    | 71.10 | -9.25   | 2/4      | ec-04 (64% of Δ)   | "match boundary..."

Winner: v2-role-anchor (delta -17.55, 3/4 tasks improved, no concentration)

RECOMMENDATION: Proceed to full run with v2-role-anchor.
```

**Concentration column**: if one task accounts for >60% of the aggregate improvement, print `<task-id> (<pct>% of Δ)`. If no concentration, print `none`. If the improvement is negative (aggregate worsens), print `—`.

**Signal classification** — set `explore_status` based on these criteria:

- `signal` — aggregate delta negative **AND** majority of tasks (>half) improved **AND** no single task accounts for >60% of the aggregate improvement. Proceed to full corpus run.
- `concentrated-signal` — aggregate delta negative **BUT** one task drives >60% of the improvement. The outlier may not represent typical corpus behavior. Recommend re-running explore with a better-stratified task set before committing to a full corpus run. Still name a winner but include the concentration warning.
- `no-signal` — aggregate flat or positive. Park the idea.

When multiple variations beat the threshold, the winner is the one with the lowest (most negative) delta. For `concentrated-signal`, pick the variation with the best distribution (most tasks improved), using delta as tiebreaker.

## Step 7 — Update idea files

**Primary idea file** (`ideas/$IDEA_ID.md`):
- Update frontmatter: set `explore_status`, `explore_tasks`, `explore_baseline_loss`, `explore_loss`, `explore_delta`, `explore_date`
- Update `## The change` section if the winning variation differs from the originally described change
- Add/update `## Epistemological status` section with the explore table and runner-up data

**Runner-up variations** (if meaningfully distinct from winner and each other):
- Create new idea files (`ideas/<variation-label>.md`) with their own `explore_status: signal` or `no-signal` and explore frontmatter filled in
- Do NOT create duplicate files for variations that are minor rewrites of the same mechanism

## Step 8 — Write to explore-log.jsonl

Append one JSON line per variation to `$EXP_DIR/explore-log.jsonl`:
```json
{"timestamp":"...","idea_id":"...","variation":"v2-role-anchor","run_dir":"runs/explore/role-anchor-v2-20260328-163118","tasks":["ec-03","ec-04"],"baseline_loss":128.78,"variation_loss":86.24,"delta":-42.54,"prompt_diff":"staff engineer PR review persona","winner":true}
```

The `run_dir` is a relative path to the committed explore run dir. Both the log entry and the run dir are committed to git.

## Step 9 — (No cleanup needed)

Each explore run dir is already self-contained since Step 3: output JSONs + .log files + `treatment.md` (the exact prompt). No temp files were ever created outside the run dir. Nothing to move or delete.

## Step 10 — Commit explore runs

Commit all explore run directories and the updated log/idea files:

```bash
git add experiments/$EXPERIMENT/runs/explore/
git add experiments/$EXPERIMENT/explore-log.jsonl
git add experiments/$EXPERIMENT/ideas/$IDEA_ID.md
# add any runner-up idea files created
git commit -m "experiment(explore): <idea-id> — <winner> delta <delta> on [<tasks>]"
```

Commit message convention: `experiment(explore): <idea-id> — <winning-variation-label> delta <delta> on [task1,task2,...]`

Example: `experiment(explore): role-anchor-staff-engineer — v2-role-anchor delta -42.54 on [ec-03,ec-04,ec-19,ec-30]`

## Final output

Print a one-line action for the executor:
- Signal: `✓ SIGNAL: Apply <winning-variation-diff> in EDIT step, then /run-experiment.`
- Concentrated signal: `⚠ CONCENTRATED SIGNAL: <winner> delta <delta> but <task> drove <pct>% of Δ. Re-run explore with stratified tasks before full corpus.`
- No signal: `✗ NO SIGNAL: All variations hurt or flat. Idea parked. Return to IDEATE.`
