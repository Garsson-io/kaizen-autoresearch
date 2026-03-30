---
id: O2
name: "Needs real external service"
direction: over
predicted: System
ground_truth: Integration
weight: 2
confusion_pair: System-Integration
description: Model claims real HTTP/subprocess/OS is needed when local module wiring suffices.
---
EC-06 b2: "The behavior explicitly references 'the underlying platform emits more than one creation event', indicating the failure involves real OS file-watching behavior." — GT says Integration dedup logic is testable without real OS events
EC-08 b4: "Quota sharing under concurrency requires actual concurrent execution... Integration testing with actual Promise.all() reveals whether the quota tracking is truly atomic." — GT says Integration
EC-15 b5: "Workflow-level testing needed for search re-ranking" — predicted Workflow, GT is System (over by 2 levels)
EC-22 b4: "Schema validation needs real external service" — GT says Integration
[run6] EC-03 b1 (System→Integration) [w=2]
  J: "MOCK-MISS: the failure is at the boundary between git’s rename detection output and the CLI’s categorization, not just a single pure function. REAL-INFRA: this depends on real git repository state and real CLI/subprocess behavior (`git diff`/`git log` style rename metadata). MOCK-HIDE: stubbing change events can hide real rename heuristics and output-format quirks. LLM-DEP: none. MULTI-STEP: no agent pipeline. Rejection-gate: Integration was considered, but behavior text says the tool 'reads a git repository' and must treat real renames correctly; without real git behavior this can be falsely green."

[run6] EC-03 b2 (System→Integration) [w=2]
  J: "MOCK-MISS: crash risk often appears when real binary diff output/encoding is processed across module boundaries. REAL-INFRA: requires real filesystem blobs and real git diff behavior for binary content. MOCK-HIDE: mocked text diffs can miss decoding/subprocess edge cases that only appear with actual binary files. LLM-DEP: none. MULTI-STEP: none."

[run6] EC-03 b3 (System→Integration) [w=2]
  J: "MOCK-MISS: the failure is tied to how the CLI handles unborn-branch/no-commit git responses, which is an interaction boundary. REAL-INFRA: no-commit repos produce real git exit codes/messages that vary by command/path. MOCK-HIDE: stubbing 'no commits' can miss actual subprocess failure handling. LLM-DEP: none. MULTI-STEP: none. Rejection-gate: Integration was considered, but behavior explicitly targets a real repository state ('no commits yet'), which is where real subprocess/error semantics matter."

[run6] EC-03 b5 (System→Integration) [w=2]
  J: "MOCK-MISS: this behavior depends on real git index vs working-tree semantics crossing module boundaries. REAL-INFRA: staged/unstaged states are OS+git index/worktree realities, typically surfaced via real git commands/subprocesses. MOCK-HIDE: faked status objects can miss differences in pathspecs, index refresh, and command flags. LLM-DEP: none. MULTI-STEP: none. Rejection-gate: Integration was considered, but behavior text explicitly compares real 'staged or unstaged' repository states, which are git runtime semantics."

[run6] EC-04 b5 (System→Integration) [w=2]
  J: "REAL-INFRA: rate-limit handling is coupled to real HTTP/API signaling and timing behavior (e.g., 429/Retry-After/backoff wait). MOCK-MISS: simple mocked exceptions can miss failures in actual transport/status/header interpretation and sleep/retry timing. LLM-DEP/MULTI-STEP: no dependence on model output quality and no multi-agentic chain. REJECTION-GATE: Integration rejected because behavior text requires real waiting and retry on API signal ('waits and retries'), where environment-level timing/HTTP semantics can be the real failure boundary."

[run6] EC-06 b1 (System→Integration) [w=2]
  J: "Failure boundary is real filesystem watcher behavior (recursive watch semantics across OS/filesystem implementations). MOCK-MISS: this is not just path parsing logic; it appears when watcher + OS event delivery interact. REAL-INFRA/MOCK-HIDE: in-process mocks can falsely pass even when real recursive events are missing. Rejected lower level: behavior text explicitly requires handling files "inside a subdirectory of the watched root," which depends on actual watcher/event behavior."

[run6] EC-06 b5 (System→Integration) [w=2]
  J: "Ordering correctness depends on real file timestamp acquisition and concurrency timing under actual filesystem behavior. MOCK-MISS: local queue tests can validate sort logic, but real failures often come from timestamp granularity/ties and event timing races at runtime. Rejected lower level: behavior text requires "arrive at the same time" and ordering by creation timestamps, which is tied to real filesystem metadata/timing."

[run6] EC-12 b5 (System→Integration) [w=2]
  J: "Behavior depends on restart semantics across process lifecycles plus durable state coordination (checkpoint/offset vs committed DB rows). Real failure often appears only when a process is interrupted and restarted, which is subprocess/OS behavior (REAL-INFRA). Integration without real restart can miss ordering and commit-boundary bugs (MOCK-HIDE). Rejected lower level: Integration is disqualified by explicit behavior text 'restarted mid-batch,' which requires restart boundary validation."

