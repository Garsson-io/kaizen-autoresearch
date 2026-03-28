---
id: challenge-your-choice
title: Replace self-check with adversarial challenge — "argue why your choice is WRONG"
status: rejected
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: meta-cognitive
risk: May cause the model to flip correct answers too. Could increase noise.
prereqs: null
related: [adversarial-self-debate, counterfactual-mock]
---

## Steelman

The current self-check is: "does your test_description actually require that level?" — it scores 100% consistency, meaning the model always says "yes" to its own choice. It's a rubber stamp.

Replace with: "Now argue why your choice is WRONG. What failure would you miss at this level? If you can identify a missed failure, raise the level."

The taxonomy data shows the model already KNOWS the right answer (the parenthetical admissions in U1). An adversarial self-challenge would force it to surface that knowledge instead of burying it. When the model writes "a mock returns a fixed label but the real model varies" as its challenge, it has to either raise to Agentic or explicitly dismiss its own argument.

This leverages the model's existing knowledge rather than trying to teach it something new.

## Scathing Critique

The model currently achieves 100% consistency — its self-check works. An adversarial challenge replaces a working component with an untested one. The model might flip correct Unit answers ("well, technically an Integration test would catch more...") creating a wave of new over-predictions.

The parenthetical admissions may only appear in the justification text AFTER classification. During the adversarial challenge, the model would need to generate new reasoning, not reuse existing parentheticals. It might generate confident-sounding dismissals: "My choice is correct because mocking is sufficient for this deterministic behavior" — even for Agentic cases.
