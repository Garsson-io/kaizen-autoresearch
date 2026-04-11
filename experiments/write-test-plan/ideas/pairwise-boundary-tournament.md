---
id: pairwise-boundary-tournament
title: Convert 5-way labeling into pairwise boundary tournament
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Early wrong boundary decisions can propagate upward through the tournament.
prereqs: The model must follow strict pairwise comparison instructions without skipping steps.
related: [adjacent-level-min-reproduction-fallback, top-down-elimination, signal-scoring-rubric]
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
Replace one-shot 5-class selection with four binary decisions:

1. Unit vs Integration
2. Winner vs System
3. Winner vs Agentic
4. Winner vs Workflow

For each step, require one sentence for "why winner" and one sentence for "why loser fails".

## Steelman

Most mistakes are adjacent-boundary errors, not random jumps. A boundary tournament explicitly focuses reasoning where the confusion actually is and may reduce global anchoring effects.

This is easy to try: it is prompt structure only, no evaluator rewrite required.

## Scathing Critique

If the first comparison is wrong, all later comparisons are constrained by that error. This could reduce catastrophic jumps but increase sticky local errors.

It also increases token cost and may induce mechanical reasoning that sounds rigorous but is still wrong.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Early wrong boundary decisions can propagate upward through the tournament.

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
