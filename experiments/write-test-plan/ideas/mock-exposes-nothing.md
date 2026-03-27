---
id: mock-exposes-nothing
title: Add the question "would a mock of this dependency always pass, hiding a real failure?"
status: kept
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: meta-cognitive
risk: Adds one question — minimal length, but may cause overthinking on simple tasks
prereqs: null
related: [counterfactual-mock, minimize-bias-reframe]
---

## Steelman

The U1 pattern ("can mock the API") shows the model defaults to "mock the dependency, test the logic." This is correct for deterministic APIs but wrong for AI/LLM calls where the mock hides the failure mode entirely (a mock always returns the same label).

Adding one key question — "Would a mock of this dependency always pass, hiding a real failure?" — directly triggers the insight the model is missing. For AI APIs, the answer is YES (a mock classification always returns "legal", so the test always passes even if the real model would return "financial"). For deterministic APIs, the answer is NO (a mock 200 response is functionally equivalent to the real one).

This is the lightest possible intervention — one question, no examples, no restructuring. And it targets U1 specifically (11 Agentic misses, all weight-4).

## Scathing Critique

Run 1 showed that adding ANY text to the prompt hurts haiku performance. Even a one-line Agentic definition expansion dropped the score by 4.7 points. This is one more question added to an already-struggling prompt.

The model already has "Does correctness depend on what a real LLM produces? → Agentic" which is conceptually identical. If the model ignores that direct instruction, why would it heed a softer counterfactual question?
