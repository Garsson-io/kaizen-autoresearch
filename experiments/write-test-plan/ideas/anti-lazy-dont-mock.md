---
id: anti-lazy-dont-mock
title: Don't lower the level just because you can mock the dependency
status: rejected
effort: low
expected_impact: low
targets:
  - agentic_underprediction
  - integration_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-Agentic
change_type: framing
risk: Pushes predictions upward without a corresponding downward guard — causes regression on Agentic cases
prereqs: null
related: [role-anchor-staff-engineer, precision-failure-boundary]
explore_status: no-signal
explore_tasks: [ec-01, ec-04, ec-10, ec-17]
explore_baseline_loss: 68.63
explore_loss: 89.47
explore_delta: 20.84
explore_date: 2026-03-28
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Exact Edit
Add one sentence at the end of the prompt, before the Issue block:

```
Don't choose a lower level just because you *can* mock the dependency. The question is whether the mock would hide a real failure. If it would, the mock is not a valid substitute — the minimum level must be high enough to catch the real failure.
```

## Epistemological Status
**Explore-run tested (4 tasks). FAILED — made loss worse. Reject.**

Tested 2026-03-28 on tasks ec-01, ec-04, ec-10, ec-17 (under-prediction tasks from iter19 baseline).

| Metric | Baseline (iter19) | V1 anti-lazy | Delta |
|--------|-------------------|--------------|-------|
| Loss (4-task subset) | 68.63 | 89.47 | **+20.84 (worse)** |

## Why it failed

The instruction pushes predictions upward without any downward guard. On ec-04, behaviors that were correctly predicted at Integration in the baseline flipped to Unit (Agentic→Unit regressions), making the already-failing Agentic behaviors even worse. The instruction also confused the model on ec-17, introducing a new false Agentic prediction (Integration→Agentic).

The anti-lazy push fights the "choose LOWEST level" framing but without anchoring the correct answer — the model resolves the tension erratically, going too low on some behaviors and too high on others.

The concept is sound (mocking hides failures), but it's already covered more precisely by MOCK-HIDE in KEY-QUESTIONS. Adding a redundant instruction in looser language creates noise rather than signal.

## Do not retry

The same mechanism is addressed better by role-anchor-staff-engineer (V2, -42.54 loss) which frames bidirectional accountability rather than one-directional upward pressure.

## Hypothesis

Don't lower the level just because you can mock the dependency should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Pushes predictions upward without a corresponding downward guard — causes regression on Agentic cases

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
