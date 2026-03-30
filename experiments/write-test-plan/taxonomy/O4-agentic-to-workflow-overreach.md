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

