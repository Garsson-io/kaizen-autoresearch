---
id: U3
name: "Integration suffices for external services"
direction: under
predicted: Integration
ground_truth: System
weight: 3
confusion_pair: Integration-System
description: Model claims module wiring catches the failure when real subprocess/HTTP/OS is needed. INCREASED from 8→13 after mock-exposes-nothing — the mock question may reinforce "mocking doesn't hide this, so Integration is fine" for System behaviors.
note: Now the HIGHEST-FREQUENCY under-prediction pattern (was U2). The mock question helped Agentic but hurt System.
---
EC-02 b3: "Integration test with real, non-mocked background processing and wall-clock timing measurement catches this. Requires no subprocess."
EC-03 b4: "Only a real git repository with known changes can catch discrepancies between the tool's counts and reality."
EC-07 b5: "Mocking the file system would miss real disk/permission failures; mocking the scheduler would hide retry logic bugs."
EC-12 b3: "Must run the actual pipeline on large real data, with memory and timing measurements, to catch streaming failures."
EC-12 b4: "Must use a boto3-compatible mock (e.g., moto)... Note: System level provides even higher confidence but is slower."
EC-13 b4: "The system resilience logic can be verified by mocking the vision model to fail. The failure mode is in application logic, not the model service."
EC-14 b1: "This can be caught by mocking the speech-to-text API response. The service logic is deterministic."
EC-14 b4: "This does not require real API calls if fixtures accurately represent the API's segment structure."
EC-18 b5: "A minimum of Integration-level testing with a controlled but realistic data source at target throughput."
EC-24 b2: "Mocking the API to return 503 is sufficient to verify fallback is triggered without hiding real failures."
EC-27 b4: "Testing with a stubbed geocoding API... and verifying the full pipeline catches real integration failures."
EC-29 b3: "Integration testing with validated mocks ensures the request contract matches the real API spec."
EC-29 b4: "Testing 'continues the intake' requires verifying downstream steps still execute. Integration reveals flow breakage."
