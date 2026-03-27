---
id: observable-behavior-framing
title: Reframe level definitions around observable failure modes, not infrastructure
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
change_type: representational
risk: Observable failure framing may be too abstract; model may struggle to map behaviors to failure modes
prereqs: null
related: [counterfactual-mock, concrete-agentic-example]
---

*Source: Garsson-io/kaizen#1020 — "describe observable behavior, not infrastructure"*

## Steelman

Issue #1020's principle #4 says: "Behavior framing = observable outcome, not implementation detail." The current treatment prompt defines levels by infrastructure:

```
Unit — one local function or object boundary, no I/O
Integration — several modules wired together, local DB or filesystem
System — subprocess, OS behavior, real HTTP, or real external API call
Agentic — result depends on real LLM non-determinism or a real model call
```

These are implementation-centric definitions. They work when the model can map from behavior to infrastructure ("calls AI API" → "real model call" → Agentic). But the model fails this mapping for EC-04 because "external AI classification API" doesn't trigger "real model call."

Reframe around observable failures:

```
Unit — failure is in logic: wrong calculation, wrong branch, wrong return value.
        A test with no dependencies reproduces it.
Integration — failure is in wiring: modules don't connect correctly, data doesn't
              flow between components. Need real modules wired together.
System — failure is in the environment: timeout, network error, subprocess exit code.
         Need the real external system to reproduce.
Agentic — failure is in AI judgment: the model classified wrong, generated wrong
          output, or varied unexpectedly. A mock always returns the same thing, so
          you'd never see this failure without the real model.
Workflow — failure is in orchestration: individual AI steps work but the pipeline
           produces wrong results due to step ordering, context loss, or error
           propagation across steps.
```

This reframe attacks the root cause directly: "failure is in AI judgment" is much harder to confuse with "failure is in the environment" than "real model call" is to confuse with "real external API call."

## Scathing Critique

The observable failure framing is more intuitive for humans but may be harder for LLMs. The model needs to reason backward: "what kind of failure would this behavior have?" → "what infrastructure would reproduce it?" This is the counterfactual-mock approach in disguise — and it has the same weakness: the model must imagine a failure it hasn't been told about.

For EC-04 behavior 3 ("classification result consistent across repeated calls"), the observable failure framing asks: "is this a logic failure (Unit), a wiring failure (Integration), or an AI judgment failure (Agentic)?" But the model's prior says "consistency = calling a function twice and comparing" → logic → Unit. The failure framing doesn't change the model's understanding of what "consistent" means in the context of an AI API.

Also, these definitions are less precise than the infrastructure definitions. "Failure is in wiring" is vaguer than "several modules wired together, local DB or filesystem." Vagueness helps the model be creative (maybe it'll correctly identify the AI failure) but also helps it be wrong in novel ways.

The current 87.2% score came from the infrastructure-centric definitions. Switching to failure-centric definitions is a significant prompt rewrite with uncertain payoff — exactly the kind of "too many variables, can't diagnose" change the program.md warns against.
