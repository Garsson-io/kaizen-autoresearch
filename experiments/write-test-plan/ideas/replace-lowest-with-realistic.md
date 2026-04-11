---
id: replace-lowest-with-realistic
title: Replace "LOWEST level" with "level a senior engineer would actually use"
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: framing
risk: "Senior engineer" is vague — model may interpret differently each time (noise source)
prereqs: null
related: [minimize-bias-reframe, persona-with-trauma]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

The "choose the LOWEST" frame triggers an optimization mindset: find the cheapest test that could theoretically pass. But test engineering isn't about the cheapest possible test — it's about the test that would actually catch the failure in production.

"What level would a senior engineer actually use?" shifts from theoretical minimization to practical judgment. A senior engineer wouldn't mock an AI classification API because they KNOW the mock hides the failure mode. They'd say "you need to call the real model at least once to know it classifies correctly."

This framing also helps with Workflow: a senior engineer wouldn't test a generate→validate→deliver pipeline with a single LLM call — they'd test the full sequence.

## Scathing Critique

"Senior engineer" is subjective and varies by context. Some senior engineers ARE over-minimizers who mock everything. The model might interpret "senior engineer" as "pragmatic, cost-conscious" and still pick lower levels.

Also, this makes the prompt more about role-playing than about classification criteria. The current prompt is already a classification task — adding persona framing changes the cognitive mode from "apply rules" to "simulate a person," which may introduce different failure modes.

## Hypothesis

Replace "LOWEST level" with "level a senior engineer would actually use" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: "Senior engineer" is vague — model may interpret differently each time (noise source)

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
