---
id: controlled-wrong-first-then-recover
title: Controlled Wrong-First Then Recover (anti-lazy boundary stress)
status: proposed
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - noise_sensitivity
  - unit_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: meta-cognitive
risk: Could repeat heavy-process regressions if recovery step becomes verbose.
prereqs: Keep to one forced alternative and one recovery sentence only.
related: [top2-runner-up-contrast-gate, challenge-your-choice, competitive-critique-seeding]
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
Forcing a brief deliberate wrong pick before the final decision can break default anchoring and expose missing evidence at hard adjacent boundaries.

## Exact Edit
- Target: `experiments/write-test-plan/prompts/treatment.md`
- Add `STRESS STEP`:
  - Pick one plausible adjacent wrong level.
  - Give one sentence why it fails on behavior evidence.
  - Finalize the minimum sufficient level.
- Limit to max 2 short lines.

## Expected Signal
- Primary targets: `Unit-Integration`, `Integration-System`, `Integration-Agentic`.
- Success pattern: improved hard-case precision where first instinct is usually wrong.
- Failure pattern: no-signal due to added process tax.

## Explore Plan
- v1: stress step on all non-Unit decisions.
- v2: stress step only when top-2 levels are adjacent.
- v3: stress step only on top-loss pairs from latest leaderboard.

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
