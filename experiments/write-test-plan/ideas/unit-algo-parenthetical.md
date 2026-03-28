---
id: unit-algo-parenthetical
title: Add algorithm-passable parenthetical to Unit definition
status: rejected
effort: low
expected_impact: medium
targets:
  - O1_integration_to_unit_over_prediction
confusion_pairs:
  - Integration-Unit
change_type: representational
risk: Makes Unit permissive → U2 explosion (confirmed)
prereqs: null
related: [concrete-agentic-example]
---

## Steelman

O1 (Integration→Unit over-prediction) is the second largest failure pattern after Agentic under-prediction. The model predicts Integration for behaviors where the algorithm can be fully tested by passing data as arguments — no real I/O required. Adding an explicit example to Unit's definition would anchor the boundary: "if you can test it by passing data as arguments, it's Unit even if production reads from a DB."

This mirrors what worked for `concrete-agentic-example` (-79.84 loss): a parenthetical example in the level definition anchored the boundary precisely.

## Scathing Critique

The model has a minimize-bias pull toward lower levels. Making Unit more permissive (easier to qualify for) amplifies that pull. Any behavior containing an algorithm that *could* be tested with argument-passing gets relabeled Unit — even if the failure mode is in the wiring between modules, not the algorithm itself.

The key asymmetry: Agentic is *above* the minimize-bias pull, so adding concrete examples there helps the model overcome its tendency to predict lower. Unit is *below* it — adding examples there just gives the model more justifications to under-predict.

## Result

**Tested in iteration 20 (2026-03-28). Loss: 495.25 vs baseline 368.08 (+127.17). REVERTED.**

Confirmed the O1/U2 opposing-forces hypothesis. U2 (Unit→Integration) exploded — behaviors requiring real module wiring were relabeled Unit because "I can pass data as arguments." Do not retry without a mechanism to prevent U2 bleed-over.
