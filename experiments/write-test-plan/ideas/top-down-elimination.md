---
id: top-down-elimination
title: Top-down elimination ladder (start at Workflow, work down)
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: May over-predict — model anchors on Workflow/Agentic and fails to eliminate down to Unit
prereqs: null
related: [signal-scoring-rubric, counterfactual-mock]
---

## Steelman

The current prompt's key questions work bottom-up: "Could a mock miss this?" → Integration, then "Does it need real network?" → System, then "Does it depend on LLM output?" → Agentic. This creates an anchoring bias toward lower levels — the model starts at Unit and needs positive evidence to escalate. Since Agentic is question #3, it's easy to "stop early" at System.

Flipping the order forces the model to *actively eliminate* higher levels. Starting at Workflow means the model must explicitly say "no, this doesn't require multiple agentic steps" before dropping to Agentic. Then it must say "no, this doesn't depend on real AI output" before dropping to System. This makes it harder to accidentally skip Agentic — you have to rule it out, not discover it.

This is the simplest possible change (reorder 4 lines) with the highest expected impact. Anchoring effects are well-documented in LLM behavior, and the current failure mode (Agentic under-prediction) is exactly what anchoring toward the bottom would produce.

## Scathing Critique

The reason the current prompt works bottom-up is that most behaviors ARE low-level. 60-70% of real behaviors are Unit. A top-down prompt wastes reasoning effort on every behavior — the model has to eliminate Workflow, Agentic, System, and Integration before arriving at Unit, which is the correct answer most of the time. This is like making a doctor check for cancer before checking for a cold.

Worse: the model may anchor on Workflow/Agentic and fail to eliminate all the way down. If the elimination reasoning is even slightly lazy ("well, this system does interact with external services, so maybe System..."), every behavior gets over-predicted by one level. The current 87.2% score on the 10-task corpus could *drop* because the easy tasks (EC-01, EC-08, EC-09) that are currently correct start getting escalated.

The real fix for Agentic under-prediction is better Agentic definition, not prompt reordering. If the model doesn't understand what Agentic means, it won't correctly eliminate down to it from Workflow either.
