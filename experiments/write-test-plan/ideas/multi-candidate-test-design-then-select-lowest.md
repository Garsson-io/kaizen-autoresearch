---
id: multi-candidate-test-design-then-select-lowest
title: Generate multi-level candidate tests, then choose the lowest that still catches the failure
status: proposed
effort: medium
expected_impact: high
targets:
  - unit_overprediction
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Token cost increases and candidate generation can become formulaic if constraints are weak.
prereqs: Prompt must enforce concrete candidate structure (setup/assertion/catches/misses) before final choice.
related: [write-test-first, pairwise-boundary-tournament, top2-runner-up-contrast-gate]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Stop doing direct level classification. For each behavior, require candidate test designs at multiple levels (for example Unit + Integration + higher-level candidate), each with:
- setup/infrastructure
- assertion
- concrete bug it catches
- concrete bug it misses

Then select the lowest candidate that still catches the behavior's real failure mode.

## Steelman

The current task asks for a level but the real objective is test design sufficiency. This reframes the decision as constrained comparison of concrete tests, not abstract label reasoning.

It should reduce both over- and under-calls because the model must justify failure coverage, not just pick a label by heuristic.

## Scathing Critique

This may inflate verbosity without improving correctness if candidate tests are shallow or repetitive. The model might generate superficially different candidates with identical coverage claims.
