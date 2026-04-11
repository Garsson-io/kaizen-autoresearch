---
id: minimal-failing-invariant-first
title: Force "minimal failing invariant" before selecting level
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: framing
risk: Bad invariant statements can create false confidence and lock in wrong labels.
prereqs: The model can produce one concise invariant tied to observable behavior text.
related: [solution-collapse-prevention, write-test-first, integration-contract-invariant-gate]
explore_status: no-signal
explore_tasks: [ec-03, ec-14, ec-24, ec-19, ec-30, ec-32]
explore_baseline_loss: 131.49
explore_loss: null
explore_delta: null
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

Explore subset (stratified): `ec-03, ec-14, ec-24, ec-19, ec-30, ec-32`  
Baseline subset loss: `131.49`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-primary-invariant-first | 132.3558 | +0.8661 | improved 2, hurt 3, flat 1 | n/a |
| v2-primary-plus-agentic-counterbalance | 152.4910 | +21.0013 | improved 2, hurt 2, flat 2 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

