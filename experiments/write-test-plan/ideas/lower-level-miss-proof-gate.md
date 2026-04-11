---
id: lower-level-miss-proof-gate
title: Require one concrete lower-level miss mode before escalating
status: proposed
effort: low
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Integration-System
  - Unit-Integration
  - Integration-Agentic
change_type: framing
risk: If applied too rigidly, may force fabricated miss-modes and increase noise.
prereqs: Keep wording concrete and single-line; avoid adding multi-step review flow.
related: [minimal-failing-invariant-first, integration-handoff-not-unit-guard, bidirectional-rejection-evidence-gate]
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
Many wrong labels come from escalation without proving why the lower level fails; forcing one concrete lower-level miss mode should reduce arbitrary boundary jumps.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add one KEY-QUESTIONS line:
  "To choose a level above Unit, name one concrete failure that Unit would miss for THIS behavior; to choose above Integration, name one failure Integration would miss."
- Keep additive and concise.

## Expected Signal
- Primary targets: `Integration-System`, `Unit-Integration`, `Integration-Agentic`.
- Success pattern: improved boundary precision on adjacent levels.
- Failure pattern: hallucinated miss-modes (verbosity without accuracy gain).

## Explore Plan
- v1: full two-step miss-proof (Unit then Integration).
- v2: only require proof for System/Agentic/Workflow.
- v3: require proof only when confidence between adjacent levels is close.

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
