---
id: framing-minimum-to-realistic
title: Change 'minimum' to 'realistic' in framing sentence
status: rejected
effort: low
expected_impact: low
targets:
  - agentic_underprediction
change_type: framing
risk: Vague — 'realistic' may be interpreted differently by different tasks
prereqs: null
related: [minimize-bias-reframe, variance-probe-question]
last_run: 20260328-182058
last_iteration: 23
last_outcome: discard
last_delta: 23.91
retry_trigger: null
owner: null
---
## Exact Edit
```diff
-For each behavior, reason about the minimum test infrastructure needed to catch
+For each behavior, reason about the realistic test infrastructure needed to catch
```

## Epistemological Status
**FULL CORPUS RUN — REJECTED.**

Note: run assembled from two API calls (rate limit hit mid-run) — ec01-ec24 from run 20260328-182058, ec20/ec25-30 from run 20260328-183317, merged into single score.

| Metric | Baseline (iter19) | framing-minimum-to-realistic | Delta |
|--------|-------------------|------------------------------|-------|
| Loss | 368.08 | 391.99 | **+23.91** |
| Score | 88.0% | 87.4% | -0.6% |

## Why it failed

'Realistic' is vague. The model may interpret it as "what would a pragmatic engineer actually do" which could mean anything — including defaulting to Integration for everything. The word 'minimum' was at least directionally precise even if biased. Removing minimize-bias while leaving the word 'minimum' intact via minimize-bias-reframe (iter 16, -6.2 loss) worked better because it removed the explicit "choose LOWEST" directive without touching the framing sentence.

## Lesson

The minimize-bias pull is in the KEY-QUESTIONS directive ("choose LOWEST"), not in the framing sentence. Changing the framing sentence word does not address the root cause.

## Hypothesis

Change 'minimum' to 'realistic' in framing sentence should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: Define primary confusion pair targets.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Vague — 'realistic' may be interpreted differently by different tasks

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 23 | 20260328-182058 | discard | 23.91 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
