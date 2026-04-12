---
id: workflow-cross-step-state-anchor
title: Workflow Cross-Step State Anchor
status: rejected
effort: low
expected_impact: medium
targets:
  - workflow_gap
  - consistency_failures
confusion_pairs:
  - Agentic-Workflow
  - Workflow-Agentic
change_type: framing
risk: Could expand Workflow too broadly for loosely worded agentic tasks.
prereqs: Keep existing MULTI-STEP text.
related: [skill-context-workflow-anchor, workflow-generic-pipeline-removal]
direction_intent: mixed
family: workflow-calibration
mechanism_signature: cross-step-state-consistency-anchor
max_followups: 1
control_required: true
explore_status: signal
explore_tasks: [ec-10, ec-13, ec-15, ec-17, ec-11, ec-14]
explore_baseline_loss: 78.32
explore_loss: 63.54
explore_delta: -14.78
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Some Agentic→Workflow misses come from missing explicit cross-step consistency cues. This anchor should improve Workflow recall without over-broadly forcing Workflow.

## Epistemological status

Explore subset (stratified): `ec-10, ec-13, ec-15, ec-17, ec-11, ec-14`  
Baseline subset loss: `78.32`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-cross-step-state | 85.9582 | +7.6338 | improved 1, hurt 4, flat 1 | n/a |
| v2-cross-step-state-plus-agentic-guard | 63.5424 | -14.7820 | improved 5, hurt 0, flat 1 | distributed |

Winner: `v2-cross-step-state-plus-agentic-guard` by aggregate loss, classification is `signal`.  

