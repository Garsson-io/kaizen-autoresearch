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
explore_tasks: [ec-24, ec-17, ec-16, ec-19, ec-29, ec-34]
explore_baseline_loss: 72.72
explore_loss: 65.79
explore_delta: -6.92
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

Explore subset (stratified): `ec-24, ec-17, ec-16, ec-19, ec-29, ec-34`  
Baseline subset loss: `72.72`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-skill-anchor | 65.6643 | -7.0546 | improved 3, hurt 0, flat 3 | distributed |
| v2-skill-anchor-plus-agentic-guard | 65.7947 | -6.9242 | improved 4, hurt 0, flat 2 | distributed |

Winner: `v2-skill-anchor-plus-agentic-guard` by aggregate loss, classification is `signal`.  
