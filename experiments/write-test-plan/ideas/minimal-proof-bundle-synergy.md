---
id: minimal-proof-bundle-synergy
title: Minimal Proof Bundle Synergy (2-line evidence contract)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: framing
risk: Bundling may duplicate existing rules and create instruction fatigue.
prereqs: Bundle must replace scattered wording with one compact proof contract.
related: [behavior-quote-grounding-gate, lower-level-miss-proof-gate, no-generic-wiring-claims-rule, grounded-escalation-contract-suite]
explore_status: no-signal
explore_tasks: [ec-15, ec-10, ec-08, ec-36, ec-04, ec-34, ec-17, ec-14]
explore_baseline_loss: 86.92
explore_loss: null
explore_delta: null
explore_date: 2026-04-11
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
A compact two-line synergy contract can preserve the gains of multiple low-effort ideas without the fragility of large structural rewrites.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a `PROOF BUNDLE` block with exactly two lines:
  1. quote the behavior phrase that forces current level,
  2. state one adjacent lower-level miss and why generic wiring claims do not apply.
- Use this block only for decisions above Unit.

## Expected Signal
- Primary targets: adjacent confusion boundaries with history of generic rationale errors.
- Success pattern: distributed small gains that survive holdout.
- Failure pattern: redundant wording yields no incremental signal.

## Explore Plan
- v1: proof bundle for all above-Unit decisions.
- v2: proof bundle only for System/Agentic/Workflow.
- v3: proof bundle for top-loss pairs only.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological Status
Current status: explored (`no-signal`), not promoted.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 18 | explore/minimal-proof-bundle-synergy-* | no-signal | n/a | all variants regressed on stratified 8-task subset |

## Reusable Lesson
Scoped proof bundle (`v3`) was least harmful, but global bundle variants regressed heavily; this family needs explicit hardcase routing if retried.

## Epistemological status

Explore subset (stratified): `ec-15, ec-10, ec-08, ec-36, ec-04, ec-34, ec-17, ec-14`  
Baseline subset loss: `86.92`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-bundle-all-above-unit | 101.1273 | +14.2094 | improved 2, hurt 4, flat 2 | n/a |
| v2-bundle-high-level-only | 98.7644 | +11.8465 | improved 1, hurt 4, flat 3 | n/a |
| v3-bundle-toploss-only | 90.3115 | +3.3936 | improved 3, hurt 3, flat 2 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
