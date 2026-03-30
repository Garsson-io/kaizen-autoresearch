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
{"run":"pre-schema","task":"EC-13","b":3,"pred":"Agentic","gt":"System","w":3,"j":"Vision model content analysis"}
{"run":"pre-schema","task":"EC-19","b":1,"pred":"Agentic","gt":"System","w":3,"j":"Code generation setup"}
{"run":"pre-schema","task":"EC-21","b":5,"pred":"Agentic","gt":"System","w":3,"j":"Sentiment aggregation"}
{"run":"6","task":"EC-14","b":1,"pred":"Agentic","gt":"System","w":3,"j":"The real failure boundary is STT diarization quality (LLM-DEP equivalent for speech model output): mocked transcripts hide mislabeled/missing speakers. Integration alone is insufficient because the core risk is model output correctness, not just local handoff. Workflow was considered, but the behavior text centers on STT output preservation; a single real-model step plus attribution assertions is enough to catch the target failure."}
{"run":"7","task":"EC-14","b":1,"pred":"Agentic","gt":"System","w":3,"j":"The real failure boundary is STT diarization quality (LLM-DEP equivalent for speech model output): mocked transcripts hide mislabeled/missing speakers. Integration alone is insufficient because the core risk is model output correctness, not just local handoff. Workflow was considered, but the behavior text centers on STT output preservation; a single real-model step plus attribution assertions is enough to catch the target failure."}
