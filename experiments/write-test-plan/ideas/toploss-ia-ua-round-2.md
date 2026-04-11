---
id: toploss-ia-ua-round-2
title: Round 2 targeted IA/UA demotion guard variant family
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - System-Agentic
change_type: meta-cognitive
risk: Could over-escalate Agentic when behavior wording is vague.
prereqs: Must preserve explicit plumbing-only exception.
related: [reject-higher-must-justify, deterministic-assertion-trap-block]
explore_status: concentrated-signal
explore_tasks: [ec-09, ec-36, ec-04, ec-35, ec-16, ec-26]
explore_baseline_loss: 32.03
explore_loss: 30.71
explore_delta: -1.32
explore_date: 2026-04-10
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
Target top weighted-loss pairs (Integration->Agentic, Unit->Agentic) with explicit demotion-proof rules.

## Steelman

Forces quoted evidence before choosing below Agentic in AI-dependent behaviors.

## Scathing Critique

May over-call Agentic if proofs are too strict.

## Epistemological Status
Explore subset (stratified): `ec-09, ec-36, ec-04, ec-35, ec-16, ec-26`  
Baseline subset loss: `32.03`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1 | 30.7094 | -1.3194 | improved 1, hurt 1, flat 4 | ec-35 drives 85% of gain |
| v1-ai-path-proof | 32.8442 | +0.8155 | improved 1, hurt 2, flat 3 | n/a |
| v2 | 35.0767 | +3.0479 | improved 1, hurt 2, flat 3 | n/a |
| v2-demotion-two-proofs | 31.3076 | -0.7212 | improved 1, hurt 1, flat 4 | ec-35 drives 70% of gain |
| v3 | 31.7839 | -0.2448 | improved 2, hurt 1, flat 3 | distributed |
| v3-integration-ai-exclusion | 34.9302 | +2.9015 | improved 2, hurt 2, flat 2 | n/a |

Winner: `v1` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could over-escalate Agentic when behavior wording is vague.

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
