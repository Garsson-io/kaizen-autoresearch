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
