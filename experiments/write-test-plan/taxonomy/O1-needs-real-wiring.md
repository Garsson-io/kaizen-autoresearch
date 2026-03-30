---
id: O1
name: "Needs real module wiring"
direction: over
predicted: Integration
ground_truth: Unit
weight: 1
confusion_pair: Integration-Unit
description: Model adds unnecessary Integration infrastructure when the behavior is testable at a single function boundary. Over-cautious — "a pure Unit test could miss an edge case."
---
EC-01 b3: "Testing config merge logic... This is pure in-process logic with no I/O" — correctly described as Unit logic but classified Integration anyway
EC-03 b1: "The failure mode is a logic/categorization error... A pure in-process mock with controlled git output is sufficient" — then classified Integration
EC-05 b1: "Pure function boundary test" — predicted Integration
EC-07 b1: "Data aggregation logic" — predicted Integration
EC-09 b2: "Plugin discovery logic" — predicted Integration
EC-15 b1: "Embedding generation is a pure function" — predicted Integration
EC-22 b3: "Configuration validation" — predicted Integration
EC-22 b4: "Schema validation logic" — predicted System
EC-28 b2: "String processing logic" — predicted Integration
EC-28 b3: "Format conversion" — predicted Integration
EC-28 b8: "Template rendering" — predicted Integration
[run5] EC-08 b7 (Integration→Unit): "FIFO ordering under concurrent async execution — Unit test with deterministic mocks might not expose ordering bugs."
[run5] EC-09 b1 (Integration→Unit): "Code execution despite invalid manifest — Unit-level test would not catch a real bug where the loader is wired."
[run5] EC-18 b4 (Integration→Unit): "Error handling and counting must work correctly under real pipeline conditions."
[run5] EC-19 b4 (Integration→Unit): "Loop control logic and response structure — both deterministic. Mock the LLM to return failing code."
[run5] EC-22 b2 (Integration→Unit): "Freshness rule calculation: deterministic, but model adds 'real failure boundaries include freshness rule read from wrong place'."
[run5] EC-24 b4 (Integration→Unit): "Edit distance computation is pure function (Unit), but model requires real storage wiring."
[run5] EC-25 b1 (Integration→Unit): "Threshold check logic is pure — model adds 'must load actual config from real DB' concern."
[run5] EC-25 b3 (Integration→Unit): "Time window boundary logic — model requires 'real database with real timestamps'."
[run5] EC-25 b5 (Integration→Unit): "Output structure — model requires 'real models' to catch serialization bugs."
[run5] EC-27 b5 (Integration→Unit): "Route deduplication consolidation: (1) duplicates consolidated (Unit-testable), (2) final route visits consolidated stops (model adds Integration need)."
[run5] EC-28 b8 (Integration→Unit): "Dependency-tracking and recalculation mechanism — model says 'single evaluation wouldn't catch ordering bugs'."
[run6] EC-06 b2 (Unit→Integration) [w=2]
  J: "Failure boundary is local decision logic (same path + time window) and does not require OS/network/subprocess. MOCK-MISS: behavior can be fully exercised at function/object boundary with a fake clock. INTEGRATION-BRAKE check: no real infra required, no AI output, no multi-step agent chain. Rejected higher levels: behavior text is specifically "deduplication logic" for repeated request by path/time window, which is deterministic and local."

[run6] EC-01 b1 (Integration→Unit) [w=1]
  J: "Failure boundary is the handoff between config-file loading, `TOOL_` env override mapping, and required-key validation/error formatting. A unit test of only the validator can miss merge/path-mapping bugs. Higher levels are rejected because behavior text does not require subprocess/real network/OS-dependent effects (so not System) and does not depend on AI output (not Agentic/Workflow)."

[run6] EC-02 b6 (Integration→Unit) [w=1]
  J: "Behavior explicitly starts from local contract: "queue reports it is full" then handler maps to HTTP 503 + header. This is module interaction; no real OS/network dependency required. Rejected System because fullness signal is injected by queue contract, not environment effects."

