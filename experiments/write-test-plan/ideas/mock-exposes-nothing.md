---
id: mock-exposes-nothing
title: Add the question "would a mock of this dependency always pass, hiding a real failure?"
status: kept
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: meta-cognitive
risk: Adds one question — minimal length, but may cause overthinking on simple tasks
prereqs: null
related: [counterfactual-mock, minimize-bias-reframe]
last_run: null
last_iteration: 7
last_outcome: keep
last_delta: 2
retry_trigger: null
owner: null
---
## Steelman

The U1 pattern ("can mock the API") shows the model defaults to "mock the dependency, test the logic." This is correct for deterministic APIs but wrong for AI/LLM calls where the mock hides the failure mode entirely (a mock always returns the same label).

Adding one key question — "Would a mock of this dependency always pass, hiding a real failure?" — directly triggers the insight the model is missing. For AI APIs, the answer is YES (a mock classification always returns "legal", so the test always passes even if the real model would return "financial"). For deterministic APIs, the answer is NO (a mock 200 response is functionally equivalent to the real one).

This is the lightest possible intervention — one question, no examples, no restructuring. And it targets U1 specifically (11 Agentic misses, all weight-4).

## Scathing Critique

Run 1 showed that adding ANY text to the prompt hurts haiku performance. Even a one-line Agentic definition expansion dropped the score by 4.7 points. This is one more question added to an already-struggling prompt.

The model already has "Does correctness depend on what a real LLM produces? → Agentic" which is conceptually identical. If the model ignores that direct instruction, why would it heed a softer counterfactual question?

## Hypothesis

Add the question "would a mock of this dependency always pass, hiding a real failure?" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Adds one question — minimal length, but may cause overthinking on simple tasks

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
| 7 |  | keep | 2 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
