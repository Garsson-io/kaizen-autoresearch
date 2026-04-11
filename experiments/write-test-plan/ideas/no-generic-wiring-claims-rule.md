---
id: no-generic-wiring-claims-rule
title: Ban generic "could miss wiring" justification unless behavior states a boundary
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
change_type: framing
risk: Could suppress legitimate Integration calls on brief behavior statements.
prereqs: Pair with explicit exception for stated handoff/contract/order/durability behavior text.
related: [global-stated-failure-only-rule, mock-miss-scope-clarification, integration-contract-invariant-gate]
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
A major shortcut is generic "wiring" rhetoric detached from behavior text; banning that unless the text states a boundary should reduce false Integration/System calls.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a KEY-QUESTIONS constraint:
  "Do not justify escalation with generic 'could miss wiring' unless the behavior explicitly describes handoff/contract/order/state-boundary failure."
- Add one short exception example inline.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`.
- Success pattern: fewer speculative escalations; better Unit/Integration split quality.
- Failure pattern: over-demotion on terse but genuinely cross-module behaviors.

## Explore Plan
- v1: strict ban + explicit exception terms list.
- v2: softer wording ("prefer not to") to reduce over-demotion risk.
- v3: apply ban only when behavior text is algorithm/parsing focused.

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
