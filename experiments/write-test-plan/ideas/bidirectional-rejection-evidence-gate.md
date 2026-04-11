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
Extend the current one-sided rejection gate to adjacent bidirectional checks:
- If choosing level `L`, provide disqualifying evidence for `L-1` and `L+1`.
- If no disqualifying evidence exists for an adjacent level, mark as uncertain and trigger one retry.

## Steelman

The current kept gate protects against unjustified downward overrides. This adds symmetry so unjustified upward or downward moves are both penalized. Adjacent-only scope keeps it lightweight.

This should help where errors oscillate between over- and under-prediction across runs.

## Scathing Critique

Symmetry can blunt a useful asymmetry. The existing one-sided gate worked partly because it targeted a specific underprediction mechanism; making it bidirectional may erase that advantage.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could over-constrain reasoning and increase tie-to-middle behavior.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Epistemological Status

Current status: null.

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
