---
id: blind-level-alias-mode
title: Hide semantic level names during reasoning (L1-L5 alias mode)
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: representational
risk: Alias indirection may confuse mapping back to canonical labels.
prereqs: Prompt must include an unambiguous one-to-one mapping table from aliases to true levels.
related: [vocabulary-leak-prevention, level-archetype-centers, minimize-bias-reframe]
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
During reasoning, rename levels to neutral tokens (`L1..L5`) and forbid the words Unit/Integration/System/Agentic/Workflow until final mapping.

Flow:
1. Reason over neutral level definitions only
2. Select `Lx`
3. Map `Lx` to canonical label in final output

## Steelman

Level names carry priors and cultural bias. "Unit" and "Workflow" trigger strong heuristics that can short-circuit evidence-based reasoning. Alias mode can reduce this lexical anchoring.

This is very easy to test: prompt text only, no pipeline changes.

## Scathing Critique

The model still knows the mapping, so bias may persist under aliases. This could be pure ceremony with no measurable effect.

Alias mapping also adds one extra failure mode: correct reasoning but wrong final remap.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Alias indirection may confuse mapping back to canonical labels.

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
