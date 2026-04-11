---
id: crazy-boundary-inversion-sanity-check
title: Crazy Boundary Inversion Sanity Check (would opposite label be absurd?)
status: proposed
effort: medium
expected_impact: low
targets:
  - consistency_failures
  - noise_sensitivity
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
  - Agentic-Workflow
change_type: meta-cognitive
risk: Inversion thought experiment can distract and reduce precision on easy cases.
prereqs: Must run only on ambiguous cases and in one sentence.
related: [reverse-self-check, top2-runner-up-contrast-gate, challenge-your-choice]
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
A controlled inversion check can catch brittle decisions by testing whether the opposite adjacent label is obviously absurd under the behavior text.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add one ambiguity-only line:
  "If uncertain between adjacent levels, test the opposite label in one sentence; if not absurd by evidence, choose lower level."
- Keep strictly optional and ambiguity-triggered.

## Expected Signal
- Primary targets: noise-sensitive adjacent ties.
- Success pattern: fewer unstable flips across seeds.
- Failure pattern: no-signal due to novelty cost.

## Explore Plan
- v1: apply inversion check only on top-loss pair.
- v2: apply on any adjacent tie.
- v3: apply on ties + require quote evidence.

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
