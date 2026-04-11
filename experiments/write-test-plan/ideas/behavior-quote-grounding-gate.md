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
