---
id: system-triad-contract-specificity-gate
title: System Triad Requires Explicit External Contract Evidence
status: kept
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - System-Integration
  - Integration-System
change_type: framing
risk: May under-call true System rows if external contract cues are implicit.
prereqs: Keep round-trip side-effect trigger intact as hard System evidence.
related: [system-default-escalation-removal, real-infra-probe, system-default-infra-keywords]
direction_intent: raise-lower-recall
family: system-calibration
mechanism_signature: triad-needs-explicit-contract-cue
max_followups: 1
control_required: true
explore_status: signal
explore_tasks: [ec-01, ec-02, ec-04, ec-05, ec-03, ec-13]
explore_baseline_loss: 61.13
explore_loss: 57.28
explore_delta: -3.85
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Created from turn-2 learning delta (EC-03 persistent System over-calls).
owner: null
---
## Hypothesis
After turn-1 keep and turn-2 no-promote, the dominant residual over-call is `System→Integration`, especially where justifications treat generic real git/CLI behavior as sufficient System evidence. A contract-specificity gate under SYSTEM TRIAD should reduce these false System escalations.

## Exact Edit
Target: `experiments/write-test-plan/prompts/treatment.md`

Add under `SYSTEM TRIAD`:
- "Do not count generic real-tool usage alone as triad evidence; require explicit external response/contract checks (status/body/header/exit-code/error-shape) or explicit round-trip side-effect visibility from behavior text."

Counterbalance variant:
- Keep a short reminder that real external side-effect readback still forces System.

## Expected Signal
- Primary gain: lower `System→Integration` over-calls.
- Side-effect risk: increased `Integration→System` under-calls on real infra rows.

## Explore Plan
- v1: contract-specificity gate only.
- v2: v1 + round-trip preservation reminder.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological Status
New from turn-2 post-explore synthesis; targeted correction to REAL-INFRA/SYSTEM-TRIAD interpretation.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run |

## Reusable Lesson
When a gate improves total loss but one confusion pair remains stubborn, add pair-specific evidence constraints instead of broad global rules.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-04, ec-05, ec-03, ec-13`  
Baseline subset loss: `61.13`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-contract-specificity | 57.2785 | -3.8487 | improved 4, hurt 2, flat 0 | distributed |
| v2-plus-roundtrip-counter | 57.7180 | -3.4092 | improved 2, hurt 1, flat 3 | distributed |

Winner: `v1-contract-specificity` by aggregate loss, classification is `signal`.  

