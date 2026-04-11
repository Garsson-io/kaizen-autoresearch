---
id: label-meaning-plain-english-capsules
title: Add plain-English label capsules with one positive and one negative anchor each
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Example capsules can over-anchor if they are too specific to current corpus phrasing.
prereqs: Keep capsules short (one sentence each) and balanced with a positive and negative anchor.
related: [canonical-boundary-calibration-pack, concrete-agentic-example, behavior-quote-grounding-gate]
family: label-communication
mechanism_signature: plain-english-capsules-balanced
max_followups: null
control_required: null
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
The model is partially missing the intended semantics of labels; concise plain-English capsules that state what each label means and what it does not mean should reduce boundary drift without adding process overhead.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add one compact "LABEL CAPSULES" block under `LEVEL-DEFS`.
- For each level, add exactly two lines:
  - positive anchor (when this level is correct)
  - negative anchor (common lookalike that should stay at adjacent level)
- Keep total new lines <= 12.

## Expected Signal
- Primary targets: all adjacent boundaries, especially `Integration-System` and `System-Agentic`.
- Success pattern: fewer cross-run label flips and fewer over-escalations from lexical cues alone.
- Failure pattern: anchoring to examples instead of reasoning about behavior-specific failure boundary.

## Explore Plan
- v1: strict two-line capsules (positive + negative) for all 5 levels.
- v2: capsules only for the two highest-confusion adjacent pairs from MINE.

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
