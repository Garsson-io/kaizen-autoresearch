---
id: U3
name: "Integration suffices for external services"
direction: under
predicted: Integration
ground_truth: System
weight: 3
confusion_pair: Integration-System
description: Model claims module wiring catches the failure when real subprocess, HTTP, or OS behavior is actually needed.
---
EC-02 b3: "The real failure is timing-related: the handler blocks on slow downstream work instead of returning immediately. Unit tests with mocked downstream can't measure wall-clock time."
EC-12 b4: "The retry logic needs to be tested within the context of the full pipeline. A Unit test of the retry function in isolation could miss failures where the pipeline doesn't invoke retry logic."
EC-13 b4: "The failure is the system's error-handling logic: does it queue for retry or auto-approve when the vision model fails? This can be tested by simulating vision model unavailability using mocks/stubs."
EC-18 b5: "Could a pure in-process mock miss this failure? Yes—mocking the I/O or concurrency could hide buffering issues. Must test the actual pipeline with real 10,000 entries."
EC-20 b4: "The failure boundary is whether the manifest write logic preserves the rest of the file. Real manifest file I/O is needed, but no GitHub API calls are required."
EC-20 b5: "The failure boundary is whether the breaking-change flag prevents PR creation. The flag logic must be wired to the PR creation decision."
EC-24 b2: "While the HTTP error handling logic could theoretically be mocked at the unit level, catching real failures requires testing both the API error path AND the fallback integration."
EC-27 b4: "Testing the service's resilience to geocoding failure requires wiring together the address handler, geocoding layer, optimization logic, and reporting."
EC-29 b4: "Tests interaction between the API call layer, the error handler, and the intake flow. A mock can simulate API unreachability to verify the system's fallback behavior."
