---
id: reject-higher-must-justify
title: Force explicit disqualifying evidence when rejecting a considered higher level
status: keep
effort: low
expected_impact: high
targets:
  - system_underprediction
  - agentic_underprediction
  - integration_underprediction
confusion_pairs:
  - Integration-System
  - Integration-Agentic
  - Integration-Workflow
change_type: meta-cognitive
risk: Could slow reasoning and produce verbose justifications that still arrive at wrong answers.
prereqs: null
related: [evidence-ledger-decision-protocol, dual-pass-classify-then-audit, global-stated-failure-only-rule]
explore_status: concentrated-signal
explore_tasks: [ec-02, ec-04, ec-06, ec-07, ec-03, ec-14]
explore_baseline_loss: 67.74
explore_loss: 66.10
explore_delta: -1.64
explore_date: 2026-04-11
last_run: 20260329-015626
last_iteration: 42
last_outcome: keep
last_delta: -27.055162739793804
retry_trigger: null
owner: null
---
## Hypothesis

43% of sonnet's errors are self-aware -- the model considers the correct higher level during reasoning but then overrides itself and picks Integration. The current prompt's bottom-up flow and SELF-CHECK ("would it pass at a lower one?") create a downward gravitational pull. Once the model has considered a higher level and is wavering, the prompt's structure encourages it to "play it safe" by picking Integration.

This idea adds a single asymmetric gate: if you considered a higher level and rejected it, you must cite the specific behavior text that disqualifies it. If you cannot cite disqualifying evidence, keep the higher level.

This is asymmetric by design: it does NOT require justification for escalating (which would suppress correct upward movement). It ONLY adds friction to the downward override path -- exactly where the 43% self-aware errors occur.

## Proposed Prompt Edit (exact prose)

Add after `SELF-CHECK`:

```md
- **REJECTION-GATE**: If during your reasoning you considered a level higher than
  your final choice and rejected it, state the specific behavior text that
  disqualifies the higher level. If you cannot point to concrete disqualifying
  evidence from the behavior description, keep the higher level.
```

## Why This Could Escape the Local Maximum

This directly targets the mechanism producing 43% of errors: the model knows the right answer but talks itself down. Unlike previous attempts that tried to strengthen specific level definitions (which created anchoring problems), this is a meta-cognitive gate on the reasoning process itself. It doesn't bias toward any particular level -- it just makes the "override your own correct reasoning" path harder.

It's also low-risk because it only fires when the model has already considered a higher level. If the model never considers System for a truly-Integration behavior, this gate never activates. It only intervenes when the model is already wavering -- which is exactly when the self-aware errors occur.

## Scathing Critique

The model may learn to simply not mention the higher level in its reasoning, avoiding the gate entirely. If the model stops "considering" higher levels to dodge the justification requirement, this becomes a no-op or worse -- it could suppress the consideration of higher levels entirely, reducing the model's reasoning breadth.

Also, "concrete disqualifying evidence" is vague. The model can always fabricate a disqualification reason from behavior text. Whether it does depends on how literally it follows the instruction.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Could slow reasoning and produce verbose justifications that still arrive at wrong answers.

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
| 42 | 20260329-015626 | keep | -27.055162739793804 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.

## Epistemological status

Explore subset (stratified): `ec-02, ec-04, ec-06, ec-07, ec-03, ec-14`  
Baseline subset loss: `67.74`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v2-primary | 66.0976 | -1.6418 | improved 1, hurt 2, flat 3 | ec-07 drives 88% of gain |
| v2plus-stronger-counter | 67.3149 | -0.4245 | improved 2, hurt 2, flat 2 | distributed |

Winner: `v2-primary` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
