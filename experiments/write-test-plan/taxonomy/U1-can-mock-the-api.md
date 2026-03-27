---
id: U1
name: "Can mock the API"
direction: under
predicted: Unit or Integration
ground_truth: Agentic
weight: 4
confusion_pair: Integration-Agentic
description: Model treats AI/LLM API calls as mockable external services, missing that the mock hides non-deterministic model output. After minimize-bias-reframe, predictions moved from Unit to Integration but still not Agentic.
self_aware: true
self_aware_note: Model often acknowledges the need for real AI in hedges then picks lower. New sub-pattern — picks System instead of Agentic when it recognizes AI is involved.
---
EC-04 b3 (Integration→Agentic): "Testing this invariant requires verifying module behavior across multiple invocations... We need to mock the API, make multiple calls, and verify both result consistency and API call frequency."
EC-04 b4 (Integration→Agentic): "We need to mock the API, track the request payload, and verify token consumption stays within the budget limit."
EC-07 b3 (Unit→Agentic): "If the generator is deterministic (rule-based or template-driven), a unit test can verify the logic without external dependencies." — hedges on WHETHER it's AI
EC-10 b4 (Integration→Agentic): "You need to mock GitHub API, introduce failures in comment posting, and verify the summary doesn't include orphaned findings."
EC-13 b1 (System→Agentic): "we need the real vision model... The end-to-end pipeline must be tested to ensure safety." — KNOWS it needs real AI, picks System not Agentic
EC-17 b2 (Integration→Agentic): "Mocking the KB with predetermined results would only test the comparison logic in isolation." — knows mocking is wrong, still picks Integration
EC-19 b3 (Integration→Agentic): "mocking the LLM to return code that will fail the tests... The test infrastructure and prompt construction are internal details we can verify without needing the real LLM."
EC-30 b3 (Integration→Agentic): "A unit test of the weighting formula alone won't catch failures where browsing data isn't queried, not merged into the score."
EC-30 b5 (Integration→Agentic): "A unit test of the diversity function alone won't catch failures where the algorithm doesn't invoke the diversity logic."
