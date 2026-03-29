---
id: adjacent-level-min-reproduction-fallback
title: Add adjacent-level tie-breaker using minimum reproduction test
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - integration_underprediction
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: meta-cognitive
risk: A broad "minimum level" fallback can become a default shortcut and suppress justified escalations.
prereqs: Tie-breaker must only apply when ambiguity remains after key questions.
related: [minimize-bias-reframe, mock-miss-scope-clarification, top-down-elimination]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Steelman

Introduce a bounded fallback rule: when uncertain between adjacent levels, choose the level whose test setup minimally but faithfully reproduces the **stated failure**.

This can reduce inconsistent over-escalation without hardcoding Unit preference, because it can also keep Integration over System when real environment behavior is not actually needed for reproduction.

## Scathing Critique

The prompt already optimizes for minimum required infrastructure, so this may be redundant. In practice, fallback rules are often overused, and the model may invoke them prematurely instead of resolving ambiguity through existing gates, causing subtle bias shifts.

