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
explore_status: no-signal
explore_tasks: [ec-13, ec-08, ec-33, ec-26, ec-31, ec-20]
explore_baseline_loss: 58.36
explore_loss: null
explore_delta: null
explore_date: 2026-04-10
---

## Steelman

Meta-learning shows a recurring tradeoff: fixing Unit vs Integration can create under-calls at System/Agentic/Workflow. Add one explicit balancing line:

"Do not reduce level just to avoid Integration; if REAL-INFRA, LLM-DEP, or MULTI-STEP is true for this behavior, escalate accordingly."

This keeps pressure on overcalled Integration while protecting higher-level correctness.

## Scathing Critique

This may be too generic to produce measurable improvement and could act as contradictory guidance if placed near strong Unit disambiguators. Without concrete examples, the model may acknowledge the rule but still default to existing habits.

## Epistemological status

Explore subset (stratified): `ec-13, ec-08, ec-33, ec-26, ec-31, ec-20`  
Baseline subset loss: `58.36`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-short-balance | 59.0123 | +0.6514 | improved 2, hurt 1, flat 3 | n/a |
| v2-balance-in-mockmiss | 62.7709 | +4.4099 | improved 3, hurt 2, flat 1 | n/a |
| v3-balance-in-selfcheck | 65.9556 | +7.5947 | improved 1, hurt 3, flat 2 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
