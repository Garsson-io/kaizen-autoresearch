---
id: bidirectional-rejection-evidence-gate
title: Require concrete evidence for rejecting either adjacent level (upward and downward)
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: meta-cognitive
risk: Could over-constrain reasoning and increase tie-to-middle behavior.
prereqs: Gate must be scoped to adjacent boundaries only to avoid combinatorial overhead.
related: [reject-higher-must-justify, pairwise-boundary-tournament, global-stated-failure-only-rule]
explore_status: no-signal
explore_tasks: [ec-15, ec-24, ec-36, ec-20, ec-08, ec-04, ec-32, ec-14]
explore_baseline_loss: 91.74
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

Explore subset (stratified): `ec-15, ec-24, ec-36, ec-20, ec-08, ec-04, ec-32, ec-14`  
Baseline subset loss: `91.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-bidirectional-adjacent | 99.6715 | +7.9299 | improved 1, hurt 4, flat 3 | n/a |
| v2-adjacent-plus-tie-rule | 101.6819 | +9.9403 | improved 1, hurt 3, flat 4 | n/a |
| v3-adjacent-scope-limited | 102.3868 | +10.6452 | improved 1, hurt 3, flat 4 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

