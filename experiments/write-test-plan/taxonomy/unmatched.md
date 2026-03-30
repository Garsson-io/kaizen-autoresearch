---
confusion_pair: "(unmatched — no taxonomy file for these pairs yet)"
note: "Auto-accumulated unmatched taxonomy lines. After creating new taxonomy files or updating confusion_pair lists in existing files, run: npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched"
---

[run6] EC-01 b1 (Integration→Unit) [w=1]
  J: "Failure boundary is the handoff between config-file loading, `TOOL_` env override mapping, and required-key validation/error formatting. A unit test of only the validator can miss merge/path-mapping bugs. Higher levels are rejected because behavior text does not require subprocess/real network/OS-dependent effects (so not System) and does not depend on AI output (not Agentic/Workflow)."

[run6] EC-02 b6 (Integration→Unit) [w=1]
  J: "Behavior explicitly starts from local contract: "queue reports it is full" then handler maps to HTTP 503 + header. This is module interaction; no real OS/network dependency required. Rejected System because fullness signal is injected by queue contract, not environment effects."

[run6] EC-03 b1 (System→Integration) [w=2]
  J: "MOCK-MISS: the failure is at the boundary between git’s rename detection output and the CLI’s categorization, not just a single pure function. REAL-INFRA: this depends on real git repository state and real CLI/subprocess behavior (`git diff`/`git log` style rename metadata). MOCK-HIDE: stubbing change events can hide real rename heuristics and output-format quirks. LLM-DEP: none. MULTI-STEP: no agent pipeline. Rejection-gate: Integration was considered, but behavior text says the tool 'reads a git repository' and must treat real renames correctly; without real git behavior this can be falsely green."

[run6] EC-03 b2 (System→Integration) [w=2]
  J: "MOCK-MISS: crash risk often appears when real binary diff output/encoding is processed across module boundaries. REAL-INFRA: requires real filesystem blobs and real git diff behavior for binary content. MOCK-HIDE: mocked text diffs can miss decoding/subprocess edge cases that only appear with actual binary files. LLM-DEP: none. MULTI-STEP: none."

[run6] EC-03 b3 (System→Integration) [w=2]
  J: "MOCK-MISS: the failure is tied to how the CLI handles unborn-branch/no-commit git responses, which is an interaction boundary. REAL-INFRA: no-commit repos produce real git exit codes/messages that vary by command/path. MOCK-HIDE: stubbing 'no commits' can miss actual subprocess failure handling. LLM-DEP: none. MULTI-STEP: none. Rejection-gate: Integration was considered, but behavior explicitly targets a real repository state ('no commits yet'), which is where real subprocess/error semantics matter."

[run6] EC-03 b5 (System→Integration) [w=2]
  J: "MOCK-MISS: this behavior depends on real git index vs working-tree semantics crossing module boundaries. REAL-INFRA: staged/unstaged states are OS+git index/worktree realities, typically surfaced via real git commands/subprocesses. MOCK-HIDE: faked status objects can miss differences in pathspecs, index refresh, and command flags. LLM-DEP: none. MULTI-STEP: none. Rejection-gate: Integration was considered, but behavior text explicitly compares real 'staged or unstaged' repository states, which are git runtime semantics."

[run6] EC-04 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at a local module boundary (classifier -> API client payload), not pure single-function logic. REAL-INFRA: no real network/OS/subprocess is required; a stub client that captures the outbound payload is sufficient. MOCK-HIDE: a pure unit test of prompt-builder logic could miss wiring/serialization omissions between modules. LLM-DEP/MULTI-STEP: not dependent on model output quality and no multi-agentic chain. REJECTION-GATE: System rejected because behavior text is about request contents ('includes the complete list of valid taxonomy labels'), which can be validated before real HTTP."

[run6] EC-04 b2 (Integration→Unit) [w=1]
  J: "MOCK-MISS: bug appears at handoff/parsing boundary (API response -> classifier normalization). REAL-INFRA: no real HTTP needed; deterministic stub response with invalid label reproduces failure. MOCK-HIDE: unit-testing only the normalization helper may miss that integration path bypasses validation. LLM-DEP/MULTI-STEP: no dependence on real model quality and no chained agentic steps. REJECTION-GATE: System rejected because behavior text focuses on local fallback mapping ('returns "unknown"'), which is verifiable with in-process wiring."

