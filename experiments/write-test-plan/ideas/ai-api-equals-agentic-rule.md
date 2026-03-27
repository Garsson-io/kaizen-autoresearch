---
id: ai-api-equals-agentic-rule
title: Add hard rule — "If the behavior calls an AI/ML model API → Agentic, period"
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: representational
risk: May cause over-prediction for behaviors that mention AI but don't depend on model output
prereqs: null
related: [minimize-bias-reframe, mock-exposes-nothing]
---

## Steelman

The taxonomy shows 11 Agentic under-predictions. In EVERY case, the behavior explicitly mentions an AI/ML/LLM API call. The model doesn't lack information — it lacks a clear decision rule.

Current: "result depends on real LLM non-determinism or a real model call" — this is a CRITERION the model must evaluate, and it consistently evaluates wrong.

Proposed: "If the behavior involves calling an AI, ML, or LLM model → Agentic. No exceptions. A mock always returns the same output; the real model varies." This is a RULE, not a criterion. Rules are harder to rationalize around.

The adversarial "misleading surface" tasks (EC-12, EC-16, EC-18) already score 88-100%, proving the model can correctly identify when something is NOT Agentic. The false positive risk is low.

## Scathing Critique

"No exceptions" is dangerous. Some behaviors mention AI/ML but the behavior being tested is actually about the infrastructure around the call, not the model output. Example: "the API returns within the SLA timeout" — this is System (testing latency), not Agentic (testing model output quality).

A hard rule removes the model's ability to make these distinctions. It converts System-about-AI-infrastructure behaviors into false Agentic predictions. The adversarial "misleading surface" tasks were specifically designed to catch this — and we'd regress on them.

Also, run 1 showed that even minimal definition changes hurt. A hard rule is a definition change.
