---
id: sub-agentic-demotion-proof-gate
title: Require explicit demotion proof before choosing below Agentic when AI/ML dependency is present
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - System-Agentic
change_type: meta-cognitive
risk: Could trigger over-escalation if proof requirement is too strict on plumbing-only AI-call behaviors.
prereqs: Behavior text must be quotable for demotion evidence.
related: [reject-higher-must-justify, deterministic-assertion-trap-block, agentic-floor-content-dependence-gate]
explore_status: no-signal
explore_tasks: [ec-15, ec-08, ec-35, ec-28, ec-32, ec-19]
explore_baseline_loss: 77.83
explore_loss: null
explore_delta: null
explore_date: 2026-04-10
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
Add a gate under `REJECTION-GATE`:
if the behavior includes an AI/ML/LLM dependency and final level is below Agentic, the model must quote the exact text proving the behavior tests plumbing only and does not judge output quality.

If no such quote exists, keep Agentic.

## Steelman

This targets the exact failure mode in `Integration->Agentic` and `Unit->Agentic`: unjustified downward demotion despite AI dependency.

## Scathing Critique

Models can fabricate weak quotes or over-interpret vague phrases as output-quality checks, causing Agentic inflation.

## Epistemological Status
Explore subset (stratified): `ec-15, ec-08, ec-35, ec-28, ec-32, ec-19`  
Baseline subset loss: `77.83`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-ai-dependency-downgrade-proof | 83.7050 | +5.8739 | improved 2, hurt 2, flat 2 | n/a |
| v2-llm-dependency-proof-plus-default | 80.7519 | +2.9208 | improved 2, hurt 2, flat 2 | n/a |
| v3-below-agentic-proof-in-rejection-gate | 91.1493 | +13.3182 | improved 2, hurt 3, flat 1 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could trigger over-escalation if proof requirement is too strict on plumbing-only AI-call behaviors.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: no-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