[run6] EC-04 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at a local module boundary (classifier -> API client payload), not pure single-function logic. REAL-INFRA: no real network/OS/subprocess is required; a stub client that captures the outbound payload is sufficient. MOCK-HIDE: a pure unit test of prompt-builder logic could miss wiring/serialization omissions between modules. LLM-DEP/MULTI-STEP: not dependent on model output quality and no multi-agentic chain. REJECTION-GATE: System rejected because behavior text is about request contents ('includes the complete list of valid taxonomy labels'), which can be validated before real HTTP."

[run6] EC-04 b2 (Integration→Unit) [w=1]
  J: "MOCK-MISS: bug appears at handoff/parsing boundary (API response -> classifier normalization). REAL-INFRA: no real HTTP needed; deterministic stub response with invalid label reproduces failure. MOCK-HIDE: unit-testing only the normalization helper may miss that integration path bypasses validation. LLM-DEP/MULTI-STEP: no dependence on real model quality and no chained agentic steps. REJECTION-GATE: System rejected because behavior text focuses on local fallback mapping ('returns "unknown"'), which is verifiable with in-process wiring."

[run6] EC-05 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at module handoff (directory scan -> filename parse/sort -> execution sequence), not a single pure function. REAL-INFRA: no required real OS/network/subprocess behavior beyond local filesystem/DB wiring. MOCK-HIDE: a unit test of sort logic alone can pass while runner wiring still executes out of order. LLM-DEP/MULTI-STEP: none. INTEGRATION-BRAKE checks: (a) no real subprocess/network requirement in behavior text, (b) no AI output dependency, (c) no agentic chain. REJECTION-GATE: rejected System because behavior text only requires ordering by filename prefix, not environment-dependent runtime effects."

[run6] EC-07 b1 (Integration→Unit) [w=1]
  J: "The failure boundary is module handoff: each source client -> aggregation/composition layer -> summary input payload. A unit test of a single formatter would miss wiring bugs (e.g., one collector not called or dropped field), but no real OS/network/subprocess is required because deterministic in-process fakes can reproduce the failure artifact."

[run6] EC-08 b2 (Integration→Unit) [w=1]
  J: "Real failure is at a local module boundary: response classification + retry policy interaction. The behavior text explicitly combines "identifies a rate-limit response" and "computes ... wait time," which is more than isolated math. Rejected System because real HTTP is not required to reproduce this failure; an in-process stubbed response object is sufficient."

[run6] EC-08 b4 (Integration→Unit) [w=1]
  J: "This depends on retry-loop termination state feeding error mapping/type construction. The behavior text ties outcome to "after ... maximum number of retries," so loop + error surface integration is the failure boundary. Rejected Unit because isolated error-class tests miss retry-state coupling; rejected System because no real infra is required."

[run6] EC-08 b7 (Integration→Unit) [w=1]
  J: "Ordering bugs emerge from queue + scheduler + dispatcher interaction. Behavior text is explicitly about queued multi-request coordination ("multiple requests ... dispatched in the order ... submitted"), which is beyond a single isolated function in most implementations. Rejected System because a local in-memory queue test with controlled scheduler can reproduce ordering failures without real network/OS."

[run6] EC-09 b1 (Integration→Unit) [w=1]
  J: "Real failure boundary is between manifest validation and plugin execution path: the loader must validate manifest metadata and short-circuit before import/onLoad. A pure unit test of only `validateManifest` would miss regressions where loader still imports module despite validation failure. Higher levels rejected: behavior text is about local loader flow (`manifest.json`, reject, no execution), with no real network/subprocess/OS-dependent artifact and no AI output dependency."

[run6] EC-09 b2 (Integration→Unit) [w=1]
  J: "Failure appears when dependency resolver output is consumed by lifecycle invoker; this is a module handoff issue, not just single-function logic. Unit tests of topo-sort alone miss hook-call ordering bugs in orchestration. Higher levels rejected: behavior only requires local module wiring and call-order observation; no subprocess/network/OS-specific behavior and no AI dependence."

