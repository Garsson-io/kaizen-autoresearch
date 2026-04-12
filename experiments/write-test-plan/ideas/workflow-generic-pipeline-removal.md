---
id: workflow-generic-pipeline-removal
title: Remove Generic "Full Agent Pipeline" Workflow Alias
status: proposed
effort: low
expected_impact: medium
targets:
  - workflow_gap
  - unit_overprediction
confusion_pairs:
  - Integration-Workflow
  - Agentic-Workflow
change_type: representational
risk: Could reduce true Workflow recall if the replacement wording is too narrow.
prereqs: Canonical Workflow semantics in program.md remain the source of truth for this run.
related: [agentic-step-vs-agentic-workflow-reframe, workflow-retry-sequence-clarifier, canonical-boundary-calibration-pack]
direction_intent: raise-lower-recall
family: definition-alignment
mechanism_signature: remove-generic-workflow-alias
max_followups: 1
control_required: true
explore_status: concentrated-signal
explore_tasks: [ec-01, ec-02, ec-05, ec-06, ec-03, ec-11]
explore_baseline_loss: 63.63
explore_loss: 60.14
explore_delta: -3.49
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: GT/spec update on Agentic-Workflow boundary already landed on 2026-04-11; test once under new baseline.
owner: null
---
## Hypothesis
The current treatment still defines Workflow as "multiple agentic steps in sequence, or a full agent pipeline". The phrase "full agent pipeline" is broader than canonical semantics and can be read as generic software orchestration, which program.md explicitly forbids. Removing that alias should cut false Workflow escalations without changing core boundary logic.

Evidence from baseline run `20260411-203850`: over-predictions dominate (68 over vs 15 under), and Workflow-over errors are present on high-impact rows (for example `EC-13 b4` as `Workflow→System`, `EC-15 b5` as `Workflow→System`).

## Exact Edit
Target: `experiments/write-test-plan/prompts/treatment.md`

Primary removal candidate:
- In `LEVEL-DEFS`, change line:
  - from: `- **Workflow** — multiple agentic steps in sequence, or a full agent pipeline`
  - to: `- **Workflow** — multiple agentic steps in sequence`

Optional scope-tightening removal (variant only):
- In `INTEGRATION-BRAKE` item (d), remove generic wording that can map non-agentic orchestration into Workflow when model decisions are not truly chained.

## Expected Signal
- Primary target: reduce false escalation into Workflow from Integration/Agentic.
- Success signature: improved precision on Agentic↔Workflow and Integration↔Workflow rows with no increase in Workflow critical misses.
- Failure signature: true Workflow rows demote to Agentic.

## Explore Plan
- v1: remove only `", or a full agent pipeline"` in `LEVEL-DEFS`.
- v2: v1 plus prune `INTEGRATION-BRAKE` (d) to keep only explicit multi-model-decision sequencing language.

Use standard explore-lite 6-task selection with at least two Workflow-GT tasks (`ec-11`, `ec-32` preferred) and two known Workflow-over pressure tasks (`ec-13`, `ec-15` preferred).

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5. Promote only if winner meets current delta/hurt thresholds and does not worsen Workflow critical-miss rows.

## Epistemological Status
New hypothesis after 2026-04-11 GT/definition refresh and baseline iteration 70. Prior "Agentic Step vs Agentic Workflow" reframe was a broader replacement and regressed; this idea is a narrower removal-only variant.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run |

## Reusable Lesson
Prefer removing ambiguous aliases over adding new explanatory blocks when taxonomy shows over-escalation and low self-aware contradictions.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-05, ec-06, ec-03, ec-11`  
Baseline subset loss: `63.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-remove-alias | 60.1384 | -3.4922 | improved 2, hurt 2, flat 2 | ec-11 drives 65% of gain |
| v2-remove-alias-plus-brake-prune | 68.1227 | +4.4921 | improved 2, hurt 2, flat 2 | n/a |

Winner: `v1-remove-alias` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

