---
id: single-counterexample-selector
title: Single Counterexample Selector (ambiguity-triggered only)
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-Agentic
  - Integration-System
change_type: structural
risk: Ambiguity trigger may misfire and either run too often or miss hard cases.
prereqs: Near-tie threshold must be numeric and fixed (`top-2 gap <= 0.10`).
related: [adjacent-counterexample-gate, uncertainty-triggered-single-retry, top2-runner-up-contrast-gate]
family: counterexample-first
mechanism_signature: one-strongest-counterexample-on-ambiguity
max_followups: 1
control_required: true
explore_status: concentrated-signal
explore_tasks: [ec-03, ec-14, ec-24, ec-19, ec-30, ec-32]
explore_baseline_loss: 131.49
explore_loss: 128.77
explore_delta: -2.72
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Applying counterexample reasoning only on ambiguous boundaries can capture hard-case gains without paying global reasoning tax.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add ambiguity-triggered selector:
  - If `top-2 gap <= 0.10`, produce one strongest adjacent-level counterexample and choose based on it.
  - If not ambiguous, use normal flow with no extra step.
- Keep output to one short line.

## Expected Signal
- Primary targets: hard adjacent confusion pairs with high variance.
- Success pattern: improved stability on difficult cases with minimal collateral regressions.
- Failure pattern: weak trigger reliability yields no-signal.

## Explore Plan
- v1: trigger on `top-2 gap <= 0.10`.
- v2: trigger only on top-loss pairs.
- v3: trigger on tie/near-tie plus mandatory behavior quote.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological Status
Current status: untested.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run yet |

## Reusable Lesson
Pending first run.

## Epistemological status

Explore subset (stratified): `ec-03, ec-14, ec-24, ec-19, ec-30, ec-32`  
Baseline subset loss: `131.49`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-primary-ambiguous-only | 132.1320 | +0.6423 | improved 2, hurt 2, flat 2 | n/a |
| v2-primary-plus-agentic-counterbalance | 128.7668 | -2.7229 | improved 1, hurt 3, flat 2 | ec-30 drives 94% of gain |

Winner: `v2-primary-plus-agentic-counterbalance` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

