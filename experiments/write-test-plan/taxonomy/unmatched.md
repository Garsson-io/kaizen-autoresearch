---
confusion_pair: "(unmatched — no taxonomy file for these pairs yet)"
note: "Auto-accumulated unmatched taxonomy lines. After creating new taxonomy files or updating confusion_pair lists in existing files, run: npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched"
---

[run6] EC-07 b4 (System→Workflow) [w=4]
  J: "The failure boundary includes real external interactions (source APIs and email delivery/inbox reception). In-process fakes can miss transport/auth/delivery-path issues. Agentic was considered, but behavior correctness here is delivery to inbox, not model output quality; summary content can be validated separately."

[run6] EC-10 b5 (System→Workflow) [w=4]
  J: "Behavior explicitly requires a real pull request and end-to-end execution over external APIs, so REAL-INFRA makes System the minimum. Rejected Agentic as minimum: behavior text checks completion of sequence on a real PR, not quality/non-deterministic correctness of model outputs. Rejected Workflow: text does not require multiple real agentic steps; it specifies operational completion of pipeline stages."

[run6] EC-11 b5 (Integration→Workflow) [w=4]
  J: "This is an orchestration/state-exposure contract across local modules (generation, tone gate, response selector/output). Deterministic stubs can force 'reject then regenerate' and verify only final response is returned, so real model quality is not required. Higher levels are disqualified by behavior text: no requirement for real OS/network/subprocess failure mode, and no need for multi-agentic quality checks."

[run6] EC-14 b4 (Workflow→System) [w=3]
  J: "Failure requires chained behavior across multiple agentic steps (per-segment transcription/summarization + merge coherence). Single-step Agentic misses cross-segment drift, duplication, or contradiction introduced during sequential merge (MULTI-STEP => Workflow). System concerns may exist, but the defining risk is multi-step agentic composition."

[run6] EC-17 b3 (Agentic→Integration) [w=2]
  J: "MOCK-MISS: This behavior depends on generation behavior under missing-context conditions, not only deterministic control flow. REAL-INFRA: No OS/subprocess-specific artifact is required. MOCK-HIDE: A mocked generator can always return a disclaimer and hide hallucination/fabrication risk. LLM-DEP: 'rather than fabricating facts' is output-quality dependent and can vary across real model runs, so Agentic is needed. REJECTION-GATE: Workflow rejected because the behavior only requires validating this single generation outcome under empty KB context, not a full multi-step agent pipeline."

[run6] EC-19 b1 (Agentic→Unit) [w=1]
  J: "The failure boundary is the model’s real code-generation behavior: whether a real LLM reliably maps natural-language interface requirements to the correct signature. A deterministic stub can validate parser/validator wiring but can hide true signature-drift failures from model variability. Rejected lower level (Integration) because the behavior text is about the generated signature matching the NL spec, which is disqualified from pure wiring tests when model output quality is the target."

[run6] EC-21 b5 (Agentic→Integration) [w=2]
  J: "This behavior mixes integration contract (single response with both fields) plus semantic consistency between score and explanation direction. INTEGRATION-BRAKE(b): consistency check depends on real explanation content quality, so pure Integration is insufficient if explanation is model-generated. MULTI-STEP: one agentic generation plus deterministic scorer, not a multi-agentic chain, so not Workflow. REJECTION-GATE: Integration is only partially sufficient; behavior text requires explanation to reference same sentiment direction, which is content-level model output validation."

[run6] EC-30 b3 (Unit→Agentic) [w=4]
  J: "Behavior is core ranking logic (weighting by browsing signal) and can fail within one algorithm boundary without module interaction. MOCK-MISS: no required cross-module handoff described. Rejected Integration because behavior text focuses on ranking rule itself, not data plumbing."

[run6] EC-30 b5 (Unit→Agentic) [w=4]
  J: "This is an algorithmic constraint on output composition; can be validated directly in ranking/diversification logic with deterministic fixtures. No required module interaction or real infra in text. Rejected Agentic: no LLM/model quality dependency is described."

[run6] EC-32 b6 (Unit→Agentic) [w=4]
  J: "Core failure boundary is assertion logic correctness (schema/structure checks vs naive keyword matching). This can be tested with crafted outputs that include echoed keywords but wrong structure. No real infra required; no model non-determinism required. Rejection gate: Integration considered, but behavior text focuses on assertion semantics themselves, which are local logic."

[run6] EC-33 b4 (Integration→Workflow) [w=4]
  J: "Core failure is orchestration state integrity: finalize step must verify a newer review round tied to updated diff exists. This can be caught with deterministic round metadata and timestamps/hash linkage across modules. Agentic/Workflow were considered but rejected by behavior text: it requires that a "fresh review-agent round is executed" (execution evidence), not that model output quality be evaluated; no need for non-deterministic LLM assertions."

[run6] EC-33 b5 (Integration→Workflow) [w=4]
  J: "This is a state-machine/policy decision across round counter + findings status + outcome emitter. Needs module wiring to reproduce the real bug class. Higher levels rejected: behavior text is deterministic policy ("rounds are exhausted" + "unresolved MUST-FIX"), not real OS/network/subprocess behavior, not model-quality dependent, and not inherently requiring multi-agent non-deterministic sequencing."
