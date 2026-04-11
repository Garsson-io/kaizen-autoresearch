---
id: self-check-hypothetical-wiring-guard
title: Add SELF-CHECK guard against hypothetical wiring justifications
status: rejected
effort: low
expected_impact: medium
targets:
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
change_type: framing
risk: Extra Unit-leaning wording in SELF-CHECK can over-correct and suppress true Integration picks.
prereqs: null
related: [mock-miss-scope-clarification]
last_run: 20260329-004233
last_iteration: 38
last_outcome: discard
last_delta: 63.29563600000001
retry_trigger: null
owner: null
---
## Outcome

Tested on full corpus in run `20260329-004233` by appending a SELF-CHECK clause:
"If the only reason for Integration is a hypothetical wiring bug not explicitly part of this behavior, treat that as Unit...".

Result: rejected. Loss regressed from `390.2296` to `453.5253` (+63.2956).

## Hypothesis

Add SELF-CHECK guard against hypothetical wiring justifications should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Extra Unit-leaning wording in SELF-CHECK can over-correct and suppress true Integration picks.

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
| 38 | 20260329-004233 | discard | 63.29563600000001 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
