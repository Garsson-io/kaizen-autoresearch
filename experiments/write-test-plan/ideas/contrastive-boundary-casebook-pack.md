---
id: contrastive-boundary-casebook-pack
title: Contrastive Boundary Casebook Pack (high-effort targeted few-shot)
status: proposed
effort: high
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
  - Agentic-Workflow
change_type: representational
risk: Example overfitting may improve matched cases but hurt generalization.
prereqs: Keep examples strictly contrastive and tied to current top weighted-loss pairs only.
related: [few-shot-worked-examples, system-agentic-negative-contrast, behavior-quote-grounding-gate]
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
A compact casebook with explicit positive/negative contrasts for top confusion boundaries will reduce ambiguity where textual rules alone keep failing.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add 4 contrastive examples (one per top confusion pair):
  - why lower label fails,
  - why chosen label is minimum sufficient,
  - one anti-pattern example that looks similar but belongs lower.
- Keep each case <= 6 lines to limit token bloat.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`, `Agentic-Workflow`.
- Success pattern: improved high-weight pair loss and fewer persistent 12/12 errors.
- Failure pattern: concentration on example-like tasks only.

## Explore Plan
- v1: 2-case pack (UI + IA).
- v2: 4-case full pack.
- v3: 4-case pack + anti-overfit warning line.

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
