---
id: vocabulary-leak-prevention
title: Strip level vocabulary from corpus tasks — describe observable behavior only
status: proposed
effort: high
expected_impact: medium
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: representational
risk: Rewriting corpus is expensive; overly sanitized tasks may lose realism
prereqs: Audit all 30 corpus tasks for vocabulary leakage
related: [concrete-agentic-example]
---

*Source: Garsson-io/kaizen#1020 — corpus validity constraints*

## Steelman

Issue #1020 identifies a critical problem: the corpus tasks contain words that leak the answer. Forbidden vocabulary includes "subprocess", "real HTTP", "real API", "LLM call", "model call", "full pipeline", "mocked", "end-to-end." Even the level names themselves ("unit", "integration") should be absent from the task description.

Our current corpus violates this. EC-04 says "delegates the classification decision to an external AI API" — the words "AI API" directly signal Agentic. EC-10 says "automation reads a pull request" — "automation" hints at Agentic/Workflow. The treatment prompt may be performing well on these tasks precisely because the vocabulary leaks the answer, not because it reasons correctly.

If we sanitize the corpus to describe only observable behavior ("the classification result matches the document content" instead of "the LLM response is parsed correctly"), we get a truer measure of the prompt's reasoning ability. Tasks that currently score well due to vocabulary leakage would drop, revealing where the prompt actually fails.

This also makes the corpus more adversarial without being unrealistic — real engineering issues are written in terms of what the system does, not how it's tested.

## Scathing Critique

This is a corpus change, not a prompt change. The autoresearch loop can only modify `treatment.md`. Rewriting 30 corpus tasks is outside scope and invalidates all previous leaderboard scores (you're changing the test, not the prompt).

Also, some vocabulary leakage is realistic. Real GitHub issues DO say "calls an AI API" or "needs integration tests." Stripping this vocabulary makes the tasks artificially neutral — which is itself a form of unrealism. Engineers don't write sanitized issue descriptions.

The bigger concern: if you strip all level vocabulary, the task may become genuinely ambiguous. "The classification result matches the document content" — is that Unit (test the parser), Integration (test the pipeline), or Agentic (test the AI model)? Without context about HOW classification happens, the correct level is unknowable. You'd be testing whether the prompt can guess, not reason.

#1020's discipline is right for a clean experiment, but applying it retroactively to a corpus that's already been scored creates an apples-to-oranges problem with the leaderboard.
