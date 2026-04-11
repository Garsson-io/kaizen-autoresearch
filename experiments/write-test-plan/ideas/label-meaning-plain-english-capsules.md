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
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 66.87
explore_delta: -0.87
explore_date: 2026-04-11
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

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-primary-full-capsules | 68.0999 | +0.3604 | improved 2, hurt 2, flat 2 | n/a |
| v2-primary-top-pair-capsules | 66.8707 | -0.8687 | improved 1, hurt 2, flat 3 | ec-07 drives 79% of gain |

Winner: `v2-primary-top-pair-capsules` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

