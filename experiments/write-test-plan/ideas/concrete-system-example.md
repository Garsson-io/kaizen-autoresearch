---
id: concrete-system-example
title: Add concrete System example inline with level definition (mirrors concrete-agentic-example)
status: proposed
effort: low
expected_impact: high
targets:
  - system_underprediction
confusion_pairs:
  - Integration-System
change_type: representational
risk: May push some correct Integration predictions up to System (O2 impact 8, low risk)
prereqs: null
related: [concrete-agentic-example, infra-probe-question, observable-behavior-framing]
---

## Steelman

U3 ("Integration suffices") is now the #1 error bucket by weighted impact (48 in run5, 16 errors). The model predicts Integration when GT is System. The model's reasoning pattern: "I can wire the modules together and mock the external service to return errors."

This is structurally identical to the U1 pattern that concrete-agentic-example fixed. Before that fix, the model said "I can mock the AI API" and picked Integration. The fix added a concrete example to the Agentic definition showing WHY mocking hides the real failure. Loss dropped -79.8.

The System definition has the same problem the Agentic definition had: it's abstract.

**Current System definition:**
```
System — subprocess, OS behavior, real HTTP, or real external API call
```

The model reads "real HTTP" and thinks "I'm testing HTTP error handling, not making real HTTP calls, so Integration." It doesn't connect "real HTTP" to "real failure modes that mocks hide" — just as it didn't connect "real LLM non-determinism" to "mocking hides variable classifications" before the Agentic fix.

**Proposed System definition:**
```
System — subprocess, OS behavior, real HTTP, or real external API call (e.g., a mock returning 503 tests your retry logic, but only real calls expose timeouts, TLS errors, and response formats that mocks don't reproduce)
```

This works because:
1. **Proven pattern**: Exact same structure as concrete-agentic-example (parenthetical example in LEVEL-DEFS)
2. **Directly addresses U3 mechanism**: 12 of 16 U3 errors involve the model saying "mock the API to fail" — this example names exactly why that mock hides the real failure
3. **Addition, not replacement**: Adds 22 words to an existing line. No restructuring.
4. **Low O2 risk**: O2 (Integration->System over-prediction) has only 7 errors (impact 14). The example specifically names failure modes (timeouts, TLS, response formats) that are clearly System-level, not Integration-level. Correct Integration predictions won't match these.

Representative U3 cases this should fix:
- EC-24 b2: "fallback translation fails in ways only observable with real HTTP" — mock returning 503 tests retry, not the fallback itself
- EC-14 b1: "parsing real speech-to-text API response format" — mock returning correct format hides parsing bugs
- EC-29 b3/b4: "real external API contract" / "real network failure handling"
- EC-06 b3/b4/b6: "real OS-level duplicate events" / "real filesystem state changes"

## Scathing Critique

The Agentic fix worked because it introduced a genuinely new concept: "a mock returns a fixed label but the real model may vary." This reframed the model's understanding of WHY mocking fails for AI calls — non-determinism.

For System, the "why mocking fails" is less clean. "Timeouts, TLS errors, and response formats" is a grab-bag of examples, not a single clean principle. The model might memorize these three failure modes and still miss others (e.g., connection pooling, DNS resolution, OS signal handling). The Agentic example worked because it named the principle (non-determinism); this example names symptoms.

Also, some U3 errors are borderline. EC-12 b4 ("retry with real S3 or LocalStack") — is LocalStack System or Integration? EC-27 b4 ("skip logic integration with downstream route optimization") — the System-ness here is about geocoding, not HTTP failure modes. The example may not help cases where the System need is domain-specific rather than infrastructure-specific.

Finally, the O2 risk is real even if small. EC-16 is an adversarial task where the model correctly picks Integration for something that sounds System-level. Adding "only real calls expose timeouts, TLS errors" might cause the model to over-predict System on EC-16's performance testing behavior.
