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
| — | treatment-l12 | 71.2%† | — | — | −10.5% | — | L12 → 5-step: over-predicts System, still misses Agentic — worse |
| 1b | treatment | **81.7%†** | — | — | — | dd30e90 | 4-task re-run after pipeline fix; EC-04 Agentic still primary miss |
| 2 | treatment | **87.2%‡** | — | — | — | 53ca886 | 10-task baseline (first full corpus run) |

*3-task corpus (EC-04, EC-07, EC-09).
†4-task core corpus (EC-04, EC-07, EC-09, EC-10). Pipeline bug fixed.
‡10-task full corpus (EC-01 through EC-10).

**[Autoresearch run 1 report](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1#discussioncomment-16346829)** — 5 iterations, 0 keeps, baseline 87.2‡. All changes hurt. Prompt is a local optimum for haiku.

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

## Score breakdown — treatment-l12 (one-shot, 4-task corpus)

| Task | Sufficiency | Precision | Consistency | Total | Notes |
|------|-------------|-----------|-------------|-------|-------|
| EC-04 | 60.0% | 59.2% | 100.0% | 69.8% | b3,b4=System(GT=Agentic) — L12 promotes System not Agentic |
| EC-07 | 70.0% | 80.0% | 100.0% | 79.5% | b4=Agentic(GT=Workflow), b5=Integration(GT=System) |
| EC-09 | 65.7% | 80.0% | 100.0% | 77.1% | b4,b5=Unit(GT=Integration) |
| EC-10 | 41.5% | 51.8% | 100.0% | 58.2% | b1,b2,b4=Unit(GT=Intg/Sys/Agentic) — badly under |
| **avg** | **59.3%** | **67.7%** | **100.0%** | **71.2%** | |

**Conclusion**: L12 hypothesis rejected. L12 ladder reasoning pushes toward System but doesn't help Agentic, and hurts EC-10 badly.

## Score breakdown — treatment (iter 1b, 4-task corpus, pipeline-fixed re-run)

| Task | Sufficiency | Precision | Consistency | Total | Notes |
|------|-------------|-----------|-------------|-------|-------|
| EC-04 | 38.3% | 49.2% | 100.0% | 55.9% | b3=Unit(GT=Agentic), b4=System(GT=Agentic) |
| EC-07 | 82.9% | 87.5% | 100.0% | 88.1% | b4=Agentic(GT=Workflow) |
| EC-09 | 100.0% | 85.0% | 100.0% | 97.0% | All correct, slight over-prediction |
| EC-10 | 80.0% | 83.5% | 100.0% | 85.7% | b4=Integration(GT=Agentic) |
| **avg** | **75.3%** | **76.3%** | **100.0%** | **81.7%** | |
