---
id: adjacent-boundary-intent-matrix
title: Add a compact adjacent-boundary intent matrix to reduce label miscommunication
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Matrix may become another verbose scaffold if not constrained to adjacent decisions only.
prereqs: Keep matrix to 4 rows (one per adjacent pair) and one decisive discriminator per row.
related: [boundary-specific-micro-variants, canonical-boundary-calibration-pack, top2-runner-up-contrast-gate]
family: label-communication
mechanism_signature: adjacent-intent-matrix
max_followups: null
control_required: null
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 67.00
explore_delta: -0.74
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Most failures are adjacent-boundary confusions; a concise intent matrix that defines one decisive discriminator per adjacent pair should improve communication of what each label means.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add `ADJACENT INTENT MATRIX` with 4 rows:
  - Unit vs Integration
  - Integration vs System
  - System vs Agentic
  - Agentic vs Workflow
- Each row includes:
  - one decisive question
  - one anti-pattern line (common mistaken escalation/demotion)
- Invoke matrix only when top-2 candidate levels are adjacent.

## Expected Signal
- Primary targets: all adjacent confusion pairs, with strongest effect on top weighted pairs from MINE.
- Success pattern: lower adjacent confusion mass and improved cross-run consistency.
- Failure pattern: if always invoked, added process tax causes broad regression.

## Explore Plan
- v1: matrix for all decisions.
- v2: matrix only when adjacent tie/near-tie is detected.

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
| v1-primary-intent-matrix | 66.9955 | -0.7440 | improved 3, hurt 2, flat 1 | distributed |
| v2-primary-plus-counterbalance | 75.5754 | +7.8359 | improved 1, hurt 3, flat 2 | n/a |

Winner: `v1-primary-intent-matrix` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

