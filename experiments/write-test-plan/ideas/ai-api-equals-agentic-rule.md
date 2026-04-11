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
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
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

## Epistemological Status
Explore subset (stratified): `ec-13, ec-09, ec-27, ec-23, ec-32, ec-29`  
Baseline subset loss: `80.05`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-hard-default-add | 83.5929 | +3.5409 | improved 4, hurt 2, flat 0 | n/a |
| v2-hard-default-with-infra-exception | 86.1667 | +6.1148 | improved 3, hurt 1, flat 2 | n/a |
| v3-hard-default-vs-system-contrast | 83.2523 | +3.2004 | improved 4, hurt 2, flat 0 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

## Hypothesis

Add hard rule — "If the behavior calls an AI/ML model API → Agentic, period" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: May cause over-prediction for behaviors that mention AI but don't depend on model output

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
