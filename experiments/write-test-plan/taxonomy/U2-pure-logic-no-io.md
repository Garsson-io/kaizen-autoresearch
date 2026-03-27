---
id: U2
name: "Pure logic, no I/O needed"
direction: under
predicted: Unit
ground_truth: Integration
weight: 2
confusion_pair: Unit-Integration
description: Model classifies multi-module wiring as pure function logic testable with mocks. Slightly increased from 8→9 after mock-exposes-nothing.
---
EC-03 b3: "This is error handling for a specific git state error. A mock of git returning 'fatal:...' is sufficient."
EC-08 b2: "This tests the retry mechanism. A mocked API that returns 429 once then success is sufficient."
EC-08 b3: "Quota exhaustion is detected by the API response. Mocking captures the response recognition and error return logic."
EC-17 b4: "This is pure business logic: verify that send_email() is blocked when approval_given=false."
EC-18 b1: "The failure mode is algorithmic: incorrect grouping logic. A pure in-process test with mock log entries can reliably catch these."
EC-18 b2: "The core failure mode is in the ordering algorithm. A Unit test with mock entries at various timestamps catches these."
EC-18 b3: "The failure mode is in the detection logic: p99 calculation incorrect. A Unit test with mock latency data can verify."
EC-25 b4: "The flagging decision is pure in-process logic: (scoring_flagged OR risk_flagged) → held_for_review."
EC-25 b5: "Output structure and field assembly is pure in-process logic with no I/O."
