---
id: retrieval-backed-precedent-pack
title: Retrieve nearest historical failures as case-law before each classification
status: proposed
effort: high
expected_impact: high
targets:
  - agentic_underprediction
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: ensemble
risk: Retrieval can overfit to the current corpus and anchor to the wrong precedent.
prereqs: We maintain a clean, labeled precedent bank with concise rationales from past runs.
related: [few-shot-worked-examples, cluster-detection-for-errors, vocabulary-leak-prevention]
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

## Why this is bold

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
