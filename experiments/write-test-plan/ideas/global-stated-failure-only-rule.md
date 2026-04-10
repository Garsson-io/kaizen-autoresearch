---
id: global-stated-failure-only-rule
title: Add global anti-speculation rule to classify only stated failure modes
status: proposed
effort: low
expected_impact: high
targets:
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: framing
risk: Could under-call levels when behaviors are written tersely and imply, but do not spell out, critical failure context.
prereqs: Must be global and level-neutral (avoid Unit-specific wording).
related: [mock-miss-scope-clarification, self-check-hypothetical-wiring-guard, precision-failure-boundary]
explore_status: no-signal
explore_tasks: [ec-13, ec-08, ec-33, ec-26, ec-31, ec-20]
explore_baseline_loss: 58.36
explore_loss: null
explore_delta: null
explore_date: 2026-04-10
---

## Steelman

Mined justifications repeatedly use speculative phrases ("could miss wiring," "might fail elsewhere"). A single global rule near the top can constrain this behavior:

"Classify by the stated behavior failure mode, not hypothetical failures outside the behavior."

This should reduce spurious escalations while avoiding the catastrophic regressions seen from explicit Unit-anchor language in SELF-CHECK.

## Scathing Critique

If applied too rigidly, the model may ignore legitimate implied context and become too literal, creating under-escalation in realistically terse issue descriptions. It may also overlap semantically with existing MOCK-MISS wording and yield minimal incremental signal.

## Epistemological status

Explore subset (stratified): `ec-13, ec-08, ec-33, ec-26, ec-31, ec-20`  
Baseline subset loss: `58.36`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-global-line | 61.7053 | +3.3444 | improved 3, hurt 2, flat 1 | n/a |
| v2-mockmiss-scope | 70.4758 | +12.1148 | improved 0, hurt 3, flat 3 | n/a |
| v3-global-plus-escalation | 64.1957 | +5.8347 | improved 3, hurt 2, flat 1 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
