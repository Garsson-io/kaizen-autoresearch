---
id: precision-failure-boundary
title: Match failure boundary exactly — not lower for convenience, not higher to be safe
status: rejected
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - integration_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: framing
risk: May reduce over-prediction but leave under-prediction (Agentic) unchanged
prereqs: null
related: [role-anchor-staff-engineer, concrete-agentic-example]
explore_status: concentrated-signal
explore_tasks: [ec-03, ec-22, ec-25, ec-30]
explore_baseline_loss: 94.59
explore_loss: 65.39
explore_delta: -29.20
explore_date: 2026-03-28
last_run: 20260328-232623
last_iteration: 36
last_outcome: discard
last_delta: 40.4614128698268
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Exact Edit
Add one sentence at the end of the prompt, before the Issue block:

```
Match the level to the actual failure boundary — not lower for convenience (mocking when the mock hides the failure), and not higher to be safe when a lower level genuinely suffices.
```

## Epistemological Status
**WARNING: concentrated-signal. Do NOT run on full corpus without re-exploring with stratified task selection.**

Tested 2026-03-28 on tasks ec-03, ec-22, ec-25, ec-30 (over-prediction tasks — biased sample).

| Task | Baseline | V3 explore | Δ |
|------|----------|-----------|---|
| ec-03 | 14.07 | 15.89 | +1.82 (worse) |
| ec-22 | 3.51 | 4.87 | +1.36 (worse) |
| ec-25 | 9.04 | 9.12 | +0.08 (flat) |
| ec-30 | 67.98 | 35.52 | **-32.46 (much better)** |
| **Total** | **94.60** | **65.39** | **-29.20** |

**Concentration analysis**: EC-30 drove -32.46 of the -29.20 aggregate (**111%** — the other 3 tasks partially offset it). 0/4 tasks improved besides EC-30. This is worse concentration than v2 (role-anchor), which had 3/4 tasks improving. The -29.20 aggregate masks a pattern where the change consistently hurts or is flat on all non-EC-30 tasks.

Context: v2 (role-anchor) showed the same EC-30 concentration pattern (81%) and was disconfirmed on the full corpus (+101.8 loss). Given identical concentration structure, this idea has the same risk.

## Why it might still work (after re-exploring)

The instruction targets over-prediction symmetrically ("not lower for convenience, not higher to be safe"). If EC-30's improvement is real and generalizes to other over-prediction tasks, re-running with stratified selection including genuine middle-tier over-prediction tasks (not just EC-30) would reveal whether the gain is reproducible.

## Next step

**Re-run explore with stratified task selection** before committing to full corpus:
- Select over-prediction tasks from the middle loss tier (10–30 loss range) not just EC-30
- If stratified explore shows distributed improvement (>half tasks), proceed to full run
- Do not run full corpus based on the current biased explore result

## Hypothesis

Match failure boundary exactly — not lower for convenience, not higher to be safe should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: May reduce over-prediction but leave under-prediction (Agentic) unchanged

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: concentrated-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 36 | 20260328-232623 | discard | 40.4614128698268 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
