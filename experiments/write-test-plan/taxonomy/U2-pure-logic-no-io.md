---
id: U2
name: "Pure logic, no I/O needed"
direction: under
predicted: Unit
ground_truth: Integration
weight: 2
confusion_pair: Unit-Integration
description: Model classifies multi-module wiring as pure function logic testable with mocks, missing that real module interaction (DB, queue, filesystem) is the failure boundary.
---
EC-01 b3: "Testing config merge logic: given a config value from file and an env var, verify env var wins. This is pure in-process logic with no I/O."
EC-02 b5: "The behavior is a straightforward conditional: IF queue is at capacity THEN return 503 with Retry-After ELSE enqueue."
EC-08 b2: "Rate-limit detection and auto-replay is library logic. Mock the API to return a single 429 response, then success on the next attempt."
EC-08 b3: "Quota exhaustion detection and error handling are error-path logic. Mock the API to signal exhaustion, then verify the library throws QuotaExhaustedError."
EC-18 b1: "The core failure here is grouping logic on trace ID fields. A pure in-process test with a list of log objects can verify this works correctly."
EC-18 b2: "The failure is in the ordering/sorting logic when timestamps from different sources differ by up to 500ms. This is a pure algorithmic problem."
EC-18 b3: "The failure is in the statistical analysis: incorrectly computing p99, failing to detect the threshold. This is pure math on a set of latency values."
EC-25 b4: "This is pure decision logic that combines two boolean signals. Both model outputs can be mocked without loss of coverage."
EC-25 b5: "Tests output structure and field presence only. No external I/O, logic, or state dependency."
