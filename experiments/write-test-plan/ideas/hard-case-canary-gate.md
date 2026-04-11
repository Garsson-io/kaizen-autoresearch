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
Create a fixed "hard-case canary" subset and require any new idea to beat baseline on that subset before running full corpus.

Suggested composition:
- 2-3 Unit-Integration traps
- 2-3 Integration-System traps
- 2-3 System-Agentic traps
- 1-2 Agentic-Workflow traps

## Steelman

This gives fast fail-fast signal on exactly the failure modes that repeatedly dominate loss. It cuts wasted full runs on ideas that are dead on arrival.

Given known noise, this also stabilizes comparisons by holding a fixed tough slice.

## Scathing Critique

A fixed canary can become a hidden training target. Improvements may not generalize if the model starts implicitly optimizing to those examples.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Canary over-optimization may miss regressions outside the canary set.

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
