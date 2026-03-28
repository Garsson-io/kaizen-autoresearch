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
---

## The change

```diff
-For each behavior, reason about the minimum test infrastructure needed to catch
+For each behavior, reason about the realistic test infrastructure needed to catch
```

## Epistemological status

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
