---
id: few-shot-worked-examples
title: Add 2-3 worked examples covering exact confusion pairs
status: proposed
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Examples may anchor the model on specific patterns and hurt generalization to novel tasks
prereqs: null
related: [concrete-agentic-example, counterfactual-mock]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

The model's primary failure is not understanding that "external AI classification API" implies non-determinism. No amount of definitional rewording will fix this if the model doesn't have a concrete reference point for what Agentic looks like in practice.

Few-shot examples directly inject this knowledge:

```
EXAMPLE: "Classification result is consistent across repeated calls"
  Naive: Unit — call the function twice, compare outputs
  Correct: Agentic — a mock always returns the same label, but a real
  AI model may classify the same document differently each time.
  The consistency guarantee can only be tested with the real model.
```

This is the single most effective prompt engineering technique. Few-shot examples outperform both CoT and fine-tuning for classification tasks in the literature. The model learns by analogy: "oh, THAT's what Agentic looks like in a classification context."

For the Workflow confusion pair, a second example disambiguates:

```
EXAMPLE: "Full pipeline delivers report to inbox"
  Naive: Agentic — it involves an AI model
  Correct: Workflow — the pipeline has MULTIPLE agentic steps
  (collect → summarize → format → deliver) where each depends on the previous.
```

Two examples, targeting the two known confusion pairs, would directly address the top two failure modes.

## Scathing Critique

Few-shot examples are a double-edged sword. They work great when the test cases resemble the examples. They work terribly when they don't. If you add an example about "AI classification API → Agentic," the model will correctly handle EC-04 (document classifier) but may over-trigger Agentic on any task that mentions "API" near "classification."

The 30-task corpus now includes 4 "misleading surface" tasks (EC-12, EC-16, EC-18, EC-20) specifically designed to look AI-like but be deterministic. An Agentic few-shot example could push these tasks into false Agentic predictions, *lowering* the overall score even while fixing EC-04.

Also, examples consume token budget. The treatment prompt is currently 23 lines. Adding 2-3 worked examples might double it. For a fast model like haiku, this may increase latency and token cost without proportional benefit.

The deeper issue: examples are a band-aid. They fix specific failure patterns without improving the model's general reasoning. Every new confusion pair requires a new example. The prompt grows linearly with failure modes instead of converging on a robust classification framework.

## Hypothesis

Add 2-3 worked examples covering exact confusion pairs should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Examples may anchor the model on specific patterns and hurt generalization to novel tasks

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
