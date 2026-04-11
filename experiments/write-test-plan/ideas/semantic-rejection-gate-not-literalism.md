---
id: semantic-rejection-gate-not-literalism
title: Rejection gate should require semantic disqualifier, not exact wording match
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: framing
risk: If too permissive, this can cause over-escalation by accepting weak semantic evidence.
prereqs: Keep one explicit anti-overreach line requiring behavior-tied evidence.
related: [reject-higher-must-justify, behavior-quote-grounding-gate, lower-level-miss-proof-gate]
family: label-communication
mechanism_signature: semantic-disqualifier-not-literal
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
Known regressions show strict textual evidence gates can be too literal; reframing rejection to semantic disqualification should preserve rigor while reducing false demotions.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- In `REJECTION-GATE`, replace wording that implies exact quote-only disqualification with:
  - semantic disqualifier tied to the behavior's failure mode is allowed
  - exact wording match is optional
  - generic boilerplate still disallowed
- Keep as a one-paragraph add/replace, not a new section.

## Expected Signal
- Primary targets: `System-Agentic`, `Agentic-Workflow`.
- Success pattern: fewer demotions caused by wording strictness when semantics clearly require higher level.
- Failure pattern: weak semantic hand-waving increases false positives at higher levels.

## Explore Plan
- v1: semantic disqualifier + explicit anti-boilerplate line.
- v2: same as v1 but only active for above-Integration decisions.

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
