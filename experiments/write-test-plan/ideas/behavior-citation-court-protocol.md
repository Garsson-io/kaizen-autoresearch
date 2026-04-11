---
id: behavior-citation-court-protocol
title: Behavior Citation Court Protocol (claim/evidence/counterclaim)
status: proposed
effort: high
expected_impact: high
targets:
  - consistency_failures
  - unit_overprediction
  - agentic_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: meta-cognitive
risk: May repeat known two-pass overhead failures if the protocol becomes verbose or symbolic.
prereqs: Keep the protocol single-pass and bounded (max 3 short bullets), no second full reasoning pass.
related: [behavior-quote-grounding-gate, top2-runner-up-contrast-gate, dual-rationale-consensus-gate]
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
A compact "court" format (claim + cited evidence + adjacent-level counterclaim) should force grounded reasoning without full two-pass overhead.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add a `DECISION RECORD` format requirement before final label:
  - Claim: chosen minimum level.
  - Evidence: one quoted behavior phrase.
  - Counterclaim: adjacent lower level and why it would miss.
- Keep it bounded to one short triplet per behavior.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: fewer generic justifications and improved adjacent boundary precision.
- Failure pattern: verbosity-induced noise similar to prior heavy process ideas.

## Explore Plan
- v1: full triplet required for all non-Unit labels.
- v2: triplet required only for Agentic/Workflow.
- v3: triplet required only when top-2 level probabilities are within close margin.

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
