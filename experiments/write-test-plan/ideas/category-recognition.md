---
id: category-recognition
title: Two-pass recognition — keyword scan then structural confirmation
status: proposed
effort: medium
expected_impact: medium
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: structural
risk: Keywords alone may over-trigger; structural tests add complexity
prereqs: null
related: [two-pass-dependency-extraction, signal-scoring-rubric, failure-mode-taxonomy]
---

*Source: Garsson-io/kaizen#986 — "two-pass category recognition — keyword scan plus structural test confirmation"*

## Steelman

Issue #986 describes a two-pass recognition algorithm for identifying error categories:
- **Pass 1**: Keyword scan (fast, high recall, low precision)
- **Pass 2**: Structural tests as yes/no questions (slower, high precision)
- Only confirmed matches (confidence >= 0.8) are used as priors

Applied to our classification task, this becomes:

```
Pass 1 — Keyword scan per behavior:
  Contains "AI", "LLM", "model", "classify", "generate", "summarize"? → Agentic candidate
  Contains "API", "HTTP", "subprocess", "external service"? → System candidate
  Contains "database", "filesystem", "wired", "multiple modules"? → Integration candidate
  No external dependency keywords? → Unit candidate

Pass 2 — Structural confirmation:
  If Agentic candidate: "Does the output VARY non-deterministically?" (yes → Agentic, no → System)
  If System candidate: "Is the API deterministic for identical inputs?" (yes → System, no → Agentic)
  If Integration candidate: "Could a single function test catch this?" (yes → Unit, no → Integration)
```

The two-pass approach addresses the root cause: the model sees "external API" and stops at System. Pass 1 correctly identifies "API" → System candidate. Pass 2 asks the distinguishing question: "Is the API deterministic?" This is where the model has to make the critical judgment, but now it's a focused yes/no question rather than an open-ended classification.

The #986 insight that "ambiguous inputs produce confidence 0.5 with full-exploration flag" is useful here too. When the structural test is inconclusive, the model should flag uncertainty rather than defaulting to the lower level.

## Scathing Critique

This is an elaborate way to ask the model a question it already fails to answer. The structural test "Does the output VARY non-deterministically?" IS the question the model gets wrong. Wrapping it in a two-pass framework doesn't change the model's answer — it just adds steps before arriving at the same wrong conclusion.

The keyword scan in pass 1 is brittle. EC-21 (feedback processor) uses "analyzer" for both rule-based and AI components. EC-25 (fraud detector) uses "model" for both rule engine and ML. EC-30 (recommendation engine) uses "algorithm" for AI ranking. Keywords don't distinguish these — they create false positives that pass 2 must then sort out.

And pass 2's structural tests are exactly what the current key questions already do: "Does correctness depend on what a real LLM produces?" The model answers "no" for EC-04 behavior 3 because it doesn't connect "external AI classification API" to "LLM." Rephrasing the question as "Does the output VARY non-deterministically?" doesn't change the model's understanding of the component.

The #986 algorithm works for category recognition in issues (where you have the full issue text and can search for structural patterns). Applying it to single-behavior classification is a forced analogy — the structural tests need context that a single behavior description may not provide.
