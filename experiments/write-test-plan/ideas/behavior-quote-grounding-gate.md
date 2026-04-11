---
id: behavior-quote-grounding-gate
title: Require behavior-quoted evidence before level escalation
status: proposed
effort: low
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - Integration-System
change_type: framing
risk: Could under-call higher levels if the quote requirement is too strict when behavior text is terse.
prereqs: Must be inserted in KEY-QUESTIONS (not SELF-CHECK) to avoid process-overhead regressions.
related: [minimal-failing-invariant-first, bidirectional-rejection-evidence-gate, system-agentic-negative-contrast]
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 66.25
explore_delta: -1.49
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
If the model must quote the exact behavior phrase that justifies escalation, generic shortcut justifications will drop and boundary accuracy will improve on high-loss adjacent pairs.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a short KEY-QUESTIONS line:
  "Before choosing Integration/System/Agentic/Workflow, quote the exact behavior phrase that requires that level. If no phrase supports escalation, choose the lower adjacent level."
- Keep as one additive sentence only.

## Expected Signal
- Primary targets: `Integration-Agentic`, `Unit-Agentic`, `Integration-System`.
- Success pattern: fewer ungrounded escalations/demotions; lower weighted loss on top adjacent pairs.
- Failure pattern: broad downward bias if quote rule is over-constraining.

## Explore Plan
- v1: strict quote requirement.
- v2: quote + "or clear paraphrase" relaxer.
- v3: quote requirement limited to high levels only (System/Agentic/Workflow).

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout + no-promote policy).

## Epistemological Status
Current status: untested.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run yet |

## Reusable Lesson
Pending first run.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-primary-quoted-evidence | 72.4495 | +4.7101 | improved 1, hurt 3, flat 2 | n/a |
| v2-primary-plus-counterbalance | 66.2496 | -1.4898 | improved 1, hurt 2, flat 3 | ec-07 drives 73% of gain |

Winner: `v2-primary-plus-counterbalance` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