[run6] EC-09 b3 (Integration→Unit) [w=1]
  J: "Need combined behavior of cycle detection + load suppression. A unit test of cycle detection algorithm alone would not catch a loader bug that still loads one plugin after detecting a cycle. Higher levels rejected: expected artifact is local contract/state mismatch (error report and zero loads), not environment-dependent behavior; no AI/model output involved."

[run6] EC-11 b1 (Integration→Unit) [w=1]
  J: "Failure boundary is module handoff: history-selection logic must be wired correctly into the LLM request builder. A pure unit test of the trimming helper can miss bugs where the wrong slice/order is actually sent. Higher levels are disqualified by behavior text: no requirement for real OS/network/subprocess, no dependence on model output quality, and no multi-agentic chain."

[run6] EC-15 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at a module boundary (embedding client output shape vs index schema), not a single pure function. REAL-INFRA: not inherently OS/network-dependent; the core failure is contract mismatch. LLM-DEP: no generation-quality dependency. MULTI-STEP: no multi-agentic chain. Rejected higher level: System is disqualified by behavior text focusing on dimensionality compatibility, which can be caught by wiring embedding module + index metadata in-process."

[run6] EC-16 b2 (Integration→Unit) [w=1]
  J: "Real risk is contract mismatch between rule output schema, grouping logic, and comment-render payload. Unit tests on grouping alone can miss end-to-end formatting/assembly defects. System was considered, but rejected because behavior text targets grouping in comment content, not real GitHub API transport behavior."

[run6] EC-16 b5 (Integration→Unit) [w=1]
  J: "Although dedup can be algorithmic, real failure often appears when outputs from multiple rule modules are merged (key-shape/source mismatch). Integration best matches this boundary. System was considered, but rejected because behavior text focuses on output dedup semantics, not OS/network/subprocess effects."

[run6] EC-18 b3 (Integration→Unit) [w=1]
  J: "Behavior spans at least two local modules: metric computation/detection and report emission ('flagged in the anomaly report'). A pure unit test of percentile math could miss contract mismatches where detector output is not surfaced in report. INTEGRATION-BRAKE: no real OS/network/subprocess, no AI dependency, no multi-agent chain; so Integration is sufficient."

[run6] EC-18 b4 (Integration→Unit) [w=1]
  J: "Failure mode is parser + pipeline control flow + reporting counter interaction. Unit-testing parser alone can miss dropped/propagated error state and incorrect skipped-count aggregation. INTEGRATION-BRAKE: no required real network/OS behavior in text; malformed payloads can be injected in-process. Rejected System because behavior does not require filesystem/socket/runtime quirks, only pipeline resilience and counting."

[run6] EC-19 b4 (Integration→Unit) [w=1]
  J: "This is cross-module state/orchestration correctness: retry controller, attempt history accumulator, and error serializer. The real failure is often missing/overwritten attempt metadata between components. No real OS/network/subprocess is inherently required, and no real LLM quality judgment is required (deterministic fail fixtures suffice). Rejected higher levels because behavior text targets retry-state contract, not environment-dependent execution or AI quality."

[run6] EC-22 b2 (Integration→Unit) [w=1]
  J: "Real failure is likely at config-to-TTL wiring (category lookup + freshness config + TTL calculator), not just arithmetic. MOCK-MISS: a pure unit test of TTL math can miss wrong config key mapping/default resolution. INTEGRATION-BRAKE: no OS/network/subprocess dependency, no AI output, no multi-agent chain, so Integration is sufficient. Rejected System/Agentic/Workflow because behavior text is configuration-based local logic."

[run6] EC-22 b3 (Integration→Unit) [w=1]
  J: "Failure appears at module boundary between memory-pressure signal, config threshold, and strategy selector/state manager. A unit test of selector logic alone can miss wiring/state propagation bugs. INTEGRATION-BRAKE: behavior text does not require real OS memory APIs; threshold crossing can be reproduced in-process. No AI dependency or multi-step agent pipeline."

