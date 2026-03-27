# Write-Test-Plan Leaderboard

**Discussion**: https://github.com/Garsson-io/kaizen-autoresearch/discussions/1
**Failure analysis**: https://github.com/Garsson-io/kaizen-autoresearch/issues/2

Tracks each prompt iteration. Score = weighted avg total from `score.ts` (0–100%).
Higher is better. Each row is one committed iteration.

| # | Score | Δ | Commit | Change summary |
|---|-------|---|--------|----------------|
| 0 | 72.3% | baseline | — | built-in baseline prompt (no guidance) |
| 1 | 66.4% | −5.9% | — | treatment-v0: added level defs + key questions |

## Score breakdown (iteration 0 — baseline)

| Task | Sufficiency | Precision | Consistency | Total |
|------|-------------|-----------|-------------|-------|
| EC-04 | 68.3% | 65.2% | 80.0% | 70.0% |
| EC-07 | 72.0% | 68.0% | 75.0% | 71.5% |
| EC-09 | 77.0% | 74.0% | 82.0% | 77.5% |
| **avg** | **72.4%** | **69.1%** | **79.0%** | **72.3%** |

## Score breakdown (iteration 1 — treatment-v0)

| Task | Sufficiency | Precision | Consistency | Total |
|------|-------------|-----------|-------------|-------|
| EC-04 | 61.2% | 57.4% | 66.7% | 62.0% |
| EC-07 | 68.5% | 64.0% | 72.0% | 67.4% |
| EC-09 | 72.0% | 69.0% | 76.0% | 71.7% |
| **avg** | **67.2%** | **63.5%** | **71.6%** | **66.4%** |

## Key failure pattern

Both conditions miss **Agentic** behaviors almost entirely (EC-04 behaviors 3–4,
GT=Agentic, weight=4). Neither prompt triggers Agentic reasoning for behaviors
that involve calling external AI APIs. This is the highest-leverage fix target.
