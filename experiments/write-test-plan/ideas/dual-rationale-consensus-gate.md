---
id: dual-rationale-consensus-gate
title: Require two independently styled rationales before accepting a label
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: meta-cognitive
risk: The two rationales may be superficially different but share the same underlying mistake.
prereqs: Prompt must force non-overlapping rationale formats to reduce copy-paste reasoning.
related: [two-step-review-loop, adversarial-self-debate, proposer-critic-judge-arbitration]
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 64.03
explore_delta: -3.71
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---

## Hypothesis

## Steelman

## Scathing Critique

## Exact Edit

## Expected Signal

## Explore Plan

## Promotion Gate

## Epistemological Status

## Run History

## Reusable Lesson

Pending first/next run. After running, record one line: "mechanism worked / failed because <specific boundary effect>".

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 64.0273 | -3.7121 | improved 2, hurt 1, flat 3 | distributed |
| v2plus-stronger-counter | 72.7635 | +5.0241 | improved 1, hurt 3, flat 2 | n/a |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
