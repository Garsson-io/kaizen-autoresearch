---
id: three-gate-chain-minimal
title: Three-Gate Chain Minimal (quote -> miss -> boundary keyword)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: framing
risk: Chain may still be too rigid for terse tasks with implicit context.
prereqs: Keep it additive and short; do not alter global decision ordering.
related: [behavior-quote-grounding-gate, lower-level-miss-proof-gate, no-generic-wiring-claims-rule]
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
A chain of multiple simple checks can outperform one complex instruction by reducing shortcut failure while keeping cognitive load bounded.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a compact `THREE-GATE` rule sequence in KEY-QUESTIONS:
  1. quote behavior evidence,
  2. state adjacent lower-level miss,
  3. cite explicit boundary keyword from a small allowed set.
- Escalation allowed only when all three gates pass.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: better precision on adjacent levels, fewer speculative escalations.
- Failure pattern: over-demotion when keyword lexicon misses valid boundary wording.

## Explore Plan
- v1: strict all-3 gates.
- v2: gate 3 allows semantic paraphrase of keyword.
- v3: all-3 gates only for System/Agentic/Workflow.

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
