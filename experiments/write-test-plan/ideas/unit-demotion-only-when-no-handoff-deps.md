---
id: unit-demotion-only-when-no-handoff-deps
title: Unit Demotion Only When No Handoff Dependencies
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - Integration-Unit
  - Integration-System
change_type: framing
risk: May over-raise Integration on compact behavior phrasing.
prereqs: Keep existing MOCK-MISS and system triad language.
related: [integration-two-component-handoff-floor, integration-evidence-quote-gate-v2]
direction_intent: raise-higher-recall
family: integration-calibration
mechanism_signature: unit-demotion-no-handoff-deps
max_followups: 1
control_required: true
explore_status: concentrated-signal
explore_tasks: [ec-01, ec-02, ec-05, ec-06, ec-03, ec-11]
explore_baseline_loss: 63.63
explore_loss: 61.94
explore_delta: -1.69
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Integration rows are being demoted to Unit even when dependency/handoff conditions are present. A negative-condition demotion gate may improve Integration recall with less over-correction than broad flooring.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-05, ec-06, ec-03, ec-11`  
Baseline subset loss: `63.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-no-handoff-demotion | 61.9412 | -1.6894 | improved 3, hurt 1, flat 2 | distributed |
| v2-no-handoff-demotion-plus-system-protect | 62.4281 | -1.2024 | improved 2, hurt 1, flat 3 | distributed |

Winner: `v1-no-handoff-demotion` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

