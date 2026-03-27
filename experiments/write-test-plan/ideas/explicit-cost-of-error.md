---
id: explicit-cost-of-error
title: Asymmetric error costs — make under-prediction expensive
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: framing
risk: Blanket "when uncertain, go higher" may cause over-prediction on easy tasks
prereqs: null
related: [top-down-elimination, few-shot-worked-examples]
---

## Steelman

The current prompt says "choose the LOWEST level that can catch a real failure." This frames the task as minimization, which rewards under-prediction. The model gets no penalty for choosing Unit when Agentic is correct — it just picked a "lower" level, which feels right given the "LOWEST" instruction.

Adding explicit cost asymmetry changes the calculus:

```
COST OF ERROR:
- Classifying Agentic as Unit: CATASTROPHIC — mock tests pass, production fails
- Classifying Unit as Integration: MINOR — slightly over-tested but safe

When genuinely uncertain between two levels, prefer the higher one.
```

This is a 3-line addition to the prompt (low effort). It doesn't change the classification framework, just the decision threshold. The model already has the reasoning capacity to consider Agentic — it just doesn't because the "LOWEST" framing anchors toward caution in the wrong direction.

The sufficiency scoring dimension (55% weight) already rewards this asymmetry: predicted >= GT gets 100%, predicted one below gets 40%. The prompt should match the scorer's values.

## Scathing Critique

"When uncertain, go higher" is exactly the heuristic that produced the treatment-l12's over-prediction problem. The L12 ladder aggressively promoted System and scored *worse* (71.2%) because it over-predicted easy tasks. Adding "prefer higher when uncertain" to the current prompt risks the same outcome.

The issue is that the model is NOT uncertain about EC-04 behaviors 3-4. It confidently classifies them as System because it genuinely believes "calls external API" = System. A cost-of-error framing only helps when the model has genuine uncertainty. When it's confidently wrong, telling it to "prefer higher" doesn't help because it doesn't think it's in the uncertain case.

Also, "prefer higher when uncertain" conflicts with "choose the LOWEST level." The model must now juggle two contradictory instructions: minimize the level, but also prefer higher when unsure. This creates a meta-decision (am I sure?) that the model will resolve inconsistently across behaviors.

The real fix is not to change the decision threshold but to improve the classification signal. Teach the model that "AI API" = non-deterministic, and the uncertainty vanishes.
