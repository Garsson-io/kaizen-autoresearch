---
id: uncertainty-triggered-single-retry
title: Trigger one automatic re-evaluation only when rationale shows uncertainty
status: proposed
effort: low
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Hedging language may be stylistic rather than true uncertainty, causing unnecessary retries.
prereqs: Uncertainty cues must be explicitly defined and enforced in output format.
related: [two-step-review-loop, remove-self-check, dual-rationale-consensus-gate]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Make second-pass review conditional instead of universal:
- First pass produces label + rationale + confidence word.
- If rationale includes uncertainty cues (`maybe`, `unclear`, `likely`, `depends`) or low confidence, run exactly one forced retry with stricter evidence rules.
- Otherwise keep first-pass output.

## Steelman

Current two-pass ideas pay full cost on every behavior. This targets extra reasoning only where risk is highest, potentially improving accuracy per token.

It also gives a clean ablation: compare always-two-pass vs conditional-two-pass.

## Scathing Critique

Models can game this by using confident language even when uncertain. Then the retry never triggers where it's needed most.

Conversely, if uncertainty cues are too broad, this collapses back into always-two-pass behavior.
