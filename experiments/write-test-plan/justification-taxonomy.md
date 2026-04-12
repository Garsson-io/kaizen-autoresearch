# Justification Taxonomy — Treatment Prompt Failure Analysis

Generated from 30-task corpus (165 behaviors with ground truth), 2026-03-27.

## Summary

| | Count | % |
|--|-------|---|
| Correct | 103 | 62% |
| Under-predicted | 40 | 24% |
| Over-predicted | 22 | 13% |

**Under:Over ratio**: 1.8:1 — systematic minimize bias confirmed.

### Per-level accuracy

| GT Level | Correct | Wrong | Accuracy | Weight | Weighted impact of errors |
|----------|---------|-------|----------|--------|--------------------------|
| Unit | 31 | 22 | 58% | 1 | 22 |
| Integration | 35 | 17 | 67% | 2 | 34 |
| System | 14 | 10 | 58% | 3 | 30 |
| **Agentic** | **18** | **10** | **64%** | **4** | **40** |
| Workflow | 5 | 3 | 63% | 4 | 12 |

**Highest-impact errors**: Agentic (40), Integration (34), System (30). Agentic errors are the single biggest drag on the weighted score.

### Impact-ranked failure patterns

| Rank | Pattern | Impact | Freq | Description |
|------|---------|--------|------|-------------|
| 1 | U1: "Can mock the API" | 40 | 10 | Agentic behaviors predicted as Unit/Integration |
| 2 | U2: "Pure logic, no I/O" | 34 | 17 | Integration behaviors predicted as Unit |
| 3 | U3: "Integration suffices" | 30 | 10 | System behaviors predicted as Integration |
| 4 | O1: "Needs real wiring" | 22 | 22 | Unit behaviors predicted as Integration |
| 5 | U4: "Single step enough" | 12 | 3 | Workflow behaviors predicted as Agentic/System |
| 6 | O2: "Needs external service" | 8 | 4 | Integration predicted as System |
| 7 | O3: "Needs real AI" | 6 | 3 | Integration/System predicted as Agentic |

---

## Under-prediction patterns (40 total)

### U1: "Can mock the API" — 10 Agentic misses, impact 40

**Predicted**: Unit or Integration | **GT**: Agentic
**The excuse**: "We can mock the external API / LLM to return controlled responses and test the logic."
**Why it's wrong**: Mocking an AI/LLM removes the non-determinism that IS the failure mode. A mock always returns the same label; the real model may classify differently each time.

**Affected tasks**: EC-04 (b3,b4), EC-10 (b4), EC-11 (b3), EC-17 (b2), EC-19 (b3), EC-25 (b2), EC-30 (b3,b5)

**Representative quotes**:
- EC-04 b3: "We can test caching by mocking the API and verifying it is called only once... (Note: to verify true LLM consistency independent of caching, Agentic-level tests with real API calls would be required, but the minimum to catch 'caching is broken' is Unit.)"
- EC-11 b3: "We can mock the LLM to return controlled responses (one deliberately formal, one casual) and verify the real tone-checking logic correctly identifies and reacts to them."
- EC-19 b3: "We need to verify that test failure output is correctly captured and included in the next LLM prompt. This can be tested at Integration level by... mocking the second LLM call."

**Self-awareness**: In 4 of 10 cases, the model explicitly acknowledges the Agentic need in parentheticals or hedges, then selects a lower level. This is the minimize bias in action — the "choose the LOWEST" instruction overrides the model's own correct reasoning.

### U2: "Pure logic, no I/O needed" — 17 Integration misses, impact 34

**Predicted**: Unit | **GT**: Integration
**The excuse**: "This is pure validation/retry/error-handling logic that can be tested with mocks."
**Why it's wrong**: The behavior tests module wiring, not isolated functions. Real failures emerge from how modules interact (DB writes, queue operations, file I/O).

**Affected tasks**: EC-02 (b1,b4,b5), EC-03 (b1), EC-04 (b5), EC-08 (b2,b3), EC-09 (b5), EC-10 (b1), EC-17 (b4), EC-20 (b5), EC-25 (b4,b5) + others

**Representative quotes**:
- EC-02 b1: "Signature validation and queue forwarding can be tested in isolation with mocked queue."
- EC-08 b2: "The core retry-and-replay logic can be tested in-process with a mocked API and mocked timer."
- EC-25 b4: "Tests pure orchestration logic that combines two model outputs with Boolean OR. No external I/O."

### U3: "Integration suffices for external services" — 10 System misses, impact 30

**Predicted**: Integration | **GT**: System
**The excuse**: "The failure can be caught by wiring modules together. No real subprocess, network, or external service needed."
**Why it's wrong**: The behavior involves real HTTP calls, subprocess spawning, or OS behavior that Integration mocks would hide.

**Affected tasks**: EC-02 (b3), EC-03 (b4), EC-07 (b5), EC-13 (b4), EC-14 (b4), EC-16 (b3), EC-20 (b4), EC-24 (b2), EC-27 (b4), EC-29 (b4)

