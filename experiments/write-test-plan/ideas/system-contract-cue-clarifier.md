---
id: system-contract-cue-clarifier
title: System Contract Cue Clarifier
status: proposed
effort: low
expected_impact: medium
targets:
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - System-Integration
  - Integration-System
change_type: framing
risk: Could reintroduce broad System escalation if cues are read too loosely.
prereqs: Keep triad specificity gate and system guard.
related: [system-triad-contract-specificity-gate, system-default-escalation-removal]
direction_intent: raise-higher-recall
family: system-calibration
mechanism_signature: explicit-contract-cue-list
max_followups: 1
control_required: true
explore_status: concentrated-signal
explore_tasks: [ec-01, ec-02, ec-05, ec-06, ec-03, ec-11]
explore_baseline_loss: 63.63
explore_loss: 60.02
explore_delta: -3.61
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Current specificity wording may be too abstract and lead to missed System calls when behavior text mentions concrete contract cues. A concise cue list should improve System recall on those rows.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-05, ec-06, ec-03, ec-11`  
Baseline subset loss: `63.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-cue-list | 63.1240 | -0.5065 | improved 3, hurt 2, flat 1 | distributed |
| v2-cue-list-plus-verify-guard | 60.0221 | -3.6085 | improved 3, hurt 2, flat 1 | distributed |

Winner: `v2-cue-list-plus-verify-guard` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