[run6] EC-04 b5 (System→Integration) [w=2]
  J: "REAL-INFRA: rate-limit handling is coupled to real HTTP/API signaling and timing behavior (e.g., 429/Retry-After/backoff wait). MOCK-MISS: simple mocked exceptions can miss failures in actual transport/status/header interpretation and sleep/retry timing. LLM-DEP/MULTI-STEP: no dependence on model output quality and no multi-agentic chain. REJECTION-GATE: Integration rejected because behavior text requires real waiting and retry on API signal ('waits and retries'), where environment-level timing/HTTP semantics can be the real failure boundary."

[run6] EC-05 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at module handoff (directory scan -> filename parse/sort -> execution sequence), not a single pure function. REAL-INFRA: no required real OS/network/subprocess behavior beyond local filesystem/DB wiring. MOCK-HIDE: a unit test of sort logic alone can pass while runner wiring still executes out of order. LLM-DEP/MULTI-STEP: none. INTEGRATION-BRAKE checks: (a) no real subprocess/network requirement in behavior text, (b) no AI output dependency, (c) no agentic chain. REJECTION-GATE: rejected System because behavior text only requires ordering by filename prefix, not environment-dependent runtime effects."

[run6] EC-06 b1 (System→Integration) [w=2]
  J: "Failure boundary is real filesystem watcher behavior (recursive watch semantics across OS/filesystem implementations). MOCK-MISS: this is not just path parsing logic; it appears when watcher + OS event delivery interact. REAL-INFRA/MOCK-HIDE: in-process mocks can falsely pass even when real recursive events are missing. Rejected lower level: behavior text explicitly requires handling files "inside a subdirectory of the watched root," which depends on actual watcher/event behavior."

[run6] EC-06 b5 (System→Integration) [w=2]
  J: "Ordering correctness depends on real file timestamp acquisition and concurrency timing under actual filesystem behavior. MOCK-MISS: local queue tests can validate sort logic, but real failures often come from timestamp granularity/ties and event timing races at runtime. Rejected lower level: behavior text requires "arrive at the same time" and ordering by creation timestamps, which is tied to real filesystem metadata/timing."

[run6] EC-07 b1 (Integration→Unit) [w=1]
  J: "The failure boundary is module handoff: each source client -> aggregation/composition layer -> summary input payload. A unit test of a single formatter would miss wiring bugs (e.g., one collector not called or dropped field), but no real OS/network/subprocess is required because deterministic in-process fakes can reproduce the failure artifact."

[run6] EC-07 b4 (System→Workflow) [w=4]
  J: "The failure boundary includes real external interactions (source APIs and email delivery/inbox reception). In-process fakes can miss transport/auth/delivery-path issues. Agentic was considered, but behavior correctness here is delivery to inbox, not model output quality; summary content can be validated separately."

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

[run6] EC-10 b5 (System→Workflow) [w=4]
  J: "Behavior explicitly requires a real pull request and end-to-end execution over external APIs, so REAL-INFRA makes System the minimum. Rejected Agentic as minimum: behavior text checks completion of sequence on a real PR, not quality/non-deterministic correctness of model outputs. Rejected Workflow: text does not require multiple real agentic steps; it specifies operational completion of pipeline stages."

[run6] EC-11 b1 (Integration→Unit) [w=1]
  J: "Failure boundary is module handoff: history-selection logic must be wired correctly into the LLM request builder. A pure unit test of the trimming helper can miss bugs where the wrong slice/order is actually sent. Higher levels are disqualified by behavior text: no requirement for real OS/network/subprocess, no dependence on model output quality, and no multi-agentic chain."

[run6] EC-11 b5 (Integration→Workflow) [w=4]
  J: "This is an orchestration/state-exposure contract across local modules (generation, tone gate, response selector/output). Deterministic stubs can force 'reject then regenerate' and verify only final response is returned, so real model quality is not required. Higher levels are disqualified by behavior text: no requirement for real OS/network/subprocess failure mode, and no need for multi-agentic quality checks."

[run6] EC-12 b5 (System→Integration) [w=2]
  J: "Behavior depends on restart semantics across process lifecycles plus durable state coordination (checkpoint/offset vs committed DB rows). Real failure often appears only when a process is interrupted and restarted, which is subprocess/OS behavior (REAL-INFRA). Integration without real restart can miss ordering and commit-boundary bugs (MOCK-HIDE). Rejected lower level: Integration is disqualified by explicit behavior text 'restarted mid-batch,' which requires restart boundary validation."

