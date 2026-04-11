---
id: dynamic-precedent-grounding-pool
title: Dynamic Precedent Grounding Pool (retrieve 2 nearest boundary precedents)
status: proposed
effort: high
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
  - Agentic-Workflow
change_type: representational
risk: Nearest-precedent retrieval can over-anchor to superficially similar examples and suppress novel edge-case reasoning.
prereqs: Precedent set must be small, curated, and balanced with both positive and negative boundary examples.
related: [retrieval-backed-precedent-pack, canonical-boundary-calibration-pack, contrastive-boundary-casebook-pack]
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
A dynamic precedent step that forces comparison against two nearest known boundary cases can reduce free-form drift and improve adjacent-pair consistency.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a high-effort `PRECEDENT CHECK` section:
  - select 2 nearest boundary precedents (one same-label, one adjacent-label),
  - state one matching and one mismatching behavior detail for each,
  - only escalate if current behavior exceeds the adjacent lower precedent in a concrete way.
- Keep the step bounded to 4 short lines per behavior.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`, `Agentic-Workflow`.
- Success pattern: fewer arbitrary jumps and better cross-seed stability on adjacent pairs.
- Failure pattern: precedent overfitting where unmatched tasks regress.

## Explore Plan
- v1: full precedent check for all non-Unit decisions.
- v2: precedent check only on historically high-loss pairs (UI/IS/IA).
- v3: precedent check + anti-overfitting line ("precedent is advisory, behavior text wins").

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