[run6] EC-20 b2 (System→Integration) [w=2]
  J: "Real failure can occur at external API contract boundary (query encoding/range semantics/response interpretation), which mocks can hide (MOCK-HIDE yes). Behavior explicitly involves database query correctness against version ranges, so real HTTP/API interaction is the true boundary (REAL-INFRA yes). No AI dependency or multi-agent chain."
[run7] EC-03 b1 (System→Integration) [w=2]
  J: "MOCK-MISS: the failure is at the boundary between git’s rename detection output and the CLI’s categorization, not just a single pure function. REAL-INFRA: this depends on real git repository state and real CLI/subprocess behavior (`git diff`/`git log` style rename metadata). MOCK-HIDE: stubbing change events can hide real rename heuristics and output-format quirks. LLM-DEP: none. MULTI-STEP: no agent pipeline. Rejection-gate: Integration was considered, but behavior text says the tool 'reads a git repository' and must treat real renames correctly; without real git behavior this can be falsely green."

[run7] EC-03 b2 (System→Integration) [w=2]
  J: "MOCK-MISS: crash risk often appears when real binary diff output/encoding is processed across module boundaries. REAL-INFRA: requires real filesystem blobs and real git diff behavior for binary content. MOCK-HIDE: mocked text diffs can miss decoding/subprocess edge cases that only appear with actual binary files. LLM-DEP: none. MULTI-STEP: none."

[run7] EC-03 b3 (System→Integration) [w=2]
  J: "MOCK-MISS: the failure is tied to how the CLI handles unborn-branch/no-commit git responses, which is an interaction boundary. REAL-INFRA: no-commit repos produce real git exit codes/messages that vary by command/path. MOCK-HIDE: stubbing 'no commits' can miss actual subprocess failure handling. LLM-DEP: none. MULTI-STEP: none. Rejection-gate: Integration was considered, but behavior explicitly targets a real repository state ('no commits yet'), which is where real subprocess/error semantics matter."

[run7] EC-03 b5 (System→Integration) [w=2]
  J: "MOCK-MISS: this behavior depends on real git index vs working-tree semantics crossing module boundaries. REAL-INFRA: staged/unstaged states are OS+git index/worktree realities, typically surfaced via real git commands/subprocesses. MOCK-HIDE: faked status objects can miss differences in pathspecs, index refresh, and command flags. LLM-DEP: none. MULTI-STEP: none. Rejection-gate: Integration was considered, but behavior text explicitly compares real 'staged or unstaged' repository states, which are git runtime semantics."

[run7] EC-04 b5 (System→Integration) [w=2]
  J: "REAL-INFRA: rate-limit handling is coupled to real HTTP/API signaling and timing behavior (e.g., 429/Retry-After/backoff wait). MOCK-MISS: simple mocked exceptions can miss failures in actual transport/status/header interpretation and sleep/retry timing. LLM-DEP/MULTI-STEP: no dependence on model output quality and no multi-agentic chain. REJECTION-GATE: Integration rejected because behavior text requires real waiting and retry on API signal ('waits and retries'), where environment-level timing/HTTP semantics can be the real failure boundary."

[run7] EC-06 b1 (System→Integration) [w=2]
  J: "Failure boundary is real filesystem watcher behavior (recursive watch semantics across OS/filesystem implementations). MOCK-MISS: this is not just path parsing logic; it appears when watcher + OS event delivery interact. REAL-INFRA/MOCK-HIDE: in-process mocks can falsely pass even when real recursive events are missing. Rejected lower level: behavior text explicitly requires handling files "inside a subdirectory of the watched root," which depends on actual watcher/event behavior."

[run7] EC-06 b5 (System→Integration) [w=2]
  J: "Ordering correctness depends on real file timestamp acquisition and concurrency timing under actual filesystem behavior. MOCK-MISS: local queue tests can validate sort logic, but real failures often come from timestamp granularity/ties and event timing races at runtime. Rejected lower level: behavior text requires "arrive at the same time" and ordering by creation timestamps, which is tied to real filesystem metadata/timing."

[run7] EC-12 b5 (System→Integration) [w=2]
  J: "Behavior depends on restart semantics across process lifecycles plus durable state coordination (checkpoint/offset vs committed DB rows). Real failure often appears only when a process is interrupted and restarted, which is subprocess/OS behavior (REAL-INFRA). Integration without real restart can miss ordering and commit-boundary bugs (MOCK-HIDE). Rejected lower level: Integration is disqualified by explicit behavior text 'restarted mid-batch,' which requires restart boundary validation."

[run7] EC-20 b2 (System→Integration) [w=2]
  J: "Real failure can occur at external API contract boundary (query encoding/range semantics/response interpretation), which mocks can hide (MOCK-HIDE yes). Behavior explicitly involves database query correctness against version ranges, so real HTTP/API interaction is the true boundary (REAL-INFRA yes). No AI dependency or multi-agent chain."

