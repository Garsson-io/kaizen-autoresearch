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
explore_status: concentrated-signal
explore_tasks: [ec-20, ec-36, ec-31, ec-03, ec-02, ec-24, ec-29, ec-34]
explore_baseline_loss: 94.75
explore_loss: 85.58
explore_delta: -9.17
explore_date: 2026-04-11
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
Current status: explored (`concentrated-signal` family-signal), not promoted.

## Run History
| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 19 | explore/ace-agent-mode-hardcase-routing-* | concentrated-signal | -9.17 (holdout) | same winner across passes, but concentration worsened |

## Reusable Lesson
Hardcase routing can unlock meaningful wins but currently over-concentrates on a single task family; next step is tighter trigger/selector design, not direct promotion.

## Epistemological status

Explore subset (stratified): `ec-20, ec-36, ec-31, ec-03, ec-02, ec-24, ec-29, ec-34`  
Baseline subset loss: `94.75`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-router-adjacent-tie | 112.2618 | +17.5076 | improved 1, hurt 2, flat 5 | n/a |
| v2-router-tie-or-missing-boundary | 113.2952 | +18.5409 | improved 0, hurt 4, flat 4 | n/a |
| v3-router-any-indicator-terse | 85.5833 | -9.1709 | improved 3, hurt 0, flat 5 | ec-34 drives 76% of gain |

Winner: `v3-router-any-indicator-terse` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
