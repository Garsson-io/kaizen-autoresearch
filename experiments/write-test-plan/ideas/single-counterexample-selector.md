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
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
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
