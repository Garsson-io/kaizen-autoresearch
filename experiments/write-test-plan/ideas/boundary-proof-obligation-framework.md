---
id: boundary-proof-obligation-framework
title: Require a proof obligation to justify crossing each adjacent boundary
status: rejected
effort: high
expected_impact: high
targets:
  - unit_overprediction
  - integration_underprediction
  - system_underprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: Too formal; model may ignore parts or produce brittle overfitted reasoning.
prereqs: Keep level defs concise and append this as a verification protocol.
related: [adjacent-level-min-reproduction-fallback, level-archetype-centers, top-down-elimination]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
last_run: 20260330-195103
last_iteration: 52
last_outcome: discard
last_delta: 113.53361005929122
retry_trigger: null
owner: null
---
## Hypothesis

The model currently jumps to a level without proving why lower levels fail for this specific behavior. Introduce an adjacent-boundary proof obligation: each escalation step must provide a concrete reason.

## Proposed Prompt Edit (exact prose)

Add this block after `KEY-QUESTIONS` and before `SELF-CHECK`:

```md
- **BOUNDARY-PROOF** (adjacent escalation only):
  - Start at Unit.
  - To move Unit -> Integration, provide one concrete reason this behavior fails at a module/interface handoff.
  - To move Integration -> System, provide one concrete reason real OS/network/subprocess/external behavior is required.
  - To move System -> Agentic, provide one concrete reason correctness depends on real model output quality/non-determinism.
  - To move Agentic -> Workflow, provide one concrete reason multiple agentic steps in sequence are required.
  - If you cannot provide the proof for a boundary, do not cross it.
```

Append to `SELF-CHECK`:

```md
If your chosen level skips a boundary proof, lower the level to the highest proven boundary.
```

## Why This Could Escape the Local Maximum

This is a large procedural change, not another micro-phrase. It addresses the root pathology from mined justifications: unsupported escalation based on vague possibility. By making escalation cumulative and evidenced, it should improve both over-calls and under-calls because every upward move requires a boundary-specific justification.

It also gives a stable mechanism for balancing adjacent confusion pairs rather than introducing one-off exceptions.

## Scathing Critique

This may over-constrain decisions and penalize terse behavior descriptions, where real boundary evidence exists but is not spelled out. It may also increase false confidence: the model can fabricate "proofs" that sound concrete but are still speculative.

High prompt complexity can lower reliability on smaller models and increase token/cost substantially.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Too formal; model may ignore parts or produce brittle overfitted reasoning.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: null.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Epistemological Status

Current status: null.

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 52 | 20260330-195103 | discard | 113.53361005929122 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
