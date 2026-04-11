---
id: no-contradiction-pair-gate
title: No-Contradiction Pair Gate (cross-behavior dependency consistency)
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-Agentic
  - Integration-System
change_type: framing
risk: Gate can over-constrain legitimate local Unit behaviors unless exceptions are explicit.
prereqs: Rule must allow explicit local-only exemptions with quoted evidence.
related: [shared-dependency-ledger, reject-higher-must-justify, behavior-quote-grounding-gate]
family: cross-behavior-consistency
mechanism_signature: contradiction-blocker-with-local-exemption
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
Within one issue, labels often contradict each other about the same dependency boundary. A no-contradiction gate should prevent inconsistent demotions.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add cross-behavior constraint:
  - If any behavior for a component is labeled above Unit due to model/content dependency or real infra boundary, a sibling behavior cannot be Unit by default.
  - Unit is allowed only with explicit quoted `local-only` proof that excludes the higher-level dependency.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-Agentic`.
- Success pattern: less intra-issue inconsistency and fewer unsupported Unit calls.
- Failure pattern: false upward drift when local-only exceptions are not used correctly.

## Explore Plan
- v1: strict contradiction gate + explicit local-only exemption.
- v2: gate applies only when behaviors share component/dependency terms.
- v3: gate applies only to Unit-vs-above-Unit conflicts (not Integration vs System).

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

