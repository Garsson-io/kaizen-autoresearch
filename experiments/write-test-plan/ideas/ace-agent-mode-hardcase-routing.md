---
id: ace-agent-mode-hardcase-routing
title: Ace-Agent Mode Hardcase Routing (normal path + hardcase branch)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - noise_sensitivity
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
  - Agentic-Workflow
change_type: structural
risk: Hardcase trigger can misfire too often and inflate reasoning overhead.
prereqs: Trigger must be narrow and deterministic (only on explicit ambiguity indicators).
related: [hard-case-canary-gate, uncertainty-triggered-single-retry, boundary-specific-micro-variants]
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
The best agent behavior is conditional: fast default for clear cases, stricter protocol for ambiguous boundary cases. Routing can preserve speed while improving hard cases.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add `ROUTER` rule:
  - If no ambiguity indicators, use current minimal flow.
  - If ambiguity indicators present (adjacent tie, weak evidence phrase, conflicting boundary cues), invoke strict grounding checks.
- Define 3 explicit ambiguity indicators.

## Expected Signal
- Primary targets: top adjacent confusion pairs and cross-seed stability.
- Success pattern: hard-case gains without global regression.
- Failure pattern: trigger drift causes either no effect or global overhead penalty.

## Explore Plan
- v1: trigger on adjacent tie only.
- v2: trigger on tie or missing explicit boundary term.
- v3: trigger on any 1 of 3 indicators + strict one-line outputs.

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
