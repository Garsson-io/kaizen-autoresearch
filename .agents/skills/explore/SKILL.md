---
name: explore
description: Pre-screen a prompt idea with cheap N-variation x M-task subset runs before committing a full corpus run.
argument-hint: "<experiment> <idea-id> [--tasks ec-04,ec-10,...] [--variations N]"
---

## Cross-references

| Doc | Read this when... |
|-----|-------------------|
| **[`docs/explore-tool.md`](../../../docs/explore-tool.md)** (canonical) | You need to understand the tool: CLI options, stratification algorithm, signal classification rules, JSON output schema, modular API, validation boundaries. This is the complete user-facing reference. |
| **This file** (`SKILL.md`) | You need the step-by-step agent workflow: what to create before running explore.ts, how to invoke it, how to interpret results and decide next steps. |
| **`program.md`** step 4.5 | You need to understand where explore fits in the iteration loop and when to skip it. |
| **`ideas/README.md`** | You need to understand what `explore_status`, `explore_tasks`, etc. mean in idea frontmatter, or how IDEATE should prioritize explored vs unexplored ideas. |

## When to use this skill

Use `/explore` during step 4.5 of the iteration loop (see `program.md`) when an idea has
`explore_status: null`. The skill pre-screens an idea cheaply before committing a full corpus run.

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

## Agent responsibilities vs script responsibilities

The agent handles **creative work**: writing variation prompts and deciding what to do with results.
The script (`explore.ts`) handles **everything mechanical**: task selection, baseline, execution, scoring, analysis, persistence.

| Step | Who | What |
|------|-----|------|
| 1. Pre-check | explore.ts | Checks explore_status, discovers existing variations |
| 2. Create variations | **Agent** | Write N treatment.md files into runs/explore/ dirs |
| 3. Select tasks | explore.ts | Stratified selection from per-task loss + catalog labels |
| 4. Compute baseline | explore.ts | Score latest run for selected tasks |
| 5. Run evals | explore.ts | Parallel run-eval.sh with --no-latest and resume support |
| 6. Score + analyze | explore.ts | Per-task loss, delta, concentration, signal classification |
| 7. Display | explore.ts | Per-task heatmap table with recommendation |
| 8. Persist | explore.ts | Updates explore-log.jsonl + idea frontmatter |
| 9. Decide | **Agent** | Signal -> proceed to EDIT. No-signal -> return to IDEATE. |

## Step 1 — Agent creates variation treatment files

This is the only step the agent does manually. For each variation:

```bash
EXPLORE_TS=$(date +%Y%m%d-%H%M%S)
OUT_DIR=$EXPLORE_DIR/$IDEA_ID-v<i>-<label>-$EXPLORE_TS
mkdir -p $OUT_DIR
# Write the variation prompt directly here:
write_variation_prompt > $OUT_DIR/treatment.md
```

Each variation should:
- Be a minimal, focused change to `treatment.md`
- Differ from the others in mechanism (not just wording)
- Have a short label in the dir name: e.g. `v1-anti-lazy`, `v2-role-anchor`

**Naming convention** (required): `<idea-id>-<variation-label>-<YYYYMMDD-HHMMSS>`
The script discovers variations by globbing this pattern.

## Step 2 — Run explore.ts

After writing variations, run the script. It handles everything else:

```bash
# Full auto: stratified tasks, parallel eval, score, report, persist
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID

# Override task selection (agent did stratification itself)
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --tasks ec-03,ec-14,ec-17,ec-20

# Preview the plan without running (check task selection, baseline)
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --dry-run

# Re-score existing outputs without running new evals
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --score-only

# Randomize task selection with a seed (for reproducibility)
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --seed 42

# Pick 8 tasks instead of default 6
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --select-count 8

# Run only the intended two new variants (avoid legacy dirs)
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID \
  --latest-batch \
  --labels v1-my-primary,v2-my-primary-plus-counterbalance \
  --strict-variation-count 2

# Don't write to explore-log or idea file (just print results)
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --no-persist

# Re-run even if explore_status is already set
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --force

# View past results without running anything
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --summary

# Machine-readable JSON output
npx tsx experiments/write-test-plan/scripts/explore.ts $IDEA_ID --json

# If a run gets stuck, stop only this experiment's workers safely
experiments/write-test-plan/scripts/stop-evals.sh
```

**Exit codes**: 0 = signal, 1 = error, 2 = no-signal, 3 = concentrated-signal.

**Resume support**: If a run crashes partway, re-running the same command picks up only the
missing outputs. The script checks which task output files exist per-variation.

## Step 3 — Agent reads results and decides

The script prints a per-task heatmap table:

```
=== EXPLORE: integration-middle-anchor (3 variations x 6 tasks) ===

Tasks: ec-03 (mid, 14.39), ec-14 (mid, 15.09), ec-17 (mid, 14.57), ec-20 (mid, 11.90), ec-24 (mid, 10.39), ec-07 (high, 19.62)
Selection: 5 mid + 1 high
Baseline loss: 85.96

Task          Baseline  v1-anchor-ba  v2-anchor-un  v3-anchor-bo
ec-03            14.39         12.59         14.02         15.27
ec-14            15.09         15.63         17.37         15.60
ec-17            14.57          8.27          7.73         13.54
ec-20            11.90         13.16         13.83         11.77
ec-24            10.39          9.88         10.41         10.62
ec-07            19.62         18.95         19.10         19.84
────────────────────────────────────────────────────────────────
TOTAL            85.96         78.48         82.46         86.64
Delta                —         -7.48         -3.50         +0.68
Impr.                —           4/6           2/6           1/6
Conc.                —     ec-17 43%     ec-17 57%             —

Signal: concentrated-signal
  Winner: v1-anchor-basic (delta -6.31) — but ec-17 drives 78% of improvement
  => CONCENTRATED: Re-run with different tasks or proceed with caution.
```

**Signal classification** (computed by explore.ts):

- `signal` — delta negative, majority improved, no concentration. Proceed to EDIT.
- `concentrated-signal` — delta negative but one task drives >60% of improvement. Weak evidence.
- `no-signal` — flat or worse. Park the idea, return to IDEATE.

## Step 4 — Commit explore runs

```bash
git add experiments/$EXPERIMENT/runs/explore/
git add experiments/$EXPERIMENT/explore-log.jsonl
git add experiments/$EXPERIMENT/ideas/$IDEA_ID.md
git commit -m "experiment(explore): $IDEA_ID — <winner> delta <delta> on [<tasks>]"
```

## Modular API for advanced use

All functions in `explore.ts` are exported. Agents can import individual pieces:

```typescript
import {
  scoreLatestRun,           // Per-task losses from runs/latest/
  scoreRunDir,              // Per-task losses from any run dir
  computeTiers,             // Tier computation from loss distribution
  selectTasksStratified,    // Full stratification with priority weights
  computeBaseline,          // Baseline losses for a task subset
  discoverVariations,       // Find variation dirs by convention
  checkExistingOutputs,     // Which tasks are missing outputs
  runVariation,             // Run one variation via run-eval.sh
  scoreVariation,           // Score a variation dir
  analyzeVariation,         // Compute delta + concentration
  classifySignal,           // signal / concentrated-signal / no-signal
  pickWinner,               // Select best variation
  printHeatmap,             // Terminal table output
  printJson,                // JSON output
  writeExploreLog,          // Append to explore-log.jsonl
  updateIdeaFrontmatter,    // Update idea file explore fields
} from "./explore.js";
```

This lets agents skip stratification (provide their own tasks), skip persistence, or
compose custom workflows without the CLI.
