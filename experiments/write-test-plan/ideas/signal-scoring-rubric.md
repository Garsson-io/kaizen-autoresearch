---
id: signal-scoring-rubric
title: Numeric signal-scoring rubric (replace verbal reasoning with points)
status: proposed
effort: medium
expected_impact: medium
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: representational
risk: Point system may be too rigid — edge cases that don't fit the rubric get misclassified
prereqs: null
related: [top-down-elimination]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Steelman

The current prompt uses verbal reasoning ("Does correctness depend on what a real LLM produces?") which is inherently fuzzy. Different behaviors activate different heuristics and the model can rationalize any answer. A numeric rubric removes ambiguity:

```
+0 if testable with pure function call (no I/O, no deps)
+1 if needs real file/DB/module wiring
+2 if needs real subprocess or real external API call (deterministic)
+3 if API response varies non-deterministically (AI/LLM)
+4 if requires chaining multiple non-deterministic steps
```

Map: 0=Unit, 1=Integration, 2=System, 3=Agentic, 4=Workflow

This works because:
1. It's mechanical — the model scores signals rather than making holistic judgments
2. It disambiguates System vs Agentic explicitly: "deterministic" API = +2, "non-deterministic AI" API = +3
3. It's additive — a behavior that needs both real DB (+1) and real AI (+3) gets max(scores) = Agentic, not System
4. LLMs are generally better at structured scoring than open-ended reasoning

## Scathing Critique

Real behaviors don't map to clean point values. What about a behavior that needs a real subprocess that calls an AI API? Is that +2 (subprocess) or +3 (AI)? The answer is "max" but the rubric doesn't say that — and if the model treats it as additive (+2+3=5, which maps to... nothing), you get garbage.

More fundamentally, the problem isn't that the model can't reason about levels — it scored 87.2% on the full corpus. The problem is that it doesn't recognize certain AI signals (specifically "external AI classification API" → non-deterministic). A point system doesn't teach it new facts; it just repackages the same question in numeric form.

And the rigidity is a real risk. The treatment-l12 idea (12-step ladder mapped to 5 levels) was a similar "add more structure" approach and it scored WORSE (71.2%). More structure doesn't mean more accuracy — it can mean more places to make mapping errors.

## Hypothesis

Numeric signal-scoring rubric (replace verbal reasoning with points) should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Point system may be too rigid — edge cases that don't fit the rubric get misclassified

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

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 64.6492 | -3.0902 | improved 2, hurt 1, flat 3 | ec-07 drives 66% of gain |
| v2plus-stronger-counter | 65.5813 | -2.1581 | improved 2, hurt 1, flat 3 | ec-07 drives 75% of gain |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
