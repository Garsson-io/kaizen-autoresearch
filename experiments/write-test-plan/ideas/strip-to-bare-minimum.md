---
id: strip-to-bare-minimum
title: Strip the prompt to absolute minimum — test if LESS guidance beats MORE
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: structural
risk: May lose the correct classifications that the key questions currently enable
prereqs: null
related: [minimize-bias-reframe]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

The baseline prompt (no guidance at all) scores 72.3%. The treatment prompt (with level defs + key questions) scores 85.2% on 30 tasks. But every attempt to ADD more text in run 1 HURT the score. This suggests haiku has a sweet spot — the current prompt may already be past it.

What if we strip even further? Remove the key questions entirely and keep only the level definitions + self-check. The key questions may be causing the minimize bias by encouraging the model to reason through a checklist where the first match (always a lower level) wins.

Test: definitions-only prompt (no key questions, no self-check). If it scores higher, the key questions are net negative.

## Scathing Critique

The baseline has NO definitions and scores 72%. The treatment has definitions + questions and scores 85%. Removing the questions would be somewhere between — likely 72-85%. The questions ARE providing value for non-Agentic classifications (EC-01, EC-05, EC-06, EC-18 all score 99-100%).

The Agentic failure is specific to 11 behaviors. Stripping the prompt hurts the 117 correct classifications to maybe fix 11. Bad tradeoff.

## Hypothesis

Strip the prompt to absolute minimum — test if LESS guidance beats MORE should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: May lose the correct classifications that the key questions currently enable

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

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 65.0246 | -2.7148 | improved 3, hurt 2, flat 1 | distributed |
| v2plus-stronger-counter | 67.0278 | -0.7116 | improved 2, hurt 2, flat 2 | ec-07 drives 73% of gain |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

