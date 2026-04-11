---
id: real-infra-fake-vs-real-gate
title: REAL-INFRA gate — require exact failure-mode dependence on real infra before escalating to System
status: rejected
effort: low
expected_impact: medium
targets:
  - integration_overprediction
  - system_underprediction
confusion_pairs:
  - Integration-System
change_type: representational
risk: Could become a no-op if redundant with existing REAL-INFRA wording, or overcorrect to Integration.
prereqs: Current prompt already reduced Integration->Unit; remaining mass includes bidirectional Integration<->System confusion.
related: [mock-miss-scope-clarification, integration-middle-anchor, precision-failure-boundary]
explore_status: no-signal
explore_tasks: [ec-31, ec-10, ec-03, ec-20]
explore_baseline_loss: 57.63
explore_loss: 56.83365925805262
explore_delta: -0.7963407419473754
explore_date: 2026-03-28
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Exact Edit
Add one clarifying `Think` line under `REAL-INFRA`:

```md
Think: can an in-process fake reproduce this exact failure mode? If yes, keep Integration; if the failure only appears with real network timing, OS signals, or process boundaries, escalate to System.
```

## Steelman

The current REAL-INFRA check is one-directional and tends to be answered from surface dependency names. This line forces an explicit equivalence test against the exact behavior failure mode, which can reduce both false escalation to System and false retention at Integration.

## Scathing Critique

This may duplicate existing questions and produce no measurable gain. Worse, if interpreted literally, it could push too many behaviors down to Integration when real infra effects are subtle.

## Epistemological Status
Explore subset (stratified): `ec-31, ec-10, ec-03, ec-20`  
Baseline subset loss: `57.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-direct-gate | 66.5228 | +8.8928 | improved 0, hurt 3, flat 1 | — |
| v2-short-gate | 56.8337 | -0.7963 | improved 1, hurt 1, flat 2 | EC-31 drives >100% of aggregate gain |
| v3-negative-gate | 61.5681 | +3.9381 | improved 1, hurt 1, flat 2 | — |

Classification: `no-signal` for loop execution (no majority improvement, tiny aggregate change, and concentrated effect).

## Hypothesis

REAL-INFRA gate — require exact failure-mode dependence on real infra before escalating to System should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could become a no-op if redundant with existing REAL-INFRA wording, or overcorrect to Integration.

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
