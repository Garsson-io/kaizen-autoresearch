---
id: retrieval-backed-precedent-pack
title: Retrieve nearest historical failures as case-law before each classification
status: proposed
effort: high
expected_impact: high
targets:
  - agentic_underprediction
  - unit_overprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: ensemble
risk: Retrieval can overfit to the current corpus and anchor to the wrong precedent.
prereqs: We maintain a clean, labeled precedent bank with concise rationales from past runs.
related: [few-shot-worked-examples, cluster-detection-for-errors, vocabulary-leak-prevention]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Before classifying each behavior, retrieve 2-4 nearest precedent snippets from prior disagreement cases (model vs GT), then force an explicit "same as / different from" comparison.

Protocol:
1. Embed the current behavior text.
2. Retrieve nearest precedent cases from a bank of high-impact historical misses.
3. Require the model to explain why each precedent is analogous or non-analogous.
4. Classify only after the comparison.

## Why this is bold

This turns the prompt into a memory-augmented classifier. Instead of static examples, it uses dynamic retrieval of the most relevant historical traps per behavior.

## Steelman

The project already has rich error history (taxonomy + runs). Right now that data informs humans between iterations, not the model at inference time. This idea closes that loop directly.

A dynamic precedent pack can target whichever confusion pair is active for a behavior. For a Unit-vs-Integration borderline case, retrieve exactly those failures; for System-vs-Agentic, retrieve those instead. That is more efficient than stuffing the prompt with fixed examples for all boundaries.

It also creates an explicit anti-hallucination check: if the model claims analogy without textual overlap, it is observable and scorable.

## Scathing Critique

Nearest-neighbor retrieval is brittle when behavior descriptions are short. Semantic similarity can retrieve superficial matches that share vocabulary but not failure mechanism, causing systematic mislabels.

This can also leak benchmark answers into evaluation if the precedent bank includes near-duplicate corpus items. You may improve loss by memorization, not reasoning.

Operationally, this needs embeddings, indexing, and careful data hygiene. It's a significant architecture change for uncertain upside.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Retrieval can overfit to the current corpus and anchor to the wrong precedent.

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
