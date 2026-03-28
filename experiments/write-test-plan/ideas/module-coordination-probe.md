---
id: module-coordination-probe
title: Add "Think: coordination" probe under MOCK-MISS to catch Unit->Integration errors
status: proposed
effort: low
expected_impact: high
targets:
  - unit_integration_confusion
confusion_pairs:
  - Unit-Integration
change_type: addition
risk: May cause some correct Unit predictions to flip to Integration (increase O1)
prereqs: null
related: [variance-probe-question, counterfactual-mock, seam-map-cross-check]
---

## Steelman

U2 ("Pure logic, no I/O") is the second-highest impact failure pattern (impact 34, 17 occurrences). The model sees retry logic, validation, error handling, queue forwarding, and thinks "pure function logic testable in isolation." But the behavior actually tests how modules coordinate: data flows from module A to B, errors propagate across boundaries, side effects trigger in the right order.

The variance-probe-question succeeded (loss delta -6.24) by adding a single "Think:" line under LLM-DEP that forced the model to reason about non-determinism before classifying. The same pattern can target U2: add a "Think:" line under MOCK-MISS that forces the model to distinguish "one function's logic" from "module coordination."

The key distinction the model misses: if the behavior's correctness depends on data flowing correctly between two or more modules (e.g., webhook validation -> queue forwarding, retry logic -> actual API client -> error propagation), that's Integration even if each module's logic is individually simple. The test needs the modules wired together to catch wiring bugs.

Representative U2 failures that this would catch:
- EC-02 b1: "Signature validation and queue forwarding can be tested in isolation with mocked queue" -- but the behavior IS the coordination between validation and forwarding
- EC-08 b2: "Retry-and-replay logic can be tested with mocked API and mocked timer" -- but the behavior is the interaction between retry, API client, and timer
- EC-25 b4: "Pure orchestration logic that combines two model outputs" -- orchestration IS coordination

This follows the proven pattern: low-effort single-line addition, targets a specific taxonomy pattern, adds a reasoning probe rather than changing the classification framework.

## Scathing Critique

O1 ("Needs real wiring") is already the most frequent error by count (22 occurrences) -- the model ALREADY over-predicts Integration for Unit behaviors. Adding a probe that says "think about module coordination" could make this worse. The model might read "does this involve coordination?" and answer "yes" for everything, since almost all software involves some coordination.

The U2 pattern may also be partly a GT issue rather than a prompt issue. Some of those 17 cases may genuinely be debatable -- "queue forwarding with mocked queue" is a reasonable Unit argument. Pushing the model toward Integration on borderline cases trades U2 errors for O1 errors, which may not net improve loss.

Also, the variance probe worked because the Unit/Agentic distinction is sharp (deterministic vs non-deterministic). The Unit/Integration distinction is inherently fuzzier -- "how many modules" is a gradient, not a binary. A reasoning probe may not help when the underlying concept is ambiguous.
