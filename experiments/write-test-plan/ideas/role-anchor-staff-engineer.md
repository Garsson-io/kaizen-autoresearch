---
id: role-anchor-staff-engineer
title: Staff engineer PR review persona — justify not lower, not higher
status: rejected
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - unit_overprediction
  - integration_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: framing
risk: Persona framing may conflict with other instructions or cause inconsistent reasoning across tasks
prereqs: null
related: [precision-failure-boundary, concrete-agentic-example]
explore_status: concentrated-signal
explore_tasks: [ec-03, ec-04, ec-19, ec-30]
explore_baseline_loss: 128.78
explore_loss: 86.24
explore_delta: -42.54
explore_date: 2026-03-28
last_run: 20260328-170052
last_iteration: 21
last_outcome: discard
last_delta: 101.81
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Exact Edit
Add one sentence at the end of the prompt, before the Issue block:

```
Answer as a staff engineer justifying the testing strategy in a PR review. You must be ready to defend why this level — not lower, not higher — is the minimum that would actually catch a real production failure.
```

## Epistemological Status
**DISCONFIRMED on full corpus. explore_status retroactively: concentrated-signal.**

Explore tested 2026-03-28 on tasks ec-03, ec-04, ec-19, ec-30 (top-loss tasks, biased sample).
Full corpus run: iter21 (run 20260328-170052), loss **469.89** vs baseline 368.08 → **+101.81**.

| Task | Baseline | Explore run | Full run | Explore Δ | Full Δ |
|------|----------|-------------|----------|-----------|--------|
| ec-03 | 14.07 | 15.09 | — | +1.02 | — |
| ec-04 | 22.10 | 16.43 | 58.74 | -5.67 | **+36.64** |
| ec-19 | 24.64 | 21.03 | — | -3.61 | — |
| ec-30 | 67.98 | 33.68 | 40.74 | **-34.30** | -27.24 |

**Concentration analysis**: EC-30 drove -34.30 of the -42.54 explore aggregate (**81%**). 3/4 tasks improved in the explore run. But EC-04 — which was modest -5.67 in explore — reversed to +36.64 on the full corpus. EC-04-type regressions (hurt 11 tasks, +140 total) overwhelmed the EC-30 improvement on the full run.

The explore sample was biased: ec-30 baseline = 67.98, which was **52.8% of the 4-task subset baseline** (128.78). Any change that helps EC-30 dominates the aggregate, masking per-task regressions.

This failure documented in meta-failures.md (explore-selection-bias). The fix: stratified task selection and per-task concentration check in `/explore`.

## Why it failed on the full corpus

The "staff engineer who defends upward AND downward" frame created bidirectional pressure that the model resolved inconsistently. On EC-30 (lots of over-prediction), the downward pressure helped. On EC-04, EC-07, EC-10 (behaviors requiring Agentic detection), the "not higher to be safe" guard suppressed correct Agentic predictions.

The tension with "choose LOWEST level" in KEY-QUESTIONS proved real: when given two opposing instructions ("defend why not lower" vs "choose lowest"), the model defaulted to Unit/Integration across the board on tasks that needed Agentic.

## Hypothesis

Staff engineer PR review persona — justify not lower, not higher should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Persona framing may conflict with other instructions or cause inconsistent reasoning across tasks

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: concentrated-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 21 | 20260328-170052 | discard | 101.81 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
