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
{"run":"run-014020","task":"EC-14","b":1,"pred":"Agentic","gt":"System","w":3,"j":"The failure is primarily whether a real speech-to-text model correctly performs diarization/speaker labeling on real meeting audio. A stubbed transcript would hide diarization failures. Rejected Workflow: behavior text is about preserving labels in STT output; it does not require validating multiple model decisions in sequence if the assertion is made at the STT output boundary."}

{"run":"run-002056","task":"EC-04","b":6,"pred":"Agentic","gt":"System","w":3,"j":"This requires real provider call and real provider token accounting; mocks can always return in-budget usage and hide real overruns. Per rule, execution through real AI/ML API defaults to Agentic even with deterministic assertion. Workflow not needed: single model call measurement. Higher level rejected: Workflow disqualified because behavior text does not describe multiple agentic stages. Adversarial critique: one could argue System since this checks API metering/infrastructure rather than model decision quality."}

{"run":"run-002056","task":"EC-14","b":1,"pred":"Agentic","gt":"System","w":3,"j":"Real failure boundary is model output quality from the speech-to-text/diarization model (LLM-DEP yes). A stubbed transcript with perfect labels would hide diarization failures (MOCK-HIDE yes). System concerns (HTTP call) exist, but correctness here is about who the model says spoke, so Agentic is the minimum. Adversarial critique: if this were only testing that the service passes through an already-labeled transcript unchanged, Integration would be enough; behavior text explicitly requires STT output preserving labels, which keeps it Agentic. Rejected higher level (Workflow): behavior text targets one model stage (STT labeling), not a required multi-agentic chain."}

{"run":"run-010159","task":"EC-14","b":1,"pred":"Agentic","gt":"System","w":3,"j":"The failure boundary is the real speech-to-text model’s diarization/label quality. A stubbed transcript would hide label-loss or speaker-mix errors. Not Workflow because this behavior targets one model output property (speaker labels), not multi-agentic stage correctness."}

