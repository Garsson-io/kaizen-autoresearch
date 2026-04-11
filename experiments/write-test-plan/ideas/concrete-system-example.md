---
id: concrete-system-example
title: Add concrete parenthetical example to System definition
status: rejected
effort: low
expected_impact: high
targets:
  - system_underprediction
confusion_pairs:
  - Integration-System
change_type: representational
risk: System example may cause over-prediction (O2: Integration→System) by making System feel easier to qualify for
prereqs: null
related: [concrete-agentic-example, infra-probe-question]
last_run: 20260328-173033
last_iteration: 22
last_outcome: discard
last_delta: 122.08
retry_trigger: null
owner: null
---
## Exact Edit
Replace System definition line with parenthetical example (analogous to concrete-agentic-example):

```diff
-  - **System** — subprocess, OS behavior, real HTTP, or real external API call
+  - **System** — subprocess, OS behavior, real HTTP, or real external API call (e.g., a mock returning 503 tests your retry logic, but only real calls expose timeouts, TLS errors, and response formats that mocks don't reproduce)
```

## Epistemological Status
**FULL CORPUS RUN — REJECTED.**

Tested 2026-03-28 on full 30-task corpus.

| Metric | Baseline (iter19) | concrete-system-example | Delta |
|--------|-------------------|------------------------|-------|
| Loss | 368.08 | 490.16 | **+122.08** |
| Score | 88.0% | 83.9% | -4.1% |

## Why it failed

The Agentic example worked because it named a CLEAN PRINCIPLE (non-determinism). The System example named a GRAB-BAG OF SYMPTOMS (timeouts, TLS, response formats). The model interpreted this as a permission slip to classify more things as System — worsening O2 (Integration→System over-prediction) while failing to fix U3 (Integration→System under-prediction).

Key asymmetry vs concrete-agentic-example:
- Agentic example: reduced under-prediction (helped U1) without causing O3 explosion
- System example: caused O2 explosion without reducing U3

## Lesson

Definitional examples work for Agentic because the Agentic/non-Agentic distinction is binary and clean (real LLM non-determinism = yes/no). The Integration/System distinction is fuzzier (depends on what specific infrastructure is needed). Making System "feel accessible" through an example causes the model to over-apply it.

## Next step

Do not retry. The Integration-System boundary requires a different approach — possibly infra-probe-question (but that's a Think line, also failed) or a more specific signal about WHEN Integration suffices.

## Hypothesis

Add concrete parenthetical example to System definition should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: System example may cause over-prediction (O2: Integration→System) by making System feel easier to qualify for

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 22 | 20260328-173033 | discard | 122.08 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
