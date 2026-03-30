---
confusion_pair: "(unmatched — no taxonomy file for these pairs yet)"
note: "Auto-accumulated unmatched taxonomy lines. After creating new taxonomy files or updating confusion_pair lists in existing files, run: npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched"
---

[run6] EC-14 b4 (Workflow→System) [w=3]
  J: "Failure requires chained behavior across multiple agentic steps (per-segment transcription/summarization + merge coherence). Single-step Agentic misses cross-segment drift, duplication, or contradiction introduced during sequential merge (MULTI-STEP => Workflow). System concerns may exist, but the defining risk is multi-step agentic composition."

[run6] EC-17 b3 (Agentic→Integration) [w=2]
  J: "MOCK-MISS: This behavior depends on generation behavior under missing-context conditions, not only deterministic control flow. REAL-INFRA: No OS/subprocess-specific artifact is required. MOCK-HIDE: A mocked generator can always return a disclaimer and hide hallucination/fabrication risk. LLM-DEP: 'rather than fabricating facts' is output-quality dependent and can vary across real model runs, so Agentic is needed. REJECTION-GATE: Workflow rejected because the behavior only requires validating this single generation outcome under empty KB context, not a full multi-step agent pipeline."

[run6] EC-19 b1 (Agentic→Unit) [w=1]
  J: "The failure boundary is the model’s real code-generation behavior: whether a real LLM reliably maps natural-language interface requirements to the correct signature. A deterministic stub can validate parser/validator wiring but can hide true signature-drift failures from model variability. Rejected lower level (Integration) because the behavior text is about the generated signature matching the NL spec, which is disqualified from pure wiring tests when model output quality is the target."

[run6] EC-21 b5 (Agentic→Integration) [w=2]
  J: "This behavior mixes integration contract (single response with both fields) plus semantic consistency between score and explanation direction. INTEGRATION-BRAKE(b): consistency check depends on real explanation content quality, so pure Integration is insufficient if explanation is model-generated. MULTI-STEP: one agentic generation plus deterministic scorer, not a multi-agentic chain, so not Workflow. REJECTION-GATE: Integration is only partially sufficient; behavior text requires explanation to reference same sentiment direction, which is content-level model output validation."
