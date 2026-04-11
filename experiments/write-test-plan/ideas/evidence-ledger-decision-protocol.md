---
id: evidence-ledger-decision-protocol
title: Force an evidence ledger before level selection (observed vs hypothetical)
status: rejected
effort: high
expected_impact: high
targets:
  - unit_overprediction
  - integration_overprediction
  - consistency_failures
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
change_type: structural
risk: Adds cognitive overhead and may reduce compliance if the model shortcuts the ledger.
prereqs: Keep output schema unchanged; this is internal reasoning guidance only.
related: [global-stated-failure-only-rule, solution-collapse-prevention, mock-miss-scope-clarification]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
last_run: 20260330-195418
last_iteration: 53
last_outcome: discard
last_delta: 33.937752225089184
retry_trigger: null
owner: null
---
## Hypothesis

The model is losing calibration because it mixes observed behavior evidence with hypothetical risks. This idea introduces a strict, short protocol: build a two-column evidence ledger first, then classify from observed evidence only.

If this works, it should reduce "could miss wiring" inflation without adding blunt Unit anchoring.

## Proposed Prompt Edit (exact prose)

Add this block right before `- **KEY-QUESTIONS** per behavior:`:

```md
- **EVIDENCE-LEDGER** (do this before choosing a level):
  - **Observed in this behavior**: list only what the behavior explicitly requires/verifies.
  - **Hypothetical elsewhere**: risks that are plausible in the feature but not this behavior.
  - Use only **Observed in this behavior** to choose level.
  - Do not escalate level based only on **Hypothetical elsewhere**.
```

And append this sentence to the end of the `MOCK-MISS` bullet:

```md
Treat "could fail in some other wiring path" as hypothetical unless this behavior explicitly tests that path.
```

## Why This Could Escape the Local Maximum

Recent regressions show that Unit-vs-Integration tweaks fail when they directly bias toward Unit. This protocol avoids that by introducing an epistemic filter (observed vs hypothetical), not a level preference. It is a meaningful structural shift in reasoning flow rather than another lexical adjustment.

It also composes with existing higher-level gates: REAL-INFRA, LLM-DEP, and MULTI-STEP remain intact and still drive escalation when observed evidence supports them.

## Scathing Critique

The model may still mark speculative claims as "observed" and bypass the guard entirely. If that happens, this adds verbosity without changing behavior. Also, if behaviors are terse, legitimate integration evidence may look hypothetical and cause under-calling.

The protocol could become performative: the model writes ledger lines but still follows prior heuristics when selecting levels.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Adds cognitive overhead and may reduce compliance if the model shortcuts the ledger.

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
| 53 | 20260330-195418 | discard | 33.937752225089184 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
