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
{"run":"1","task":"EC-01","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"Testing config merge logic: given a config value from file and an env var, verify env var wins. This is pure in-process logic with no I/O."}
{"run":"1","task":"EC-02","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"The behavior is a straightforward conditional: IF queue is at capacity THEN return 503 with Retry-After ELSE enqueue."}
{"run":"1","task":"EC-08","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"Rate-limit detection and auto-replay is library logic. Mock the API to return a single 429 response, then success on the next attempt."}
{"run":"1","task":"EC-08","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"Quota exhaustion detection and error handling are error-path logic. Mock the API to signal exhaustion."}
{"run":"1","task":"EC-18","b":1,"pred":"Unit","gt":"Integration","w":2,"j":"The core failure here is grouping logic on trace ID fields. A pure in-process test with a list of log objects can verify this works correctly."}
{"run":"1","task":"EC-18","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"The failure is in the ordering/sorting logic when timestamps from different sources differ by up to 500ms. This is a pure algorithmic problem."}
{"run":"1","task":"EC-18","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"The failure is in the statistical analysis: incorrectly computing p99. This is pure math on a set of latency values."}
{"run":"1","task":"EC-25","b":4,"pred":"Unit","gt":"Integration","w":2,"j":"This is pure decision logic that combines two boolean signals. Both model outputs can be mocked without loss of coverage."}
{"run":"1","task":"EC-25","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"Tests output structure and field presence only. No external I/O, logic, or state dependency."}
{"run":"2","task":"EC-03","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"This is error handling for a specific git state error. A mock of git returning 'fatal:...' is sufficient."}
{"run":"2","task":"EC-08","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"This tests the retry mechanism. A mocked API that returns 429 once then success is sufficient."}
{"run":"2","task":"EC-08","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"Quota exhaustion is detected by the API response. Mocking captures the response recognition and error return logic."}
{"run":"2","task":"EC-17","b":4,"pred":"Unit","gt":"Integration","w":2,"j":"This is pure business logic: verify that send_email() is blocked when approval_given=false."}
{"run":"2","task":"EC-18","b":1,"pred":"Unit","gt":"Integration","w":2,"j":"The failure mode is algorithmic: incorrect grouping logic. A pure in-process test with mock log entries can reliably catch these."}
{"run":"2","task":"EC-18","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"The core failure mode is in the ordering algorithm. A Unit test with mock entries at various timestamps catches these."}
{"run":"2","task":"EC-18","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"The failure mode is in the detection logic: p99 calculation incorrect. A Unit test with mock latency data can verify."}
{"run":"2","task":"EC-25","b":4,"pred":"Unit","gt":"Integration","w":2,"j":"The flagging decision is pure in-process logic: (scoring_flagged OR risk_flagged) → held_for_review."}
{"run":"2","task":"EC-25","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"Output structure and field assembly is pure in-process logic with no I/O."}
{"run":"3","task":"EC-01","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"Path resolution is deterministic logic that runs before any file I/O."}
{"run":"3","task":"EC-01","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"The merge logic (environment variable priority over file value) is a pure data transformation with no I/O side effects."}
{"run":"3","task":"EC-01","b":4,"pred":"Unit","gt":"Integration","w":2,"j":"Error message construction is in-process logic."}
{"run":"3","task":"EC-04","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"The failure mode is missing retry logic on rate-limit errors. Testable at Unit level: mock the API to raise a rate-limit error."}
{"run":"3","task":"EC-09","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"The behavior is about loader control flow: which plugins are initialized after one fails."}
{"run":"5","task":"EC-01","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"This is precedence logic: read two sources (file and environment), apply a rule (env overrides file), and return the result. No file I/O required."}
{"run":"5","task":"EC-02","b":1,"pred":"Unit","gt":"Integration","w":2,"j":"Signature validation is pure cryptographic logic (HMAC-SHA256) with no I/O or external dependencies."}
{"run":"5","task":"EC-02","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"This is a control-flow and ordering guarantee: await queue.enqueue() must complete before res.send(200). Testable at Unit by mocking."}
{"run":"5","task":"EC-02","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"The real failure is the handler incorrectly awaiting downstream work before returning. The failure is observable with a mock."}
{"run":"5","task":"EC-04","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"The failure mode is missing retry logic: the module doesn't detect rate-limit errors. A unit test can mock the API to raise a rate-limit error."}
{"run":"5","task":"EC-06","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"The deduplication logic is independent of actual filesystem watching. By mocking duplicate events with controlled timing, a Unit test suffices."}
{"run":"5","task":"EC-06","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"The ordering logic is independent of filesystem operations. Mocked file metadata with various creation timestamps is sufficient."}
{"run":"5","task":"EC-08","b":3,"pred":"Unit","gt":"Integration","w":2,"j":"After a 429, the client retries the request and surfaces the success. A Unit test mocks the API to return 429 once, then success."}
{"run":"5","task":"EC-08","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"The retry logic terminates under adversarial input (API always returns 429). A Unit test with a tight timeout catches this."}
{"run":"5","task":"EC-09","b":5,"pred":"Unit","gt":"Integration","w":2,"j":"Error handling and conditional plugin loading are pure logic. The test can mock multiple plugins where one onLoad throws."}
{"run":"5","task":"EC-10","b":1,"pred":"Unit","gt":"Integration","w":2,"j":"Input filtering logic (reading diff vs. full file) is testable by mocking the GitHub API to return known diff content."}
{"run":"5","task":"EC-23","b":4,"pred":"Unit","gt":"Integration","w":2,"j":"Merge logic is deterministic. Conflicting assessments injected via mocked results verify the merge rule."}
{"run":"5","task":"EC-28","b":7,"pred":"Unit","gt":"Integration","w":2,"j":"Cross-sheet reference resolution is in-memory logic. Multiple sheets can coexist in memory without I/O."}
{"run":"6","task":"EC-06","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"Failure boundary is local decision logic (same path + time window) and does not require OS/network/subprocess. MOCK-MISS: behavior can be fully exercised at function/object boundary with a fake clock. INTEGRATION-BRAKE check: no real infra required, no AI output, no multi-step agent chain. Rejected higher levels: behavior text is specifically \"deduplication logic\" for repeated request by path/time window, which is deterministic and local."}
{"run":"7","task":"EC-06","b":2,"pred":"Unit","gt":"Integration","w":2,"j":"Failure boundary is local decision logic (same path + time window) and does not require OS/network/subprocess. MOCK-MISS: behavior can be fully exercised at function/object boundary with a fake clock. INTEGRATION-BRAKE check: no real infra required, no AI output, no multi-step agent chain. Rejected higher levels: behavior text is specifically \"deduplication logic\" for repeated request by path/time window, which is deterministic and local."}
