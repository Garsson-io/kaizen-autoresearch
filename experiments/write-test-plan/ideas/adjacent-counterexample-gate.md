---
id: adjacent-counterexample-gate
title: Adjacent Counterexample Gate (disqualify lower level with one concrete case)
status: proposed
effort: low
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: framing
risk: Weakly specified counterexamples may become generic and add noise.
prereqs: Counterexample must be tied to exact behavior text, not hypothetical architecture prose.
related: [lower-level-miss-proof-gate, behavior-quote-grounding-gate, reject-higher-must-justify]
family: counterexample-first
mechanism_signature: adjacent-lower-disqualification-by-counterexample
max_followups: 1
control_required: false
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 66.05
explore_delta: -1.69
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Boundary mistakes happen when the model escalates without a falsifiable reason. Requiring one concrete counterexample that breaks the lower adjacent level should sharpen adjacent decisions.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a KEY-QUESTIONS line:
  "Before choosing a level above adjacent lower level, state one concrete counterexample where a test at the lower level would pass while behavior correctness still fails. If none, keep lower level."
- Keep as one additive sentence.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: fewer speculative escalations and fewer arbitrary demotions.
- Failure pattern: generic fabricated counterexamples with no real effect.

## Explore Plan
- v1: strict counterexample requirement for all above-Unit decisions.
- v2: apply only for System/Agentic/Workflow decisions.
- v3: apply only on adjacent-tie/near-tie (`top-2 gap <= 0.10`).

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
| v1-primary-all-above-unit | 66.0512 | -1.6882 | improved 1, hurt 1, flat 4 | ec-07 drives 100% of gain |
| v2-primary-high-level-only | 69.6883 | +1.9489 | improved 2, hurt 2, flat 2 | n/a |

Winner: `v1-primary-all-above-unit` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

