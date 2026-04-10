---
id: proposer-critic-judge-arbitration
title: Replace single-pass classification with proposer-critic-judge arbitration
status: proposed
effort: high
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
  - agentic_underprediction
confusion_pairs:
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: ensemble
risk: Correlated model biases may survive all three roles and add cost without improving accuracy.
prereqs: The eval harness can run multi-turn or multi-call adjudication per behavior.
related: [ensemble-majority-vote, competitive-critique-seeding, adversarial-self-debate]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Use three explicit roles per behavior:

1. Proposer: output initial label + evidence.
2. Critic: strongest possible rebuttal with an alternative label.
3. Judge: pick winner under strict rules (must cite behavior text, must explain why loser fails).

Optional hard gate:
- If judge confidence is low or proposer/critic disagree by >= 2 levels, escalate to a second judge call and use conservative tie-break (higher-risk level).

## Why this is bold

This is not "add one self-check line." It changes inference topology from one-shot to adversarial adjudication with explicit conflict resolution.

## Steelman

Current failures often look like anchoring: the first rationale locks in a level and self-check is too weak to overturn it. A dedicated critic role with incentive to disagree can surface hidden evidence the proposer ignored.

Compared with majority vote, this approach preserves rationale quality: the judge must explain why one argument is better, not just count votes.

It can also improve reliability under noise. If two independent argumentative paths converge on the same label, confidence is better calibrated than a single pass.

## Scathing Critique

Role prompting does not guarantee cognitive diversity; the same base model can produce stylistic disagreement with identical underlying errors.

Cost/latency roughly triples, which may be unacceptable for iterative runs. It also complicates evaluation because failures could come from proposer, critic, or judge logic.

If the tie-break policy defaults upward, this may reduce under-prediction while inflating over-prediction, hurting total loss.
