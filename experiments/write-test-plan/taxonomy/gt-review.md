# Ground Truth Review

Analysis of every behavior in the taxonomy where the model disagreed with GT.
Verdict: GT_CORRECT (keep GT), GT_WRONG (fix GT), DEBATABLE (flag for discussion).

Canonical policy for adjudication lives in `program.md`:
- "GT adjudication policy (agent disagreement vs GT)"
- Integration/System boundary uses the round-trip observability rule.
- Agentic/Workflow boundary uses single-step vs multi-step model dependence.

Recent adjudication updates (2026-04-11):
- **EC-19** relabeled to match clarified semantics:
  - b1 `Unit -> Agentic`
  - b3 `Agentic -> Workflow`
  - b5 `Agentic -> Workflow`
  - b6 `Unit -> Integration`
  - b7 `System -> Integration`
- **EC-29** updates:
  - b1 `Unit -> Integration`
  - b12 `System -> Integration`
  - split old b13 into:
    - b13 `Agentic` (single live submission scope)
    - b14 `Workflow` (wider context/history consistency scope)
- **EC-31** updates:
  - b4 `System -> Integration`
  - b5 `System -> Integration`
  (kept as Integration because behavior text targets hook contract/wiring, not mandatory external round-trip boundary proof)

Already fixed: EC-18 b1/b2/b3, EC-25 b4/b5 (Integration → Unit).

## U1: "Can mock the API" (predicted Unit/Integration, GT=Agentic)

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-04 b3 | Integration | Agentic | **GT_CORRECT** | "Classification result consistent across repeated calls" — a mock always returns the same thing, so consistency can only be tested with the real AI model. |
| EC-04 b4 | Integration | Agentic | **GT_CORRECT** | "Token consumption stays within per-call budget" — real token counts come from the real model's tokenizer; a mock returns fake counts. |
| EC-10 b4 | Integration | Agentic | **GT_CORRECT** | "Every summary finding has matching inline comment" — the AI generates both; mock would produce deterministic pairs. Real model might generate findings that don't match. |
| EC-17 b2 | Integration | Agentic | **GT_CORRECT** | "Factual consistency check flags contradictions" — the fact-checking is done by an LLM comparing draft to KB. Mock would always flag/not flag deterministically. |
| EC-19 b3 | Integration | Agentic | **GT_CORRECT** | "Refinement step includes failure messages in next LLM prompt" — testing that the LLM actually learns from failures requires a real model call. |
| EC-30 b3 | Integration | Agentic | **GT_CORRECT** | "Recommendation algorithm ranks products matching browsing patterns higher" — if the algorithm is ML-based, ranking quality needs real model. |
| EC-30 b5 | Integration | Agentic | **GT_CORRECT** | "Recommendation algorithm surfaces serendipity" — same reasoning; ML-based diversity needs real model output. |
| EC-07 b3 | Unit | Agentic | **GT_CORRECT** | "Narrative accurately represents key data values" — narrative generation is LLM-dependent; mock returns canned text. |
| EC-13 b1 | System | Agentic | **GT_CORRECT** | "Image containing explicit content is flagged" — AI vision model classification; mock always returns same result. |

**All U1 entries: GT is correct.** The model consistently fails to recognize that AI API outputs vary non-deterministically.

## U2: "Pure logic, no I/O" (predicted Unit, GT=Integration)

