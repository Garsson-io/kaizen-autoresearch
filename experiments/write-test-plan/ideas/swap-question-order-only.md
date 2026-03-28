---
id: swap-question-order-only
title: Move Agentic question before System question (minimal reorder, no text change)
status: rejected
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
change_type: structural
risk: Run 1 iter 1 tried reordering + adding examples and hurt score. This isolates just the reorder.
prereqs: null
related: [top-down-elimination]
---

## Steelman

Run 1 iter 1 reordered questions AND added examples — it dropped 3.5 points. But we can't attribute the drop to reordering vs examples because both changed simultaneously. The atomic test: swap ONLY the Agentic and System question lines, change nothing else.

Current order: Integration → System → Agentic → Workflow.
The model checks System first, matches "external API call," and stops. If Agentic is checked first, the model would match "real LLM" before reaching "real external API."

This is a zero-text-change experiment — same word count, same definitions, just two lines swapped.

## Scathing Critique

The current question order is bottom-up (lowest first), which is the natural escalation for "choose the LOWEST." Reordering to check higher levels first contradicts the framing. The model may get confused by the inconsistency between "choose the LOWEST" and "check highest first."

Also, the model doesn't actually follow the questions as a sequential checklist — it reads all definitions and questions, then makes a holistic judgment. Line order may not matter to the model's attention mechanism.
