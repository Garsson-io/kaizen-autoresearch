---
id: U2
name: "Pure logic, no I/O needed"
direction: under
predicted: Unit
ground_truth: Integration
weight: 2
confusion_pair: Unit-Integration
description: Model classifies multi-module wiring as pure function logic testable with mocks, missing that real module interaction is the failure boundary.
---
[run1] EC-01 b3: "Testing config merge logic: given a config value from file and an env var, verify env var wins. This is pure in-process logic with no I/O."
[run1] EC-02 b5: "The behavior is a straightforward conditional: IF queue is at capacity THEN return 503 with Retry-After ELSE enqueue."
[run1] EC-08 b2: "Rate-limit detection and auto-replay is library logic. Mock the API to return a single 429 response, then success on the next attempt."
[run1] EC-08 b3: "Quota exhaustion detection and error handling are error-path logic. Mock the API to signal exhaustion."
[run1] EC-18 b1: "The core failure here is grouping logic on trace ID fields. A pure in-process test with a list of log objects can verify this works correctly."
[run1] EC-18 b2: "The failure is in the ordering/sorting logic when timestamps from different sources differ by up to 500ms. This is a pure algorithmic problem."
[run1] EC-18 b3: "The failure is in the statistical analysis: incorrectly computing p99. This is pure math on a set of latency values."
[run1] EC-25 b4: "This is pure decision logic that combines two boolean signals. Both model outputs can be mocked without loss of coverage."
[run1] EC-25 b5: "Tests output structure and field presence only. No external I/O, logic, or state dependency."
[run2] EC-03 b3: "This is error handling for a specific git state error. A mock of git returning 'fatal:...' is sufficient."
[run2] EC-08 b2: "This tests the retry mechanism. A mocked API that returns 429 once then success is sufficient."
[run2] EC-08 b3: "Quota exhaustion is detected by the API response. Mocking captures the response recognition and error return logic."
[run2] EC-17 b4: "This is pure business logic: verify that send_email() is blocked when approval_given=false."
[run2] EC-18 b1: "The failure mode is algorithmic: incorrect grouping logic. A pure in-process test with mock log entries can reliably catch these."
[run2] EC-18 b2: "The core failure mode is in the ordering algorithm. A Unit test with mock entries at various timestamps catches these."
[run2] EC-18 b3: "The failure mode is in the detection logic: p99 calculation incorrect. A Unit test with mock latency data can verify."
[run2] EC-25 b4: "The flagging decision is pure in-process logic: (scoring_flagged OR risk_flagged) → held_for_review."
[run2] EC-25 b5: "Output structure and field assembly is pure in-process logic with no I/O."
[run3] EC-01 b2 (Unit→Integration): "Path resolution is deterministic logic that runs before any file I/O."
[run3] EC-01 b3 (Unit→Integration): "The merge logic (environment variable priority over file value) is a pure data transformation with no I/O side effects."
[run3] EC-01 b4 (Unit→Integration): "Error message construction is in-process logic."
[run3] EC-04 b5 (Unit→Integration): "The failure mode is missing retry logic on rate-limit errors. Testable at Unit level: mock the API to raise a rate-limit error."
[run3] EC-09 b5 (Unit→Integration): "The behavior is about loader control flow: which plugins are initialized after one fails."
[run5] EC-01 b3 (Unit→Integration): "This is precedence logic: read two sources (file and environment), apply a rule (env overrides file), and return the result. No file I/O required."
[run5] EC-02 b1 (Unit→Integration): "Signature validation is pure cryptographic logic (HMAC-SHA256) with no I/O or external dependencies."
[run5] EC-02 b2 (Unit→Integration): "This is a control-flow and ordering guarantee: await queue.enqueue() must complete before res.send(200). Testable at Unit by mocking."
[run5] EC-02 b3 (Unit→Integration): "The real failure is the handler incorrectly awaiting downstream work before returning. The failure is observable with a mock."
[run5] EC-04 b5 (Unit→Integration): "The failure mode is missing retry logic: the module doesn't detect rate-limit errors. A unit test can mock the API to raise a rate-limit error."
[run5] EC-06 b2 (Unit→Integration): "The deduplication logic is independent of actual filesystem watching. By mocking duplicate events with controlled timing, a Unit test suffices."
[run5] EC-06 b5 (Unit→Integration): "The ordering logic is independent of filesystem operations. Mocked file metadata with various creation timestamps is sufficient."
[run5] EC-08 b3 (Unit→Integration): "After a 429, the client retries the request and surfaces the success. A Unit test mocks the API to return 429 once, then success."
[run5] EC-08 b5 (Unit→Integration): "The retry logic terminates under adversarial input (API always returns 429). A Unit test with a tight timeout catches this."
[run5] EC-09 b5 (Unit→Integration): "Error handling and conditional plugin loading are pure logic. The test can mock multiple plugins where one onLoad throws."
[run5] EC-10 b1 (Unit→Integration): "Input filtering logic (reading diff vs. full file) is testable by mocking the GitHub API to return known diff content."
[run5] EC-23 b4 (Unit→Integration): "Merge logic is deterministic. Conflicting assessments injected via mocked results verify the merge rule."
[run5] EC-28 b7 (Unit→Integration): "Cross-sheet reference resolution is in-memory logic. Multiple sheets can coexist in memory without I/O."
