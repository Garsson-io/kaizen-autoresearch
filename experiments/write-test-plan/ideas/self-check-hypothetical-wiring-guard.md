---
id: self-check-hypothetical-wiring-guard
title: Add SELF-CHECK guard against hypothetical wiring justifications
status: rejected
effort: low
expected_impact: medium
targets:
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
change_type: framing
risk: Extra Unit-leaning wording in SELF-CHECK can over-correct and suppress true Integration picks.
prereqs: null
related: [mock-miss-scope-clarification]
---

## Outcome

Tested on full corpus in run `20260329-004233` by appending a SELF-CHECK clause:
"If the only reason for Integration is a hypothetical wiring bug not explicitly part of this behavior, treat that as Unit...".

Result: rejected. Loss regressed from `390.2296` to `453.5253` (+63.2956).
