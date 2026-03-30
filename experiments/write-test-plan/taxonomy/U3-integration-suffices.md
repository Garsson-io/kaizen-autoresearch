---
id: U3
name: "Integration suffices for external services"
direction: under
predicted: Integration
ground_truth: System
weight: 3
confusion_pair: Integration-System
description: Model claims module wiring catches the failure when real subprocess/HTTP/OS is needed.
note: Increased from 8→13 after mock-exposes-nothing — the mock question reinforces "mocking doesn't hide this, so Integration is fine."
---
[run1] EC-02 b3: "The real failure is timing-related: the handler blocks on slow downstream work. You must actually run slow downstream code and measure response latency."
[run1] EC-12 b4: "The retry logic needs to be tested within the context of the full pipeline."
[run1] EC-13 b4: "The failure is the system's error-handling logic. Integration level is sufficient because we're testing how modules interact with simulated failures."
[run1] EC-18 b5: "The real failure is throughput collapse under load. Must test the actual pipeline with real 10,000 entries."
[run1] EC-20 b4: "Real manifest file I/O is needed, but no GitHub API calls are required."
[run1] EC-20 b5: "The flag logic must be wired to the PR creation decision, and the GitHub API call must be mocked."
[run1] EC-24 b2: "Catching real failures requires testing both the API error path AND the fallback integration."
[run1] EC-27 b4: "Testing the service's resilience to geocoding failure requires wiring together the address handler, geocoding layer, optimization logic, and reporting."
[run1] EC-29 b4: "Tests interaction between the API call layer, the error handler, and the intake flow."
[run2] EC-02 b3: "Integration test with real, non-mocked background processing and wall-clock timing measurement catches this. Requires no subprocess."
[run2] EC-03 b4: "Only a real git repository with known changes can catch discrepancies between the tool's counts and reality."
[run2] EC-07 b5: "Mocking the file system would miss real disk/permission failures; mocking the scheduler would hide retry logic bugs."
[run2] EC-12 b3: "Must run the actual pipeline on large real data, with memory and timing measurements, to catch streaming failures."
[run2] EC-12 b4: "Must use a boto3-compatible mock (e.g., moto)... Note: System level provides even higher confidence but is slower."
[run2] EC-13 b4: "The system resilience logic can be verified by mocking the vision model to fail. The failure mode is in application logic."
[run2] EC-14 b1: "This can be caught by mocking the speech-to-text API response. The service logic is deterministic."
[run2] EC-14 b4: "This does not require real API calls if fixtures accurately represent the API's segment structure."
[run2] EC-18 b5: "A minimum of Integration-level testing with a controlled but realistic data source at target throughput."
[run2] EC-24 b2: "Mocking the API to return 503 is sufficient to verify fallback is triggered without hiding real failures."
[run2] EC-27 b4: "Testing with a stubbed geocoding API... and verifying the full pipeline catches real integration failures."
[run2] EC-29 b3: "Integration testing with validated mocks ensures the request contract matches the real API spec."
[run2] EC-29 b4: "Testing 'continues the intake' requires verifying downstream steps still execute. Integration reveals flow breakage."
[run3] EC-03 b4 (Integration→System): "This is a correctness oracle test that cannot be validated with mocked git output. Must create a real repository."
[run3] EC-07 b5 (Integration→System): "Unit tests mocking email success never test the error path and fallback mechanism."
[run3] EC-12 b3 (Integration→System): "A unit test with mocked file I/O could not reveal real memory-usage patterns or actual processing time."
[run3] EC-12 b4 (Integration→System): "The retry logic sits inside the full pipeline, wired between the S3 client, batch processor, and error handler."
[run3] EC-24 b2 (Integration→System): "A unit test with mocked API and mocked database would only verify exception-handling logic flow."
[run3] EC-29 b3 (Integration→System): "The behavior requires verifying two distinct operations: sending correct data and interpreting the response."
[run3] EC-29 b4 (Integration→System): "The behavior requires testing that error handling correctly manages API failures and allows the pipeline to continue."
[run5] EC-02 b4 (Integration→System): "A single-request Unit test cannot reveal concurrency bottlenecks, serialization bugs, or lock contention."
[run5] EC-06 b3 (Integration→System): "Verifying dedup handles real OS-level duplicate events requires Integration testing. OS behavior emitting multiple events per change cannot be simulated."
[run5] EC-06 b4 (Integration→System): "Error recovery when the watched directory is deleted requires real filesystem state changes. OS errors (ENOENT from fs.watch) cannot be unit-mocked."
[run5] EC-06 b6 (Integration→System): "File write completion detection depends on filesystem state (file size, modification time, file handle status). Real file I/O is necessary."
[run5] EC-10 b2 (Integration→System): "Diff-relative line numbering differs from absolute file line numbers. Simple Unit mock assigns wrong line numbers."
[run5] EC-12 b3 (Integration→System): "Real failure modes depend on actual I/O: whether S3 streaming is properly implemented vs. loading entire files into memory."
[run5] EC-12 b4 (Integration→System): "Retry and backoff with real S3 or LocalStack catches real service behavior. Mock misses edge cases."
[run5] EC-13 b5 (Integration→System): "Error-handling logic and retry queue: mocking the vision model to fail is sufficient — but the model picks Integration when System is needed."
[run5] EC-14 b1 (Integration→System): "The failure boundary is parsing real speech-to-text API response format. A mock always returning the right format hides real parsing bugs."
[run5] EC-14 b4 (Integration→System): "Correct splitting (timestamp boundaries), sequential processing (context passing): requires real API segment structure."
[run5] EC-20 b7 (Integration→System): "Review flag surfaced in scanner output requires testing the full pipeline with real scan output."
[run5] EC-24 b2 (Integration→System): "The real failure is that the fallback translation itself fails in ways only observable with real HTTP."
[run5] EC-27 b4 (Integration→System): "Skip logic integration with downstream route optimization — cannot catch if Travelling Salesman logic ignores skipped nodes."
[run5] EC-29 b3 (Integration→System): "Two modules (API client + response parser) depend on external I/O. Unit test cannot verify request formatting correctness."
[run5] EC-29 b4 (Integration→System): "Error handling across the API client and orchestration layers: unit test of a single error handler misses cross-layer failures."
[run5] EC-30 b8 (Integration→System): "Unit test on 100 products passes; production with 100k products times out. Real failure observable only at scale."
[run6] EC-12 b4 (Integration→System) [w=3]
  J: "Core failure is retry-policy wiring between S3 client wrapper, backoff policy, and batch controller (module boundary). This can be caught with deterministic stubbed S3 responses (503 then success) and clock/backoff assertions; real network is not required for this specific behavior (INTEGRATION-BRAKE a=no). No AI dependence (b=no) and no multi-agent chain (c=no). Rejected higher level: System is disqualified because behavior text targets retry logic on a known status code, not network stack variability."

