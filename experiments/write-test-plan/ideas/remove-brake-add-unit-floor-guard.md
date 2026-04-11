---
id: remove-brake-add-unit-floor-guard
title: Remove Brake Add Unit Floor Guard
status: rejected
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
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
last_run: 20260329-074201
last_iteration: 47
last_outcome: discard
last_delta: 31.737026744618674
retry_trigger: null
owner: null
---
## Hypothesis


Historical evidence suggests this idea changes SELF-CHECK via remove. Expected effect is on Unit-Integration by reducing repeated misclassification patterns seen before iteration 47.

## Exact Edit


- Target: `experiments/write-test-plan/prompts/treatment.md`
- Historical locus: SELF-CHECK
- Historical edit type: remove
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


Latest known outcome: discard.
Latest run: 20260329-074201.
Latest delta: 31.737026744618674.

If retried, require two-step explore (seed/subset change) before promotion.

## Run History


| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 47 | 20260329-074201 | discard | 31.737026744618674 | backfilled from results log |

## Reusable Lesson


Previous variant regressed; only retry with a narrower mechanism and explicit guard against the observed regression direction.

## Steelman

Latest recorded attempt (20260329-074201) worsened loss (31.737026744618674).

Run note: Removed INTEGRATION-BRAKE: massive regression +31.74; BRAKE is load-bearing despite Unit→Integration side effect; reverted

## Scathing Critique

Current record is partially reconstructed from logs, so mechanism details are incomplete. Risk: retrying without reconstructing the exact prior wording may repeat failure modes or misattribute success. Require explicit diff reconstruction before retry.
