---
id: agent-needs-working-memory-slots
title: Agent Needs Working Memory Slots (behavior, boundary, miss)
status: kept
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
explore_status: concentrated-signal
explore_tasks: [ec-03, ec-23, ec-27, ec-08, ec-12, ec-34, ec-14, ec-19]
explore_baseline_loss: 105.23
explore_loss: 101.44
explore_delta: -3.79
explore_date: 2026-04-11
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
Current status: explored (`family-signal` via winner flip), not promoted.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 20 | explore/agent-needs-working-memory-slots-* | family-signal | pass1 -9.85 / holdout -3.79 | winner flip (`v3` -> `v2`), both meaningful negative |

## Reusable Lesson
Memory-slot mechanism is promising but winner is unstable; prefer merged selector follow-up (`memory-slots-selector-hybrid`) over direct promotion.

## Epistemological status

Explore subset (stratified): `ec-03, ec-23, ec-27, ec-08, ec-12, ec-34, ec-14, ec-19`  
Baseline subset loss: `105.23`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-memory-slots-all | 110.7509 | +5.5215 | improved 3, hurt 2, flat 3 | n/a |
| v2-memory-slots-above-unit | 101.4356 | -3.7938 | improved 4, hurt 1, flat 3 | distributed |
| v3-memory-slots-terse-cap | 102.9297 | -2.2997 | improved 3, hurt 2, flat 3 | distributed |

Winner: `v2-memory-slots-above-unit` by holdout aggregate loss, but pass1 winner was `v3-memory-slots-terse-cap`; treat as `family-signal` and do not promote a single variant yet.
