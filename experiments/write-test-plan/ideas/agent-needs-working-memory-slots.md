---
id: agent-needs-working-memory-slots
title: Agent Needs Working Memory Slots (behavior, boundary, miss)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: structural
risk: Added structure can become box-checking if slots are vague or repetitive.
prereqs: Slots must be terse and required only once per behavior block.
related: [behavior-quote-grounding-gate, lower-level-miss-proof-gate, minimal-failing-invariant-first]
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
The agent often fails because it does not hold the critical evidence in working memory at decision time. A fixed 3-slot memory scaffold should improve boundary precision.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add an `AGENT MEMORY SLOTS` mini-block before final label:
  - Slot A: exact behavior phrase.
  - Slot B: boundary signal detected (handoff, infra, model-quality, multi-agent workflow).
  - Slot C: one concrete miss if lowered one adjacent level.
- Require final label to reference Slot B and Slot C explicitly.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: fewer generic rationales and lower adjacent-pair loss.
- Failure pattern: verbosity without accuracy gain.

## Explore Plan
- v1: full 3-slot scaffold for all behaviors.
- v2: scaffold only when candidate label is above Unit.
- v3: scaffold + strict one-line-per-slot cap.

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
