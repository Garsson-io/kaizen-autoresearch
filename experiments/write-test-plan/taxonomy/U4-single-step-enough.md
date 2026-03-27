---
id: U4
name: "Single agentic step is enough"
direction: under
predicted: Agentic or System
ground_truth: Workflow
weight: 4
confusion_pair: Agentic-Workflow
description: Model treats multi-step agentic pipelines as single-call Agentic or System. Reduced from 4→2 after minimize-bias-reframe.
---
EC-07 b4 (System→Workflow): "This is an end-to-end test that exercises the full pipeline: data collection, summary generation, and email delivery. System-level testing ensures the report actually reaches an email system."
EC-11 b5 (Agentic→Workflow): "To catch real failures in the regeneration quality and actual triggering, the test must make real LLM calls for both the initial response and the regeneration."
