---
id: component-coherence-check
title: Component Coherence Check (final cross-behavior contradiction sweep)
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - unit_overprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-Agentic
  - Integration-System
change_type: meta-cognitive
risk: End-of-pass coherence checks can act like a second-pass tax and regress easy cases.
prereqs: Keep to one short contradiction question with at most one label revision.
related: [shared-dependency-ledger, uncertainty-triggered-single-retry, two-step-review-loop]
family: cross-behavior-consistency
mechanism_signature: final-contradiction-sweep-single-revision
max_followups: 1
control_required: true
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 67.65
explore_delta: -0.09
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
A final coherence sweep across behaviors in the same issue can catch contradiction-driven mistakes without full two-pass reasoning.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add final issue-level check:
  - "Do any chosen levels imply contradictory dependency assumptions for the same component?"
  - If yes, revise only the lowest-confidence conflicting label once and cite the dependency basis.

## Expected Signal
- Primary targets: cross-seed stability and adjacent-boundary consistency.
- Success pattern: fewer unstable flips on related behaviors in the same issue.
- Failure pattern: review overhead causes net regression.

## Explore Plan
- v1: always-run final coherence check (single revision max).
- v2: run check only when 2+ behaviors in issue are above Unit.
- v3: run check only when top-2 label confidence gap is small (`<= 0.10`) for any behavior.

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
| v2-primary | 67.6487 | -0.0908 | improved 3, hurt 3, flat 0 | ec-07 drives 64% of gain |
| v2plus-stronger-counter | 67.3263 | -0.4131 | improved 1, hurt 3, flat 2 | ec-07 drives 85% of gain |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
