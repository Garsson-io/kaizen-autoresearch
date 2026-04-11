---
id: minimal-failing-invariant-first
title: Force "minimal failing invariant" before selecting level
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: framing
risk: Bad invariant statements can create false confidence and lock in wrong labels.
prereqs: The model can produce one concise invariant tied to observable behavior text.
related: [solution-collapse-prevention, write-test-first, integration-contract-invariant-gate]
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
Before any label choice, require one line:

"Minimal failing invariant: <the smallest condition that must hold/fail for this behavior to matter>."

Then pick level based on what environment is required to falsify that invariant.

## Steelman

This reframes classification around failure mechanics instead of infrastructure keywords. It can reduce shallow pattern matching and make boundary decisions more mechanistic.

The intervention is tiny: one mandatory line plus one mapping reminder.

## Scathing Critique

If the model cannot identify the true invariant, this adds noise rather than clarity. It may output generic invariants that sound precise but do not constrain level choice.

Also, this resembles prior "name failure mode first" ideas that already showed weak signal.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Bad invariant statements can create false confidence and lock in wrong labels.

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
