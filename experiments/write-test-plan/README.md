# Experiment: write-test-plan

**Question**: Does prompt guidance improve minimum-viable test level classification?

**Metric (val_bpb)**: Weighted average total score from `scripts/score.ts`,
computed over the 4-task core corpus. Range 0–100%. Higher is better.

**Design source**: [kaizen #1016](https://github.com/Garsson-io/kaizen/issues/1016) + [discussion #1018](https://github.com/Garsson-io/kaizen/discussions/1018)

**Thresholds**: ≥75% → skill sufficient | 55–75% → iterate | <55% → redesign

**Current best**: 72.3% (baseline, round 1) — treatment has not yet beaten it.

---

## Conditions

| Condition | Description | Status |
|-----------|-------------|--------|
| baseline | Bare level definitions — no guidance | 72.3% (r1, 3-task) |
| treatment | `prompts/treatment.md` — the file the agent iterates on | 66.4% (r1, 3-task) |
| treatment-l12 | L12 rich ladder reasoning → 5-step translation | not yet run |

---

## Design

### Corpus

10 GitHub issues from `Garsson-io/kaizen-test-fixture`, ground-truth labeled.
Core corpus (used for fast iteration): EC-04, EC-07, EC-09, EC-10.
Full corpus (EC-01 through EC-10) used for final validation.

| Task | Description | GT levels present |
|------|-------------|------------------|
| EC-01 | Config loader — file + env override | Unit, Integration |
| EC-02 | Webhook handler — signature + queueing | Integration, System |
| EC-03 | Repo stats CLI — git change categorization | Integration, System |
| EC-04 ★ | Document classifier — external AI API | Unit, Integration, **Agentic** |
| EC-05 | Migration runner — ordered, safe re-runs | Unit, Integration, System |
| EC-06 | File processor daemon — watch + deliver | Integration, System |
| EC-07 ★ | Status report — aggregation + LLM synthesis | Unit, Integration, System, **Agentic**, **Workflow** |
| EC-08 | API client — rate limiting + backoff | Unit, Integration |
| EC-09 ★ | Plugin loader — discovery + lifecycle | Unit, Integration |
| EC-10 ★ | Code review agent — diff + inline comments | Integration, System, **Agentic**, **Workflow** |

★ = in core corpus

### Adversarial rounds (from #1016)

| Round | What's added | Tests |
|-------|-------------|-------|
| 1 (neutral) | Nothing — clean issue body | Basic accuracy |
| 2 (anchoring) | "This module already has unit tests in tests/" | Resistance to unit-test anchoring |
| 3 (pressure) | "Team prefers fast tests", "deferred to follow-up" | Resistance to social pressure |

A robust condition drops ≤10% from round 1 to round 3.

### Scoring model
Four dimensions, weighted:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Sufficiency | 55% | Did predicted level ≥ GT minimum? |
| Precision | 20% | Distance from minimum (symmetric) |
| Consistency | 15% | `plan_consistent` true=1.0, false+note=0.5, false=0.0 |
| Structure | 10% | All required fields present (Zod-guaranteed) |

Row weights: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4.

### Model
`claude-haiku-4-5-20251001` — cheap and fast.

---

## Running the experiment

```bash
npm install
cd experiments/write-test-plan

# Core eval (4 tasks, round 1, treatment prompt)
./run-eval.sh

# All three adversarial rounds
./run-eval.sh --round 1
./run-eval.sh --round 2
./run-eval.sh --round 3

# Test the L12 hypothesis
./run-eval.sh --prompt prompts/treatment-l12.md

# Baseline reference
./run-eval.sh --condition baseline

# Full 10-task corpus
./run-eval.sh --corpus ec-01,ec-02,ec-03,ec-04,ec-05,ec-06,ec-07,ec-08,ec-09,ec-10

# Autonomous iteration loop
claude -p --dangerously-skip-permissions < program.md
```

---

## Observability

- **Leaderboard**: [`leaderboard.md`](leaderboard.md) — updated each kept iteration
- **Discussion**: [#1](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1) — iteration log
- **Failure analysis**: [#2](https://github.com/Garsson-io/kaizen-autoresearch/issues/2) — known failure modes
- **Run results**: posted as comments on [kaizen #1016](https://github.com/Garsson-io/kaizen/issues/1016)
- **Prompt history**: `git log --follow prompts/treatment.md`
- **Run artifacts**: gitignored — use GitHub Releases to archive

---

## Directory structure

```
experiments/write-test-plan/
  README.md          # this file
  program.md         # autoresearch agent loop instructions
  leaderboard.md     # score history
  run-eval.sh        # eval runner (--round, --prompt, --corpus)
  prompts/
    baseline.md      # fixed baseline
    treatment.md     # agent iterates on this
    treatment-l12.md # L12 reasoning hypothesis (test once, don't iterate)
  corpus/            # EC-01 through EC-10 issue bodies
  ground-truth/      # expert-labeled GT JSON (all 10 tasks)
  scripts/
    run-probe.ts     # run one probe → JSON output
    score.ts         # score outputs → breakdown + avg
  src/
    schema.ts        # Zod schemas
  runs/              # gitignored
```
