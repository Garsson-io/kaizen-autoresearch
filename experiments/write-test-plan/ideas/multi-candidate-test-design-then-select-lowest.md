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
explore_status: signal
explore_tasks: [ec-05, ec-06, ec-07, ec-08, ec-03, ec-14]
explore_baseline_loss: 70.71
explore_loss: 59.47
explore_delta: -11.24
explore_date: 2026-04-10
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

## Epistemological status

Explore subset (stratified): `ec-05, ec-06, ec-07, ec-08, ec-03, ec-14`  
Baseline subset loss: `70.71`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-adjacent-two-candidates | 59.4707 | -11.2386 | improved 4, hurt 0, flat 2 | distributed |
| v2-three-candidate-coverage | 61.6101 | -9.0991 | improved 3, hurt 1, flat 2 | distributed |
| v3-candidate-plus-miss-proof | 70.3399 | -0.3694 | improved 2, hurt 1, flat 3 | distributed |

Winner: `v1-adjacent-two-candidates` by aggregate loss, classification is `signal`.  

