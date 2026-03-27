# Justification Taxonomy — Treatment Prompt Failure Analysis

Generated from 30-task corpus (197 behaviors), 2026-03-27.

**Counts**: 117 correct (59%), 42 under (21%), 38 over (19%)

---

## Under-prediction patterns (42 total)

These are cases where the model chose a LOWER level than ground truth. Sorted by frequency and impact.

### U1: "Can mock the API" (11 Agentic misses)

**Predicted**: Unit or Integration | **GT**: Agentic
**The excuse**: "We can mock the external API / LLM to return controlled responses and test the logic."
**Why it's wrong**: Mocking an AI/LLM removes the non-determinism that IS the failure mode. A mock always returns the same label; the real model may classify differently each time. The behavior's correctness depends on what the real model produces.
**Frequency**: 11 behaviors across EC-04, EC-10, EC-11, EC-17, EC-19, EC-25, EC-30
**Weight impact**: Very high — Agentic has weight 4, and these are the biggest score drag.

**Examples**:
- EC-04 b3: "We can test caching by mocking the API" (GT=Agentic — consistency requires real model)
- EC-11 b3: "Mock the LLM to return controlled responses" (GT=Agentic — tone detection needs real model)
- EC-25 b2: "Pattern detection requires analyzing transactions" (GT=Agentic — AI-based risk model)
- EC-30 b3,b5: "Algorithm ranking logic can be tested against real data" (GT=Agentic — AI recommendation)

**Self-awareness**: The model often ACKNOWLEDGES the Agentic need in parentheticals ("Agentic-level tests with real API calls would be required, but...") then picks a lower level anyway.

### U2: "Pure logic, no I/O needed" (12 Integration misses)

**Predicted**: Unit | **GT**: Integration
**The excuse**: "This is pure validation/retry/error-handling logic that can be tested with mocks."
**Why it's wrong**: The behavior tests module wiring, not isolated functions. Real failures emerge from how modules interact (DB writes, queue operations, file I/O), not from logic alone.
**Frequency**: 12 behaviors across EC-02, EC-04, EC-08, EC-09, EC-10, EC-17, EC-20, EC-25

**Examples**:
- EC-02 b1: "Signature validation can be tested with mocked queue" (GT=Integration — needs real queue wiring)
- EC-08 b2: "Retry-and-replay logic can be tested in-process with mocked API" (GT=Integration)
- EC-20 b5: "Compare version strings and set a flag — deterministic" (GT=System — needs real advisory API)

### U3: "Integration-level is sufficient for external services" (10 System misses)

**Predicted**: Integration | **GT**: System
**The excuse**: "The failure can be caught by wiring modules together. No real subprocess, network, or external service needed."
**Why it's wrong**: The behavior involves real HTTP calls, real subprocess spawning, or real OS behavior that Integration-level mocks would hide.
**Frequency**: 10 behaviors across EC-02, EC-03, EC-07, EC-13, EC-14, EC-16, EC-20, EC-24, EC-27, EC-29

**Examples**:
- EC-02 b3: "Requires measurement of real HTTP response timing" (classified Integration, GT=System)
- EC-07 b5: "Retry logic at Integration boundary" (GT=System — needs real file I/O + SMTP)
- EC-14 b4: "Splitting and merging logic can be validated at integration level" (GT=System)

### U4: "Single agentic step is enough" (4 Workflow misses)

**Predicted**: Agentic or System | **GT**: Workflow
**The excuse**: "Testing with one real LLM call is sufficient" or "This is end-to-end but System-level."
**Why it's wrong**: The behavior requires MULTIPLE agentic steps in sequence where output of step N feeds step N+1. A single call can't test the pipeline's coordination.
**Frequency**: 4 behaviors across EC-07, EC-11, EC-14, EC-19

**Examples**:
- EC-07 b4: "An Integration test with mocked email would verify..." (GT=Workflow — full report+send pipeline)
- EC-19 b5: "Need real LLM calls to verify iterative refinement" (predicted Agentic, GT=Workflow — generate/test/refine loop)
- EC-11 b5: "Testing response-selection logic in isolation" (GT=Workflow — draft/check/resend pipeline)

---

## Over-prediction patterns (38 total)

Cases where the model chose a HIGHER level than ground truth. Less harmful to sufficiency score but hurts precision.

### O1: "Needs real module wiring" (20 Unit→Integration)

**Predicted**: Integration | **GT**: Unit
**The excuse**: "A pure Unit test of [X] could miss [unlikely edge case], so Integration is safer."
**Why it's wrong**: The behavior is testable at a single function boundary. The model adds unnecessary infrastructure.
**Frequency**: 20 behaviors (most common over-prediction)

### O2: "Needs real external service" (4 Integration→System)

**Predicted**: System | **GT**: Integration
**The excuse**: "Real HTTP/filesystem/subprocess needed" when local module wiring suffices.
**Frequency**: 4 behaviors

### O3: "Needs real AI" (3 Integration/System→Agentic)

**Predicted**: Agentic | **GT**: Integration or System
**The excuse**: "This looks AI-related so must be Agentic" — but the behavior is actually deterministic.
**Frequency**: 3 behaviors. The adversarial "misleading surface" tasks were designed to trigger this.

---

## Correct prediction patterns (117 total)

### C1: Clean level match with sound reasoning (85)

The model correctly identifies the level AND gives a correct justification.

### C2: Correct level, questionable reasoning (32)

The model picks the right level but the justification is weak or partially wrong. These could easily flip to incorrect on a different run (noise source).

---

## Key insights for prompt improvement

1. **The #1 failure is U1 ("can mock the API")** — 11 Agentic misses, all weight-4. The model treats AI/LLM APIs as ordinary external services. It even acknowledges the Agentic need then talks itself down.

2. **The model has a systematic "minimize" bias** — the instruction "choose the LOWEST level" causes the model to rationalize why a lower level suffices, even when it knows better (see the parenthetical admissions in U1).

3. **Under > Over** — 42 under vs 38 over. The model under-predicts more than it over-predicts, consistent with the "minimize" bias.

4. **The adversarial "misleading surface" tasks work** — EC-12, EC-16, EC-18 (designed to look Agentic but be System/Integration) score 88-100%. The model correctly identifies these as NOT Agentic. So it's not blindly anchoring on surface cues — it's specifically failing on the Agentic/System boundary.

5. **Workflow is rare and hard** — only 5 Workflow behaviors in the corpus, 4 missed. The model almost never predicts Workflow.
