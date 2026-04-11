---
id: error-stratified-calibration-ladder
title: Error-Stratified Calibration Ladder (top-loss pairs get stricter proof)
status: proposed
effort: high
expected_impact: medium
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
  - noise_sensitivity
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: structural
risk: Dynamic strictness by pair may add cognitive overhead and trigger the known heavy-process penalty.
prereqs: Keep ladder deterministic and tiny (single lookup table + one added proof line only on flagged pairs).
related: [signal-scoring-rubric, boundary-specific-micro-variants, lower-level-miss-proof-gate]
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
Applying stricter evidence only where historical loss is highest should improve hard boundaries without paying a global process tax.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a high-effort `CALIBRATION LADDER`:
  - Maintain a small pair-priority order (UI > IS > IA > AW).
  - For top 2 pairs only, require both quote-evidence and lower-level miss-proof.
  - For lower-priority pairs, keep current lightweight decision flow.
- Add one rule: if pair is not in ladder, do not invoke extra checks.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: concentrated improvements on top-weighted confusion pairs with minimal collateral regressions.
- Failure pattern: complexity overhead outweighs benefits, causing flat or worse aggregate loss.

## Explore Plan
- v1: strict ladder on top 2 pairs.
- v2: ladder on top 3 pairs.
- v3: top 2 pairs + terse format cap to reduce overhead.

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
