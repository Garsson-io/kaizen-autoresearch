---
id: write-test-first
title: Write a test sketch first, then classify based on what you wrote
status: parked
effort: high
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: framing
risk: Massive token cost increase; haiku may write poor test sketches; schema needs redesign
prereqs: Schema change to include test_sketch field, or internal-reasoning-only approach
related: [counterfactual-mock, two-pass-dependency-extraction]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

Instead of "what level is this?" ask "write a 3-line test, then look at what you wrote":

```
For each behavior:
1. Write a 3-line test sketch (setup, action, assertion)
2. Look at your test:
   - Imports only the module under test? → Unit
   - Spins up a DB or wires modules? → Integration
   - Makes a real HTTP/subprocess call? → System
   - Calls a real AI model? → Agentic
   - Chains multiple AI calls? → Workflow
```

This is a radical reframe that plays to the model's strength: code generation. Models are better at writing code than reasoning abstractly about classification. By making the model produce a test first, you ground the classification in concrete code rather than abstract taxonomy.

For EC-04 behavior 3, the model would write: `result1 = classifier.classify(doc); result2 = classifier.classify(doc); assert result1 == result2`. Then it looks at the test and sees it calls `classifier.classify` which calls the real AI API. Classification: Agentic. The test itself reveals the level.

## Scathing Critique

This was correctly identified by Aviad as "too early when we have specs and no code." The task is classifying behaviors from an issue description — there is no codebase to import from. The model would have to invent a test for a system that doesn't exist yet, using imagined function signatures and imagined dependencies.

The test sketches would be hallucinated code. The model writing `classifier.classify(doc)` proves nothing — it invented that function name. It could equally write `mock_classifier.classify(doc)` and conclude Unit. The test sketch reflects the model's assumptions, not ground truth.

Token cost is 3-5x higher (5 behaviors x test sketch + reasoning). For haiku at scale across 30 tasks, this could 10x the eval cost. And the schema would need a `test_sketch` field that the scorer doesn't use — dead weight in the structured output.

Parked: revisit when there's an actual codebase to test against, or when using a more capable model (Opus) that can write realistic test sketches from specs alone.

## Hypothesis

Write a test sketch first, then classify based on what you wrote should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Massive token cost increase; haiku may write poor test sketches; schema needs redesign

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
