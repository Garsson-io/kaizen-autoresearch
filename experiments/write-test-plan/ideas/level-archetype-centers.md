---
id: level-archetype-centers
title: Add one-line canonical archetype per level as decision anchors
status: proposed
effort: medium
expected_impact: medium
targets:
  - unit_overprediction
  - agentic_underprediction
  - workflow_gap
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: More lines can dilute the core prompt and accidentally create new anchors that overfit examples.
prereqs: Additive only; do not replace existing LEVEL-DEFS.
related: [concrete-agentic-example, negative-examples, category-recognition]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Steelman

The model appears vulnerable to generic hypothetical reasoning ("could miss wiring"), which can override nuanced boundary checks. Adding a short canonical archetype for each level creates stable "center of gravity" anchors:

- Unit: local logic transform/invariant in one boundary
- Integration: local cross-component contract behavior
- System: real environment boundary behavior
- Agentic: model-output quality dependence
- Workflow: correctness across multiple agentic steps

Because this is additive and compact, it can improve consistency without deleting known-good structure.

## Scathing Critique

This may just restate existing definitions with different wording and produce little measurable gain. Worse, if archetypes are too concrete, the model might treat them as narrow prototypes and miss valid edge cases that do not look archetypal.

