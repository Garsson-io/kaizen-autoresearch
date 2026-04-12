---
id: integration-evidence-quote-gate-v2
title: Integration Evidence Quote Gate V2
status: proposed
effort: low
expected_impact: medium
targets:
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - Integration-Unit
  - Integration-System
change_type: meta-cognitive
risk: May increase Unit overuse on terse behavior wording.
prereqs: Keep MOCK-MISS and SYSTEM TRIAD unchanged.
related: [integration-boundary-evidence-gate, rg-integration-dual-quote-gate-v1]
direction_intent: raise-higher-recall
family: integration-calibration
mechanism_signature: integration-quote-gate-with-safeguard
max_followups: 1
control_required: true
explore_status: no-signal
explore_tasks: [ec-01, ec-02, ec-05, ec-06, ec-03, ec-11]
explore_baseline_loss: 63.63
explore_loss: null
explore_delta: null
explore_date: 2026-04-12
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Integration→Unit remains dominant. Requiring explicit handoff evidence for Integration justifications, plus a safeguard for explicitly ordered handoffs, should improve boundary discipline.

## Epistemological status

Explore subset (stratified): `ec-01, ec-02, ec-05, ec-06, ec-03, ec-11`  
Baseline subset loss: `63.63`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-quote-gate | 68.3468 | +4.7162 | improved 2, hurt 2, flat 2 | n/a |
| v2-quote-gate-plus-handoff-safeguard | 68.1823 | +4.5517 | improved 2, hurt 2, flat 2 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

