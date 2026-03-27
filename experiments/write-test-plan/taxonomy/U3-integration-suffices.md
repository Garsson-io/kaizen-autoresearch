---
id: U3
name: "Integration suffices for external services"
direction: under
predicted: Integration
ground_truth: System
weight: 3
confusion_pair: Integration-System
description: Model claims module wiring catches the failure when real subprocess, HTTP, or OS behavior is needed. Reduced from 10→8 after minimize-bias-reframe.
---
EC-02 b3: "The real failure is timing-related: the handler blocks on slow downstream work. You must actually run slow downstream code and measure response latency."
EC-12 b4: "The retry logic needs to be tested within the context of the full pipeline."
EC-13 b4: "The failure is the system's error-handling logic. Integration level is sufficient because we're testing how modules interact with simulated failures."
EC-18 b5: "The real failure is throughput collapse under load. Must test the actual pipeline with real 10,000 entries."
EC-20 b4: "Real manifest file I/O is needed, but no GitHub API calls are required."
EC-20 b5: "The flag logic must be wired to the PR creation decision, and the GitHub API call must be mocked."
EC-24 b2: "Catching real failures requires testing both the API error path AND the fallback integration."
EC-27 b4: "Real failure boundary spans the geocoding client and service error-handling logic."
