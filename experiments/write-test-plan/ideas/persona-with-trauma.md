---
id: persona-with-trauma
title: QA persona who shipped a bug due to under-testing AI
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: framing
risk: Persona framing may override careful reasoning with emotional bias toward over-testing
prereqs: null
related: [explicit-cost-of-error, concrete-agentic-example]
---

## Steelman

```
You are a QA lead who once shipped a critical bug because your team mocked
an AI API in tests. The mock always returned "safe" but the real model
sometimes returned "unsafe", causing a content moderation failure in
production. You now carefully distinguish between deterministic APIs
(where mocks are sufficient) and AI APIs (where the real model must be used).
```

Persona prompting is one of the most effective prompt engineering techniques for classification tasks. It doesn't just tell the model what to do — it tells it WHO to be. The "trauma" backstory creates a specific bias: be suspicious of AI API mocks.

This bias is exactly what the experiment needs. The primary failure mode is that the model treats AI APIs as mockable (System) instead of requiring real model calls (Agentic). A persona who was burned by this exact mistake will be hypersensitive to it.

The backstory also provides implicit few-shot learning: the scenario described (content moderation failure from mocked AI) is structurally identical to EC-04 (document classification) and EC-13 (content moderation). The model internalizes the lesson without seeing an explicit example.

Low effort: 4 lines added to the beginning of the prompt. No structural change.

## Scathing Critique

Persona prompting is unreliable with smaller models. Haiku may not consistently maintain a persona across 5-10 behaviors — it might start as a cautious QA lead and gradually revert to its default behavior by behavior 4. Persona consistency is a known weakness of non-frontier models.

The "trauma" approach is a sledgehammer. Yes, it will fix EC-04 (AI API → Agentic). But it will also make the model paranoid about EVERY external API call. EC-12 (S3 data pipeline), EC-16 (CI lint), EC-20 (vulnerability scanner) all call external APIs that are deterministic. A traumatized QA persona may escalate these to Agentic, hurting the score on "misleading surface" adversarial tasks.

The persona also conflicts with the "choose the LOWEST level" instruction. The persona says "be suspicious of mocks" while the prompt says "minimize the level." The model has to reconcile these, and different behaviors may trigger different resolutions.

Finally, this approach doesn't scale. When you discover a new failure mode (e.g., Workflow under-prediction), you'd need to add another trauma to the backstory. The persona becomes a collection of war stories rather than a classification framework.
