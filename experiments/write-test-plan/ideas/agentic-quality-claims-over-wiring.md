---
id: agentic-quality-claims-over-wiring
title: Agentic Quality Claims Over Wiring
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
explore_status: no-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: null
explore_delta: null
explore_date: 2026-04-11
last_run: 20260328-200721
last_iteration: 28
last_outcome: keep
last_delta: -13.32472628624153
retry_trigger: null
owner: null
---
## Hypothesis


Historical evidence suggests this idea changes KEY-QUESTIONS via replace. Expected effect is on Unit-Integration by reducing repeated misclassification patterns seen before iteration 28.

## Exact Edit


- Target: `experiments/write-test-plan/prompts/treatment.md`
- Historical locus: KEY-QUESTIONS
- Historical edit type: replace
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
Latest run: 20260328-200721.
Latest delta: -13.32472628624153.

If retried, require two-step explore (seed/subset change) before promotion.

## Run History


| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 28 | 20260328-200721 | keep | -13.32472628624153 | backfilled from results log |

## Reusable Lesson


Previously improved loss; preserve exact mechanism and avoid adding unrelated constraints when retrying/adapting.

## Steelman

Latest recorded attempt (20260328-200721) improved loss (-13.32472628624153).

Run note: strengthen LLM-DEP rule: model-quality claims are Agentic even when surrounding wiring is Integration

## Scathing Critique

Current record is partially reconstructed from logs, so mechanism details are incomplete. Risk: retrying without reconstructing the exact prior wording may repeat failure modes or misattribute success. Require explicit diff reconstruction before retry.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 69.4381 | +1.6987 | improved 2, hurt 2, flat 2 | n/a |
| v2plus-stronger-counter | 75.3542 | +7.6147 | improved 0, hurt 3, flat 3 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
