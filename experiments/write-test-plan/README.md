# Experiment: write-test-plan

**Hypothesis**: A treatment prompt with explicit level-classification guidance
will produce more accurate minimum-level predictions than a bare baseline prompt.

**Metric (val_bpb)**: Weighted average total score from `scripts/score.ts`,
computed over 3 corpus tasks × 2 runs each. Range 0–100%. Higher is better.

**Current best**: 72.3% (baseline) — treatment has not yet beaten it.

---

## Design

### Corpus
3 GitHub issues from `Garsson-io/kaizen-test-fixture`, chosen to cover
all 5 test levels and include hard-to-classify Agentic + Workflow behaviors:

| Task | Description | GT levels present |
|------|-------------|------------------|
| EC-04 | Document classifier with external AI API | Unit, Integration, Agentic |
| EC-07 | Automated status report with multi-source aggregation | Unit, Integration, System, Agentic, Workflow |
| EC-09 | Plugin loader with dependency ordering | Unit, Integration |

### Ground truth
Expert-labeled `ground-truth/*.json` files. Each behavior has a single
`ground_truth_level`. Labeled by the experiment designer, not the model.
See `ground-truth/` for the full labels.

### Scoring model
Four dimensions, weighted:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Sufficiency | 55% | Did predicted level ≥ GT minimum? (under-testing is penalized) |
| Precision | 20% | How close to the minimum? (symmetric, penalizes over-testing too) |
| Consistency | 15% | Does `plan_consistent` match the declared level? |
| Structure | 10% | All required fields present (Zod-guaranteed) |

Row weights by GT level: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4.
Higher-stakes behaviors (Agentic/Workflow) count more.

### Conditions
- **baseline**: Minimal prompt — just the level definitions and issue text.
- **treatment**: `prompts/treatment.md` — the file the autoresearch agent iterates on.

### Model
`claude-haiku-4-5-20251001` — cheap and fast, sufficient for this classification task.

---

## Running the experiment

```bash
npm install
cd experiments/write-test-plan

# Run treatment eval (all 3 tasks)
./run-eval.sh

# Run baseline for comparison
./run-eval.sh --condition baseline

# Run autoresearch loop (autonomous iteration)
claude -p --dangerously-skip-permissions < program.md
```

---

## Observability

- **Leaderboard**: [`leaderboard.md`](leaderboard.md) — updated on every kept commit
- **Prompt history**: `git log --follow prompts/treatment.md`
- **Run artifacts**: gitignored locally; attach to GitHub Release to archive
- **Discussion**: use GitHub Discussions for longer-form analysis of failure modes

---

## Directory structure

```
experiments/write-test-plan/
  README.md          # this file — experiment design
  program.md         # autoresearch agent loop instructions
  leaderboard.md     # score history — updated per iteration
  run-eval.sh        # eval runner — prints SCORE: <fraction>
  prompts/
    baseline.md      # fixed baseline (do not edit)
    treatment.md     # the file the agent iterates on
  corpus/
    ec-04.md         # issue body — document classifier
    ec-07.md         # issue body — status report
    ec-09.md         # issue body — plugin loader
  ground-truth/
    ec-04.json       # expert-labeled GT for EC-04
    ec-07.json       # expert-labeled GT for EC-07
    ec-09.json       # expert-labeled GT for EC-09
  scripts/
    run-probe.ts     # run one probe task → JSON output
    score.ts         # score outputs against GT → breakdown + avg
  src/
    schema.ts        # Zod schemas for ProbeOutput and GroundTruth
  runs/              # gitignored — raw model outputs live here
```
