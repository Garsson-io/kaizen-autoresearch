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
---

## The change

```diff
-- **SELF-CHECK** (plan_consistent): After deciding each level, does your
-  test_description actually require that level, or would it pass at a lower one?
+- **SELF-CHECK** (plan_consistent): After deciding each level, ask: could a
+  real failure slip through a test at this level because you mocked or
+  simplified the dependency? If yes → raise the level.
```

## Epistemological status

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
