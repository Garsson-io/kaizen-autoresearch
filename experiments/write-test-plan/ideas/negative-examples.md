---
id: negative-examples
title: Add "NOT this" disambiguation between adjacent levels
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: representational
risk: Negative examples can confuse — the model may focus on what NOT to do rather than what to do
prereqs: null
related: [concrete-agentic-example, few-shot-worked-examples]
---

## Steelman

The current level definitions say what each level IS. They don't say what it ISN'T. For confusion pairs, explicit disambiguation is more powerful than better definitions:

```
System vs Agentic:
  System: calls a deterministic external API (weather API, geocoding, CVE database)
  NOT System: calls an AI/LLM API where the response content varies non-deterministically
  Agentic: correctness depends on what a real AI model produces (classification, generation, summarization)
  NOT Agentic: calls a real external API that always returns the same result for the same input
```

This directly targets the confusion pair with contrastive examples. The model doesn't have to infer the boundary — it's explicitly stated. "Calls external API" is no longer ambiguous because both possibilities (deterministic → System, non-deterministic → Agentic) are spelled out.

Low effort: 4 lines added to the level definitions. Compatible with every other idea — you can combine negative examples with top-down elimination, few-shot examples, or any other structural change.

## Scathing Critique

Negative examples create a decision tree that the model must follow precisely. "Is the API deterministic? → System. Is it AI? → Agentic." But real behaviors don't come with labels on their APIs. The model still has to determine whether "external classification API" is deterministic or AI-powered — which is the exact same judgment it currently fails at.

The negative examples also add length without adding new information. "NOT System: calls an AI/LLM API" is the same as the Agentic definition. "NOT Agentic: deterministic API" is the same as the System definition. You're saying each thing twice with opposite framing, hoping one version clicks. That might work, or it might just dilute the signal.

There's also the "System vs Agentic" framing assumes the model has already narrowed to these two choices. But the model doesn't know it's in the System-Agentic decision space — it might be considering Unit vs System. Adding System-Agentic disambiguation doesn't help if the model never gets that far.
