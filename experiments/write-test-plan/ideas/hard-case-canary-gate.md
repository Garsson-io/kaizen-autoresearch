---
id: hard-case-canary-gate
title: Add fixed hard-case canary set as precondition before full-corpus runs
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Canary over-optimization may miss regressions outside the canary set.
prereqs: Maintain a stable 8-12 behavior canary set with representative high-impact historical misses.
related: [two-pass-vs-effort-ablation, cluster-detection-for-errors, explore-tool]
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 63.69
explore_delta: -4.05
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
| v2-primary | 71.2236 | +3.4842 | improved 2, hurt 3, flat 1 | n/a |
| v2plus-stronger-counter | 63.6872 | -4.0522 | improved 2, hurt 2, flat 2 | ec-07 drives 62% of gain |

Winner: `v2plus-stronger-counter` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
