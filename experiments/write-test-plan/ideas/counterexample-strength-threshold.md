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
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 64.87
explore_delta: -2.86
explore_date: 2026-04-11
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

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 69.6040 | +1.8646 | improved 1, hurt 3, flat 2 | n/a |
| v2plus-stronger-counter | 64.8747 | -2.8648 | improved 2, hurt 1, flat 3 | ec-07 drives 69% of gain |

Winner: `v2plus-stronger-counter` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
