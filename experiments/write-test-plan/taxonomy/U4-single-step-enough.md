---
id: U4
name: "Single agentic step is enough"
direction: under
predicted: Agentic or System
ground_truth: Workflow
weight: 4
confusion_pair: Agentic-Workflow, System-Workflow, Integration-Workflow
description: Model treats multi-step agentic pipelines as single-call Agentic or System. Reduced from 4→2 after minimize-bias-reframe.
---
EC-07 b4 (System→Workflow): "This is an end-to-end test that exercises the full pipeline: data collection, summary generation, and email delivery. System-level testing ensures the report actually reaches an email system."
EC-11 b5 (Agentic→Workflow): "To catch real failures in the regeneration quality and actual triggering, the test must make real LLM calls for both the initial response and the regeneration."
[run3] EC-07 b4 (System→Workflow): "Mocking email delivery verifies the code calls the API but misses real infrastructure failures."
[run3] EC-11 b5 (Integration→Workflow): "This requires wiring response handler, state management, and regeneration orchestration."
[run3] EC-29 b10 (Agentic→Workflow): "The behavior requires testing the complete pipeline with real patient data, including the symptom triage LLM call."
[run6] EC-32 b4 (Agentic→Workflow) [w=4]
  J: "The intended failure is that behavior quality regresses when skill context regresses, under the same prompt. That depends on real model behavior changing with context, which stubs can mask (MOCK-HIDE). REAL-INFRA may be present, but the decisive boundary is LLM-dependent output quality. MULTI-STEP: single behavior check, so Agentic not Workflow. Rejection gate: Workflow rejected because behavior text describes one prompt/response behavioral check, not multiple agentic stages."

[run6] EC-07 b4 (System→Workflow) [w=4]
  J: "The failure boundary includes real external interactions (source APIs and email delivery/inbox reception). In-process fakes can miss transport/auth/delivery-path issues. Agentic was considered, but behavior correctness here is delivery to inbox, not model output quality; summary content can be validated separately."

[run6] EC-10 b5 (System→Workflow) [w=4]
  J: "Behavior explicitly requires a real pull request and end-to-end execution over external APIs, so REAL-INFRA makes System the minimum. Rejected Agentic as minimum: behavior text checks completion of sequence on a real PR, not quality/non-deterministic correctness of model outputs. Rejected Workflow: text does not require multiple real agentic steps; it specifies operational completion of pipeline stages."

[run6] EC-11 b5 (Integration→Workflow) [w=4]
  J: "This is an orchestration/state-exposure contract across local modules (generation, tone gate, response selector/output). Deterministic stubs can force 'reject then regenerate' and verify only final response is returned, so real model quality is not required. Higher levels are disqualified by behavior text: no requirement for real OS/network/subprocess failure mode, and no need for multi-agentic quality checks."

[run6] EC-33 b4 (Integration→Workflow) [w=4]
  J: "Core failure is orchestration state integrity: finalize step must verify a newer review round tied to updated diff exists. This can be caught with deterministic round metadata and timestamps/hash linkage across modules. Agentic/Workflow were considered but rejected by behavior text: it requires that a "fresh review-agent round is executed" (execution evidence), not that model output quality be evaluated; no need for non-deterministic LLM assertions."

[run6] EC-33 b5 (Integration→Workflow) [w=4]
  J: "This is a state-machine/policy decision across round counter + findings status + outcome emitter. Needs module wiring to reproduce the real bug class. Higher levels rejected: behavior text is deterministic policy ("rounds are exhausted" + "unresolved MUST-FIX"), not real OS/network/subprocess behavior, not model-quality dependent, and not inherently requiring multi-agent non-deterministic sequencing."

[run7] EC-07 b4 (System→Workflow) [w=4]
  J: "The failure boundary includes real external interactions (source APIs and email delivery/inbox reception). In-process fakes can miss transport/auth/delivery-path issues. Agentic was considered, but behavior correctness here is delivery to inbox, not model output quality; summary content can be validated separately."

[run7] EC-10 b5 (System→Workflow) [w=4]
  J: "Behavior explicitly requires a real pull request and end-to-end execution over external APIs, so REAL-INFRA makes System the minimum. Rejected Agentic as minimum: behavior text checks completion of sequence on a real PR, not quality/non-deterministic correctness of model outputs. Rejected Workflow: text does not require multiple real agentic steps; it specifies operational completion of pipeline stages."

[run7] EC-11 b5 (Integration→Workflow) [w=4]
  J: "This is an orchestration/state-exposure contract across local modules (generation, tone gate, response selector/output). Deterministic stubs can force 'reject then regenerate' and verify only final response is returned, so real model quality is not required. Higher levels are disqualified by behavior text: no requirement for real OS/network/subprocess failure mode, and no need for multi-agentic quality checks."

[run7] EC-32 b4 (Agentic→Workflow) [w=4]
  J: "The intended failure is that behavior quality regresses when skill context regresses, under the same prompt. That depends on real model behavior changing with context, which stubs can mask (MOCK-HIDE). REAL-INFRA may be present, but the decisive boundary is LLM-dependent output quality. MULTI-STEP: single behavior check, so Agentic not Workflow. Rejection gate: Workflow rejected because behavior text describes one prompt/response behavioral check, not multiple agentic stages."

[run7] EC-33 b4 (Integration→Workflow) [w=4]
  J: "Core failure is orchestration state integrity: finalize step must verify a newer review round tied to updated diff exists. This can be caught with deterministic round metadata and timestamps/hash linkage across modules. Agentic/Workflow were considered but rejected by behavior text: it requires that a "fresh review-agent round is executed" (execution evidence), not that model output quality be evaluated; no need for non-deterministic LLM assertions."

[run7] EC-33 b5 (Integration→Workflow) [w=4]
  J: "This is a state-machine/policy decision across round counter + findings status + outcome emitter. Needs module wiring to reproduce the real bug class. Higher levels rejected: behavior text is deterministic policy ("rounds are exhausted" + "unresolved MUST-FIX"), not real OS/network/subprocess behavior, not model-quality dependent, and not inherently requiring multi-agent non-deterministic sequencing."

