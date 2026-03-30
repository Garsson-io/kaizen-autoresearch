---
id: dual-pass-classify-then-audit
title: Two-pass protocol: initial classification then adversarial downgrade/upgrade audit
status: rejected
effort: high
expected_impact: high
targets:
  - unit_overprediction
  - integration_underprediction
  - system_underprediction
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: meta-cognitive
risk: More reasoning steps can amplify errors if the first-pass hypothesis is wrong.
prereqs: Must explicitly forbid introducing new hypothetical facts in pass 2.
related: [adversarial-self-debate, solution-collapse-prevention, seam-map-cross-check]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Hypothesis

Single-pass decisions are brittle and prone to confirmation bias. A second audit pass can catch both over-escalation and under-escalation if constrained to behavior evidence only.

## Proposed Prompt Edit (exact prose)

Add this block before `SELF-CHECK`:

```md
- **DUAL-PASS DECISION**:
  - **Pass 1 (propose)**: choose the minimum level that appears sufficient from behavior evidence.
  - **Pass 2 (audit)**: challenge Pass 1 in both directions:
    - **Downgrade check**: could this pass at one lower level with the same stated behavior?
    - **Upgrade check**: is there a concrete behavior-stated reason requiring one higher level?
  - In Pass 2, do not introduce new hypothetical facts not present in the behavior text.
  - Finalize the level only after both checks.
```

Append to `SELF-CHECK`:

```md
If downgrade and upgrade checks disagree, prefer the level supported by explicit behavior evidence, not hypothetical risk.
```

## Why This Could Escape the Local Maximum

This is a material process change that directly targets instability seen in mined justifications. Instead of trying to tune a single heuristic, it adds an explicit internal adversarial audit that can catch both known failure directions (speculative over-calls and missed necessary escalations).

It may improve robustness because the audit is symmetric, unlike prior edits that mainly pushed down or up.

## Scathing Critique

Two-pass reasoning can increase variance and latency; weaker runs may produce contradictory audits and unstable final choices. If the model does not faithfully follow "no hypothetical facts," this becomes extra prose with minimal effect.

This is high-effort and may be harder to isolate causally in evaluation.
