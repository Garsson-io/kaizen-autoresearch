---
id: hypothesis-validation-step
title: Treat each level choice as a hypothesis — require falsification attempt
status: proposed
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: meta-cognitive
risk: Falsification adds significant token cost; model may produce pro-forma falsification that doesn't change the answer
prereqs: null
related: [adversarial-self-debate, counterfactual-mock, solution-collapse-prevention]
---

*Source: Garsson-io/kaizen#983 — Phase 4.5 step 4: "HYPOTHESIS / VALIDATION / IF WRONG"; Garsson-io/kaizen#747 — "the implementor should form hypotheses about what could break"*

## Steelman

Two kaizen issues converge on the same insight: every decision should be treated as a hypothesis with an explicit falsification attempt.

From #983 (Phase 4.5 plan formation):
> Step 4: Hypothesis Validation — HYPOTHESIS / VALIDATION / IF WRONG

From #747 (testing plan phase):
> The implementor should form hypotheses about what could break, attempt to falsify them, and document which test types they considered and rejected (with reasons).

Applied to our classification:

```
For each behavior, after choosing a level:
  HYPOTHESIS: "[Level] is sufficient because [reason]"
  FALSIFICATION: "This would be wrong if [specific condition]"
  CHECK: Does that condition apply here?
  IF WRONG: "Then the correct level would be [higher level]"
```

Example for EC-04 behavior 3:
```
HYPOTHESIS: "System is sufficient because we need to call the real external API"
FALSIFICATION: "This would be wrong if the API response varies non-deterministically"
CHECK: The API is an AI classification service — AI outputs DO vary non-deterministically
IF WRONG: "Then the correct level is Agentic"
→ REVISED: Agentic
```

The power of this approach: the falsification step FORCES the model to consider the exact scenario where it's wrong. "This would be wrong if the API response varies" is precisely the reasoning the model currently skips. By making it a mandatory step, the model can't avoid confronting the Agentic possibility.

This is different from adversarial-self-debate (which argues for two levels) because it starts from the model's natural answer and tries to break it. The model doesn't have to consider multiple candidates — it just has to honestly evaluate whether its own answer could be wrong.

## Scathing Critique

The model will produce a falsification step that confirms its original answer. This is the #1 failure mode of self-checking in LLMs: when asked "could I be wrong?", the model generates a token-level continuation that's consistent with its previous reasoning. It chose System; it will generate a falsification condition that doesn't apply.

Example of what will actually happen:
```
HYPOTHESIS: "System is sufficient because we call the real external API"
FALSIFICATION: "This would be wrong if the behavior required testing internal module wiring"
CHECK: No, this is about the external API, not internal wiring
→ CONFIRMED: System
```

The model chose a falsification condition that conveniently doesn't challenge its answer. This is not hypothetical — it's the well-documented "sycophantic self-evaluation" pattern in LLMs. The model's self-checks are biased toward confirmation of its existing answer.

Also, HYPOTHESIS/VALIDATION/IF WRONG adds 4 lines of structured output per behavior. For a 10-behavior task, that's 40 lines of reasoning that the structured JSON schema doesn't capture. Either you add these fields to the schema (bloating the output and changing the scorer) or they exist only in the model's internal reasoning (invisible and unverifiable).

The kaizen Phase 4.5 works because a human reviews the hypothesis and can catch "that falsification condition is too narrow." In our automated eval pipeline, there's no human in the loop — the model checks itself and moves on.
