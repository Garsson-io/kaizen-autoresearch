---
id: U4
name: "Single agentic step is enough"
direction: under
predicted: Agentic or System
ground_truth: Workflow
weight: 4
confusion_pair: Agentic-Workflow
description: Model treats multi-step agentic pipelines as single-call Agentic or System, missing that output of step N feeds step N+1.
---
EC-07 b4: "This is an end-to-end test that exercises the full pipeline: data collection, summary generation, and email delivery. System-level testing ensures the report actually reaches an email system."
EC-11 b5: "The real failures are: (1) the system returns the first response instead of the second, (2) the tone-check never triggers with real responses, (3) the regeneration prompt is broken. To catch real failures the test must make real LLM calls for both the initial response and the regeneration."
