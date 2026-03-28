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
---

## The change

Append anti-mock clause to Agentic definition line:

```diff
-  - **Agentic** — result depends on real LLM non-determinism or a real AI/ML model call (e.g., classification, scoring, generation APIs)
+  - **Agentic** — result depends on real LLM non-determinism or a real AI/ML model call (e.g., classification, scoring, generation APIs); mocking the model tests your mock, not the system
```

## Epistemological status

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