[run6] EC-24 b4 (Integration→Unit) [w=1]
  J: "The failure mode spans computation + persistence wiring: correct distance must be computed and written to storage. A pure unit test of edit-distance function misses storage/field-mapping failures; a pure storage test misses algorithm mistakes. INTEGRATION-BRAKE: (a) no real OS/network/subprocess required, (b) correctness here is deterministic string-distance math, not model quality, (c) no multi-agentic sequence. Rejected Agentic because behavior text is about metric computation/storage, not judging real model output quality."

[run6] EC-25 b4 (Integration→Unit) [w=1]
  J: "Real failure appears at module handoff/orchestration boundary: scorer output + risk output must be combined correctly before review decision (MOCK-MISS indicates cross-module interaction). Integration brake: no real OS/network/subprocess required (a=no), no dependence on model quality since inputs can be stubbed as flagged/unflagged states (b=no), no multi-agentic chain under test (c=no). Higher levels rejected by behavior text 'operate as an OR gate, not AND'—this targets decision wiring, not external infra or model accuracy."

[run6] EC-25 b5 (Integration→Unit) [w=1]
  J: "Failure is contract mismatch when assembling outputs from multiple components into one reviewer-facing object (cross-module data wiring). Integration brake: no real OS/network/subprocess required (a=no), no need for real AI quality because fixed model outputs can validate schema/fields (b=no), no multi-step agentic pipeline required (c=no). Higher levels rejected: behavior text focuses on 'combined output includes both ... so reviewer can see which model flagged,' i.e., payload composition contract."

[run6] EC-26 b2 (Integration→Unit) [w=1]
  J: "Real failures commonly occur at parser->schedule-object->calculator semantic handoff for special cron modifiers, not just inside one pure function (MOCK-MISS). No real OS/network/subprocess is required, and correctness is deterministic (so not System/Agentic). Rejected System because behavior text only requires timestamp correctness for cron semantics, not environment-dependent infrastructure."

[run6] EC-26 b3 (Integration→Unit) [w=1]
  J: "The failure is at interaction between schedule generation and overlap-gap policy/reporting modules; unit-testing overlap math alone can miss boundary mismatches (MOCK-MISS). No required real OS/network/subprocess and no model non-determinism. Rejected System because behavior text is local schedule conflict logic, not environment behavior."

[run6] EC-26 b4 (Integration→Unit) [w=1]
  J: "Needs real interaction between scheduler logic and timezone/DST conversion library with actual zone rules; many failures are in that wiring and rule interpretation. It does not require subprocesses/network/OS events by behavior text, and remains deterministic for fixed tzdata. Rejected System because text specifies DST-correct run-time computation, not runtime OS/network behavior."

[run6] EC-26 b5 (Integration→Unit) [w=1]
  J: "Failure boundary is policy engine + scheduling state/time computation interaction; unit-testing only policy branching can miss real handoff/state interpretation bugs (MOCK-MISS). No required real infrastructure or AI output. Rejected System because behavior text focuses on policy decisioning from computed times, which is testable in-process with controlled clock inputs."

[run6] EC-27 b5 (Integration→Unit) [w=1]
  J: "The failure boundary is cross-module data flow: deduplication/aggregation plus routing input/output consistency ('not visited twice'). Unit-testing only a dedupe helper could miss mismatch between consolidated stops and optimizer visitation. System is disqualified because no real OS/network/subprocess behavior is needed; Agentic/Workflow are disqualified because no AI steps exist."

[run6] EC-28 b1 (Integration→Unit) [w=1]
  J: "Failure boundary is parser + range resolver + function execution over worksheet state, not pure arithmetic alone (MOCK-MISS). No real network/subprocess/OS dependency is required by the behavior text, so System is disqualified. No AI/ML output dependency, so Agentic/Workflow are disqualified."

[run6] EC-28 b2 (Integration→Unit) [w=1]
  J: "This failure appears at module handoff between reference resolution, dependency linking, and evaluator order (MOCK-MISS). Behavior text does not require real OS/network/subprocess, so System is rejected. No LLM dependency, so Agentic/Workflow are rejected."

