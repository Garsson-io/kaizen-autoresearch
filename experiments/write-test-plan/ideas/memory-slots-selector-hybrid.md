---
id: memory-slots-selector-hybrid
title: Memory Slots Selector Hybrid (above-Unit gating + terse slots)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - Integration-System
change_type: structural
risk: Hybrid may still add moderate overhead and regress easy-mid tasks if trigger is too loose.
prereqs: Keep slot format terse and activate only above Unit, with explicit boundary-signal requirement.
related: [agent-needs-working-memory-slots]
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
retry_trigger: "family-signal from Iteration 20 winner flip (v3 pass1, v2 holdout)"
owner: null
---
## Hypothesis
The memory-slot mechanism is real but variant-sensitive. Combining `v2` scope control (above-Unit only) with `v3` terse slot formatting should preserve gains while reducing flip instability.

## Evidence (from Iteration 20)
- Pass 1 (seed720): winner `v3-memory-slots-terse-cap`, delta `-9.85` (v2 was `-1.28`).
- Holdout (seed820): winner `v2-memory-slots-above-unit`, delta `-3.79` (v3 still negative `-2.30`).
- Interpretation: both mechanisms contain useful signal; single winner is unstable.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Hybrid rule:
  - Apply memory slots only when provisional choice is above Unit.
  - Keep slots exactly one short line each.
  - Require final label to cite Slot B (boundary signal) and Slot C (adjacent miss-proof).

## Falsification Criterion
- `no-promote` if either pass becomes weak/noisy (> -2.0) or if gains remain concentrated >60% on one task.

## Explore Plan
- v1: above-Unit + terse slots (direct hybrid).
- v2: hybrid + trigger only on adjacent tie/near-tie.
- v3: hybrid + top-loss-pair-only activation.

## Reusable Lesson
Created from family-signal; do not promote `agent-needs-working-memory-slots` variants directly.
