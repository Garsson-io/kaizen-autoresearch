---
id: canonical-boundary-calibration-pack
title: Add a small canonical boundary calibration pack inside the prompt
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Pack can overfit model behavior to a narrow set of examples.
prereqs: Curate 2-3 clean examples per adjacent boundary with clear positive/negative contrasts.
related: [few-shot-worked-examples, contrastive-boundary-examples-pack, boundary-specific-micro-variants]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Embed a tiny stable set of boundary examples (2-3 per adjacent pair) that define the decision edge:
- Unit vs Integration
- Integration vs System
- System vs Agentic
- Agentic vs Workflow

Use them as calibration references before behavior-level decisions.

## Steelman

This gives consistent anchors across runs and reduces drift from ad-hoc wording changes. It can improve boundary stability without requiring major pipeline changes.

## Scathing Critique

If examples are too close to corpus wording, gains may come from imitation rather than real reasoning.
