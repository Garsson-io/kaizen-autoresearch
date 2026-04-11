---
id: counterexample-strength-threshold
title: Counterexample Strength Threshold (must cite boundary token from behavior)
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: framing
risk: Hard token constraints can over-reject valid escalations on terse behavior text.
prereqs: Allow semantic-equivalent paraphrase fallback when exact token is absent.
related: [adjacent-counterexample-gate, no-generic-wiring-claims-rule, behavior-quote-grounding-gate]
family: counterexample-first
mechanism_signature: counterexample-validity-via-boundary-token
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
Counterexamples help only if they are anchored to behavior-specific boundary cues. A strength threshold should reduce low-signal fabricated justifications.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add constraint on counterexample validity:
  - counterexample must cite one concrete boundary cue present in behavior text (handoff, ordering/state contract, infra/runtime, model-judgment/content quality),
  - otherwise counterexample is invalid and escalation is denied.
- Add fallback: semantic-equivalent phrase allowed when exact token absent.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`.
- Success pattern: improved precision and less rationale drift.
- Failure pattern: over-constraining rule causes downward bias.

## Explore Plan
- v1: strict boundary-token requirement.
- v2: token OR semantic-equivalent phrase.
- v3: apply threshold only for non-Unit escalations above Integration.

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
