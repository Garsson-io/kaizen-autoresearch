---
id: competitive-critique-seeding
title: Seed competitor/bogus answers and force evidence-based critique before final classification
status: rejected
effort: medium
expected_impact: medium
targets:
  - consistency_failures
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - Agentic-Workflow
  - Integration-System
change_type: meta-cognitive
risk: Can cause reflexive contrarian behavior (rejecting good reasoning) unless acceptance criteria are explicit.
prereqs: Critique must require behavior-quoted evidence, not tone/style disagreement.
related: [two-step-review-loop, adversarial-self-debate, hypothesis-validation-step]
explore_status: concentrated-signal
explore_tasks: [ec-35, ec-31, ec-23, ec-03, ec-34, ec-24, ec-29, ec-20]
explore_baseline_loss: 97.62
explore_loss: 96.15
explore_delta: -1.47
explore_date: 2026-04-11
last_run: 20260411-002056
last_iteration: 64
last_outcome: discard
last_delta: 28.5687
retry_trigger: Retry only after model/corpus/GT/top-loss-pair change.
owner: null
---
## Hypothesis
Before finalizing each behavior level, force the model to critique a candidate answer that may be wrong. The candidate can be framed as coming from a competitor model, a random baseline, or a pre-baked canned rationale.

Goal: trigger deeper second-pass reasoning and reduce first-answer anchoring.

## Variants to test

### A) Competitor-origin critique

Prompt pattern:
- "A competing model proposed this label+justification."
- "Your job: find up to 3 concrete flaws tied to behavior text."
- "If no concrete flaw exists, keep it."

### B) Mixed-quality plan review

Provide 2-3 candidate rationales per behavior:
- one likely strong,
- one ambiguous,
- one intentionally bad.

Require ranking and explicit reject reasons before final answer.

### C) Bogus-trap rejection gate

Inject known-wrong canned rationales (e.g., "always choose lowest if test can be mocked").
Require explicit rejection of those traps when they conflict with behavior text.

## Guardrails

- Reject only with behavior-quoted evidence.
- If critique fails to produce concrete evidence, default to "accept with caveats" instead of forced rejection.
- Score critique quality on factual grounding, not aggression.

## Steelman

This can operationalize the user's intuition: bad candidate answers often trigger stronger analysis than blank-slate generation. It also creates explicit anti-anchoring pressure at the decision boundary.

## Scathing Critique

"Competitive framing" may add noise and persona bias rather than real rigor. If the model over-learns to attack, calibration drops and false negatives rise.

## Epistemological Status
Explore subset (stratified): `ec-35, ec-31, ec-23, ec-03, ec-34, ec-24, ec-29, ec-20`  
Baseline subset loss: `97.62`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-competitor-audit | 115.1191 | +17.5010 | improved 2, hurt 5, flat 1 | n/a |
| v2-mixed-quality-review | 96.1471 | -1.4710 | improved 4, hurt 2, flat 2 | distributed |
| v3-bogus-trap-reject | 100.8220 | +3.2039 | improved 2, hurt 4, flat 2 | n/a |

Winner: `v2-mixed-quality-review` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: Can cause reflexive contrarian behavior (rejecting good reasoning) unless acceptance criteria are explicit.

## Explore Plan

- Define v1/v2/v3 variants with one isolated change each.
- Current explore_status: concentrated-signal.

## Promotion Gate

Follow `experiments/write-test-plan/program.md` LOOP step 4.5 (holdout/stability gate and `no-promote` rules).

## Run History

| Iter | Run | Outcome | Delta | Note |
|---:|---|---|---:|---|
| 64 | 20260411-002056 | discard | 28.5687 | backfilled from results log |

## Reusable Lesson

TODO: record one portable lesson after each try.
