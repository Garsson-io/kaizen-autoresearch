---
id: determinism-test
title: Add "is the dependency's output deterministic?" as the Agentic/System decision point
status: rejected
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: representational
risk: "Deterministic" is ambiguous — rate-limited APIs, caches, and flaky networks are non-deterministic but not Agentic
prereqs: null
related: [ai-api-equals-agentic-rule, mock-exposes-nothing]
last_run: 20260411-010159
last_iteration: 65
last_outcome: discard
last_delta: 77.145
retry_trigger: null
owner: null
---
## Steelman

The System/Agentic confusion exists because both involve "external API calls." The model currently has: System = "real external API call", Agentic = "real LLM non-determinism." These overlap when the external API IS an LLM.

The clean decision point is DETERMINISM of the dependency's output:
- Same input → same output (deterministic) → a mock is functionally equivalent → System
- Same input → different output (non-deterministic) → a mock hides the variance → Agentic

Change the System definition from "real external API call" to "real external API call where the response is deterministic (same input → same output)." This makes the distinction a YES/NO question about the dependency, not a judgment about what kind of service it is.

The U1 pattern would be directly addressed: "can you mock this API and get functionally equivalent output? No, because the AI model returns different labels → Agentic."

## Scathing Critique

Many non-AI services are non-deterministic: rate-limited APIs return 429 sometimes, caches have TTLs, networks drop packets. By the determinism test, testing "does the API return 503 under load?" would be Agentic, which is wrong (it's System).

The distinction isn't determinism per se — it's whether the SEMANTIC CONTENT of the response varies. An LLM can return "legal" or "financial" for the same document (semantic variance). A REST API always returns the same user object (semantic determinism) even if the HTTP layer is non-deterministic.

"Semantic determinism" is a harder concept than "external API call" — it may confuse haiku more, not less.

## Epistemological Status
Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `68.84`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-semantic-determinism-line | 63.8778 | -4.9576 | improved 4, hurt 0, flat 2 | distributed |
| v2-llm-variance-clarifier | 65.4867 | -3.3487 | improved 2, hurt 1, flat 3 | ec-07 drives 68% of gain |
| v3-determinism-with-infra-exclusion | 69.0117 | +0.1763 | improved 1, hurt 2, flat 3 | n/a |

Winner: `v1-semantic-determinism-line` by aggregate loss, classification is `signal`.

## Hypothesis

Add "is the dependency's output deterministic?" as the Agentic/System decision point should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: "Deterministic" is ambiguous — rate-limited APIs, caches, and flaky networks are non-deterministic but not Agentic

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 65 | 20260411-010159 | discard | 77.145 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
