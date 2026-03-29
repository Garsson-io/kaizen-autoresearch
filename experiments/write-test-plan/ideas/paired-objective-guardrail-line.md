---
id: paired-objective-guardrail-line
title: Add guardrail line to reduce Unit-Integration errors without suppressing higher escalations
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - agentic_underprediction
  - workflow_gap
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: framing
risk: A broad balancing sentence may be too weak to move behavior or too vague to be actionable.
prereqs: Keep it short and near KEY-QUESTIONS where escalation decisions are made.
related: [mock-miss-scope-clarification, global-stated-failure-only-rule, system-environment-artifact-split]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Steelman

Meta-learning shows a recurring tradeoff: fixing Unit vs Integration can create under-calls at System/Agentic/Workflow. Add one explicit balancing line:

"Do not reduce level just to avoid Integration; if REAL-INFRA, LLM-DEP, or MULTI-STEP is true for this behavior, escalate accordingly."

This keeps pressure on overcalled Integration while protecting higher-level correctness.

## Scathing Critique

This may be too generic to produce measurable improvement and could act as contradictory guidance if placed near strong Unit disambiguators. Without concrete examples, the model may acknowledge the rule but still default to existing habits.

