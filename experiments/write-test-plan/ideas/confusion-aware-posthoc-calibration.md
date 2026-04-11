---
id: confusion-aware-posthoc-calibration
title: Learn a post-hoc confusion corrector on top of model probabilities
status: proposed
effort: high
expected_impact: medium
targets:
  - unit_overprediction
  - consistency_failures
  - noise_sensitivity
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: structural
risk: Can overfit to recent runs and silently degrade when error distribution shifts.
prereqs: Reliable calibrated probabilities and enough historical runs to fit a stable correction layer.
related: [explicit-cost-of-error, signal-scoring-rubric, ensemble-majority-vote]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Keep the current prompt mostly stable, but add a learned post-processor that adjusts final class probabilities before argmax.

Inputs to calibrator:
- base level probabilities
- margin between top 2 levels
- extracted flags from rationale (real infra mention, AI model mention, multi-step mention)
- optional task metadata (if allowed)

Output:
- corrected probability vector or direct corrected label.

Candidate calibrators:
- multiclass logistic regression
- isotonic regression per boundary
- lightweight gradient-boosted tree

## Why this is bold

This stops treating prompt text as the only lever. It adds a statistical correction layer that can absorb persistent confusion patterns (for example, Integration->Unit skew) without destabilizing the whole prompt.

## Steelman

The repo now has many timestamped runs and confusion history. That is exactly the data needed for post-hoc calibration. If the model is systematically miscalibrated near specific boundaries, a small correction model can reduce loss quickly.

This also isolates risk: instead of editing load-bearing prompt sections, calibrate outputs externally and roll back in one switch if it regresses.

## Scathing Critique

This may optimize benchmark-specific quirks rather than general reasoning quality. A calibrator trained on one corpus/model pair can fail badly after a model upgrade or corpus expansion.

It also adds engineering complexity and another place to hide bugs (feature extraction drift, train/serve mismatch, stale calibrator artifacts).

If probabilities are not truly calibrated, the correction layer may amplify noise instead of reducing it.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Can overfit to recent runs and silently degrade when error distribution shifts.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Epistemological Status

Current status: null.

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
