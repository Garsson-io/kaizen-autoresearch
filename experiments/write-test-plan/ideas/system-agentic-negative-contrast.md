---
id: system-agentic-negative-contrast
title: Contrast System (transport/env) vs Agentic (model judgment)
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - system_overprediction
confusion_pairs:
  - System-Agentic
change_type: representational
risk: Could over-push Agentic on infra behaviors that mention AI.
prereqs: Remaining error mass includes System↔Agentic confusion after Unit/Integration tightening.
related: [concrete-agentic-example, mock-miss-scope-clarification]
explore_status: no-signal
explore_tasks: [ec-10, ec-14, ec-24, ec-07]
explore_baseline_loss: 60.29
explore_loss: null
explore_delta: null
explore_date: 2026-03-28
---

## The change

Replace the System/Agentic definition lines with explicit contrastive wording:
- System = transport/environment failures
- Agentic = model judgment quality (not System)

## Steelman

Makes a high-cost adjacent boundary explicit in one atomic edit.

## Scathing Critique

Could be redundant with LLM-DEP and create new false Agentic escalations.

## Epistemological status

Explore subset (stratified): `ec-10, ec-14, ec-24, ec-07`  
Baseline subset loss: `60.29`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-contrast-full | 83.4381 | +23.1440 | improved 0, hurt 4, flat 0 | n/a |
| v2-contrast-short | 114.3501 | +54.0560 | improved 1, hurt 3, flat 0 | n/a |
| v3-contrast-min | 71.7924 | +11.4983 | improved 1, hurt 3, flat 0 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

