---
id: infra-probe-question
title: Add Think line under REAL-INFRA — "would an in-process fake catch this failure?"
status: kept
effort: low
expected_impact: high
targets:
  - system_underprediction
confusion_pairs:
  - Integration-System
change_type: representational
risk: May push some correct Integration predictions up to System, worsening O2 (Integration->System, impact 8)
prereqs: null
related: [variance-probe-question, counterfactual-mock, observable-behavior-framing]
last_run: 20260329-021446
last_iteration: 43
last_outcome: keep
last_delta: -12.451789609392238
retry_trigger: null
owner: null
---
## Steelman

U3 ("Integration suffices") is the #3 failure pattern by impact (30), with 10 cases where the model predicts Integration but GT is System. The model's reasoning: "wiring modules together catches this." But the actual failure requires real network latency, real subprocess exit codes, or real OS filesystem behavior that no in-process fake reproduces.

The variance-probe-question (KEPT, loss delta -6.24) proved the pattern: adding a concrete "Think:" mental simulation under an existing KEY-QUESTION helps the model calibrate without disrupting working elements. That idea added a Think line under LLM-DEP targeting U1. This idea applies the same pattern to REAL-INFRA targeting U3.

**Current REAL-INFRA:**
> Does the behavior depend on OS, real network, or real subprocess? -> System.

The model answers "no" because it frames the test around module integration — "we wire the HTTP client to the handler and test the flow." It doesn't consider whether an in-process fake HTTP client would mask the real failure (timeout behavior, connection pooling, TLS errors, real latency under contention).

**Proposed addition (Think line under REAL-INFRA):**
> Think: could an in-process fake (mock HTTP client, fake filesystem, stub subprocess) reproduce the exact failure, or does the failure only appear with real network timing, real OS signals, or real process boundaries?

This works because:
1. **Mirrors the proven variance-probe pattern**: small Think line, addition not replacement, targets one KEY-QUESTION
2. **Concrete mental simulation**: "in-process fake vs real" is something the model can evaluate per-behavior
3. **Directly addresses U3 mechanism**: The model's error is stopping at "modules wired together" without asking whether the wiring needs to be REAL
4. **Self-limiting for false positives**: For behaviors where an in-process fake IS sufficient (true Integration), the model will correctly answer "yes, a fake catches it"

Representative U3 cases this should fix:
- EC-02 b3: "real HTTP response timing under contention" — fake HTTP client can't reproduce timing
- EC-16 b3: "realistic file operations and API latency simulation" — in-process fakes miss latency
- EC-27 b4: "resilience to geocoding failure" — real geocoding API has failure modes fakes don't

**No opposing over-prediction to worry about**: O2 (Integration->System) has only 4 cases and impact 8. Even if this probe pushes 1-2 Integration predictions up to System, the net impact is strongly positive (U3 impact 30 vs O2 risk ~4).

## Scathing Critique

The REAL-INFRA question is already the most explicit question in the prompt: "Does the behavior depend on OS, real network, or real subprocess?" If the model answers "no" to that direct question, why would a Think line change its mind? The model isn't failing to consider real infra — it's actively reasoning that Integration-level wiring is sufficient. A rephrased version of the same question may get the same wrong answer.

Also, the variance-probe worked because it introduced a genuinely NEW dimension (temporal variance / non-determinism) that the model hadn't considered. The infra-probe doesn't introduce a new dimension — "in-process fake vs real" is just restating "does it need real infra?" in different words. The model already knows what real infra means; it just disagrees about when it's needed.

The O2 risk is small but real. EC-12 and EC-16 are adversarial tasks designed to look like they need real infra when they don't. The model currently handles these correctly (88-100%). Adding a "could a fake catch this?" probe might cause the model to second-guess its correct Integration answers on these tasks.

Finally, one data point (variance-probe) is not a pattern. It could be that the variance-probe worked because of its specific content, not because "Think lines under KEY-QUESTIONS" is a generalizable technique.

## Hypothesis

Add Think line under REAL-INFRA — "would an in-process fake catch this failure?" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: May push some correct Integration predictions up to System, worsening O2 (Integration->System, impact 8)

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
| 43 | 20260329-021446 | keep | -12.451789609392238 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
