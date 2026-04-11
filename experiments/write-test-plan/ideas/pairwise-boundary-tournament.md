---
id: pairwise-boundary-tournament
title: Convert 5-way labeling into pairwise boundary tournament
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Early wrong boundary decisions can propagate upward through the tournament.
prereqs: The model must follow strict pairwise comparison instructions without skipping steps.
related: [adjacent-level-min-reproduction-fallback, top-down-elimination, signal-scoring-rubric]
explore_status: concentrated-signal
explore_tasks: [ec-03, ec-14, ec-24, ec-19, ec-30, ec-32]
explore_baseline_loss: 131.49
explore_loss: 129.42
explore_delta: -2.07
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---

## Hypothesis

## Steelman

## Scathing Critique

## Exact Edit

## Expected Signal

## Explore Plan

## Promotion Gate

## Epistemological Status

## Run History

## Reusable Lesson

Pending first/next run. After running, record one line: "mechanism worked / failed because <specific boundary effect>".

## Epistemological status

Explore subset (stratified): `ec-03, ec-14, ec-24, ec-19, ec-30, ec-32`  
Baseline subset loss: `131.49`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-primary-adjacent-tournament | 129.4196 | -2.0701 | improved 3, hurt 1, flat 2 | distributed |
| v2-primary-plus-agentic-counterbalance | 137.6306 | +6.1409 | improved 1, hurt 3, flat 2 | n/a |

Winner: `v1-primary-adjacent-tournament` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

