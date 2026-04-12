---
id: integration-boundary-evidence-gate
title: Integration Requires Behavior-Stated Boundary Evidence
status: proposed
effort: low
expected_impact: high
targets:
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: framing
risk: Could demote true Integration rows when behavior text is terse.
prereqs: Keep explicit exception examples for real cross-module handoff semantics.
related: [mock-miss-scope-clarification, no-generic-wiring-claims-rule, system-default-escalation-removal]
direction_intent: raise-lower-recall
family: integration-calibration
mechanism_signature: integration-needs-stated-boundary
max_followups: 1
control_required: true
explore_status: concentrated-signal
explore_tasks: [ec-01, ec-02, ec-04, ec-05, ec-03, ec-13]
explore_baseline_loss: 61.13
explore_loss: 59.26
explore_delta: -1.86
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Introduced after turn-1 keep shifted top loss to Integration→Unit.
owner: null
---
## Hypothesis
After `system-default-escalation-removal` (iter 71 keep), total loss improved but `Integration→Unit` increased (40 -> 47). The model is still escalating to Integration on speculative wiring language. Adding a strict evidence rule under MOCK-MISS should reduce false Integration calls by requiring boundary evidence in the behavior text.

## Exact Edit
Target: `experiments/write-test-plan/prompts/treatment.md`

Add under `MOCK-MISS`:
- Integration requires behavior-stated cross-module boundary evidence (handoff/contract/order/state transition), not generic "could miss wiring" claims.

Counterbalance variant:
- Preserve Integration when behavior explicitly states cross-component handoff semantics even if no external infra is involved.

## Expected Signal
- Primary gain: lower `Integration→Unit` loss.
- Side-effect risk: increased `Unit→Integration` and `Integration→System` under-calls on terse rows.

## Explore Plan
- v1: strict boundary-evidence requirement.
- v2: v1 + explicit exception line for concrete handoff semantics.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological Status
New idea from turn-1 post-run synthesis; designed as direct counterbalance to the side effect cluster introduced by REAL-INFRA demotion.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run |

## Reusable Lesson
Counterbalance ideas should be generated from observed side effects immediately after a strong keep, not pre-queued.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-04, ec-05, ec-03, ec-13`  
Baseline subset loss: `61.13`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-strict-boundary-evidence | 69.0686 | +7.9414 | improved 1, hurt 3, flat 2 | n/a |
| v2-strict-plus-handoff-counter | 59.2634 | -1.8639 | improved 1, hurt 1, flat 4 | distributed |

Winner: `v2-strict-plus-handoff-counter` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

