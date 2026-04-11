---
id: integration-handoff-not-unit-guard
title: Add explicit Not-Unit handoff guard to MOCK-MISS
status: rejected
effort: low
expected_impact: medium
targets:
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
change_type: representational
risk: Could over-steer to Integration and increase Unit->Integration overprediction.
prereqs: mock-miss-scope-clarification remains in prompt and Integration->Unit is still dominant.
related: [mock-miss-scope-clarification, integration-middle-anchor]
explore_status: no-signal
explore_tasks: [ec-20, ec-24, ec-28, ec-32]
explore_baseline_loss: 65.53
explore_loss: 60.15702795152423
explore_delta: -5.3729720484757735
explore_date: 2026-03-28
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Exact Edit
Add one explicit clause to `MOCK-MISS`:

```md
Not Unit: if the bug appears only when local modules hand off data/state, Unit is too low.
```

## Steelman

The current rule explains Unit eligibility but does not explicitly negate Unit at handoff boundaries. This clause adds a direct boundary check in the same decision sentence, which may reduce Integration->Unit confusions.

## Scathing Critique

The model may already implicitly know this from existing wording, so this could be redundant and become a no-op.

## Epistemological Status
Explore subset (stratified): `ec-20, ec-24, ec-28, ec-32`  
Baseline subset loss: `65.53`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-inline-guard | 60.1570 | -5.3730 | improved 1, hurt 0, flat 3 | EC-32 drives 77.1% of gain |
| v2-short-guard | 62.2076 | -3.3224 | improved 1, hurt 1, flat 2 | EC-24 drives >100% of gain |
| v3-contrast-guard | 70.7021 | +5.1721 | improved 1, hurt 3, flat 0 | — |

Classification: `no-signal` for loop execution (no majority improvement and concentrated gains).

## Hypothesis

Add explicit Not-Unit handoff guard to MOCK-MISS should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could over-steer to Integration and increase Unit->Integration overprediction.

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
