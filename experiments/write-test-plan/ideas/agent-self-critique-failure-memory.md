---
id: agent-self-critique-failure-memory
title: Agent Self-Critique with Failure Memory (today's misses as guardrails)
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: meta-cognitive
risk: Historical miss memory may overfit to recent error distribution.
prereqs: Memory list should be tiny (top 3 current misses) and advisory, not absolute.
related: [failure-mode-taxonomy, confusion-aware-posthoc-calibration, hard-case-canary-gate]
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
A small explicit reminder of current top failure patterns can improve calibration and reduce repeated mistakes across similar tasks.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add `FAILURE MEMORY` mini-list (top 3 recurring boundary mistakes) with one caution line each.
- Add one line: "Before final label, check if current case matches a listed failure pattern."

## Expected Signal
- Primary targets: repeated high-loss confusion pairs.
- Success pattern: reduced recurrence of known mistake templates.
- Failure pattern: overfitting to recent leaderboard; new patterns degrade.

## Explore Plan
- v1: static top-3 memory list.
- v2: memory list + one explicit anti-pattern example.
- v3: memory list only for cases routed as ambiguous.

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
