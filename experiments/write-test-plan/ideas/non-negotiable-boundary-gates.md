---
id: non-negotiable-boundary-gates
title: Add hard non-negotiable gates for model-judgment, real-infra, and multi-step boundaries
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - system_underprediction
  - workflow_gap
confusion_pairs:
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Overly strict gates can increase over-prediction if behavior text is ambiguous.
prereqs: Gate criteria must be explicit and tied to behavior evidence, not inferred from vibe.
related: [reject-higher-must-justify, deterministic-assertion-trap-block, integration-brake]
explore_status: concentrated-signal
explore_tasks: [ec-15, ec-08, ec-35, ec-28, ec-32, ec-19]
explore_baseline_loss: 77.83
explore_loss: 73.11
explore_delta: -4.72
explore_date: 2026-04-10
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
Introduce hard gates that override local heuristics:
- If behavior validates model judgment/output quality -> minimum Agentic.
- If behavior validates real OS/network/subprocess/external delivery artifact -> minimum System.
- If behavior validates multiple model decisions in sequence -> Workflow.

Model can demote only with explicit quoted disqualifying evidence.

## Steelman

A large share of misses come from the model recognizing a higher-level condition and still talking itself down. Hard gates directly block that failure mechanism.

Low implementation cost: this is mostly prompt policy, not pipeline rework.

## Scathing Critique

If task wording is underspecified, hard gates can convert uncertainty into systematic over-escalation.

## Epistemological Status
Explore subset (stratified): `ec-15, ec-08, ec-35, ec-28, ec-32, ec-19`  
Baseline subset loss: `77.83`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-agentic-floor-judgment | 73.1074 | -4.7237 | improved 3, hurt 1, flat 2 | distributed |
| v2-agentic-floor-with-plumbing-exception | 79.5252 | +1.6941 | improved 2, hurt 3, flat 1 | n/a |
| v3-agentic-floor-plus-workflow-floor | 85.6918 | +7.8607 | improved 2, hurt 2, flat 2 | n/a |

Winner: `v1-agentic-floor-judgment` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Overly strict gates can increase over-prediction if behavior text is ambiguous.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: concentrated-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
