---
id: boundary-specific-micro-variants
title: Use tiny per-boundary prompt variants instead of one global wording for all boundaries
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Managing multiple micro-variants can create maintenance complexity.
prereqs: Runner can swap a boundary block template without changing the rest of the prompt.
related: [pairwise-boundary-tournament, few-shot-worked-examples, two-pass-vs-effort-ablation]
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
Stop searching for one perfect global wording. Keep base prompt fixed and test tiny alternate phrasings for each boundary independently:
- Variant set A for Unit-Integration block
- Variant set B for Integration-System block
- Variant set C for System-Agentic block
- Variant set D for Agentic-Workflow block

Compose the best-performing block per boundary.

## Steelman

Your error patterns are boundary-specific, but current edits are global and cause collateral damage. This isolates interventions to where they matter and should reduce regressions from unrelated sections.

It is still easy to try with minimal harness support.

## Scathing Critique

Composed local winners may interact badly globally. Without a final joint validation, this can overfit to local metrics and fail on full corpus.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Managing multiple micro-variants can create maintenance complexity.

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
