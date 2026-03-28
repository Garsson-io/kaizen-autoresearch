---
name: run-experiment
description: Run the full experiment iteration loop — mine prose, diagnose, pick idea, edit treatment, verify, keep/revert. Includes mandatory MINE and META steps that /autoresearch doesn't handle.
argument-hint: "<experiment-name> [--iterations N]"
---

## Setup

1. Parse `$ARGUMENTS` for experiment name (default: `write-test-plan`) and optional `--iterations N` (default: unbounded).
2. Set `EXPERIMENT_DIR=experiments/<name>`.

## Read these files (MANDATORY before any action)

Read ALL of these before entering the loop:

```
$EXPERIMENT_DIR/program.md                     — config, loop definition, edit rules, failure analysis
$EXPERIMENT_DIR/meta-failures.md               — process mistakes to avoid, meta-hypotheses to track
$EXPERIMENT_DIR/taxonomy/README.md             — how taxonomy works (append-only, [runN] prefix)
$EXPERIMENT_DIR/ideas/README.md                — idea schema
$EXPERIMENT_DIR/prompts/treatment.md           — the current prompt (the file you edit)
$EXPERIMENT_DIR/leaderboard.md                 — score history
```

Also read the autoresearch principles (from the plugin):
```
.claude/skills/autoresearch/references/core-principles.md
.claude/skills/autoresearch/references/autonomous-loop-protocol.md
.claude/skills/autoresearch/references/results-logging.md
```

## Step 0: Baseline (first iteration only)

If no baseline exists in `autoresearch-results.tsv`, run one:

```bash
cd $EXPERIMENT_DIR && ./run-eval.sh
```

Record SCORE and LOSS in `autoresearch-results.tsv` as iteration 0 (baseline).
Commit the run outputs from `runs/<timestamp>/`.

## The Loop

Follow the loop defined in `$EXPERIMENT_DIR/program.md` exactly. Here is the summary:

```
LOOP:
  1. MINE — extract justifications from runs/latest/, append [runN] to taxonomy/, note what changed
  2. DIAGNOSE — read taxonomy/ for top patterns by impact, read ideas/ for candidates
  3. META — read meta-failures.md. Did this run confirm or weaken any meta-hypothesis?
     Update with new evidence. ≥3 data points to confirm, ≥2 contradictions to disprove.
  4. PICK — choose one idea (low effort + high impact + targets top pattern)
  5. EDIT — one atomic change to treatment.md. Be explicit: adding X, removing Y, or replacing Y with X.
     Reference named sections (**LEVEL-DEFS**, **KEY-QUESTIONS**, **SELF-CHECK**, etc.)
  6. COMMIT — git commit with experiment(treatment): prefix. Reference the idea id.
  7. RUN — ./run-eval.sh. Monitor progress (grep -c "done" on the log).
  8. SCORE — compare loss to baseline. Any decrease in loss = keep. Same or increase = revert.
  9. LOG — append to autoresearch-results.tsv. Update idea status (kept/rejected/no-op).
  10. COMMIT RUNS — git add runs/<timestamp>/ and commit.
  11. If bounded: check iteration count. If done → print summary and STOP.
  12. GOTO 1
```

## Critical rules

- **Steps 1–3 are MANDATORY.** Mine prose, diagnose, consult meta-failures BEFORE picking.
- **Primary metric: loss (lower is better).** `verify.ts | jq '.loss'`. Legacy score in `.score`.
- **One atomic change per iteration.** If you need "and" to describe it, split.
- **Git is memory.** Read `git log --oneline -20` and `git diff HEAD~1` at step 1.
- **Commit before verify.** Enables clean revert.
- **Preserve `{{TASK_ID}}` and `{{ISSUE_BODY}}`** in treatment.md — removing them breaks the eval.
- **Read all prompt files** in `$EXPERIMENT_DIR/prompts/` — study what each does differently.
- **Never edit corpus/, ground-truth/, or scripts/** — only treatment.md changes.
- **Taxonomy is append-only.** Never delete old `[runN]` lines.

## Keep/revert decision

- **Loss decreased** → keep. Commit stays.
- **Loss same or increased** → revert via `git revert HEAD --no-edit`.
- Log status as `keep`, `no-op` (within noise, reverted), or `discard` (actively worse, reverted).

## Summary format (when bounded loop ends)

```
=== Experiment Complete (N/N iterations) ===
Baseline loss: {baseline} → Final loss: {current} ({delta})
Baseline score: {baseline_score} → Final score: {current_score}
Keeps: X | Discards: Y | No-ops: Z
Best iteration: #{n} — {description}
```

Then run `/post-run-report <experiment>` to publish results to the GitHub discussion.
