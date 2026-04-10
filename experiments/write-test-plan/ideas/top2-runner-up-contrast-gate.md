---
id: top2-runner-up-contrast-gate
title: Force top-2 candidate levels and explicit winner-vs-runner-up contrast
status: proposed
effort: low
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: meta-cognitive
risk: Can add verbosity and still miss when both top candidates are wrong.
prereqs: The model must expose an honest runner-up instead of fabricating an obviously weak alternative.
related: [pairwise-boundary-tournament, reject-higher-must-justify, adjacent-level-min-reproduction-fallback]
explore_status: no-signal
explore_tasks: [ec-13, ec-08, ec-33, ec-26, ec-31, ec-20]
explore_baseline_loss: 58.36
explore_loss: null
explore_delta: null
explore_date: 2026-04-10
---

## Core idea

Before final label, require:
1. `top1` candidate level
2. `top2` runner-up level
3. one sentence: why `top1` beats `top2` on behavior evidence
4. one sentence: what evidence would flip decision to `top2`

Then output final label.

## Steelman

Most observed mistakes are boundary-local. This gate forces the model to reason at the exact decision frontier instead of defending a single choice in isolation. It should improve calibration on close calls and reduce arbitrary downward anchoring.

It is cheap: output-structure change only.

## Scathing Critique

If the model picks a weak fake runner-up, the contrast step becomes performative. Also, cases where the true label is not in top2 remain unfixed.

## Epistemological status

Explore subset (stratified): `ec-13, ec-08, ec-33, ec-26, ec-31, ec-20`  
Baseline subset loss: `58.36`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-selfcheck-top2 | 61.7263 | +3.3653 | improved 4, hurt 2, flat 0 | n/a |
| v2-adjacent-top2 | 70.8231 | +12.4621 | improved 2, hurt 3, flat 1 | n/a |
| v3-top2-flip | 59.0340 | +0.6731 | improved 2, hurt 1, flat 3 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
