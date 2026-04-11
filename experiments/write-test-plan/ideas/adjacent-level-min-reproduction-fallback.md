---
id: adjacent-level-min-reproduction-fallback
title: Add adjacent-level tie-breaker using minimum reproduction test
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - integration_underprediction
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: meta-cognitive
risk: A broad "minimum level" fallback can become a default shortcut and suppress justified escalations.
prereqs: Tie-breaker must only apply when ambiguity remains after key questions.
related: [minimize-bias-reframe, mock-miss-scope-clarification, top-down-elimination]
explore_status: no-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: null
explore_delta: null
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---

## Steelman

## Scathing Critique

## Hypothesis

## Exact Edit

## Expected Signal

## Explore Plan

## Promotion Gate

## Epistemological Status

## Run History

## Reusable Lesson

Pending first/next run. After running, record one line: "mechanism worked / failed because <specific boundary effect>".

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-primary-ambiguous-fallback | 75.0281 | +7.2887 | improved 1, hurt 3, flat 2 | n/a |
| v2-primary-plus-counterbalance | 78.9497 | +11.2103 | improved 0, hurt 3, flat 3 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

