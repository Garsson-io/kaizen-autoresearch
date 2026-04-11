---
id: canonical-boundary-calibration-pack
title: Add a small canonical boundary calibration pack inside the prompt
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Pack can overfit model behavior to a narrow set of examples.
prereqs: Curate 2-3 clean examples per adjacent boundary with clear positive/negative contrasts.
related: [few-shot-worked-examples, contrastive-boundary-examples-pack, boundary-specific-micro-variants]
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
Embed a tiny stable set of boundary examples (2-3 per adjacent pair) that define the decision edge:
- Unit vs Integration
- Integration vs System
- System vs Agentic
- Agentic vs Workflow

Use them as calibration references before behavior-level decisions.

## Steelman

This gives consistent anchors across runs and reduces drift from ad-hoc wording changes. It can improve boundary stability without requiring major pipeline changes.

## Scathing Critique

If examples are too close to corpus wording, gains may come from imitation rather than real reasoning.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Pack can overfit model behavior to a narrow set of examples.

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
