---
id: non-negotiable-boundary-gates
title: Add hard non-negotiable gates for model-judgment, real-infra, and multi-step boundaries
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - system_underprediction
  - workflow_gap
confusion_pairs:
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Overly strict gates can increase over-prediction if behavior text is ambiguous.
prereqs: Gate criteria must be explicit and tied to behavior evidence, not inferred from vibe.
related: [reject-higher-must-justify, deterministic-assertion-trap-block, integration-brake]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Introduce hard gates that override local heuristics:
- If behavior validates model judgment/output quality -> minimum Agentic.
- If behavior validates real OS/network/subprocess/external delivery artifact -> minimum System.
- If behavior validates multiple model decisions in sequence -> Workflow.

Model can demote only with explicit quoted disqualifying evidence.

## Steelman

A large share of misses come from the model recognizing a higher-level condition and still talking itself down. Hard gates directly block that failure mechanism.

Low implementation cost: this is mostly prompt policy, not pipeline rework.

## Scathing Critique

If task wording is underspecified, hard gates can convert uncertainty into systematic over-escalation.
