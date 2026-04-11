---
id: remove-self-check
title: Remove the plan_consistent self-check entirely — it's a no-op
status: proposed
effort: low
expected_impact: low
targets:
  - noise_sensitivity
confusion_pairs: []
change_type: structural
risk: Consistency score might drop, but it's currently 100% so the self-check adds nothing
prereqs: null
related: [strip-to-bare-minimum, challenge-your-choice]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

The self-check ("does your test_description actually require that level?") scores 100% consistency across ALL 197 behaviors — it never triggers a level change. It's dead weight: 2 lines of prompt text consuming tokens without affecting output.

Run 1 showed every text addition hurts. Removing 2 lines frees token budget and reduces cognitive load. The freed space could be used for a higher-value intervention (like the adversarial challenge, or nothing at all).

## Scathing Critique

100% consistency means the self-check is working perfectly — it confirms every classification. Removing it might cause the model to stop generating plan_consistent fields or to stop aligning test_description with minimum_level. The 100% consistency might BE the effect of having the instruction, not evidence that it's unnecessary.

Also, 2 lines of text is negligible token savings. This is unlikely to move the score in either direction.

## Hypothesis

Remove the plan_consistent self-check entirely — it's a no-op should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Consistency score might drop, but it's currently 100% so the self-check adds nothing

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
