---
id: abstraction-ladder-prompting
title: Force explicit abstraction climbing — "what category does this belong to?"
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: meta-cognitive
risk: Abstraction climbing may produce vague categories that don't help with classification
prereqs: null
related: [solution-collapse-prevention, failure-mode-taxonomy]
---

*Source: Garsson-io/kaizen#268 — "Agents don't spontaneously climb the abstraction ladder"*

## Steelman

Issue #268 identifies a fundamental LLM behavior pattern: agents fix immediate problems but don't spontaneously generalize. They comply literally with instructions but don't ask "what category does this belong to?" Applied to our task: the model reads "calls external classification API" and immediately classifies it as System. It never asks "what category of external API is this — deterministic or AI-powered?"

The fix from #268: add an explicit abstraction step:

```
Before choosing a level, categorize the behavior's external dependency:
- Pure computation (no dependency) → Unit territory
- Module wiring (internal dependencies) → Integration territory
- Deterministic external service (same input → same output always) → System territory
- Non-deterministic AI/ML service (same input → output may vary) → Agentic territory
- Chain of non-deterministic steps → Workflow territory

Name the category, THEN choose the level.
```

This is a 6-line addition (low effort). It doesn't change the level definitions or the key questions — it adds a categorization step before them. The model must explicitly place the dependency in a bucket before proceeding to classification.

The #268 insight that "climbing the abstraction ladder requires asking 'what category does this belong to?'" is exactly what's missing from our prompt. The model knows the levels. It knows the key questions. But it doesn't spontaneously categorize the dependency type before answering the questions.

This idea combines well with almost every other idea — it's a preprocessing step that makes the key questions more effective.

## Scathing Critique

"Categorize the dependency before choosing the level" is just the two-pass-dependency-extraction idea wearing a philosophy hat. The practical effect is identical: the model must identify whether the external service is deterministic or AI-powered. If it can do that, the classification follows trivially. If it can't, the categorization step doesn't help.

The #268 problem (agents don't generalize) applies to multi-turn conversations where the agent has time pressure and throughput incentives. Our task is single-shot classification — there's no time pressure, no throughput metric, no incentive to "close the issue quickly." The model isn't failing to generalize; it's failing to recognize a specific factual property (AI API = non-deterministic).

Also, adding yet another reasoning step before the key questions dilutes the prompt. The model now has: dependency categorization → key questions → level selection → self-check. Four reasoning stages for what should be a single classification judgment. Each stage is a place for the model to wander off track.

The strongest version of this idea is just the concrete-agentic-example idea: instead of asking the model to "categorize the dependency," just tell it: "AI/LLM APIs are non-deterministic. External services that always return the same result for the same input are deterministic." That's a fact, not a reasoning step.
