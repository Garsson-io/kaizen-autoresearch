---
id: grounded-escalation-contract-suite
title: Grounded Escalation Contract Suite (quote + miss-proof + anti-generic)
status: proposed
effort: high
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - unit_overprediction
  - system_underprediction
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - Integration-System
  - Unit-Integration
change_type: structural
risk: Rule stack may over-constrain terse behaviors and shift errors downward if exceptions are too narrow.
prereqs: Keep escape hatches explicit for terse but clearly boundary-level behaviors.
related: [behavior-quote-grounding-gate, lower-level-miss-proof-gate, no-generic-wiring-claims-rule, bidirectional-rejection-evidence-gate]
explore_status: no-signal
explore_tasks: [ec-36, ec-20, ec-27, ec-15, ec-02, ec-34, ec-14, ec-11]
explore_baseline_loss: 103.14
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
Combining three grounding constraints into one coherent contract should reduce ungrounded boundary jumps better than any single line: quote-evidence, lower-level-miss proof, and anti-generic-wiring guard.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- High-effort change: add a dedicated mini-block under KEY-QUESTIONS called `GROUNDING CONTRACT` with three required checks:
  1. quote the behavior phrase driving escalation,
  2. name one concrete miss at the lower adjacent level,
  3. disallow generic "could miss wiring" unless boundary language is present.
- Include one short exception clause for terse but explicit boundary behaviors.

## Expected Signal
- Primary targets: `Integration-Agentic`, `Unit-Agentic`, `Integration-System`, `Unit-Integration`.
- Success pattern: lower weighted loss on top adjacent pairs with fewer rationale shortcuts.
- Failure pattern: over-demotion due to strictness; increased `Agentic→Integration` or `System→Integration`.

## Explore Plan
- v1: strict full contract.
- v2: contract + relaxed quote rule (quote OR high-fidelity paraphrase).
- v3: contract only for System/Agentic/Workflow decisions.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological Status
Current status: explored (`no-signal`), not promoted.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 17 | explore/grounded-escalation-contract-suite-* | no-signal | n/a | all variants flat or worse on 8-task stratified subset |

## Reusable Lesson
Combined grounding contract can fix explicit workflow-trigger tasks (EC-11) but over-escalates on infra/orchestration-heavy boundaries (EC-14/EC-34); prefer scoped/selector variants over global contract.

## Epistemological status

Explore subset (stratified): `ec-36, ec-20, ec-27, ec-15, ec-02, ec-34, ec-14, ec-11`  
Baseline subset loss: `103.14`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-contract-strict | 110.2313 | +7.0888 | improved 2, hurt 4, flat 2 | n/a |
| v2-contract-quote-relaxed | 103.4500 | +0.3074 | improved 1, hurt 4, flat 3 | n/a |
| v3-contract-high-level-only | 135.6416 | +32.4990 | improved 1, hurt 4, flat 3 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.
