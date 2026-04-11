---
id: boundary-specific-micro-variants
title: Use tiny per-boundary prompt variants instead of one global wording for all boundaries
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Managing multiple micro-variants can create maintenance complexity.
prereqs: Runner can swap a boundary block template without changing the rest of the prompt.
related: [pairwise-boundary-tournament, few-shot-worked-examples, two-pass-vs-effort-ablation]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
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
