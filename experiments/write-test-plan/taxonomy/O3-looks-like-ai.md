---
id: O3
name: "Looks like AI so must be Agentic"
direction: over
predicted: Agentic
ground_truth: Integration or System
weight: 2
confusion_pair: System-Agentic
description: Model sees AI-related context and predicts Agentic, but the behavior being tested is actually about deterministic infrastructure around the AI call, not the model output itself.
note: The adversarial "misleading surface" tasks (EC-12, EC-16, EC-18) were designed to trigger this. The model mostly avoids it (88-100% on those tasks), so this is a minor pattern.
---
EC-13 b3: "Vision model content analysis" — predicted Agentic, GT says System (testing the API integration, not model quality)
EC-19 b1: "Code generation setup" — predicted Agentic, GT says Unit (testing the prompt construction, not the model output)
EC-21 b5: "Sentiment aggregation" — predicted Agentic, GT says Integration (aggregating scores is deterministic logic)
[run-203945] EC-32 b6 (Integration→Agentic): "Real failure often comes from interaction between extraction/parsing and assertion layers: echoed keywords can pass weak checks."
