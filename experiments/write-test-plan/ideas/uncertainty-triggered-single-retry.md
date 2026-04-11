---
id: uncertainty-triggered-single-retry
title: Trigger one automatic re-evaluation only when rationale shows uncertainty
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Hedging language may be stylistic rather than true uncertainty, causing unnecessary retries.
prereqs: Uncertainty cues must be explicitly defined and enforced in output format.
related: [two-step-review-loop, remove-self-check, dual-rationale-consensus-gate]
explore_status: no-signal
explore_tasks: [ec-13, ec-08, ec-33, ec-25, ec-31, ec-20]
explore_baseline_loss: 58.06
explore_loss: null
explore_delta: null
explore_date: 2026-04-10
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
Make second-pass review conditional instead of universal:
- First pass produces label + rationale + confidence word.
- If rationale includes uncertainty cues (`maybe`, `unclear`, `likely`, `depends`) or low confidence, run exactly one forced retry with stricter evidence rules.
- Otherwise keep first-pass output.

## Steelman

Current two-pass ideas pay full cost on every behavior. This targets extra reasoning only where risk is highest, potentially improving accuracy per token.

It also gives a clean ablation: compare always-two-pass vs conditional-two-pass.

## Scathing Critique

Models can game this by using confident language even when uncertain. Then the retry never triggers where it's needed most.

Conversely, if uncertainty cues are too broad, this collapses back into always-two-pass behavior.

## Epistemological Status
Explore subset (stratified): `ec-13, ec-08, ec-33, ec-25, ec-31, ec-20`  
Baseline subset loss: `58.06`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-selfcheck-cues | 61.8104 | +3.7477 | improved 1, hurt 2, flat 3 | n/a |
| v2-confidence-tag | 62.9575 | +4.8948 | improved 1, hurt 2, flat 3 | n/a |
| v3-adjacent-only-retry | 64.4418 | +6.3792 | improved 0, hurt 2, flat 4 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Hedging language may be stylistic rather than true uncertainty, causing unnecessary retries.

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
