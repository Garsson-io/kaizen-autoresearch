---
id: solution-collapse-prevention
title: Force the model to name the failure mode before choosing the level
status: rejected
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
risk: Extra reasoning step may degrade rather than improve — model may name a wrong failure mode and then consistently misclassify
prereqs: null
related: [counterfactual-mock, two-pass-dependency-extraction, observable-behavior-framing, seam-map-cross-check]
---

*Source: Garsson-io/kaizen#724 — "solution collapse at every layer — the system optimizes for closing issues, not understanding problems"*

## Steelman

Issue #724 identifies the deepest structural problem in the kaizen system: agents optimize for producing an answer, not for understanding the problem. The fix: force the agent to name the failure mode before choosing the solution.

Applied to our classification task: the model currently reads a behavior and immediately pattern-matches to a level ("calls external API" → System). It never asks "what specific failure would this behavior have?" The level is a solution; the failure mode is the problem.

Restructure the prompt:

```
For each behavior:
1. Name the FAILURE MODE — what specific thing goes wrong if this behavior breaks?
   (wrong calculation, broken wiring, network failure, AI gave wrong answer, pipeline lost context)
2. Name what CATCHES that failure — what kind of test infrastructure reveals it?
   (pure function call, wired modules, real API call, real AI model, full pipeline run)
3. Map to level based on what CATCHES it, not what the behavior DESCRIBES.
```

This directly addresses #724's insight: "The fix is somewhere in the philosophy layer. The chain needs a 'validate the hypothesis' step between 'accept scope' and 'implement.'" In our case: validate the failure mode between reading the behavior and choosing the level.

For EC-04 behavior 3 ("classification result consistent across repeated calls"), this changes the reasoning chain:
- Current: "consistent → test by calling twice → Unit"
- Proposed: "failure = real AI model returns different results → catches it = real model call → Agentic"

The model might still get it wrong, but the reasoning path is more likely to surface the AI dependency because the failure mode question forces it to think about WHAT varies, not just HOW to test.

## Scathing Critique

This is counterfactual-mock + two-pass-dependency-extraction + observable-behavior-framing combined into one Frankenstein prompt. Each of those ideas has individual weaknesses; combining them doesn't cancel the weaknesses — it compounds them.

The core issue remains: the model doesn't know that "external AI classification API" implies non-determinism. Asking "what specific thing goes wrong?" doesn't change this. The model will answer: "the external API returns an unexpected label" → "catches it = calling the real API" → "System." The failure mode is correctly named! But the model still maps "calling the real API" to System rather than Agentic because it doesn't distinguish deterministic from non-deterministic APIs.

Also, #724 is about multi-step agent workflows where each step can collapse independently. Our task is single-shot classification — there's only one step. Solution collapse in a pipeline (where the implementor doesn't question the spec) is a different cognitive failure than classification error in a single prompt (where the model lacks a concept).

Adding 3 substeps per behavior triples the token cost and the surface area for errors. Each substep is a place where the model can go wrong, and errors in step 1 (wrong failure mode) cascade to step 3 (wrong level). The current single-step approach at least keeps errors local to each behavior.
