---
id: O2
name: "Needs real external service"
direction: over
predicted: System
ground_truth: Integration
weight: 2
confusion_pair: Integration-System
description: Model claims real HTTP/subprocess/OS is needed when local module wiring suffices.
---
EC-06 b2: "The behavior explicitly references 'the underlying platform emits more than one creation event', indicating the failure involves real OS file-watching behavior." — GT says Integration dedup logic is testable without real OS events
EC-08 b4: "Quota sharing under concurrency requires actual concurrent execution... Integration testing with actual Promise.all() reveals whether the quota tracking is truly atomic." — GT says Integration
EC-15 b5: "Workflow-level testing needed for search re-ranking" — predicted Workflow, GT is System (over by 2 levels)
EC-22 b4: "Schema validation needs real external service" — GT says Integration
[run-203945] EC-32 b3 (Integration→System): "Failure boundary is module wiring plus filesystem-loaded skill content. In-process mocks can mask accidental hard-coding"
[run6] EC-12 b4 (Integration→System) [w=3]
  J: "Core failure is retry-policy wiring between S3 client wrapper, backoff policy, and batch controller (module boundary). This can be caught with deterministic stubbed S3 responses (503 then success) and clock/backoff assertions; real network is not required for this specific behavior (INTEGRATION-BRAKE a=no). No AI dependence (b=no) and no multi-agent chain (c=no). Rejected higher level: System is disqualified because behavior text targets retry logic on a known status code, not network stack variability."

[run6] EC-13 b5 (Integration→System) [w=3]
  J: "Failure boundary is local module interaction: classifier error handling -> retry queue -> approval gate. This can be caught by wiring modules with a failing model client stub. INTEGRATION-BRAKE: (a) real OS/network is not strictly required to reproduce the contract failure; (b) no dependence on real AI output quality; (c) no multi-agentic sequence. Rejected System because behavior text focuses on fallback state transition ('queued for retry rather than auto-approved'), not environment-specific transport quirks."

[run6] EC-20 b7 (Integration→System) [w=3]
  J: "Failure appears at orchestration boundary between breaking-change decision, PR module invocation suppression, and output/reporting state propagation (MOCK-MISS yes). Can be caught with in-process wiring and a fake PR client; no real OS/network needed for this behavior itself (INTEGRATION-BRAKE a=no). No AI output dependence (b=no) and no multi-agent chain (c=no). Rejected System: behavior text is conditional control-flow and local output, not real repository creation."

[run6] EC-24 b2 (Integration→System) [w=3]
  J: "Failure appears at module handoff: API client error handling -> fallback translator selection -> response shaping. An in-process stub returning 503 is sufficient to reproduce this contract failure; real network/OS is not required. INTEGRATION-BRAKE: (a) no real OS/network/subprocess required by behavior text, (b) no AI quality dependency, (c) no multi-agentic chain. Rejected System because behavior text specifies handling a 503 response, not environment-dependent network behavior (timeouts/sockets/load)."

[run6] EC-27 b4 (Integration→System) [w=3]
  J: "Real failure appears at module handoff boundaries: geocoding result handling -> stop filtering -> optimizer input -> skipped-address reporting. A unit test of any single function could miss orchestration defects. System was considered but rejected because the behavior text targets logical handling of a known API response shape ('returns no results'), which can be reproduced with an in-process geocoder stub; no environment-dependent HTTP behavior is required. No AI/ML dependency."

[run6] EC-31 b4 (Integration→System) [w=3]
  J: "Failure is at local component contract/state boundary: trigger metadata reconstruction plus persistence writer. Needs multi-module wiring with local filesystem write/read, but no real network/subprocess/model output. Rejected System because behavior text requires persistence of identifier, not OS-dependent runtime behavior."

[run6] EC-31 b5 (Integration→System) [w=3]
  J: "This is an inter-module local contract test (writer hook ↔ reader/enforcer hook). It requires wiring both hooks against shared local state format. Rejected Agentic/Workflow because no AI step exists; rejected System because behavior text does not require real OS/network/subprocess effects beyond local file handoff."

[run6] EC-32 b3 (Integration→System) [w=3]
  J: "This is a wiring/provenance failure mode across loader + harness + test configuration. MOCK-MISS: a single-function test cannot prove context source-of-truth is file-backed rather than hard-coded. INTEGRATION-BRAKE: (a) no required real OS/network/subprocess beyond normal local file reads, so not System minimum; (b) correctness here is about context loading path, not model output quality, so not Agentic minimum; (c) no multi-agent chain, so not Workflow."

[run6] EC-34 b2 (Integration→System) [w=3]
  J: "This behavior is mainly module wiring: startup flow consumes computed branch state and emits a warning payload/message. Integration is enough to catch real failures in handoff/formatting. I considered System, but rejected it because the behavior text does not require real OS/session bootstrap mechanics; an in-process startup entrypoint test can reproduce the failure. No AI output dependency."

[run6] EC-34 b5 (Integration→System) [w=3]
  J: "Core failure is local contract/state mismatch: detector must correctly combine branch divergence/age with PR status categories (`open`, `merged`). This can be caught by wiring detector + PR-state adapter with realistic fixtures. I considered System, but rejected it because the behavior text does not require live API/network; deterministic PR-state fixtures can expose the false-positive bug. No AI dependency."