[run6] EC-13 b5 (Integration→System) [w=3]
  J: "Failure boundary is local module interaction: classifier error handling -> retry queue -> approval gate. This can be caught by wiring modules with a failing model client stub. INTEGRATION-BRAKE: (a) real OS/network is not strictly required to reproduce the contract failure; (b) no dependence on real AI output quality; (c) no multi-agentic sequence. Rejected System because behavior text focuses on fallback state transition ('queued for retry rather than auto-approved'), not environment-specific transport quirks."

[run6] EC-20 b7 (Integration→System) [w=3]
  J: "Failure appears at orchestration boundary between breaking-change decision, PR module invocation suppression, and output/reporting state propagation (MOCK-MISS yes). Can be caught with in-process wiring and a fake PR client; no real OS/network needed for this behavior itself (INTEGRATION-BRAKE a=no). No AI output dependence (b=no) and no multi-agent chain (c=no). Rejected System: behavior text is conditional control-flow and local output, not real repository creation."

[run6] EC-24 b2 (Integration→System) [w=3]
  J: "Failure appears at module handoff: API client error handling -> fallback translator selection -> response shaping. An in-process stub returning 503 is sufficient to reproduce this contract failure; real network/OS is not required. INTEGRATION-BRAKE: (a) no real OS/network/subprocess required by behavior text, (b) no AI quality dependency, (c) no multi-agentic chain. Rejected System because behavior text specifies handling a 503 response, not environment-dependent network behavior (timeouts/sockets/load)."

[run6] EC-27 b4 (Integration→System) [w=3]
  J: "Real failure appears at module handoff boundaries: geocoding result handling -> stop filtering -> optimizer input -> skipped-address reporting. A unit test of any single function could miss orchestration defects. System was considered but rejected because the behavior text targets logical handling of a known API response shape ('returns no results'), which can be reproduced with an in-process geocoder stub; no environment-dependent HTTP behavior is required. No AI/ML dependency."

[run6] EC-31 b4 (Integration→System) [w=3]
  J: "Failure is at local component contract/state boundary: trigger metadata reconstruction plus persistence writer. Needs multi-module wiring with local filesystem write/read, but no real network/subprocess/model output. Rejected System because behavior text requires persistence of identifier, not OS-dependent runtime behavior."

[run6] EC-31 b5 (Integration→System) [w=3]
  J: "This is an inter-module local contract test (writer hook ↔ reader/enforcer hook). It requires wiring both hooks against shared local state format. Rejected Agentic/Workflow because no AI step exists; rejected System because behavior text does not require real OS/network/subprocess effects beyond local file handoff."

[run6] EC-32 b3 (Integration→System) [w=3]
  J: "This is a wiring/provenance failure mode across loader + harness + test configuration. MOCK-MISS: a single-function test cannot prove context source-of-truth is file-backed rather than hard-coded. INTEGRATION-BRAKE: (a) no required real OS/network/subprocess beyond normal local file reads, so not System minimum; (b) correctness here is about context loading path, not model output quality, so not Agentic minimum; (c) no multi-agent chain, so not Workflow."

[run6] EC-34 b2 (Integration→System) [w=3]
  J: "This behavior is mainly module wiring: startup flow consumes computed branch state and emits a warning payload/message. Integration is enough to catch real failures in handoff/formatting. I considered System, but rejected it because the behavior text does not require real OS/session bootstrap mechanics; an in-process startup entrypoint test can reproduce the failure. No AI output dependency."

[run6] EC-34 b5 (Integration→System) [w=3]
  J: "Core failure is local contract/state mismatch: detector must correctly combine branch divergence/age with PR status categories (`open`, `merged`). This can be caught by wiring detector + PR-state adapter with realistic fixtures. I considered System, but rejected it because the behavior text does not require live API/network; deterministic PR-state fixtures can expose the false-positive bug. No AI dependency."

