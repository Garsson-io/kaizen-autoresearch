---
id: integration-contract-invariant-gate
title: Require a concrete cross-module contract/invariant for Integration
status: proposed
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
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Steelman

Current failures suggest the model often equates "multiple modules exist in this feature" with Integration, even when the specific behavior is a local algorithm check. A stronger discriminator is to require a concrete **cross-module contract/invariant** to justify Integration: mapping correctness across boundaries, ordering propagation, transaction coupling, or state handoff semantics.

This idea is stronger than prior failed Unit-leaning guards because it does not add broad "treat as Unit" language. It tightens the positive evidence required for Integration instead of anchoring downward directly. That should reduce speculative "could miss wiring" rationales while preserving escalation routes for System/Agentic/Workflow.

## Scathing Critique

"Contract/invariant" may be too abstract and could be interpreted inconsistently by the model. If the behavior text is short, the model may fail to detect an implicit contract and under-call Integration. This could reintroduce U2-style misses in a different form.

If implemented poorly, this could become another wording-heavy concept that looks precise to humans but does not produce stable classifier behavior under noisy prompt following.

