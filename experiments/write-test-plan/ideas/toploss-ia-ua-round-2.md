---
id: toploss-ia-ua-round-2
title: Round 2 targeted IA/UA demotion guard variant family
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - System-Agentic
change_type: meta-cognitive
risk: Could over-escalate Agentic when behavior wording is vague.
prereqs: Must preserve explicit plumbing-only exception.
related: [reject-higher-must-justify, deterministic-assertion-trap-block]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Target top weighted-loss pairs (Integration->Agentic, Unit->Agentic) with explicit demotion-proof rules.

## Steelman

Forces quoted evidence before choosing below Agentic in AI-dependent behaviors.

## Scathing Critique

May over-call Agentic if proofs are too strict.
