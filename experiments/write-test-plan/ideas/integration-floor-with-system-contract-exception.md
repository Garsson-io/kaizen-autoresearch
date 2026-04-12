---
id: integration-floor-with-system-contract-exception
title: Integration Floor With System Contract Exception
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - Integration-Unit
  - Integration-System
  - System-Integration
change_type: framing
risk: Can over-escalate System if contract cues are interpreted too broadly.
prereqs: Keep SYSTEM TRIAD and triad specificity gate intact.
related: [integration-two-component-handoff-floor, system-triad-contract-specificity-gate]
direction_intent: mixed
family: boundary-calibration
mechanism_signature: handoff-floor-with-system-contract-exception
max_followups: 1
control_required: true
explore_status: no-signal
explore_tasks: [ec-01, ec-02, ec-05, ec-06, ec-03, ec-11]
explore_baseline_loss: 63.63
explore_loss: null
explore_delta: null
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Round 1 reduced total loss but showed potential Integration↔System side-effect risk. Keeping the Integration handoff floor while adding an explicit external-contract exception should preserve Integration recall gains without creating additional System misses.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-05, ec-06, ec-03, ec-11`  
Baseline subset loss: `63.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-floor-plus-system-exception | 66.7867 | +3.1561 | improved 1, hurt 1, flat 4 | n/a |
| v2-plus-specificity-guard | 67.6114 | +3.9809 | improved 2, hurt 3, flat 1 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

