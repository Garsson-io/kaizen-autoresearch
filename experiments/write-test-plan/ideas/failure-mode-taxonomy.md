---
id: failure-mode-taxonomy
title: Give the model a failure mode taxonomy — map failure types to levels
status: rejected
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: representational
risk: Taxonomy may be too rigid; novel failure modes that don't fit get misclassified
prereqs: null
related: [observable-behavior-framing, solution-collapse-prevention, signal-scoring-rubric]
---

*Source: Garsson-io/kaizen#747 — "the failure mode taxonomy that's missing"*

## Steelman

Issue #747 contains a ready-made failure mode taxonomy for test planning:

| Failure mode | Test type needed | Level |
|-------------|-----------------|-------|
| Wrong calculation/logic | Unit test | Unit |
| Missing import / undefined symbol | Smoke / integration | Integration |
| Module A incorrectly calls Module B | Integration test | Integration |
| External API returns unexpected result | System test w/ real API | System |
| AI model produces wrong/varying output | Test with real model | Agentic |
| Pipeline step A's output breaks step B | Full pipeline test | Workflow |

Instead of defining levels by infrastructure ("needs real HTTP"), define them by what failure they catch. This is a concrete version of observable-behavior-framing, grounded in the kaizen team's actual incident taxonomy.

The key insight from #747: "The implementor should form hypotheses about what could break, attempt to falsify them, and document which test types they considered and rejected." Applied to our prompt:

```
Failure mode → Test level mapping:
  Logic error (wrong value, wrong branch)           → Unit
  Wiring error (modules don't connect correctly)    → Integration
  Environment error (API down, timeout, wrong port) → System
  AI judgment error (model classified/generated wrong, output varies) → Agentic
  Orchestration error (steps work alone but pipeline fails) → Workflow

For each behavior, identify the FAILURE MODE first, then read off the level.
```

This is not a novel framing — it's the kaizen team's own framework from #747, battle-tested through incidents #746, #724, #1014. It encodes the lesson that the test level depends on what can go wrong, not what infrastructure exists.

## Scathing Critique

This is a lookup table disguised as reasoning. If the model could correctly identify the failure mode, it wouldn't need the table — the level follows mechanically. The hard part IS identifying the failure mode. "AI judgment error" requires the model to already know that the component involves AI. If it doesn't know that, the taxonomy doesn't help.

Also, real behaviors often have multiple failure modes at different levels. EC-04 behavior 5 ("when API signals rate too high, module waits and retries") has both an environment failure mode (API returns 429 → System) and a logic failure mode (retry logic is wrong → Unit). The taxonomy says "pick the failure mode" but doesn't say which one when there are multiple. The existing prompt handles this with "choose the LOWEST level that catches a real failure" — but that instruction ALSO fails for multi-modal behaviors.

The taxonomy from #747 was designed for human engineers writing testing plans, not for LLMs classifying in a structured output. Human engineers can hold multiple failure modes in mind and reason about tradeoffs. An LLM producing a JSON object picks one path and follows it. A rigid taxonomy may force the model into a binary choice that doesn't reflect the behavior's actual complexity.