[run6] EC-14 b1 (Agentic→System) [w=3]
  J: "The real failure boundary is STT diarization quality (LLM-DEP equivalent for speech model output): mocked transcripts hide mislabeled/missing speakers. Integration alone is insufficient because the core risk is model output correctness, not just local handoff. Workflow was considered, but the behavior text centers on STT output preservation; a single real-model step plus attribution assertions is enough to catch the target failure."

[run6] EC-14 b4 (Workflow→System) [w=3]
  J: "Failure requires chained behavior across multiple agentic steps (per-segment transcription/summarization + merge coherence). Single-step Agentic misses cross-segment drift, duplication, or contradiction introduced during sequential merge (MULTI-STEP => Workflow). System concerns may exist, but the defining risk is multi-step agentic composition."

[run6] EC-15 b1 (Integration→Unit) [w=1]
  J: "MOCK-MISS: failure is at a module boundary (embedding client output shape vs index schema), not a single pure function. REAL-INFRA: not inherently OS/network-dependent; the core failure is contract mismatch. LLM-DEP: no generation-quality dependency. MULTI-STEP: no multi-agentic chain. Rejected higher level: System is disqualified by behavior text focusing on dimensionality compatibility, which can be caught by wiring embedding module + index metadata in-process."

[run6] EC-16 b2 (Integration→Unit) [w=1]
  J: "Real risk is contract mismatch between rule output schema, grouping logic, and comment-render payload. Unit tests on grouping alone can miss end-to-end formatting/assembly defects. System was considered, but rejected because behavior text targets grouping in comment content, not real GitHub API transport behavior."

[run6] EC-16 b5 (Integration→Unit) [w=1]
  J: "Although dedup can be algorithmic, real failure often appears when outputs from multiple rule modules are merged (key-shape/source mismatch). Integration best matches this boundary. System was considered, but rejected because behavior text focuses on output dedup semantics, not OS/network/subprocess effects."

[run6] EC-17 b3 (Agentic→Integration) [w=2]
  J: "MOCK-MISS: This behavior depends on generation behavior under missing-context conditions, not only deterministic control flow. REAL-INFRA: No OS/subprocess-specific artifact is required. MOCK-HIDE: A mocked generator can always return a disclaimer and hide hallucination/fabrication risk. LLM-DEP: 'rather than fabricating facts' is output-quality dependent and can vary across real model runs, so Agentic is needed. REJECTION-GATE: Workflow rejected because the behavior only requires validating this single generation outcome under empty KB context, not a full multi-step agent pipeline."

[run6] EC-18 b3 (Integration→Unit) [w=1]
  J: "Behavior spans at least two local modules: metric computation/detection and report emission ('flagged in the anomaly report'). A pure unit test of percentile math could miss contract mismatches where detector output is not surfaced in report. INTEGRATION-BRAKE: no real OS/network/subprocess, no AI dependency, no multi-agent chain; so Integration is sufficient."

[run6] EC-18 b4 (Integration→Unit) [w=1]
  J: "Failure mode is parser + pipeline control flow + reporting counter interaction. Unit-testing parser alone can miss dropped/propagated error state and incorrect skipped-count aggregation. INTEGRATION-BRAKE: no required real network/OS behavior in text; malformed payloads can be injected in-process. Rejected System because behavior does not require filesystem/socket/runtime quirks, only pipeline resilience and counting."

[run6] EC-19 b1 (Agentic→Unit) [w=1]
  J: "The failure boundary is the model’s real code-generation behavior: whether a real LLM reliably maps natural-language interface requirements to the correct signature. A deterministic stub can validate parser/validator wiring but can hide true signature-drift failures from model variability. Rejected lower level (Integration) because the behavior text is about the generated signature matching the NL spec, which is disqualified from pure wiring tests when model output quality is the target."

[run6] EC-19 b4 (Integration→Unit) [w=1]
  J: "This is cross-module state/orchestration correctness: retry controller, attempt history accumulator, and error serializer. The real failure is often missing/overwritten attempt metadata between components. No real OS/network/subprocess is inherently required, and no real LLM quality judgment is required (deterministic fail fixtures suffice). Rejected higher levels because behavior text targets retry-state contract, not environment-dependent execution or AI quality."

