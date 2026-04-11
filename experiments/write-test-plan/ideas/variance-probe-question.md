---
id: variance-probe-question
title: Replace LLM-DEP with concrete variance probe -- "100 runs, same input, same output?"
status: kept
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: representational
risk: Model may over-apply variance reasoning to flaky network calls (non-deterministic but not Agentic)
prereqs: null
related: [determinism-test, concrete-agentic-example, mock-exposes-nothing, counterfactual-mock]
last_run: 20260328-145025
last_iteration: 16
last_outcome: keep
last_delta: -6.24
retry_trigger: null
owner: null
---
## Steelman

The #1 failure pattern (U1, impact 40) is that the model treats AI/LLM APIs as ordinary mockable services. The current LLM-DEP question asks:

> Does correctness depend on what a real LLM produces?

The model answers "no" because it frames the test around infrastructure logic (retry, caching, routing) rather than the AI output itself. The question is too abstract -- "correctness depends on what a real LLM produces" requires the model to reason about the nature of AI outputs, which it consistently fails to do.

**Proposed replacement for LLM-DEP:**

> **VARIANCE**: Would running this test 100 times with the real dependency produce different outcomes? A deterministic API (REST, DB) returns the same result. An AI/ML model may classify, generate, or score differently each run. If outcomes vary → Agentic.

This works because:

1. **Concrete and observable**: "100 times, same input" is a thought experiment the model can simulate, not an abstract judgment about "non-determinism."
2. **Directly addresses the failure mechanism**: The model's U1 error is not connecting "AI API" to "variable output." The 100-runs framing forces this connection -- "would an AI classifier return the same label 100 times? No."
3. **Self-correcting for false positives**: A REST API that returns user data? Same result 100 times. A database query? Same result. This naturally excludes deterministic services without needing the model to distinguish "AI" from "non-AI."
4. **Handles the flaky-network objection**: Network errors (429, timeout) produce transport failures, not different OUTCOMES. The question is about the semantic result, not the transport layer.

This is a targeted edit to one bullet point (LLM-DEP → VARIANCE). It does not remove any working section. It does not add structural complexity. It changes the FRAMING of the question the model already answers, from "does it depend on LLM output?" (abstract) to "would results vary across runs?" (concrete).

The determinism-test idea targets the same mechanism but proposed changing the Agentic DEFINITION. This idea changes only the QUESTION, leaving definitions intact. Questions are safer to modify than definitions (per meta-failures: definition changes hurt -4.2).

## Scathing Critique

The critique from `determinism-test` applies here too: many non-AI services have non-deterministic behavior. Rate-limited APIs return 429 unpredictably. Cache TTLs cause different responses. Time-dependent APIs return different data each second. The model might reason "this API could return different results on different days" and escalate a System-level behavior to Agentic.

The "100 runs" framing might also confuse the model on behaviors where the test itself is about consistency. EC-04 b3 tests "caching consistency" -- running 100 times with the real API is literally what Agentic means here, but the model might read "100 runs" as a testing strategy rather than a classification criterion.

Also, this is still fundamentally a question the model can answer wrong. The current MOCK-HIDE question is already a counterfactual ("Would mocking this dependency always pass, hiding a real failure?") and the model answers it wrong. Rephrasing the question from "would a mock hide a failure?" to "would 100 runs give different results?" may not change the model's underlying misunderstanding that AI APIs are deterministic services.

The safest version would add VARIANCE as a NEW question rather than replacing LLM-DEP, since meta-failures show replacements hurt. But adding yet another question risks information overload -- the prompt already has 5 key questions.

## Hypothesis

Replace LLM-DEP with concrete variance probe -- "100 runs, same input, same output?" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Model may over-apply variance reasoning to flaky network calls (non-deterministic but not Agentic)

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
| 16 | 20260328-145025 | keep | -6.24 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
