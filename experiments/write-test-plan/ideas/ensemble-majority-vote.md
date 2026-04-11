---
id: ensemble-majority-vote
title: Run 3 prompt variants, majority vote per behavior
status: parked
effort: high
expected_impact: medium
targets:
  - agentic_underprediction
  - workflow_gap
  - noise_sensitivity
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: ensemble
risk: 3x API cost; majority vote still fails if all 3 variants share the same blind spot
prereqs: Changes to run-eval.sh to support multi-prompt voting
related: [top-down-elimination, counterfactual-mock, signal-scoring-rubric]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

Instead of finding one perfect prompt, run three different prompts and take the majority vote per behavior:
- Variant A: current treatment (bottom-up key questions)
- Variant B: top-down elimination ladder
- Variant C: counterfactual mock reasoning

If 2 of 3 agree, use that answer. If all 3 disagree, use the highest level (bias toward safety).

This works because each prompt has different blind spots. The current treatment under-predicts Agentic. A top-down prompt might over-predict. The majority vote cancels out systematic biases. This is the "wisdom of crowds" approach applied to prompt engineering.

For noisy metrics (LLM-based scoring), ensembles are the gold standard. They reduce variance without requiring any single prompt to be perfect. And the implementation is straightforward: modify run-eval.sh to run 3 probes per task and add a voting step.

## Scathing Critique

3x the API cost for a potential 2-3% improvement. The experiment uses haiku for speed and cost — tripling the budget undermines the reason for using haiku.

More fundamentally, if all three prompts share the same blind spot (they all fail to recognize "external AI classification API" as non-deterministic), majority vote doesn't help. The blind spot is in the MODEL, not the prompt. Three different prompts to the same model may produce three identical wrong answers.

The implementation complexity is high: you need to modify run-eval.sh, run-probe.ts, and score.ts to support multi-prompt voting. This is no longer a prompt-only change — it's a pipeline change. And pipeline changes are outside the scope of the autoresearch loop, which can only modify treatment.md.

Parked: revisit if single-prompt approaches plateau AND the eval budget allows 3x cost.

## Hypothesis

Run 3 prompt variants, majority vote per behavior should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: 3x API cost; majority vote still fails if all 3 variants share the same blind spot

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
