---
id: two-pass-dependency-extraction
title: Two-pass — extract dependencies first, then classify
status: proposed
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
  - Agentic-Workflow
change_type: structural
risk: Two-pass adds latency and complexity; errors in pass 1 cascade to pass 2
prereqs: Structured output schema would need a dependency_list field, or pass 1 is internal reasoning only
related: [counterfactual-mock, signal-scoring-rubric]
---

## Steelman

The current prompt asks the model to do two things simultaneously: (1) identify what external dependencies a behavior has, and (2) map those dependencies to a test level. Combining these steps means the model's dependency identification is biased by its level heuristics — if it "knows" the answer is System, it won't look hard for AI dependencies.

Separating the steps eliminates this bias:

```
PASS 1: For each behavior, list every external dependency:
  - Database/filesystem → DB
  - External deterministic API → API
  - AI/LLM model call → AI
  - Subprocess/OS → PROC
  - None → PURE

PASS 2: Map dependencies to level:
  PURE only → Unit
  DB/filesystem → Integration
  API/PROC → System
  AI → Agentic
  Multiple AI steps → Workflow
```

This works because pass 1 is a factual question ("what does this behavior depend on?") that the model is good at. Pass 2 is a mechanical mapping. The hard judgment call — "is this API call deterministic or AI-powered?" — happens in pass 1, where the model focuses only on dependency identification without the anchoring effect of level classification.

For EC-04 behavior 3, pass 1 would list "external AI classification API" as a dependency tagged AI. Pass 2 mechanically maps AI → Agentic. The model never gets the chance to shortcut to System.

## Scathing Critique

This assumes the model CAN distinguish "deterministic API" from "AI API" when asked directly. But that's the exact same distinction it fails to make in the single-pass version. The model sees "external classification API" and tags it as API (deterministic) not AI — because it doesn't know that "classification" implies non-determinism.

The two-pass approach doesn't add new knowledge. It just restructures the same reasoning. If the model tags a dependency wrong in pass 1, pass 2 mechanically produces the wrong level. And now there's no opportunity for the holistic self-check ("does my test actually require this level?") to catch the error, because pass 2 is purely mechanical.

Also, the schema implications are real. Either you add a `dependency_list` field to the structured output (changing the eval pipeline) or you rely on the model's internal reasoning for pass 1 (which is invisible and unverifiable). The current structured output schema has no place for dependency tags.

Finally, two-pass prompts are fragile with smaller models. Haiku may lose track of pass 1 outputs when executing pass 2, especially for tasks with 10 behaviors. The prompt would work better with Opus or Sonnet, but the experiment uses haiku for speed and cost.
