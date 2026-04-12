---
id: system-default-escalation-removal
title: Remove Broad "Start At System" Default In REAL-INFRA
status: kept
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - System-Integration
  - Integration-System
change_type: framing
risk: Could increase under-calls on true System rows if triad usage is weak.
prereqs: Keep SYSTEM TRIAD and ROUND-TRIP EFFECT RULE intact while ablating only the broad default sentence.
related: [system-default-infra-keywords, concrete-system-example, integration-middle-anchor]
direction_intent: raise-lower-recall
family: definition-alignment
mechanism_signature: remove-system-start-high-default
max_followups: 1
control_required: true
explore_status: signal
explore_tasks: [ec-02, ec-04, ec-05, ec-06, ec-03, ec-13]
explore_baseline_loss: 71.42
explore_loss: 48.73
explore_delta: -22.69
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: Run after baseline shift to over-escalation profile (68 over, 15 under in iter 70).
owner: null
---
## Hypothesis
`REAL-INFRA` currently contains a global default: "if failure mode involves real HTTP/subprocess/filesystem/network/OS, start at System and demote only if...". This is broader than canonical adjudication, which requires concrete System triggers (happy-path contract, error-path contract, or external round-trip side effect), not mere presence of infra words.

Removing that broad default should reduce false System escalations while preserving true System recall via `SYSTEM TRIAD` and `ROUND-TRIP EFFECT RULE`.

Evidence from baseline run `20260411-203850`: `System→Integration` over-predictions are a major error family (17 rows), while true `Integration→System` misses are smaller (6 rows).

## Exact Edit
Target: `experiments/write-test-plan/prompts/treatment.md`

Primary removal candidate:
- Delete this sentence in `REAL-INFRA`:
  - `Default: if the behavior's failure mode involves real HTTP responses, real subprocess behavior, real filesystem events, real network conditions, or real OS primitives, start at System and demote to Integration only if the test truly needs nothing beyond in-process module wiring.`

Keep unchanged:
- `ROUND-TRIP EFFECT RULE`
- `SYSTEM TRIAD` bullets 1-3
- Integration/System examples

## Expected Signal
- Primary target: reduce `System→Integration` false escalations.
- Success signature: precision gain on Integration rows mentioning infra terms but lacking triad evidence.
- Failure signature: new `Integration→System` under-calls on genuine external-contract behaviors.

## Explore Plan
- v1: pure deletion of the broad default sentence.
- v2: v1 + short reminder line: "System requires at least one SYSTEM TRIAD trigger from behavior text."

Use explore tasks weighted toward current confusion: include `ec-03`, `ec-24`, `ec-34`, `ec-20`, plus one known true-System-heavy task (`ec-06` or `ec-27`).

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5. Promote only if winner improves aggregate loss and does not increase critical misses on System GT rows.

## Epistemological Status
New ablation after GT+definition refresh on 2026-04-11. Prior wins that strengthened System defaults were achieved under a different under-calling regime; current baseline shows opposite directional pressure.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run |

## Reusable Lesson
When error direction flips after taxonomy/GT updates, re-test previously successful "raise-level" defaults with removal ablations before adding more guardrails.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-05, ec-06, ec-03, ec-13`  
Baseline subset loss: `71.42`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-remove-default | 59.8792 | -11.5380 | improved 4, hurt 0, flat 2 | distributed |
| v2-remove-plus-triad-gate | 48.7292 | -22.6881 | improved 5, hurt 0, flat 1 | distributed |

Winner: `v2-remove-plus-triad-gate` by aggregate loss, classification is `signal`.  

