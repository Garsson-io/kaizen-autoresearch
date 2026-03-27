---
id: C1
name: "Correct level with sound reasoning"
direction: correct
predicted: matches GT
ground_truth: all levels
weight: all
description: Model correctly identifies the level AND gives a valid justification. These are the patterns to PRESERVE when changing the prompt.
note: Not all correct predictions are listed — only representative examples showing reasoning patterns worth protecting.
---
EC-01 b2: "Catching this requires verifying the loader actually loads from the correct filesystem location. Integration-level testing with a temp directory and actual file I/O is needed." — correct Integration
EC-06 b3: "This behavior requires actual filesystem operations at the OS level. A mock cannot simulate the real filesystem state changes." — correct System
EC-14 b2: "The correct identification and categorization of decisions depends on the real LLM's semantic understanding. An integration test with a mock LLM won't verify that the real LLM reliably separates decisions from narrative." — correct Agentic
EC-23 b1: "Correct clause extraction depends entirely on the LLM's semantic understanding of contract language. A mock extractor cannot validate that a real LLM correctly identifies all relevant clauses." — correct Agentic
EC-23 b5: "Multiple agentic steps where output feeds input — clause extraction, risk flagging, compliance check, summary generation." — correct Workflow
EC-29 b10: "Full pipeline with real LLM handoffs between stages." — correct Workflow
