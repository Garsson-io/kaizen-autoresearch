---
id: shared-dependency-ledger
title: Shared Dependency Ledger (issue-level model/infra/handoff anchors)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: structural
risk: A ledger step may add overhead and become a perfunctory checklist if not kept tiny.
prereqs: Ledger must be bounded to 3 short lines and reused by all behavior decisions in the issue.
related: [module-coordination-probe, behavior-quote-grounding-gate, lower-level-miss-proof-gate]
family: cross-behavior-consistency
mechanism_signature: issue-level-shared-dependency-anchors
max_followups: 1
control_required: false
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
Many mislabels come from behavior-local shortcutting that ignores issue-level dependency context. A tiny shared ledger (model, infra, handoff) should reduce contradictory per-behavior decisions.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add an issue-level pre-step before per-behavior labeling:
  - `MODEL DEPENDENCIES` (if any behavior depends on model judgment/content quality),
  - `INFRA DEPENDENCIES` (real network/process/OS/storage boundary),
  - `HANDOFF DEPENDENCIES` (cross-module contract/order/state transfer).
- Require each behavior rationale to cite one ledger line or explicitly mark `local-only`.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: fewer contradictory labels within same issue; reduced boundary drift.
- Failure pattern: added overhead with no lift.

## Explore Plan
- v1: strict 3-line ledger + mandatory per-behavior citation.
- v2: same ledger, citations only for above-Unit decisions.
- v3: ledger optional unless issue has 2+ non-Unit provisional labels.

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

