---
id: score-test-design-quality-not-just-level
title: Extend scoring to include test-design quality signals, not just level correctness
status: proposed
effort: high
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: New rubric can introduce subjectivity and reduce comparability with historical runs.
prereqs: Define deterministic checks for quality fields (failure mode, falsifiable oracle, lower-level miss rationale).
related: [signal-scoring-rubric, write-test-first, feature-extractor-plus-deterministic-mapper]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Keep level scoring, but add explicit quality components:
- clear failure mode statement
- falsifiable oracle/assertion
- concrete explanation of why lower level misses

Treat missing/weak design fields as score penalties.

## Steelman

Current optimization can game labels while leaving weak test designs. This aligns evaluation with the actual product goal: proposing tests that would catch real regressions.

## Scathing Critique

If quality checks are weakly specified, this becomes another prose game and may add noise without improving real-world utility.
