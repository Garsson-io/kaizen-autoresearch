---
id: intent-first-then-level-bounded-two-pass
title: High-effort bounded two-pass: infer test intent first, then map to level
status: proposed
effort: high
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Two-pass structure can trigger the known heavy-process penalty if outputs are not tightly bounded.
prereqs: Strict output caps, no narrative prose, and pass-2 mapping table limited to adjacent-pair checks.
related: [two-step-review-loop, grounding-first-then-label-mapper, feature-extractor-plus-deterministic-mapper]
family: label-communication
mechanism_signature: intent-then-level-bounded-pass
max_followups: 1
control_required: true
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
retry_trigger: Only after low/medium label-communication variants show partial signal.
owner: null
---
## Hypothesis
If the model first identifies what type of test intent the behavior requires (local logic, cross-module wiring, real infra artifact, model judgment, or multi-step agentic chain) and only then maps intent to label, we can reduce label-meaning confusion.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add bounded Pass 1 (`INTENT TAG`) with exactly one tag from a fixed 5-tag set.
- Add bounded Pass 2 (`LABEL MAP`) with deterministic mapping from tag to final label.
- Add one guard: if evidence does not support chosen tag, fall back to adjacent lower tag.
- Keep each pass to one line per behavior.

## Expected Signal
- Primary targets: all adjacent boundaries with emphasis on stability improvements.
- Success pattern: lower run-to-run variance and fewer winner flips in explores.
- Failure pattern: process overhead dominates and reproduces prior two-pass regressions.

## Explore Plan
- v1: full two-pass bounded version.
- v2: two-pass only for above-Integration candidates (control arm = unchanged treatment for Unit/Integration path).

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
