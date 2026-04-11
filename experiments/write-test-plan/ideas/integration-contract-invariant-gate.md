---
id: integration-contract-invariant-gate
title: Require a concrete cross-module contract/invariant for Integration
status: rejected
effort: low
expected_impact: high
targets:
  - unit_overprediction
  - integration_overprediction
confusion_pairs:
  - Unit-Integration
change_type: representational
risk: If phrased too strictly, true Integration behaviors described tersely may be pushed down to Unit.
prereqs: The prompt must preserve existing REAL-INFRA/LLM-DEP/MULTI-STEP escalation checks.
related: [mock-miss-scope-clarification, integration-middle-anchor, precision-failure-boundary]
explore_status: no-signal
explore_tasks: [ec-08, ec-03, ec-12, ec-27, ec-04, ec-09, ec-14, ec-32]
explore_baseline_loss: 89.90
explore_loss: null
explore_delta: null
explore_date: 2026-04-11
last_run: 20260410-235407
last_iteration: 63
last_outcome: discard
last_delta: 70.8144
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Steelman

Current failures suggest the model often equates "multiple modules exist in this feature" with Integration, even when the specific behavior is a local algorithm check. A stronger discriminator is to require a concrete **cross-module contract/invariant** to justify Integration: mapping correctness across boundaries, ordering propagation, transaction coupling, or state handoff semantics.

This idea is stronger than prior failed Unit-leaning guards because it does not add broad "treat as Unit" language. It tightens the positive evidence required for Integration instead of anchoring downward directly. That should reduce speculative "could miss wiring" rationales while preserving escalation routes for System/Agentic/Workflow.

## Scathing Critique

"Contract/invariant" may be too abstract and could be interpreted inconsistently by the model. If the behavior text is short, the model may fail to detect an implicit contract and under-call Integration. This could reintroduce U2-style misses in a different form.

If implemented poorly, this could become another wording-heavy concept that looks precise to humans but does not produce stable classifier behavior under noisy prompt following.

## Epistemological Status
Explore subset (stratified): `ec-08, ec-03, ec-12, ec-27, ec-04, ec-09, ec-14, ec-32`  
Baseline subset loss: `89.90`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-contract-required | 97.3218 | +7.4216 | improved 1, hurt 3, flat 4 | n/a |
| v2-contract-checklist | 100.8615 | +10.9614 | improved 2, hurt 3, flat 3 | n/a |
| v3-contract-negative | 96.8470 | +6.9469 | improved 0, hurt 3, flat 5 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

## Hypothesis

Require a concrete cross-module contract/invariant for Integration should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: If phrased too strictly, true Integration behaviors described tersely may be pushed down to Unit.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: no-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 63 | 20260410-235407 | discard | 70.8144 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
