---
id: O3
name: "Looks like AI so must be Agentic"
direction: over
predicted: Agentic
ground_truth: Integration or System
weight: 2
confusion_pair: Agentic-System
description: Model sees AI-related context and predicts Agentic, but the behavior being tested is actually about deterministic infrastructure around the AI call, not the model output itself.
note: The adversarial "misleading surface" tasks (EC-12, EC-16, EC-18) were designed to trigger this. The model mostly avoids it (88-100% on those tasks), so this is a minor pattern.
---
EC-13 b3: "Vision model content analysis" — predicted Agentic, GT says System (testing the API integration, not model quality)
EC-19 b1: "Code generation setup" — predicted Agentic, GT says Unit (testing the prompt construction, not the model output)
EC-21 b5: "Sentiment aggregation" — predicted Agentic, GT says Integration (aggregating scores is deterministic logic)
[run-203945] EC-32 b6 (Integration→Agentic): "Real failure often comes from interaction between extraction/parsing and assertion layers: echoed keywords can pass weak checks."
[run6] EC-04 b4 (System→Agentic) [w=4]
  J: "REAL-INFRA: this behavior is about actual token consumption against configured budget, which is tied to real provider accounting/HTTP response usage fields and can differ from local estimates. MOCK-HIDE: mocked usage counters can always pass and miss real over-budget calls caused by provider-side tokenization or request envelope effects. LLM-DEP: not primarily about semantic quality/classification accuracy; it is usage accounting, so Agentic is not strictly required as minimum. MULTI-STEP: no chained agentic pipeline. REJECTION-GATE: Agentic rejected because behavior text targets budget compliance ('number of tokens consumed ... within budget'), not subjective/model-quality correctness."

[run6] EC-19 b2 (System→Agentic) [w=4]
  J: "This behavior’s core failure can appear in real code execution and test-runner/process boundaries (compile/runtime errors, exit status handling, test invocation semantics), which in-process fakes can miss. Rejected higher level (Agentic) because this behavior can be validated with deterministic generated code fixtures (e.g., fail then pass) and does not require judging real model quality to verify pass-on-retry orchestration."

[run6] EC-14 b1 (Agentic→System) [w=3]
  J: "The real failure boundary is STT diarization quality (LLM-DEP equivalent for speech model output): mocked transcripts hide mislabeled/missing speakers. Integration alone is insufficient because the core risk is model output correctness, not just local handoff. Workflow was considered, but the behavior text centers on STT output preservation; a single real-model step plus attribution assertions is enough to catch the target failure."