**Representative quotes**:
- EC-02 b3: "Requires measurement of real HTTP response timing under contention."
- EC-16 b3: "Performance constraints require realistic file operations and API latency simulation."
- EC-27 b4: "Testing the service's resilience to geocoding failure requires wiring together the address handler, geocoding layer, optimization logic, and reporting."

### U4: "Single agentic step is enough" — 3 Workflow misses, impact 12

**Predicted**: Agentic or System | **GT**: Workflow
**The excuse**: "Testing with one real LLM call is sufficient" or "End-to-end but System-level."
**Why it's wrong**: The behavior requires MULTIPLE agentic steps where output of step N feeds step N+1.

**Affected tasks**: EC-07 (b4), EC-11 (b5), EC-14 (b5), EC-19 (b5)

**Representative quotes**:
- EC-07 b4: "An Integration test with mocked email would verify the script calls the email function."
- EC-19 b5: "This behavior fundamentally tests whether the iterative refinement loop actually works end-to-end with real LLM feedback."

---

## Over-prediction patterns (22 total)

### O1: "Needs real module wiring" — 22 Unit→Integration, impact 22

**Predicted**: Integration | **GT**: Unit
**The excuse**: "A pure Unit test could miss [unlikely edge case], so Integration is safer."
**Why it's wrong**: The behavior is testable at a single function boundary. The model adds unnecessary infrastructure.

This is the most frequent error by count but lowest impact per instance (Unit weight=1).

### O2: "Needs real external service" — 4 Integration→System, impact 8

**Predicted**: System | **GT**: Integration
**The excuse**: "Real HTTP/filesystem/subprocess needed" when local module wiring suffices.

### O3: "Needs real AI" — 3 lower→Agentic, impact 6

**Predicted**: Agentic | **GT**: Integration or System
**The excuse**: "This looks AI-related so must be Agentic" — but the behavior is actually deterministic.
The adversarial "misleading surface" tasks (EC-12, EC-16, EC-18) were designed to trigger this; the model correctly avoids most of them (88-100%).

---

## Key insights

1. **U1 is the highest-impact single pattern** (impact 40). The model treats AI/LLM APIs as ordinary external services and talks itself out of Agentic with "we can mock it."

2. **The minimize bias is real and measurable** — under:over ratio is 1.8:1. The "choose the LOWEST" instruction causes systematic under-prediction across all levels, not just Agentic.

3. **The model knows better than it acts** — in 4/10 U1 cases, the justification explicitly acknowledges "Agentic would be required" then picks lower. The knowledge is there; the framing suppresses it.

4. **Over-predictions are mostly harmless** — O1 (Unit→Integration) is the most common error by count but only impact 22 because Unit has weight 1. Fixing under-predictions has ~5x more score impact than fixing over-predictions.

5. **Adversarial misleading-surface tasks work** — the model correctly identifies non-Agentic behaviors that look Agentic (EC-12, EC-16, EC-18 score 88-100%). The failure is specifically at the boundary where the behavior IS Agentic but the model rationalizes it isn't.

6. **Workflow is rare and hard** — 8 Workflow behaviors in corpus, 5 correct (63%). The model predicts Agentic instead of Workflow, missing the multi-step aspect.

---

## Ideas targeting each pattern

| Pattern | Impact | Top ideas |
|---------|--------|-----------|
| U1 | 40 | minimize-bias-reframe, mock-exposes-nothing, ai-api-equals-agentic-rule, determinism-test |
| U2 | 34 | explicit-cost-of-error, anti-deferral-gate |
| U3 | 30 | observable-behavior-framing, counterfactual-mock |
| O1 | 22 | strip-to-bare-minimum (removing guidance may reduce over-prediction) |
| U4 | 12 | challenge-your-choice, top-down-elimination |

---

## 2026-04-12 Audit Addendum (iterations 63-74)

Scope: 12 latest iterations (63-74), 843 unique error entries after de-duplicating repeated iteration/run-dir combinations.

### Dominant "excuse families" that lacked proper routing

1. `Agentic->Integration` (18 lines, weighted impact 36)
- Recurring excuse: "real AI call on path + semantic behavior => Agentic minimum."
- Dominant behaviors: `EC-21 b5` (11), `EC-15 b4` (7).
- New rule home: O3 (`Looks like AI so must be Agentic`).

2. `Workflow->System` (15 lines, weighted impact 45)
- Recurring excuse: "MULTI-STEP + LLM-DEP + end-to-end pipeline => Workflow."
- Dominant behaviors: `EC-13 b4` (8), `EC-15 b5` (7).
- New rule home: O4 (`Workflow overreach from pipeline breadth`).

3. `Agentic->Unit` (10 lines, weighted impact 10)
- Recurring excuse: "embedding/model output contract must be real Agentic even for deterministic shape assertions."
- Dominant behavior: `EC-15 b1` (10).
- New rule home: O3 (same overreach family as above).

### Codified routing updates

- Expanded O3 confusion pairs:
  - `Agentic-System` -> `Agentic-System, Agentic-Integration, Agentic-Unit`
- Expanded O4 confusion pairs:
  - `Workflow-Agentic` -> `Workflow-Agentic, Workflow-System`
- Reprocessed unmatched taxonomy lines:
  - moved 34 lines to O3/O4
  - unmatched reduced to 0
