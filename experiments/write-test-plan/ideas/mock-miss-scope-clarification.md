---
id: mock-miss-scope-clarification
title: Scope MOCK-MISS to the specific behavior's failure mode, not hypothetical wiring failures
status: kept
effort: low
expected_impact: high
targets:
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
change_type: representational
risk: May cause U2 explosion if "it is Unit" anchor biases model downward too hard; similar risk to unit-algo-parenthetical but via KEY-QUESTIONS not LEVEL-DEFS
prereqs: null
related: [minimize-bias-reframe, unit-algo-parenthetical]
---

## The change

```diff
-  - **MOCK-MISS**: Could a pure in-process mock miss this failure? If yes → at least Integration.
+  - **MOCK-MISS**: Does THIS SPECIFIC BEHAVIOR describe a failure that only appears when multiple modules interact — not just a failure that could theoretically exist somewhere in the feature? If the behavior tests one function's logic, parsing, or algorithm, it is Unit even if the broader feature has integration points. Only escalate to Integration when the behavior's own failure mode is at a module boundary.
```

## Rationale

The original MOCK-MISS question ("Could a pure in-process mock miss this failure?") is universally
true — you can always argue that mocking one component could miss some wiring bug. With codex
(gpt-5.3-codex), this causes 52/88 errors (59%) to be Integration→Unit over-predictions: the model
says "a unit test of the validator could miss loader wiring" for behaviors that ARE testing the
validator. The rewrite scopes the question to the specific behavior: "Is THIS failure mode at a
module boundary?" This blocks the false escalation pattern.

Codex has the inverse of haiku's minimize-bias (codex over-predicts Integration). The ceiling
effect seen on haiku was caused by changes to LEVEL-DEFS making Unit easier to qualify for —
this change is to KEY-QUESTIONS, targeting the heuristic rather than the definition.

## Skeptic view

The new wording is longer and more complex. The explicit "it is Unit" phrase may act as a general
Unit anchor causing over-correction downward. If codex latches on to "it is Unit" as a blanket
permission, the Integration→Agentic/System misses could worsen (5 Integration→Agentic and
9 Integration→System errors currently). The haiku failure mode (U2 explosion) came from LEVEL-DEFS
but a similar mechanism could apply here via KEY-QUESTIONS.
