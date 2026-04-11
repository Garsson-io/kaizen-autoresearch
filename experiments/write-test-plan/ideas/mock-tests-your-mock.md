---
id: mock-tests-your-mock
title: Append anti-mock clause to Agentic definition
status: no-op
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
confusion_pairs:
  - Integration-Agentic
change_type: representational
risk: Redundant with existing MOCK-HIDE question; low-information addition
prereqs: concrete-agentic-example
related: [concrete-agentic-example, anti-lazy-dont-mock]
last_run: 20260328-184249
last_iteration: 24
last_outcome: no-op
last_delta: 1.01
retry_trigger: null
owner: null
---
## Exact Edit
Append anti-mock clause to Agentic definition line:

```diff
-  - **Agentic** — result depends on real LLM non-determinism or a real AI/ML model call (e.g., classification, scoring, generation APIs)
+  - **Agentic** — result depends on real LLM non-determinism or a real AI/ML model call (e.g., classification, scoring, generation APIs); mocking the model tests your mock, not the system
```

## Epistemological Status
**FULL CORPUS RUN — NO-OP.**

Tested 2026-03-28, iter 24.

| Metric | Baseline (iter19) | mock-tests-your-mock | Delta |
|--------|-------------------|----------------------|-------|
| Loss | 368.08 | 369.09 | **+1.01** |
| Score | 88.0% | 88.9% | +0.9% |

Delta +1.01 is within LLM noise. Reverted per policy (same-or-worse → revert).

## Why it didn't help

The anti-mock signal was already present in two places:
1. The concrete-agentic-example already includes "(e.g., classification, scoring, generation APIs)" which implies real model calls
2. MOCK-HIDE key question already handles the "mocking hides a real failure" reasoning

Adding the clause redundantly made the Agentic definition longer without adding new signal.
The model already understood the principle from the existing definition.

## Lesson

After concrete-agentic-example, the Agentic definition is already well-calibrated. Further
additions suffer diminishing returns. The remaining U1 failures are not because the model
doesn't understand the concept — they happen because specific task context leads it away
from applying it. Definition expansion cannot fix that.

## Next step

Do not retry. U1 requires a different approach than definition expansion — possibly few-shot
examples of issue text patterns that signal Agentic, not further definition elaboration.

## Hypothesis

Append anti-mock clause to Agentic definition should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Redundant with existing MOCK-HIDE question; low-information addition

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 24 | 20260328-184249 | no-op | 1.01 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
