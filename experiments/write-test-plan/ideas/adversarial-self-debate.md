---
id: adversarial-self-debate
title: Self-debate — argue for two candidate levels, pick the survivor
status: proposed
effort: medium
expected_impact: medium
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: meta-cognitive
risk: Doubles reasoning length per behavior, may introduce inconsistency when debate is inconclusive
prereqs: null
related: [counterfactual-mock, top-down-elimination]
---

## Steelman

The current prompt asks the model to pick ONE level and then self-check. But self-checking your own answer is weak — confirmation bias means the model will rationalize whatever it already chose. A debate format forces genuine deliberation:

```
For each behavior, identify TWO candidate levels. For each candidate:
1. Argue why this level IS sufficient (what test would catch the failure?)
2. Argue why this level is NOT sufficient (what failure would slip through?)
Pick the lower level that survives the "what would slip through?" challenge.
```

This works because:
1. It prevents premature commitment — the model must consider alternatives before deciding
2. The "what would slip through?" argument is where Agentic emerges naturally: "a System-level test calls the API but mocks the response — the mock always returns 'legal', so the non-deterministic classification behavior slips through"
3. It's how human QA engineers actually reason about test levels — they consider tradeoffs, not just classify
4. The format produces self-documenting justifications that could be scored for quality

## Scathing Critique

This is the heaviest meta-cognitive approach and it has the worst effort-to-impact ratio. For each of the 5 behaviors per task, the model now produces 4 arguments instead of 1 classification. That's 20 arguments per task, most of which are wasted on Unit behaviors where the debate is trivially resolved.

For EC-09 (plugin loader), the debate for every behavior would be: "Could be Unit. Could be Integration. Unit: we can test manifest validation with a pure function call. Integration: we need the real module loader. Winner: Unit." That's correct but wasteful.

Worse, the debate format can produce false ties. When the model generates equally compelling arguments for System AND Agentic, it has to break the tie somehow. The "pick the lower level" instruction biases toward System — the exact failure mode we're trying to fix.

The self-check in the current prompt (plan_consistent) already scores 100%. The model doesn't lack the ability to reason about its own answers. It lacks the knowledge that AI APIs are non-deterministic. A debate doesn't inject new knowledge — it just processes the same incomplete understanding more elaborately.
