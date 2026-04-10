---
id: dual-rationale-consensus-gate
title: Require two independently styled rationales before accepting a label
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
change_type: meta-cognitive
risk: The two rationales may be superficially different but share the same underlying mistake.
prereqs: Prompt must force non-overlapping rationale formats to reduce copy-paste reasoning.
related: [two-step-review-loop, adversarial-self-debate, proposer-critic-judge-arbitration]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

In a single call, force two rationales with different constraints:
- Rationale A: rule-based boundary argument
- Rationale B: minimal failing-test argument

If A and B agree -> keep label.
If they disagree -> move one level up and explain why.

## Steelman

This gives cheap internal ensemble behavior without multiple API calls. Different rationale formats can expose brittle first-pass decisions and improve calibration.

Compared to full proposer/critic/judge, this is fast and easy to ablate.

## Scathing Critique

Single-call "independence" is often fake independence. The model can generate two narratives around the same mistaken conclusion.

The disagreement fallback (move up one level) may reduce underprediction but increase overprediction.
