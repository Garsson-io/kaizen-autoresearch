---
id: integration-two-component-handoff-floor
title: Integration Two-Component Handoff Floor
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
risk: Could over-escalate deterministic helper-only rows to Integration.
prereqs: Keep existing SYSTEM TRIAD and specificity guard unchanged.
related: [integration-boundary-evidence-gate, system-triad-contract-specificity-gate]
direction_intent: raise-higher-recall
family: integration-calibration
mechanism_signature: two-component-handoff-floor
max_followups: 1
control_required: true
explore_status: signal
explore_tasks: [ec-01, ec-02, ec-05, ec-06, ec-03, ec-11]
explore_baseline_loss: 63.63
explore_loss: 50.59
explore_delta: -13.04
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Integration→Unit remains the largest weighted loss. The model often demotes cross-module orchestration rows to Unit when each piece appears deterministic. A narrow floor keyed to explicit multi-component handoff wording should raise Integration recall on those rows.

## Exact Edit
Target: `experiments/write-test-plan/prompts/treatment.md`

Add under `MOCK-MISS`:
- v1: handoff floor requiring Integration when behavior explicitly names interaction among 2+ local components.
- v2: v1 + guard that single-function helper paths do not trigger the floor.

## Expected Signal
- Primary gain: reduce Integration→Unit.
- Side-effect risk: increase Integration→System if floor text is interpreted as generic orchestration pressure.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-05, ec-06, ec-03, ec-11`  
Baseline subset loss: `63.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-handoff-floor | 50.5889 | -13.0417 | improved 4, hurt 0, flat 2 | distributed |
| v2-handoff-floor-plus-guard | 57.6784 | -5.9521 | improved 3, hurt 1, flat 2 | distributed |

Winner: `v1-handoff-floor` by aggregate loss, classification is `signal`.  

