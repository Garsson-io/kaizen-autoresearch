---
id: toploss-ia-ua-round-1
title: Round 1 targeted IA/UA demotion guard variant family
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
explore_status: no-signal
explore_tasks: [ec-03, ec-08, ec-27, ec-24, ec-32, ec-29]
explore_baseline_loss: 84.02
explore_loss: null
explore_delta: null
explore_date: 2026-04-10
---

## Core idea

Target top weighted-loss pairs (Integration->Agentic, Unit->Agentic) with explicit demotion-proof rules.

## Steelman

Forces quoted evidence before choosing below Agentic in AI-dependent behaviors.

## Scathing Critique

May over-call Agentic if proofs are too strict.

## Epistemological status

Explore subset (stratified): `ec-03, ec-08, ec-27, ec-24, ec-32, ec-29`  
Baseline subset loss: `84.02`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1 | 90.5984 | +6.5743 | improved 1, hurt 2, flat 3 | n/a |
| v1-demotion-proof | 85.3198 | +1.2957 | improved 1, hurt 2, flat 3 | n/a |
| v2 | 104.1401 | +20.1160 | improved 0, hurt 3, flat 3 | n/a |
| v2-rejection-evidence | 91.6414 | +7.6173 | improved 0, hurt 2, flat 4 | n/a |
| v3 | 88.7607 | +4.7366 | improved 1, hurt 2, flat 3 | n/a |
| v3-unit-brake | 93.9128 | +9.8887 | improved 0, hurt 1, flat 5 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