Already-fixed entries (EC-18 b1/b2/b3, EC-25 b4/b5) excluded.

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-01 b3 | Unit | Integration | **GT_CORRECT** | "Env var with TOOL_ prefix overrides config file" — the behavior is that the LOADER resolves the conflict, not just the merge function. You need the real config loading pipeline reading real env vars + real file. |
| EC-02 b5 | Unit | Integration | **DEBATABLE** | "Queue at capacity returns 503 with Retry-After" — the conditional logic is Unit-testable, but "queue at capacity" implies a real queue with state. You could mock the queue.isFull() check (Unit) or use a real queue (Integration). |
| EC-08 b2 | Unit | Integration | **DEBATABLE** | "Client replays request automatically after wait" — the retry logic is testable with a mock API returning 429. But "replays the original request" implies the real HTTP client machinery fires. The boundary is fuzzy. |
| EC-08 b3 | Unit | Integration | **DEBATABLE** | "QuotaExhaustedError rather than retrying indefinitely" — error type detection is Unit, but "rather than retrying indefinitely" implies testing the full retry→exhaust→error flow with a real client. |
| EC-03 b3 | Unit | Integration | **GT_CORRECT** | "Repository with no commits produces empty report" — needs a real git repo in a specific state. Mocking git output tests the error handler, not the actual behavior of the tool against a real empty repo. |
| EC-17 b4 | Unit | Integration | **GT_CORRECT** | "Approval workflow blocks sending until user approves" — the behavior is about the WORKFLOW blocking, not just a boolean check. Needs the approval service wired to the email service to verify the block. |

## U3: "Integration suffices for external services" (predicted Integration, GT=System)

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-02 b3 | Integration | System | **DEBATABLE** | "Response returned within 3 seconds regardless of downstream processing" — timing guarantees are hard to test with mocks. But you could wire modules with a slow stub. GT=System argues you need real async processing; model says Integration timing test suffices. |
| EC-12 b3 | Integration | System | **GT_CORRECT** | "500,000 rows within timeout without OOM" — performance under real load requires real S3/Postgres or equivalent infrastructure. |
| EC-12 b4 | Integration | System | **GT_CORRECT** | "S3 returns transient 503, pipeline retries" — needs a real (or realistic mock) S3 endpoint that returns 503. Integration-level moto mock might suffice, but GT=System is defensible. |
| EC-13 b4 | Integration | System | **GT_CORRECT** | "AI vision model unavailable, posts queued for retry" — unavailability of a real external service is a System concern. |
| EC-18 b5 | Integration | System | **GT_CORRECT** | "10,000 log entries/second without dropping" — throughput under load is a System-level concern. |
| EC-14 b1 | Integration | System | **GT_CORRECT** | "Speech-to-text preserves speaker labels" — STT is an external API; verifying speaker label fidelity needs the real service. |
| EC-14 b4 | Integration | System | **GT_CORRECT** | "Audio longer than 60 min is split into segments" — segment splitting + merging with a real file/API is System. |
| EC-20 b4 | Integration | System | **DEBATABLE** | "Auto-generated PR bumps only affected dependency" — GT=System implies you need real git/GitHub. Model says you can test manifest manipulation at Integration level. |
| EC-20 b5 | Integration | System | **DEBATABLE** | "Breaking change flagged for manual review" — similar to above. |
| EC-24 b2 | Integration | System | **GT_CORRECT** | "Translation API returns 503, service falls back" — testing real API failure + fallback path needs the external service or realistic simulation. |
| EC-27 b4 | Integration | System | **GT_CORRECT** | "One address fails geocoding, service skips and optimizes remaining" — needs real geocoding API to test failure handling. |
| EC-29 b3 | Integration | System | **GT_CORRECT** | "Insurance eligibility check sends correct ID to payer API" — testing the real external API contract is System. |
| EC-29 b4 | Integration | System | **GT_CORRECT** | "Payer API unreachable, system marks pending and continues" — real network failure handling is System. |
| EC-03 b4 | Integration | System | **GT_CORRECT** | "Counts match actual change history" — needs a real git repo with known history. |
| EC-07 b5 | Integration | System | **GT_CORRECT** | "Email delivery failure saved to file for retry" — real email delivery (or realistic SMTP) is System. |

## U4: "Single step enough" (predicted Agentic/System, GT=Workflow)

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-07 b4 | System | Workflow | **GT_CORRECT** | "Complete flow (collection through delivery) works end-to-end" — explicitly says "full pipeline," multiple agentic steps in sequence. |
| EC-11 b5 | Agentic | Workflow | **GT_CORRECT** | "When tone check triggers regeneration, second response replaces first" — requires generate → check → regenerate → verify replacement, which is a multi-step agentic pipeline. |

