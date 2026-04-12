---
id: mock-miss-scope-clarification
title: Scope MOCK-MISS to the specific behavior's failure mode, not hypothetical wiring failures
status: rejected
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
last_run: 20260329-004857
last_iteration: 39
last_outcome: discard
last_delta: 14.554338617581909
retry_trigger: null
owner: null
---
## Exact Edit
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

## Hypothesis

Scope MOCK-MISS to the specific behavior's failure mode, not hypothetical wiring failures should reduce targeted confusion by improving decision-boundary clarity.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: May cause U2 explosion if "it is Unit" anchor biases model downward too hard; similar risk to unit-algo-parenthetical but via KEY-QUESTIONS not LEVEL-DEFS

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Epistemological Status

Current status: null.

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 39 | 20260329-004857 | discard | 14.554338617581909 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 68.3772 | +0.6378 | improved 1, hurt 2, flat 3 | n/a |
| v2plus-stronger-counter | 65.2501 | -2.4893 | improved 3, hurt 0, flat 3 | distributed |

Winner: `v2plus-stronger-counter` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
