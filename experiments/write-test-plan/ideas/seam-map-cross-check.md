---
id: seam-map-cross-check
title: Add a seam-identification step before level classification
status: proposed
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: structural
risk: Seam identification adds complexity; model may name seams incorrectly
prereqs: null
related: [two-pass-dependency-extraction, counterfactual-mock]
---

*Source: Garsson-io/kaizen#1014 — Phase 4.5 grounding incident*

## Steelman

Issue #1014 documents a precise failure mode: the agent produced a correct seam map (identifying `SessionSimulator` as the test seam) but then wrote a test plan that ignored it, defaulting to unit-only. The seam map and the test plan were disconnected — no cross-check gate verified consistency.

This exact failure mode applies to our classification task. The model might correctly identify that a behavior involves "an external AI classification API" (the seam) but then classify it as System because it doesn't cross-check: "given this seam, what's the minimum level that exercises it?"

The idea: add a seam-identification step to the treatment prompt:

```
For each behavior:
1. Name the testability seam — what boundary must the test cross?
   (function boundary, module boundary, network boundary, AI model boundary, multi-step pipeline boundary)
2. Given the seam, what is the minimum level that exercises it?
```

This is a variant of two-pass-dependency-extraction but framed in the language of testability seams (which is the kaizen team's mental model). The seam forces the model to name the boundary BEFORE choosing a level, preventing the "default to Unit" heuristic from pre-firing.

The #1014 incident shows that even when the seam is correctly identified, the classification can still be wrong if there's no cross-check. Adding the cross-check ("given seam X, is my level consistent?") addresses this.

## Scathing Critique

This is two-pass-dependency-extraction wearing a different hat. The critique of that idea applies here: if the model can't distinguish "AI API boundary" from "external API boundary" in one pass, it won't magically distinguish them in a seam-identification pass either.

The #1014 incident involved a different failure: the model had correct context but its heuristic ("unit tests = sufficient") pre-fired before consulting it. That's an attention/ordering problem, not a knowledge problem. Our prompt doesn't have heuristics that pre-fire — it processes each behavior fresh. The #1014 fix (cross-check gate) is specific to multi-step plan formation, not single-shot classification.

Adding seam identification also bloats the structured output. The current schema has 7 fields per behavior. Adding `testability_seam` makes 8. More fields = more chance of Zod validation failures, especially with haiku.

Finally, "testability seam" is kaizen-specific jargon. The model may not have a strong prior for this concept, especially haiku. Terms like "dependency" or "boundary" would be more universally understood but are less precise.
