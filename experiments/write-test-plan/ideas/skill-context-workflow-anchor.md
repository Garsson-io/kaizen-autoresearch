---
id: skill-context-workflow-anchor
title: Skill Context Workflow Anchor
status: proposed
effort: low
expected_impact: medium
targets:
  - workflow_gap
  - consistency_failures
confusion_pairs:
  - Agentic-Workflow
  - Workflow-Agentic
change_type: framing
risk: Could over-escalate Agentic rows to Workflow.
prereqs: Keep existing MULTI-STEP rule.
related: [workflow-generic-pipeline-removal, system-triad-contract-specificity-gate]
direction_intent: mixed
family: workflow-calibration
mechanism_signature: skill-context-workflow-anchor
max_followups: 1
control_required: true
explore_status: signal
explore_tasks: [ec-10, ec-13, ec-15, ec-17, ec-11, ec-14]
explore_baseline_loss: 78.32
explore_loss: 70.47
explore_delta: -7.86
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Persistent Agentic↔Workflow errors are often tied to skill-context steering semantics. Explicitly anchoring cross-step skill-context effects to Workflow should reduce Agentic→Workflow misses.

## Epistemological status

Explore subset (stratified): `ec-10, ec-13, ec-15, ec-17, ec-11, ec-14`  
Baseline subset loss: `78.32`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-skill-anchor | 70.4682 | -7.8562 | improved 4, hurt 1, flat 1 | distributed |
| v2-skill-anchor-plus-agentic-guard | 74.8566 | -3.4678 | improved 3, hurt 1, flat 2 | ec-11 drives 66% of gain |

Winner: `v1-skill-anchor` by aggregate loss, classification is `signal`.  

