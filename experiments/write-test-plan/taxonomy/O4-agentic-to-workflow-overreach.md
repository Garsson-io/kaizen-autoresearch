---
id: O4
name: "Agentic assumed to require Workflow"
direction: over
predicted: Workflow
ground_truth: Agentic
weight: 4
confusion_pair: Workflow-Agentic
description: Model upgrades single-step model-quality checks to multi-step workflow without evidence of sequential agentic dependency.
---

{"run":"run-014020","task":"EC-13","b":6,"pred":"Workflow","gt":"Agentic","w":4,"j":"Requires repeated agentic decisions over time plus stateful consistency behavior within a window (e.g., cache/memoization/policy carryover). A single-call agentic test is insufficient to catch sequence consistency failures. Rejected lower Agentic-only level because behavior text requires multiple submissions \"multiple times within a short window,\" i.e., sequenced steps."}

{"run":"run-014020","task":"EC-19","b":2,"pred":"Workflow","gt":"Agentic","w":4,"j":"MOCK-MISS: this behavior spans generation, test execution, and retry orchestration. REAL-INFRA: test execution can be local, but the core risk is not OS-specific; it is iterative agent behavior. MOCK-HIDE/LLM-DEP: fixed stubs hide whether model outputs actually become correct. MULTI-STEP: explicitly includes \"first or a subsequent attempt,\" which requires sequential agentic decisions across attempts. REJECTION-GATE: rejected Agentic because behavior text requires success across iterative attempts, not just one model output."}

{"run":"run-002056","task":"EC-19","b":3,"pred":"Workflow","gt":"Agentic","w":4,"j":"Requires multiple real agentic steps (initial generation plus one or more refinements) and success depends on model adapting across attempts. Stubs hide the failure mode entirely. Adversarial critique: a deterministic scripted model sequence could emulate improvement, suggesting Integration; that would not validate real adaptation reliability, which behavior explicitly calls 'live iterative loop'. Rejection gate: Agentic rejected because behavior requires sequenced multi-step loop, not a single model decision."}

{"run":"run-002056","task":"EC-19","b":5,"pred":"Workflow","gt":"Agentic","w":4,"j":"Needs at least two real agentic generations with context carryover; correctness is the model's behavioral response to prior failure feedback. Mocked outputs can trivially differ and miss real non-response-to-feedback failures. Adversarial critique: textual difference alone could be tested with deterministic stubs (Integration); behavior explicitly says 'live attempt' and 'in response to prior failure context', which requires real model behavior across steps. Rejection gate: Agentic rejected because this is not one isolated generation; it is sequential adaptation across attempts."}

{"run":"run-010159","task":"EC-13","b":6,"pred":"Workflow","gt":"Agentic","w":4,"j":"MULTI-STEP applies: the behavior explicitly requires repeated submissions and consistency across multiple agentic decisions over time/window state. LLM-DEP also applies because 'borderline' consistency depends on real model behavior plus pipeline memory/cache/handoff. Rejected Agentic-only because a single-call agentic test cannot validate cross-submission consistency guarantees."}

{"run":"run-010159","task":"EC-19","b":3,"pred":"Workflow","gt":"Agentic","w":4,"j":"Requires multiple real agentic steps in sequence (generate -> test feedback -> refine -> retest). Mocking model outputs would hide the real recovery behavior. Rejected Agentic-only: behavior explicitly depends on iterative loop success across attempts, not one model call."}

{"run":"run-010159","task":"EC-19","b":5,"pred":"Workflow","gt":"Agentic","w":4,"j":"Needs sequential agentic dependence: second model output must reflect first failure context. A stub can force different code and hide whether context actually drives change. Rejected Agentic-only because behavior requires at least two linked model steps (initial + context-aware retry)."}

{"run":"run-011347","task":"EC-11","b":3,"pred":"Workflow","gt":"Agentic","w":4,"j":"MULTI-STEP + LLM-DEP: behavior requires a sequence of agentic decisions/actions (initial generation -> tone assessment -> regeneration trigger). Candidate Workflow test: run end-to-end with real model, seed prompts likely to produce formal draft for casual tier, assert tone-check flags it and second generation is invoked; catches failures in decision handoff and loop control. Adjacent Agentic single-step tone-classification test cannot verify that classification actually drives regeneration orchestration. REJECTION-GATE: Integration disqualified by behavior text 'identifies ... and triggers regeneration' because model-dependent identification governs next-step control flow."}

{"run":"run-011347","task":"EC-13","b":6,"pred":"Workflow","gt":"Agentic","w":4,"j":"MOCK-MISS: deterministic mocks hide the exact failure (decision drift across repeated real evaluations). REAL-INFRA: may involve cache/window behavior, but key boundary is repeated real model decisions plus pipeline handling. LLM-DEP: yes, borderline classification depends on real model behavior and potential nondeterminism. MULTI-STEP: explicitly multiple submissions/decisions in sequence within a time window, so Workflow. CANDIDATE-TEST-CHECK: Agentic candidate with one call cannot validate cross-run consistency; Workflow candidate submitting same image N times through full flow and checking stable decisions catches drift/race/cache failures. Rejection gate for Agentic: behavior text requires consistency across repeated submissions ('multiple times within a short window'), disqualifying single-step agentic scope."}

{"run":"run-011347","task":"EC-19","b":3,"pred":"Workflow","gt":"Agentic","w":4,"j":"Requires multiple real agentic steps in sequence (initial generation, failure-informed refinement(s), eventual pass). A single live call test cannot expose the iterative recovery behavior. Rejected lower level (Agentic): behavior explicitly requires loop success across attempts, not one model decision."}

{"run":"run-011347","task":"EC-19","b":5,"pred":"Workflow","gt":"Agentic","w":4,"j":"Needs at least two real agentic generations with state carryover (fail context -> revised code). Mocked model responses cannot validate genuine responsiveness to context. Rejected lower level (Agentic): behavior text requires sequenced comparison between attempts, i.e., multi-step agentic loop."}

