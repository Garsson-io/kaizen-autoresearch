---
id: multi-candidate-test-design-then-select-lowest
title: Generate multi-level candidate tests, then choose the lowest that still catches the failure
status: rejected
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
explore_status: concentrated-signal
explore_tasks: [ec-15, ec-08, ec-35, ec-28, ec-32, ec-19]
explore_baseline_loss: 77.83
explore_loss: 74.58
explore_delta: -3.25
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

Explore subset (stratified): `ec-15, ec-08, ec-35, ec-28, ec-32, ec-19`  
Baseline subset loss: `77.83`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-adjacent-two-candidates | 80.2754 | +2.4443 | improved 3, hurt 2, flat 1 | n/a |
| v2-three-candidate-coverage | 74.5771 | -3.2540 | improved 3, hurt 1, flat 2 | distributed |
| v3-candidate-plus-miss-proof | 77.2459 | -0.5852 | improved 2, hurt 2, flat 2 | distributed |

Winner: `v2-three-candidate-coverage` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
