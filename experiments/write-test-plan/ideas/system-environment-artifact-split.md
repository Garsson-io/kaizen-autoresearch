---
id: system-environment-artifact-split
title: Split Integration vs System by environment-dependent failure artifacts
status: rejected
effort: low
expected_impact: high
targets:
  - integration_underprediction
  - system_underprediction
  - consistency_failures
confusion_pairs:
  - Integration-System
change_type: representational
risk: Could overemphasize environment language and miss local integration failures that mention APIs casually.
prereqs: Keep existing Unit-vs-Integration guards intact to avoid reopening Unit anchor drift.
related: [real-infra-fake-vs-real-gate, integration-middle-anchor, mock-miss-scope-clarification]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Steelman

Recent mined data shows bidirectional confusion between Integration and System. The prompt can make this boundary operational by asking what **failure artifact** would actually be observed.

If the failure is a local contract/state propagation mismatch between local components, it is Integration. If the failure depends on OS/process/network/external behavior and appears as environment-dependent artifacts (timeouts, subprocess exit behavior, socket/API variability, filesystem/runtime quirks), it is System.

This focuses on where failure manifests, not on superficial terms like "API" or "module," which should improve calibration on both directions of confusion.

## Scathing Critique

The artifact framing adds conceptual load and might be too advanced for brief behavior statements. The model may hallucinate artifacts and still over-escalate. Also, some behaviors truly span both local integration and environment interaction, so this rule may not resolve ambiguity cleanly without a tie-breaker.

