---
id: minimal-failing-invariant-first
title: Force "minimal failing invariant" before selecting level
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: framing
risk: Bad invariant statements can create false confidence and lock in wrong labels.
prereqs: The model can produce one concise invariant tied to observable behavior text.
related: [solution-collapse-prevention, write-test-first, integration-contract-invariant-gate]
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
