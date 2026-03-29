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
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Steelman

Mined justifications repeatedly use speculative phrases ("could miss wiring," "might fail elsewhere"). A single global rule near the top can constrain this behavior:

"Classify by the stated behavior failure mode, not hypothetical failures outside the behavior."

This should reduce spurious escalations while avoiding the catastrophic regressions seen from explicit Unit-anchor language in SELF-CHECK.

## Scathing Critique

If applied too rigidly, the model may ignore legitimate implied context and become too literal, creating under-escalation in realistically terse issue descriptions. It may also overlap semantically with existing MOCK-MISS wording and yield minimal incremental signal.

