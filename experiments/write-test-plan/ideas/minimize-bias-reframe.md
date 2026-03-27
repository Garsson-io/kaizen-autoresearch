---
id: minimize-bias-reframe
title: Reframe "choose the LOWEST" to "choose the level that matches the failure boundary"
status: kept
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: framing
risk: May cause over-prediction if the model stops anchoring to minimum
prereqs: null
related: [counterfactual-mock, top-down-elimination]
---

## Steelman

The justification taxonomy (U1) reveals that the model KNOWS the correct answer then talks itself down. EC-04 b3: "Agentic-level tests with real API calls would be required, but the minimum to catch 'caching is broken' is Unit." This is the "choose the LOWEST" instruction causing a systematic minimize bias.

The fix is surgical: change "choose the LOWEST level that can catch a real failure" to "choose the level that matches the REAL failure boundary — not the lowest level where you could write SOME test." This directly attacks the rationalization pattern without adding length.

Evidence: 42 under-predictions vs 38 over-predictions confirms the model under-predicts more than it over-predicts. Removing the minimize anchor should shift the distribution toward correct.

## Scathing Critique

"Choose the LOWEST" is actually correct test engineering advice — you don't want unnecessary infrastructure. Removing this anchor may cause the model to over-predict aggressively, turning 42 under-predictions into 60 over-predictions. Over-prediction hurts precision (20% of score).

Also, the model's parenthetical acknowledgments might be post-hoc rationalizations in the justification text, not actual reasoning that influenced the classification. The model may have decided Unit first and then generated the justification, including the parenthetical as a hedge. Changing the framing instruction wouldn't affect a decision that was already made before reasoning.
