---
id: bidirectional-rejection-evidence-gate
title: Require concrete evidence for rejecting either adjacent level (upward and downward)
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: meta-cognitive
risk: Could over-constrain reasoning and increase tie-to-middle behavior.
prereqs: Gate must be scoped to adjacent boundaries only to avoid combinatorial overhead.
related: [reject-higher-must-justify, pairwise-boundary-tournament, global-stated-failure-only-rule]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Extend the current one-sided rejection gate to adjacent bidirectional checks:
- If choosing level `L`, provide disqualifying evidence for `L-1` and `L+1`.
- If no disqualifying evidence exists for an adjacent level, mark as uncertain and trigger one retry.

## Steelman

The current kept gate protects against unjustified downward overrides. This adds symmetry so unjustified upward or downward moves are both penalized. Adjacent-only scope keeps it lightweight.

This should help where errors oscillate between over- and under-prediction across runs.

## Scathing Critique

Symmetry can blunt a useful asymmetry. The existing one-sided gate worked partly because it targeted a specific underprediction mechanism; making it bidirectional may erase that advantage.
