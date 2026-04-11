---
id: soft-strictness-valve-for-label-meaning
title: Add a soft strictness valve when label meaning is clear but wording is sparse
status: proposed
effort: high
expected_impact: medium
targets:
  - agentic_underprediction
  - workflow_gap
  - consistency_failures
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: framing
risk: Valve can be abused as a generic escalation shortcut if not constrained by explicit anti-handwaving text.
prereqs: Valve must be allowed only for adjacent pair choices and requires one concrete behavior-tied failure mechanism.
related: [semantic-rejection-gate-not-literalism, reject-higher-must-justify, lower-level-miss-proof-gate]
family: label-communication
mechanism_signature: soft-strictness-valve-adjacent-only
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
retry_trigger: Only if strict textual gates continue to cause demotion errors in MINE DIGEST.
owner: null
---
## Hypothesis
Current decisioning can be too strict when label intent is semantically clear but exact wording is sparse; a narrowly scoped strictness valve can reduce false demotions without broad over-escalation.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add `STRICTNESS VALVE` rule:
  - applies only when deciding between adjacent levels
  - allows semantic evidence (not exact phrase match) to justify higher level
  - requires one concrete failure mechanism tied to behavior text
  - forbids generic statements ("could fail in production", "complex system")

## Expected Signal
- Primary targets: `System-Agentic`, `Agentic-Workflow`.
- Success pattern: fewer strictness-driven demotions while keeping over-escalation bounded.
- Failure pattern: widespread escalation if valve is interpreted as a generic escape hatch.

## Explore Plan
- v1: valve active for all adjacent pairs.
- v2: valve active only for above-System adjacent pairs.

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
