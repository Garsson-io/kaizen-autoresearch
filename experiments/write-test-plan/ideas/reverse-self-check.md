---
id: reverse-self-check
title: Reverse SELF-CHECK direction — upward pressure instead of downgrade invitation
status: discard
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - integration_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-Agentic
change_type: structural
risk: Caused O1 expansion and raised overall loss; upward pressure too broad
prereqs: null
related: [minimize-bias-reframe, concrete-agentic-example]
last_run: 20260328-190539
last_iteration: 25
last_outcome: discard
last_delta: 6.57
retry_trigger: null
owner: null
---
## Exact Edit
```diff
-- **SELF-CHECK** (plan_consistent): After deciding each level, does your
-  test_description actually require that level, or would it pass at a lower one?
+- **SELF-CHECK** (plan_consistent): After deciding each level, ask: could a
+  real failure slip through a test at this level because you mocked or
+  simplified the dependency? If yes → raise the level.
```

## Epistemological Status
**FULL CORPUS RUN — DISCARDED.**

Tested 2026-03-28, iter 25. Required schema fix first (`plan_consistent_note: z.string().nullish()`
— model returned null instead of omitting the field with new wording).

| Metric | Baseline (iter19) | reverse-self-check | Delta |
|--------|-------------------|--------------------|-------|
| Loss | 368.08 | 374.65 | **+6.57** |
| Score | 88.0% | 89.1% | +1.1% |
| Consistency | 100% | 99% | -1% |

## Why it failed

The upward pressure applied too broadly. While it correctly pushed some Agentic misses to reconsider,
it also caused correct Unit classifications to be second-guessed (U→Integration over-prediction).
The "mocked or simplified the dependency" framing matched Unit behaviors that use test doubles —
even though those are appropriate for Unit tests.

Additionally, the self-check is partially post-hoc: the classification happens during KEY-QUESTIONS
reasoning; the self-check just validates. Reversing validation direction doesn't change the core
classification reasoning, only the final validation pass.

## Lesson

The self-check is not the mechanism causing minimize-bias. The minimize-bias pull happens during
KEY-QUESTIONS reasoning, not at the validation step. Changing the validation direction cannot fix
a classification decision already made. The 100% consistency on the baseline means the model
always rubber-stamps its own choices — changing the wording just makes it rubber-stamp "no, I
didn't miss anything" instead of "yes, this level is correct."

## Hypothesis

Reverse SELF-CHECK direction — upward pressure instead of downgrade invitation should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Caused O1 expansion and raised overall loss; upward pressure too broad

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 25 | 20260328-190539 | discard | 6.57 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
