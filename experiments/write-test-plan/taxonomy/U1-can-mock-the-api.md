---
id: U1
name: "Can mock the API"
direction: under
predicted: Unit or Integration
ground_truth: Agentic
weight: 4
confusion_pair: System-Agentic
description: Model treats AI/LLM API calls as ordinary external services that can be fully mocked, missing that the mock hides non-deterministic model output.
self_aware: true
self_aware_note: In 4/10 cases the model acknowledges Agentic is needed in parentheticals then picks lower anyway.
---
EC-04 b3: "Testing this invariant requires verifying module behavior across multiple invocations and tracking the interaction with the external API... We need to mock the API, make multiple calls, and verify both result consistency and API call frequency."
EC-04 b4: "Testing the token budget enforcement requires verifying the actual request payload sent to the API (or mocked API)... We need to mock the API, track the request payload, and verify token consumption stays within the budget limit."
EC-10 b4: "The failure boundary is in the orchestration between comment posting and summary generation... You need to mock GitHub API, introduce failures in comment posting, and verify the summary doesn't include orphaned findings."
EC-17 b2: "The real failure boundary is whether the consistency checker actually detects contradictions when querying a real knowledge base. Mocking the KB with predetermined results would only test the comparison logic in isolation."
EC-19 b3: "The real failure is that when code fails tests, we don't include the failure output in the refinement prompt... We can catch this by: (a) mocking the LLM to return code that will fail the tests."
EC-30 b3: "The algorithm's ranking logic must be tested against real browsing data and a real catalog to catch failures like: browsing history not loaded, signal not applied, or weighting incorrect."
EC-30 b5: "This is a behavioral requirement of the algorithm itself. Unit tests of the algorithm's pure logic could pass while the algorithm, when run against real data, fails to produce diverse results."
