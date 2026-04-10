---
id: scheduled-noise-control-runs
title: Schedule unchanged-prompt control runs to estimate live noise floor
status: proposed
effort: low
expected_impact: medium
targets:
  - noise_sensitivity
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: structural
risk: Extra runs consume budget and may slow iteration throughput.
prereqs: Team accepts a fixed cadence (for example every 3 experiments) for control measurements.
related: [two-pass-vs-effort-ablation, hard-case-canary-gate, meta-failures]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Every N experiment attempts, run one unchanged-prompt control on the same model/corpus settings and log delta distribution.

Decision rule:
- keep only if improvement exceeds recent control variance by a clear margin.

## Steelman

You already documented noise-floor risk. This operationalizes it so keep/discard decisions are grounded in current, not historical, variance. It should reduce false keeps and false rejects.

Implementation is process-only and immediate.

## Scathing Critique

Control cadence can become ritual overhead if variance is already stable. Also, conservative thresholds may reject small real gains.