[run6] EC-20 b2 (System→Integration) [w=2]
  J: "Real failure can occur at external API contract boundary (query encoding/range semantics/response interpretation), which mocks can hide (MOCK-HIDE yes). Behavior explicitly involves database query correctness against version ranges, so real HTTP/API interaction is the true boundary (REAL-INFRA yes). No AI dependency or multi-agent chain."

[run6] EC-21 b5 (Agentic→Integration) [w=2]
  J: "This behavior mixes integration contract (single response with both fields) plus semantic consistency between score and explanation direction. INTEGRATION-BRAKE(b): consistency check depends on real explanation content quality, so pure Integration is insufficient if explanation is model-generated. MULTI-STEP: one agentic generation plus deterministic scorer, not a multi-agentic chain, so not Workflow. REJECTION-GATE: Integration is only partially sufficient; behavior text requires explanation to reference same sentiment direction, which is content-level model output validation."

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

[run6] EC-30 b3 (Unit→Agentic) [w=4]
  J: "Behavior is core ranking logic (weighting by browsing signal) and can fail within one algorithm boundary without module interaction. MOCK-MISS: no required cross-module handoff described. Rejected Integration because behavior text focuses on ranking rule itself, not data plumbing."

[run6] EC-30 b4 (Integration→Unit) [w=1]
  J: "Failure typically appears at sort->paginate boundary (tie handling, stable ordering across repeated calls). Needs modules wired together over shared dataset/state, beyond single-function happy path. INTEGRATION-BRAKE: no explicit real network/subprocess requirement; no AI output dependence; no multi-agent chain. Rejected System: behavior text is deterministic local ordering/pagination, not environment-dependent IO."

[run6] EC-30 b5 (Unit→Agentic) [w=4]
  J: "This is an algorithmic constraint on output composition; can be validated directly in ranking/diversification logic with deterministic fixtures. No required module interaction or real infra in text. Rejected Agentic: no LLM/model quality dependency is described."

[run6] EC-30 b6 (Integration→Unit) [w=1]
  J: "Failure is at boundary between user-profile/history detection and fallback recommender strategy. A unit test of fallback scorer alone can miss orchestration bug that returns empty list. INTEGRATION-BRAKE: no real OS/network/subprocess, no AI-quality dependence, no multi-agent sequence. Rejected higher levels due local strategy-routing behavior text."

[run6] EC-30 b9 (Integration→Unit) [w=1]
  J: "Failure mode is cross-module state handoff: purchase event/history update must influence later ranking. Unit test of rank penalty alone misses propagation bugs. INTEGRATION-BRAKE: no explicit need for real external infra, no AI quality dependence, no multi-agent chain. Rejected System/Agentic/Workflow based on behavior text limited to local state transition and rerank."

[run6] EC-30 b10 (Integration→Unit) [w=1]
  J: "Determinism here is pipeline-level (feature assembly, ordering, tie-breaks, seed handling), not just a single function. Cross-module nondeterminism can occur even if individual units pass. INTEGRATION-BRAKE: behavior text does not require real OS/network/subprocess; no real LLM/ML stochastic output requirement; no multi-agent sequence. Rejected higher levels accordingly."

[run6] EC-32 b6 (Unit→Agentic) [w=4]
  J: "Core failure boundary is assertion logic correctness (schema/structure checks vs naive keyword matching). This can be tested with crafted outputs that include echoed keywords but wrong structure. No real infra required; no model non-determinism required. Rejection gate: Integration considered, but behavior text focuses on assertion semantics themselves, which are local logic."

[run6] EC-33 b4 (Integration→Workflow) [w=4]
  J: "Core failure is orchestration state integrity: finalize step must verify a newer review round tied to updated diff exists. This can be caught with deterministic round metadata and timestamps/hash linkage across modules. Agentic/Workflow were considered but rejected by behavior text: it requires that a "fresh review-agent round is executed" (execution evidence), not that model output quality be evaluated; no need for non-deterministic LLM assertions."

[run6] EC-33 b5 (Integration→Workflow) [w=4]
  J: "This is a state-machine/policy decision across round counter + findings status + outcome emitter. Needs module wiring to reproduce the real bug class. Higher levels rejected: behavior text is deterministic policy ("rounds are exhausted" + "unresolved MUST-FIX"), not real OS/network/subprocess behavior, not model-quality dependent, and not inherently requiring multi-agent non-deterministic sequencing."

