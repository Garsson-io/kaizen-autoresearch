---
id: under-testing-red-team-critic-pass
title: Add a critic pass that searches for ways the proposed test could pass while prod is broken
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: meta-cognitive
risk: Critic can become generic and always recommend escalation, harming precision.
prereqs: Critic must provide behavior-specific escape path evidence, not abstract caution text.
related: [competitive-critique-seeding, two-step-review-loop, uncertainty-triggered-single-retry]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

After initial level choice, run one focused critic question:
"How could this test pass while production is still broken for this behavior?"

If the critic finds a plausible escape path tied to behavior text, force escalation or retry.

## Steelman

This directly targets under-testing risk, which is the expensive failure mode in practice. It also keeps cost low by adding one targeted check instead of full multi-pass orchestration.

## Scathing Critique

Without strict grounding rules, critic outputs may be fear-based speculation and push unnecessary higher levels.
