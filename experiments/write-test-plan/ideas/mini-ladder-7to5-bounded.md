---
id: mini-ladder-7to5-bounded
title: Replace 12-step ladder with bounded 7-step internal ladder mapped to 5 labels
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: representational
risk: Still risks structural overfit if the mapping table is too rigid.
prereqs: Keep only 7 rungs with one-to-one mapping notes and explicit overflow/ambiguity rule.
related: [signal-scoring-rubric, abstraction-ladder-prompting, feature-extractor-plus-deterministic-mapper]
family: label-communication
mechanism_signature: mini-ladder-7to5
max_followups: null
control_required: null
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
The old 12->5 ladder was too complex, not necessarily wrong in concept; a compact 7-rung ladder can clarify label intent while avoiding heavy-process penalties.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a compact internal ladder with 7 rungs:
  - local logic
  - cross-module local wiring
  - real infra/subprocess boundary
  - deterministic external service
  - single model-judgment dependency
  - bounded tool-use agentic session
  - multi-step agentic chain
- Add fixed mapping from these 7 rungs to the 5 output labels.
- Add one ambiguity rule: if two adjacent rungs apply, choose the lower rung unless behavior text gives explicit higher-level dependency.

## Expected Signal
- Primary targets: `Integration-System` and `System-Agentic`.
- Success pattern: better boundary calibration without broad regression tax.
- Failure pattern: repeats ladder over-anchoring behavior seen in `treatment-l12`.

## Explore Plan
- v1: full 7-rung mapping with ambiguity-to-lower rule.
- v2: same mapping but applied only when top-2 candidate levels are adjacent.

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
