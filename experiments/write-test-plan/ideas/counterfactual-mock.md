---
id: counterfactual-mock
title: Counterfactual mock reasoning — "what failure would a mock miss?"
status: proposed
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: framing
risk: Adds reasoning overhead, may slow the model and introduce inconsistency errors
prereqs: null
related: [top-down-elimination, write-test-first]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

The root cause of Agentic under-prediction is that the model doesn't connect "external AI API" to "non-deterministic behavior that a mock would miss." The counterfactual reframe directly attacks this: instead of asking "what level is this?" (abstract classification), ask "if you mocked every dependency, what real failure would you miss?" (concrete reasoning about failure modes).

This reframe works because:
1. It forces the model to think about what a mock DOES vs what the real dependency DOES
2. For Agentic behaviors, the answer is obvious: "a mock returns a fixed label, but the real model varies" — this is exactly the reasoning the model currently fails to produce
3. For Unit behaviors, the answer is "nothing — a mock covers this" — which correctly keeps them at Unit
4. It's grounded in the actual testing decision engineers make, not abstract level taxonomy

The kaizen#1016 analysis explicitly identifies the failure: "the model tests module determinism, not LLM variability" — counterfactual mock reasoning directly addresses this by asking "what would the mock miss?"

## Scathing Critique

This is basically asking the model to do more work per behavior. The current prompt already has a self-check step ("does your test_description actually require that level?") and that step scores 100% consistency — so meta-cognitive reasoning isn't the bottleneck.

The problem is definitional, not procedural. The model doesn't know that "external AI classification API" implies non-determinism. Adding a counterfactual reasoning step doesn't teach it that fact — it just adds a step where the model will confidently write "a mock of the classification API would return the expected label, which is sufficient to test this behavior" (wrong, but internally consistent).

Also, this reframe may hurt simpler tasks. For EC-09 (plugin loader), asking "what would a mock miss?" for every behavior adds unnecessary complexity to a straightforward classification. The model may start second-guessing correct Unit classifications.

## Hypothesis

Counterfactual mock reasoning — "what failure would a mock miss?" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Adds reasoning overhead, may slow the model and introduce inconsistency errors

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
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
