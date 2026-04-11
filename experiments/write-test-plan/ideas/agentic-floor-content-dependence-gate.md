---
id: agentic-floor-content-dependence-gate
title: Add explicit Agentic floor when behavior depends on model output content quality
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
change_type: representational
risk: Could over-escalate plumbing-only model-call behaviors if exception is vague.
prereqs: Must preserve a clear exception for routing/retry/payload-only checks that do not judge model output content.
related: [deterministic-assertion-trap-block, reject-higher-must-justify, non-negotiable-boundary-gates]
explore_status: concentrated-signal
explore_tasks: [ec-15, ec-08, ec-35, ec-28, ec-32, ec-19]
explore_baseline_loss: 77.83
explore_loss: 76.81
explore_delta: -1.02
explore_date: 2026-04-10
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
Under `LLM-DEP`, add a strict floor:
if pass/fail depends on model output content quality (correctness, relevance, factuality, ranking, moderation, generation quality), minimum level is Agentic.

Allow Integration/System only for plumbing-only checks (routing, retry, timeout, payload schema) with explicit statement that output quality is not judged.

## Steelman

Current top weighted-loss pairs are `Integration->Agentic` and `Unit->Agentic`. Those errors are exactly downward demotions from content-dependent AI behaviors. A direct floor should reduce those demotions.

## Scathing Critique

The model may claim every behavior implicitly judges output quality and over-call Agentic. The plumbing-only exception must be precise or this collapses calibration.

## Epistemological Status
Explore subset (stratified): `ec-15, ec-08, ec-35, ec-28, ec-32, ec-19`  
Baseline subset loss: `77.83`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-content-quality-floor | 76.8130 | -1.0180 | improved 2, hurt 2, flat 2 | ec-19 drives 64% of gain |
| v2-content-floor-plus-explicit-plumbing-exception | 77.7668 | -0.0643 | improved 2, hurt 2, flat 2 | distributed |
| v3-content-floor-plus-integration-brake-hook | 88.2201 | +10.3890 | improved 0, hurt 3, flat 3 | n/a |

Winner: `v1-content-quality-floor` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could over-escalate plumbing-only model-call behaviors if exception is vague.

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
