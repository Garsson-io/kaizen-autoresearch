---
id: U1
name: "Can mock the API"
direction: under
predicted: Unit or Integration
ground_truth: Agentic
weight: 4
confusion_pair: Integration-Agentic
description: Model treats AI/LLM API calls as mockable services. Improved from 10→4 after mock-exposes-nothing question, but still the highest-weight under-prediction.
self_aware: true
---
EC-04 b3 (Unit→Agentic): "We can mock the external API to return different values on successive calls, then verify the module still returns the same result. A mock is sufficient because the failure is in the module's logic, not the API's behavior."
EC-10 b4 (Integration→Agentic): "A pure in-process mock of GitHub could hide failures if you don't validate what actually gets posted."
EC-19 b3 (Integration→Agentic): "This can be caught at Integration level by mocking both LLM calls and intercepting/verifying the arguments to the second call."
EC-30 b3 (Integration→Agentic): "Algorithm logic could be correct in isolation, but real failure is whether browsing history is actually loaded, aggregated correctly, and integrated into the ranking formula."
EC-30 b5 (Integration→Agentic): "Diversity algorithm logic could exist but not be invoked. Need to verify diversity logic is wired into the main recommendation flow."
