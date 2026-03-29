---
id: contrastive-boundary-examples-pack
title: Add compact positive/negative contrastive examples for all adjacent boundaries
status: proposed
effort: high
expected_impact: high
targets:
  - unit_overprediction
  - system_underprediction
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Example anchoring could overfit to patterns and harm out-of-distribution behaviors.
prereqs: Keep examples short (1 line each) and explicitly marked as boundary demos.
related: [few-shot-worked-examples, negative-examples, concrete-agentic-example]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Hypothesis

Current definitions are abstract and allow drift. A compact contrastive pack can supply concrete anchors for each adjacent boundary without full few-shot overload.

## Proposed Prompt Edit (exact prose)

Add this block after `LEVEL-DEFS`:

```md
- **BOUNDARY EXAMPLES** (use as tie-breakers):
  - **Unit vs Integration**:
    - Unit example: "Validate parser rejects malformed token list in one function."
    - Integration example: "Verify parser output field names map correctly into scheduler input."
  - **Integration vs System**:
    - Integration example: "Verify repo layer and service layer preserve transaction rollback state."
    - System example: "Verify behavior under real subprocess exit codes / real network timeout behavior."
  - **System vs Agentic**:
    - System example: "Deterministic external API contract handling (same input -> same output semantics)."
    - Agentic example: "Correctness depends on real model judgment quality (classification/ranking/scoring/generation)."
  - **Agentic vs Workflow**:
    - Agentic example: "Single model step quality check."
    - Workflow example: "Multi-step agent chain where later step correctness depends on earlier model outputs."
```

Append one line under `SELF-CHECK`:

```md
If two levels still seem plausible, choose the one whose boundary example most closely matches the behavior's failure mode.
```

## Why This Could Escape the Local Maximum

Past failed edits were tiny and policy-like; this introduces explicit boundary geometry across all adjacent pairs. It could improve calibration holistically, not just Unit-vs-Integration.

Because examples are contrastive and paired, they are less likely to produce one-sided anchoring than isolated "Unit" or "Agentic" examples.

## Scathing Critique

Even compact examples can dominate model pattern-matching and create template overfitting. If behavior wording differs from examples, the model may still revert to old heuristics. This is also a larger token increase, which could hurt consistency.

