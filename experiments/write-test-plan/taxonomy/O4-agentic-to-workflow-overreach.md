---
id: O4
name: "Agentic assumed to require Workflow"
direction: over
predicted: Workflow
ground_truth: Agentic
weight: 4
confusion_pair: Agentic-Workflow
description: Model upgrades single-step model-quality checks to multi-step workflow without evidence of sequential agentic dependency.
---
[run-203945] EC-32 b4 (Agentic→Workflow): "This is a true causality check that behavior quality depends on real skill context. Correctness depends on real model responses..."
[run6] EC-32 b4 (Agentic→Workflow) [w=4]
  J: "The intended failure is that behavior quality regresses when skill context regresses, under the same prompt. That depends on real model behavior changing with context, which stubs can mask (MOCK-HIDE). REAL-INFRA may be present, but the decisive boundary is LLM-dependent output quality. MULTI-STEP: single behavior check, so Agentic not Workflow. Rejection gate: Workflow rejected because behavior text describes one prompt/response behavioral check, not multiple agentic stages."

