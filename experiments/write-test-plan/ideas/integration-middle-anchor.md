---
id: integration-middle-anchor
title: Anchor Integration as the local-wiring middle layer with explicit adjacent contrasts
status: rejected
effort: low
expected_impact: high
targets:
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
  - Integration-Workflow
change_type: representational
risk: Extra Integration guidance may still bleed downward into Unit or upward into System if the contrast language is too vague
prereqs: The current 36-task shift toward Integration-boundary errors is real enough to optimize for, not a one-run artifact
related: [negative-examples, precision-failure-boundary, infra-probe-question]
explore_status: concentrated-signal
explore_tasks: [ec-03, ec-14, ec-17, ec-20]
explore_baseline_loss: 55.78
explore_loss: 49.64592132396043
explore_delta: -6.134078676039568
explore_date: 2026-03-28
last_run: 20260328-225446
last_iteration: 35
last_outcome: discard
last_delta: 9.079870259515767
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Exact Edit
Add an Integration-specific contrast block directly under the `Integration` level definition:

```md
  - **Integration** — several modules wired together, local DB or filesystem
    Think: this is the local-wiring layer — handler -> service -> repo, job -> queue -> worker, parser -> file/db.
    Not Unit: if the failure only appears when local components hand off data/state to each other, a single-function test is too low.
    Not higher: if the behavior stops at local wiring/state and does not require real network, OS/subprocess, or model judgment, keep it at Integration.
```

## Steelman

The current prompt gives `Integration` only one short positive definition, while `System`, `Agentic`, and `Workflow` each get stronger discriminators in `KEY-QUESTIONS`. That leaves the middle layer under-specified. The new 36-task run makes this visible: the dominant confusion mass is around `Integration`, with `Integration->Unit` far above every other pair and smaller spillover from `Integration` into `System`, `Agentic`, and `Workflow`. A short contrast block fixes the middle, not the extremes. It tells the model what Integration *is* (local component handoffs and local state), what it is *not below* (not a single isolated function when mocks hide the handoff bug), and what it is *not above* (do not escalate local wiring to System/Agentic/Workflow unless the behavior truly depends on real infra or real model judgment). This follows the add-not-replace rule and stays close to the current prompt shape.

## Scathing Critique

This may be the same mistake as `unit-algo-parenthetical` in a softer form: once the model sees more text around the Unit/Integration boundary, it may over-apply the new language and relabel anything with more than one noun as Integration. The current diagnosis also comes from a single expanded-corpus run plus a taxonomy file that still reflects the older 30-task distribution, so the apparent Integration crisis may be partly noise or measurement lag. If so, adding an Integration anchor could spend prompt budget on a transient pattern while regressing the hard-won Agentic gains.

## Epistemological Status
Explore subset (stratified): `ec-03, ec-14, ec-17, ec-20`  
Baseline subset loss: `55.78`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-anchor-basic | 49.6459 | -6.1341 | improved 2, hurt 1, flat 1 | EC-17 drives ~91% of gain |
| v2-anchor-unit-contrast | 52.9471 | -2.8329 | improved 1, hurt 2, flat 1 | EC-17 drives >100% (others regress) |
| v3-anchor-bounded | 56.1766 | +0.3966 | improved 1, hurt 1, flat 2 | n/a (net worse) |

Winner: `v1-anchor-basic` by aggregate loss, but classification is `concentrated-signal` (outlier-driven improvement).  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

## Hypothesis

Anchor Integration as the local-wiring middle layer with explicit adjacent contrasts should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Extra Integration guidance may still bleed downward into Unit or upward into System if the contrast language is too vague

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: concentrated-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 35 | 20260328-225446 | discard | 9.079870259515767 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
