---
id: behavior-anchored-decision-graph
title: Behavior-Anchored Decision Graph for adjacent boundaries
status: proposed
effort: high
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - system_underprediction
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
  - Agentic-Workflow
change_type: structural
risk: Large graph rewrite can recreate known regressions from broad structural changes.
prereqs: Decision graph must remain adjacent-boundary only; avoid introducing global scoring framework.
related: [minimal-failing-invariant-first, lower-level-miss-proof-gate, system-agentic-negative-contrast]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
## Hypothesis
Replacing free-form reasoning with an explicit adjacent decision graph should reduce arbitrary jumps and make boundary choices more stable.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- High-effort restructure: convert KEY-QUESTIONS into a fixed adjacent graph:
  - Unit vs Integration -> winner
  - winner vs System -> winner
  - winner vs Agentic -> winner
  - winner vs Workflow -> winner
- At each edge, require behavior-grounded evidence and one lower-level miss proof.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`, `Agentic-Workflow`.
- Success pattern: reduced volatility and fewer contradictory justifications.
- Failure pattern: graph complexity causes broad regression (historical risk for heavy structural edits).

## Explore Plan
- v1: full four-edge graph.
- v2: graph only across historically dominant edges (UI, IS, IA).
- v3: graph + explicit stop condition when evidence insufficient.

## Promotion Gate
Follow `experiments/write-test-plan/program.md` LOOP step 4.5.

## Epistemological Status
Current status: untested.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| — | — | — | — | not run yet |

## Reusable Lesson
Pending first run.
