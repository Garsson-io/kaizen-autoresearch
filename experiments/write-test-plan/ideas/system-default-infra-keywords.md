---
id: system-default-infra-keywords
title: System Default Infra Keywords
status: kept
effort: medium
expected_impact: medium
targets:
  - consistency_failures
confusion_pairs:
  - Unit-Integration
change_type: framing
risk: Backfilled placeholder from historical run log; details need curation.
prereqs: null
related: [self-check-hypothetical-wiring-guard, integration-contract-invariant-gate, integration-handoff-not-unit-guard]
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 66.75
explore_delta: -0.99
explore_date: 2026-04-11
last_run: 20260329-023810
last_iteration: 44
last_outcome: keep
last_delta: -12.637607763055565
retry_trigger: null
owner: null
---
## Hypothesis


Historical evidence suggests this idea changes KEY-QUESTIONS via add. Expected effect is on Unit-Integration by reducing repeated misclassification patterns seen before iteration 44.

## Exact Edit


- Target: `experiments/write-test-plan/prompts/treatment.md`
- Historical locus: KEY-QUESTIONS
- Historical edit type: add
- Suggested next edit: replay the smallest previously attempted variant, then run explore holdout before any full-corpus promotion.

## Expected Signal


- Primary targets: Unit-Integration.
- Success criterion: improve weighted loss on these pairs without introducing a larger adjacent-pair regression.
- Watch risk: Backfilled placeholder from historical run log; details need curation..

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Epistemological Status


Latest known outcome: keep.
Latest run: 20260329-023810.
Latest delta: -12.637607763055565.

If retried, require two-step explore (seed/subset change) before promotion.

## Run History


| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 44 | 20260329-023810 | keep | -12.637607763055565 | backfilled from results log |

## Reusable Lesson


Previously improved loss; preserve exact mechanism and avoid adding unrelated constraints when retrying/adapting.

## Steelman

Latest recorded attempt (20260329-023810) improved loss (-12.637607763055565).

Run note: System-default burden flip in REAL-INFRA; Unit→Integration dropped 10→5; loss improved -12.64

## Scathing Critique

Current record is partially reconstructed from logs, so mechanism details are incomplete. Risk: retrying without reconstructing the exact prior wording may repeat failure modes or misattribute success. Require explicit diff reconstruction before retry.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 66.7451 | -0.9944 | improved 3, hurt 2, flat 1 | distributed |
| v2plus-stronger-counter | 68.7827 | +1.0432 | improved 3, hurt 3, flat 0 | n/a |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