## O1: "Needs real module wiring" (predicted Integration, GT=Unit)

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-05 b1 | Integration | Unit | **GT_CORRECT** | "Migrations applied in ascending numeric order" — sorting order is a pure function on the migration list. |
| EC-07 b1 | Integration | Unit | **GT_CORRECT** | "Summary includes data from all three sources" — data presence in output is a pure function of inputs. |
| EC-09 b2 | Integration | Unit | **GT_CORRECT** | "Plugin B loaded before A if A depends on B" — topological sort is pure algorithm. |
| EC-15 b1 | Integration | Unit | **GT_CORRECT** | "Embedding vector has correct dimensionality" — dimension check is a pure validation. |
| EC-22 b3 | Integration | Unit | **GT_CORRECT** | "Eviction strategy switches from LRU to LFU based on memory threshold" — strategy selection is pure config-driven logic. |
| EC-28 b2 | Integration | Unit | **GT_CORRECT** | "Cascaded cell references evaluate correctly" — formula evaluation is pure function. |
| EC-28 b3 | Integration | Unit | **GT_CORRECT** | "Circular dependency detected" — cycle detection in a graph is pure algorithm. |
| EC-28 b8 | Integration | Unit | **GT_CORRECT** | "Dependent formulas recalculated in topological order" — pure graph algorithm. |

**All O1 entries: GT is correct.** Model over-predicts Integration for pure-logic behaviors.

## O2: "Needs real external service" (predicted System+, GT=Integration)

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-06 b2 | System | Integration | **DEBATABLE** | "File processed exactly once despite multiple filesystem events" — model says "real OS file-watching behavior" needed. GT says dedup logic is testable with simulated events. Both have a point. |
| EC-08 b4 | System | Integration | **GT_CORRECT** | "Concurrent callers share same quota bucket" — concurrency testing with real async is Integration, doesn't need real external API. |

## O3: "Looks like AI so must be Agentic" (predicted Agentic, GT=Integration/System)

| Behavior | Predicted | GT | Verdict | Reasoning |
|----------|-----------|-----|---------|-----------|
| EC-13 b3 | Agentic | System | **DEBATABLE** | "Post that passes both checks published within 5 seconds" — is this about AI model latency (Agentic) or system throughput (System)? GT says it's a latency/throughput test, not a model quality test. Model says AI pipeline timing needs real model. |
| EC-19 b1 | Agentic | Unit | **GT_CORRECT** | "Generated function signature matches expected interface" — checking if output matches a spec is a structural check, not an AI quality test. You validate the JSON structure, not the AI's judgment. |
| EC-21 b5 | Agentic | Integration | **GT_CORRECT** | "Both outputs returned together, explanation references same sentiment direction as score" — this is testing output consistency (deterministic aggregation), not AI quality. |

## Summary

| Verdict | Count | Behaviors |
|---------|-------|-----------|
| **GT_CORRECT** | 35 | Most behaviors — GT is right, model is wrong |
| **GT_WRONG** | 0 | None remaining (5 already fixed) |
| **DEBATABLE** | 8 | EC-02 b5, EC-08 b2, EC-08 b3, EC-02 b3, EC-20 b4, EC-20 b5, EC-06 b2, EC-13 b3 |

### Debatable cases detail

| Behavior | Current GT | Model says | Core tension |
|----------|-----------|-----------|-------------|
| EC-02 b3 | System | Integration | Timing guarantee: real async vs wired modules with slow stub |
| EC-02 b5 | Integration | Unit | Queue capacity: real queue state vs mocked isFull() |
| EC-06 b2 | Integration | System | FS dedup: simulated events vs real OS events |
| EC-08 b2 | Integration | Unit | Retry: mock API + verify replay vs real HTTP client |
| EC-08 b3 | Integration | Unit | Exhaustion: mock API + verify error vs real retry→exhaust flow |
| EC-13 b3 | System | Agentic | 5-second SLA: throughput test vs AI pipeline latency |
| EC-20 b4 | System | Integration | Auto-PR: real git/GitHub vs manifest manipulation |
| EC-20 b5 | System | Integration | Breaking change flag: real version API vs version comparison logic |
