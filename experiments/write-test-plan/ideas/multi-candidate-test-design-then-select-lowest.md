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
explore_status: no-signal
explore_tasks: [ec-08, ec-34, ec-10, ec-03, ec-24, ec-31, ec-14, ec-33]
explore_baseline_loss: 99.66
explore_loss: null
explore_delta: null
explore_date: 2026-04-11
last_run: 20260411-011347
last_iteration: 66
last_outcome: discard
last_delta: 67.2659
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
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

## Epistemological Status
Explore subset (stratified): `ec-15, ec-08, ec-35, ec-28, ec-32, ec-19`  
Baseline subset loss: `77.83`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-adjacent-two-candidates | 80.2754 | +2.4443 | improved 3, hurt 2, flat 1 | n/a |
| v2-three-candidate-coverage | 74.5771 | -3.2540 | improved 3, hurt 1, flat 2 | distributed |
| v3-candidate-plus-miss-proof | 77.2459 | -0.5852 | improved 2, hurt 2, flat 2 | distributed |

Winner: `v2-three-candidate-coverage` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Token cost increases and candidate generation can become formulaic if constraints are weak.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: concentrated-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 66 | 20260411-011347 | discard | 67.2659 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.

## Epistemological status

Explore subset (stratified): `ec-08, ec-34, ec-10, ec-03, ec-24, ec-31, ec-14, ec-33`  
Baseline subset loss: `99.66`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-adjacent-two-candidates | 112.1589 | +12.5019 | improved 2, hurt 5, flat 1 | n/a |
| v2-three-candidate-coverage | 102.2065 | +2.5495 | improved 1, hurt 1, flat 6 | n/a |
| v3-candidate-plus-miss-proof | 108.7795 | +9.1225 | improved 1, hurt 4, flat 3 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

