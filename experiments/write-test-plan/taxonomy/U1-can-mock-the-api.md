---
id: U1
name: "Can mock the API"
direction: under
predicted: Unit or Integration
ground_truth: Agentic
weight: 4
confusion_pair: Integration-Agentic
description: Model treats AI/LLM API calls as mockable services, missing that the mock hides non-deterministic model output.
self_aware: true
self_aware_note: Model often acknowledges the need for real AI in hedges then picks lower.
---
[run1] EC-04 b3 (Integration→Agentic): "Testing this invariant requires verifying module behavior across multiple invocations... We need to mock the API, make multiple calls, and verify both result consistency and API call frequency."
[run1] EC-04 b4 (Integration→Agentic): "We need to mock the API, track the request payload, and verify token consumption stays within the budget limit."
[run1] EC-10 b4 (Integration→Agentic): "You need to mock GitHub API, introduce failures in comment posting, and verify the summary doesn't include orphaned findings."
[run1] EC-17 b2 (Integration→Agentic): "Mocking the KB with predetermined results would only test the comparison logic in isolation."
[run1] EC-19 b3 (Integration→Agentic): "mocking the LLM to return code that will fail the tests... The test infrastructure and prompt construction are internal details we can verify without needing the real LLM."
[run1] EC-30 b3 (Integration→Agentic): "The algorithm's ranking logic must be tested against real browsing data and a real catalog."
[run1] EC-30 b5 (Integration→Agentic): "This is a behavioral requirement of the algorithm itself. Unit tests of the algorithm's pure logic could pass."
[run1] EC-07 b3 (Unit→Agentic): "If the generator is deterministic (rule-based or template-driven), a unit test can verify the logic."
[run1] EC-13 b1 (System→Agentic): "we need the real vision model... The end-to-end pipeline must be tested to ensure safety."
[run2] EC-04 b3 (Unit→Agentic): "We can mock the external API to return different values on successive calls. A mock is sufficient because the failure is in the module's logic, not the API's behavior."
[run2] EC-10 b4 (Integration→Agentic): "A pure in-process mock of GitHub could hide failures if you don't validate what actually gets posted."
[run2] EC-19 b3 (Integration→Agentic): "This can be caught at Integration level by mocking both LLM calls and intercepting/verifying the arguments to the second call."
[run2] EC-30 b3 (Integration→Agentic): "Algorithm logic could be correct in isolation, but real failure is whether browsing history is actually loaded."
[run2] EC-30 b5 (Integration→Agentic): "Diversity algorithm logic could exist but not be invoked. Need to verify diversity logic is wired into the main recommendation flow."
[run3] EC-04 b3 (Unit→Agentic): "The primary failure mode is missing or broken caching logic. A Unit test mocking the API can verify that identical inputs trigger a cache hit."
[run3] EC-04 b4 (Unit→Agentic): "The failure mode is missing or broken budget enforcement. This is testable at Unit level: mock the API to return specific token counts."
[run3] EC-10 b4 (Integration→Agentic): "This is about orchestration and state consistency. You need integration-level verification that orchestrates both components."
[run3] EC-19 b3 (Integration→Agentic): "Must test that the exact failure messages flow from test execution → prompt construction → next LLM invocation. Requires mocking LLM."
[run3] EC-25 b2 (Integration→Agentic): "Testing pattern detection requires the real risk model — mocking it to always return 'fraud=true' would pass even if the model is broken."
[run3] EC-30 b3 (Integration→Agentic): "A unit test of the weighting formula alone could pass while the real system fails if browsing data retrieval is broken."
[run3] EC-30 b5 (Integration→Agentic): "The failure mode is the algorithm defaulting to all categories from browsing history or lacking the diversity mechanism entirely."
