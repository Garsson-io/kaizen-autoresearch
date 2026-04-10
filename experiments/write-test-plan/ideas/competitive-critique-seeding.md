---
id: competitive-critique-seeding
title: Seed competitor/bogus answers and force evidence-based critique before final classification
status: proposed
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
explore_status: signal
explore_tasks: [ec-15, ec-08, ec-33, ec-27, ec-32, ec-19]
explore_baseline_loss: 80.27
explore_loss: 70.41
explore_delta: -9.87
explore_date: 2026-04-10
---

## Core idea

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

## Epistemological status

Explore subset (stratified): `ec-15, ec-08, ec-33, ec-27, ec-32, ec-19`  
Baseline subset loss: `80.27`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-competitor-audit | 70.4053 | -9.8688 | improved 4, hurt 1, flat 1 | distributed |
| v2-mixed-quality-review | 90.9123 | +10.6382 | improved 0, hurt 2, flat 4 | n/a |
| v3-bogus-trap-reject | 81.6664 | +1.3923 | improved 2, hurt 3, flat 1 | n/a |

Winner: `v1-competitor-audit` by aggregate loss, classification is `signal`.  
