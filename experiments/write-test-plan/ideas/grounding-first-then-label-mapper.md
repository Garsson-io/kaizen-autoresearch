---
id: grounding-first-then-label-mapper
title: Grounding-First Then Label Mapper (two-phase but bounded)
status: proposed
effort: high
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - agentic_underprediction
confusion_pairs:
  - Integration-Agentic
  - Unit-Integration
  - Integration-System
change_type: structural
risk: Could regress like prior extraction/mapper attempts if grounding artifacts are weakly constrained.
prereqs: Keep phase outputs short and deterministic in format; no free-form narrative in phase 1.
related: [feature-extractor-plus-deterministic-mapper, behavior-quote-grounding-gate, lower-level-miss-proof-gate]
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
A bounded grounding phase (quoted evidence + miss-proof artifacts) followed by a deterministic label mapping phase can reduce reasoning drift without heavy free-form overhead.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add two bounded outputs per behavior:
  1. Grounding artifact: quote, boundary keyword, lower-level miss.
  2. Mapping rule: choose minimum level from artifact using fixed adjacency mapping.
- Hard cap each phase to short bullet output.

## Expected Signal
- Primary targets: `Integration-Agentic`, `Unit-Integration`, `Integration-System`.
- Success pattern: lower variance and better cross-seed stability.
- Failure pattern: repeats previous no-signal pattern from extractor/mapper family.

## Explore Plan
- v1: minimal two-phase schema.
- v2: two-phase + strict token cap lines.
- v3: two-phase only for non-Unit candidates.

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
