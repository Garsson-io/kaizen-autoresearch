---
id: under-testing-red-team-critic-pass
title: Add a critic pass that searches for ways the proposed test could pass while prod is broken
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: meta-cognitive
risk: Critic can become generic and always recommend escalation, harming precision.
prereqs: Critic must provide behavior-specific escape path evidence, not abstract caution text.
related: [competitive-critique-seeding, two-step-review-loop, uncertainty-triggered-single-retry]
explore_status: no-signal
explore_tasks: [ec-13, ec-08, ec-33, ec-26, ec-31, ec-20]
explore_baseline_loss: 58.36
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
After initial level choice, run one focused critic question:
"How could this test pass while production is still broken for this behavior?"

If the critic finds a plausible escape path tied to behavior text, force escalation or retry.

## Steelman

This directly targets under-testing risk, which is the expensive failure mode in practice. It also keeps cost low by adding one targeted check instead of full multi-pass orchestration.

## Scathing Critique

Without strict grounding rules, critic outputs may be fear-based speculation and push unnecessary higher levels.

## Epistemological Status
Explore subset (stratified): `ec-13, ec-08, ec-33, ec-26, ec-31, ec-20`  
Baseline subset loss: `58.36`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-critic-question | 66.9470 | +8.5860 | improved 1, hurt 2, flat 3 | n/a |
| v2-critic-evidence-gated | 65.7205 | +7.3596 | improved 1, hurt 3, flat 2 | n/a |
| v3-critic-adjacent-up | 68.1578 | +9.7969 | improved 1, hurt 4, flat 1 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Critic can become generic and always recommend escalation, harming precision.

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
