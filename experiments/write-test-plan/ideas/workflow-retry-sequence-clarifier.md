---
id: workflow-retry-sequence-clarifier
title: Workflow Retry Sequence Clarifier
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
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 66.68
explore_delta: -1.06
explore_date: 2026-04-11
last_run: 20260328-201805
last_iteration: 30
last_outcome: discard
last_delta: 42.34429522395984
retry_trigger: null
owner: null
---
## Hypothesis


Historical evidence suggests this idea changes KEY-QUESTIONS via add. Expected effect is on Unit-Integration by reducing repeated misclassification patterns seen before iteration 30.

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


Latest known outcome: discard.
Latest run: 20260328-201805.
Latest delta: 42.34429522395984.

If retried, require two-step explore (seed/subset change) before promotion.

## Run History


| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 30 | 20260328-201805 | discard | 42.34429522395984 | backfilled from results log |

## Reusable Lesson


Previous variant regressed; only retry with a narrower mechanism and explicit guard against the observed regression direction.

## Steelman

Latest recorded attempt (20260328-201805) worsened loss (42.34429522395984).

Run note: add MULTI-STEP retry/state wording for Workflow — loss worsened, reverted

## Scathing Critique

Current record is partially reconstructed from logs, so mechanism details are incomplete. Risk: retrying without reconstructing the exact prior wording may repeat failure modes or misattribute success. Require explicit diff reconstruction before retry.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 66.6754 | -1.0640 | improved 3, hurt 1, flat 2 | distributed |
| v2plus-stronger-counter | 71.2774 | +3.5380 | improved 2, hurt 2, flat 2 | n/a |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

