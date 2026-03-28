# Experiment: write-test-plan

**Question**: Does prompt guidance improve minimum-viable test level classification?

**Design source**: [kaizen #1016](https://github.com/Garsson-io/kaizen/issues/1016) + [discussion #1018](https://github.com/Garsson-io/kaizen/discussions/1018)

**Model**: `claude-haiku-4-5-20251001`

---

## Key files

| File | Purpose |
|------|---------|
| [program.md](program.md) | Autoresearch config — the agent reads this first |
| [leaderboard.md](leaderboard.md) | Score history + per-task breakdowns |
| [justification-taxonomy.md](justification-taxonomy.md) | Why the model gets things wrong — failure pattern analysis |
| [ideas/](ideas/) | Prompt-improvement hypotheses with steelman/critique |
| [taxonomy/](taxonomy/) | One .md per reasoning pattern, append-only across runs |
| [corpus/catalog.json](corpus/catalog.json) | Task metadata (title, domain, difficulty, adversarial technique) |
| [taxonomy/gt-review.md](taxonomy/gt-review.md) | Ground truth correctness audit |

## Scoring model

Four dimensions, weighted:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Sufficiency | 55% | Did predicted level >= GT minimum? |
| Precision | 20% | Distance from minimum (symmetric) |
| Consistency | 15% | `plan_consistent` true=1.0, false+note=0.5, false=0.0 |
| Structure | 10% | All required fields present (Zod-guaranteed) |

Row weights: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4.

## Running

```bash
npm install
cd experiments/write-test-plan
./run-eval.sh                          # full corpus, treatment
./run-eval.sh --round 2                # adversarial anchoring
./run-eval.sh --condition baseline     # baseline reference
./run-eval.sh --single ec-04           # debug one task
```

See [program.md](program.md) for the full command reference.

## Observability

- [Leaderboard](leaderboard.md) — updated each kept iteration
- [Discussion #1](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1) — iteration log
- [Issue #2](https://github.com/Garsson-io/kaizen-autoresearch/issues/2) — failure analysis
- [kaizen #1016](https://github.com/Garsson-io/kaizen/issues/1016) — run results
