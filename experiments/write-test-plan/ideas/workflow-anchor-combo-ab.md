---
id: workflow-anchor-combo-ab
title: Workflow Anchor Combo A+B
status: parked
effort: low
expected_impact: high
targets:
  - workflow_gap
  - consistency_failures
confusion_pairs:
  - Agentic-Workflow
  - Workflow-Agentic
change_type: framing
risk: Could over-escalate to Workflow on loosely phrased agentic rows.
prereqs: none
related: [skill-context-workflow-anchor, workflow-cross-step-state-anchor]
direction_intent: mixed
family: workflow-calibration
mechanism_signature: combine-skill-and-cross-step-anchors
max_followups: 1
control_required: true
explore_status: signal
explore_tasks: [ec-33, ec-24, ec-22, ec-25, ec-15, ec-34]
explore_baseline_loss: 71.04
explore_loss: 55.13
explore_delta: -15.92
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
A+B combines the two strongest Workflow signals and should outperform either alone on Agentic↔Workflow boundaries.

## Epistemological status

Explore subset (stratified): `ec-33, ec-24, ec-22, ec-25, ec-15, ec-34`  
Baseline subset loss: `71.04`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-a-plus-b | 55.1262 | -15.9175 | improved 4, hurt 0, flat 2 | distributed |

Winner: `v1-a-plus-b` by aggregate loss, classification is `signal`.  