[run6] EC-28 b3 (Integration→Unit) [w=1]
  J: "Detecting cycles requires dependency graph construction plus evaluator interaction across cells; a single-function unit test would miss cross-cell state behavior (MOCK-MISS). Behavior text has no real infrastructure requirement (REAL-INFRA no), and no AI dependency."

[run6] EC-28 b8 (Integration→Unit) [w=1]
  J: "This specifically targets interactions among dependency graph maintenance, invalidation, and recalculation scheduler. Unit tests of isolated functions can miss ordering bugs (MOCK-HIDE). No explicit real OS/network/subprocess or AI dependency in behavior text."

[run6] EC-29 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at module handoff (validator must gate downstream orchestrator calls), not just field-check logic. REAL-INFRA: no real OS/network/subprocess required. LLM-DEP: none. MULTI-STEP: none. INTEGRATION-BRAKE passed (a/b/c all no). Rejected System/Agentic/Workflow because behavior text is local validation + control-flow gating only."

[run6] EC-29 b9 (Integration→Unit) [w=1]
  J: "MOCK-MISS: risk is contract/state propagation across scheduler/provider/templating modules. REAL-INFRA: no real network/OS needed if testing composed local modules. LLM-DEP: none. MULTI-STEP: none. INTEGRATION-BRAKE passed (a/b/c no). Rejected System/Agentic/Workflow because behavior text is deterministic message composition."

[run6] EC-30 b1 (Integration→Unit) [w=1]
  J: "Failure boundary is filter->rank pipeline wiring: high-score out-of-stock items can leak if modules compose incorrectly. MOCK-MISS: not just one scoring function. INTEGRATION-BRAKE: no real OS/network/subprocess in behavior text, no AI/ML output quality dependency, no multi-agent chain, so not System/Agentic/Workflow. Rejected higher levels because behavior only states catalog/status filtering and ranked output."

[run6] EC-30 b2 (Integration→Unit) [w=1]
  J: "Real risk is contract mismatch between user-settings retrieval and category filter application. A pure unit on category predicate can miss mapping/hand-off failures. INTEGRATION-BRAKE: behavior text does not require real infra, real AI output, or multi-step agentic flow. Rejected System/Agentic/Workflow due explicit local settings+filter scope."

[run6] EC-30 b4 (Integration→Unit) [w=1]
  J: "Failure typically appears at sort->paginate boundary (tie handling, stable ordering across repeated calls). Needs modules wired together over shared dataset/state, beyond single-function happy path. INTEGRATION-BRAKE: no explicit real network/subprocess requirement; no AI output dependence; no multi-agent chain. Rejected System: behavior text is deterministic local ordering/pagination, not environment-dependent IO."

[run6] EC-30 b6 (Integration→Unit) [w=1]
  J: "Failure is at boundary between user-profile/history detection and fallback recommender strategy. A unit test of fallback scorer alone can miss orchestration bug that returns empty list. INTEGRATION-BRAKE: no real OS/network/subprocess, no AI-quality dependence, no multi-agent sequence. Rejected higher levels due local strategy-routing behavior text."

[run6] EC-30 b9 (Integration→Unit) [w=1]
  J: "Failure mode is cross-module state handoff: purchase event/history update must influence later ranking. Unit test of rank penalty alone misses propagation bugs. INTEGRATION-BRAKE: no explicit need for real external infra, no AI quality dependence, no multi-agent chain. Rejected System/Agentic/Workflow based on behavior text limited to local state transition and rerank."

[run6] EC-30 b10 (Integration→Unit) [w=1]
  J: "Determinism here is pipeline-level (feature assembly, ordering, tie-breaks, seed handling), not just a single function. Cross-module nondeterminism can occur even if individual units pass. INTEGRATION-BRAKE: behavior text does not require real OS/network/subprocess; no real LLM/ML stochastic output requirement; no multi-agent sequence. Rejected higher levels accordingly."

