---
id: two-pass-vs-effort-ablation
title: Compare two-pass prompting vs higher reasoning effort (2x2 ablation)
status: kept
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - workflow_gap
  - agentic_underprediction
confusion_pairs:
  - Agentic-Workflow
  - Integration-System
change_type: meta-cognitive
risk: Can confuse mechanism attribution unless all cells are run on the same task subset and model.
prereqs: Runner must support explicit reasoning-effort control and fixed task set.
related: [two-step-review-loop, competitive-critique-seeding, hypothesis-validation-step]
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-03, ec-04, ec-07, ec-13, ec-19, ec-32, ec-33]
explore_baseline_loss: 105.54
explore_loss: 102.60
explore_delta: -2.94
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Question

When accuracy is unstable, what helps more in practice:
1) forcing a two-pass critique structure in the prompt, or
2) increasing model reasoning effort from medium to high?

## Design

Run 2x2 on identical task subset:
- A: baseline prompt + medium effort
- B: baseline prompt + high effort
- C: two-pass prompt + medium effort
- D: two-pass prompt + high effort

Primary metric: loss (lower is better).
Secondary checks: critical miss rate, under/over direction shifts.

## Why this matters

Both interventions aim to reduce first-answer anchoring. If one dominates, we should bias future loops toward that mechanism and avoid paying extra latency/cost for weaker gains.

## Caveat

If deltas are small, repeat with a second task subset/seed before concluding.

## Result (2026-04-11)

Subset used: `ec-02, ec-03, ec-04, ec-07, ec-13, ec-19, ec-32, ec-33`

| Condition | Loss |
|---|---:|
| baseline + medium | **120.47** |
| two-pass + medium | 121.25 |
| baseline + high | 124.84 |
| two-pass + high | 127.78 |

Conclusion: increasing reasoning effort to `high` hurts on this subset, and two-pass prompting is closer to baseline at `medium` effort but still slightly worse than baseline-medium. Operational default should remain `medium` effort.

## Hypothesis

Compare two-pass prompting vs higher reasoning effort (2x2 ablation) should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Can confuse mechanism attribution unless all cells are run on the same task subset and model.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Epistemological Status

Current status: null.

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.

## Epistemological status

Explore subset (stratified): `ec-02, ec-03, ec-04, ec-07, ec-13, ec-19, ec-32, ec-33`  
Baseline subset loss: `105.54`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 117.6345 | +12.0981 | improved 2, hurt 4, flat 2 | n/a |
| v2plus-stronger-counter | 102.5966 | -2.9398 | improved 2, hurt 2, flat 4 | distributed |

Winner: `v2plus-stronger-counter` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

