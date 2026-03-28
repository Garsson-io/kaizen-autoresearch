---
id: concrete-agentic-example
title: Add concrete Agentic example inline with level definition
status: kept
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: representational
risk: Model may over-anchor on the specific example and miss other Agentic patterns
prereqs: null
related: [few-shot-worked-examples, explicit-cost-of-error]
---

## Steelman

The simplest possible fix for the #1 failure mode. The current Agentic definition is:

```
Agentic — result depends on real LLM non-determinism or a real model call
```

The model doesn't connect "external AI classification API" to "LLM non-determinism." Fix: add a concrete example directly in the definition:

```
Agentic — result depends on a real AI/LLM model call (e.g., classification via
          AI API — a mock returns a fixed label but the real model may vary)
```

This is 15 extra words. It directly addresses the root cause identified in kaizen#1016: "the model doesn't connect 'external AI classification API' to 'LLM non-determinism.'" The fix is to make the connection explicit.

This is the fix candidate #1 in the leaderboard's failure analysis section. It was identified as the highest-priority fix before the autoresearch run. The autoresearch run tried 5 iterations and 0 kept — but the report noted the prompt is at a "local optimum for haiku." A targeted definitional fix (not a structural change) is more likely to break out of the local optimum than the structural changes the loop tried.

## Scathing Critique

This was already partially tried. The current treatment prompt already says "result depends on real LLM non-determinism or a real model call" — which IS a concrete description. Adding "e.g., classification via AI API" is barely different from the existing wording. The model that reads "real LLM non-determinism" and still predicts System for EC-04 is unlikely to change its mind because of "e.g., classification via AI API."

The autoresearch run 1 report tried variants in this direction (adding examples, clarifying Agentic) and none improved the score. The prompt is at a local optimum — small wording changes don't move the needle. You need a structural change (different reasoning framework) not a definitional change (better Agentic description).

Also, the "mock returns fixed label but real model varies" example is tightly coupled to EC-04. It will fix EC-04 behaviors 3-4 but may not generalize to EC-13 (content moderation), EC-21 (feedback processing), or EC-30 (recommendation engine) where the Agentic signal is different.
