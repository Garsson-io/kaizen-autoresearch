# Write-Test-Plan Leaderboard

**Discussion**: https://github.com/Garsson-io/kaizen-autoresearch/discussions/1
**Failure analysis**: https://github.com/Garsson-io/kaizen-autoresearch/issues/2
**Kaizen issue**: https://github.com/Garsson-io/kaizen/issues/1016

**Thresholds**: ≥75% = sufficient | 55–75% = iterate | <55% = redesign

Core corpus: EC-04, EC-07, EC-09, EC-10 (covers all 5 levels)

---

## Iteration history

| # | Condition | Score (r1) | r2 | r3 | Δ | Commit | Change |
|---|-----------|-----------|----|----|---|--------|--------|
| 0 | baseline | 72.3%* | — | — | — | — | built-in, no guidance |
| 1 | treatment | 66.4%* | — | — | −5.9% | — | level defs + key questions (worse!) |
| — | treatment-l12 | not run | — | — | — | — | L12 → 5-step hypothesis |

*3-task corpus (EC-04, EC-07, EC-09). Will re-run on 4-task core corpus.

---

## Known failure modes

### Agentic almost never predicted (primary)

EC-04 behaviors 3–4 (GT=Agentic, weight=4 each): ~5% sufficiency in both conditions.
The model classifies "calls external AI API" as System rather than Agentic.

Root cause: the prompt says "depends on real LLM non-determinism" but the model
doesn't connect "external AI classification API" to "LLM non-determinism."

Fix candidates:
1. Add concrete positive Agentic example: "classifies via AI API → Agentic because mock returns fixed label but real model varies"
2. Add explicit disambiguation: "Not every external API = Agentic; only calls where the LLM's choice itself matters"
3. Move Agentic check before System check in key questions

### Workflow gap (secondary)
Neither condition reliably predicts Workflow for multi-step agentic flows.
EC-07 b5 and EC-10 b5 (GT=Workflow) likely scored as Agentic or lower.

---

## Score breakdown — baseline (iter 0, 3-task corpus)

| Task | Sufficiency | Precision | Consistency | Total |
|------|-------------|-----------|-------------|-------|
| EC-04 | 68.3% | 65.2% | 80.0% | 70.0% |
| EC-07 | 72.0% | 68.0% | 75.0% | 71.5% |
| EC-09 | 77.0% | 74.0% | 82.0% | 77.5% |
| **avg** | **72.4%** | **69.1%** | **79.0%** | **72.3%** |

## Score breakdown — treatment-v0 (iter 1, 3-task corpus)

| Task | Sufficiency | Precision | Consistency | Total |
|------|-------------|-----------|-------------|-------|
| EC-04 | 61.2% | 57.4% | 66.7% | 62.0% |
| EC-07 | 68.5% | 64.0% | 72.0% | 67.4% |
| EC-09 | 72.0% | 69.0% | 76.0% | 71.7% |
| **avg** | **67.2%** | **63.5%** | **71.6%** | **66.4%** |
