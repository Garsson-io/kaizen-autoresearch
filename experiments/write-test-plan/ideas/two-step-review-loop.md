---
id: two-step-review-loop
title: Force two-pass review (initial answer -> explicit re-review)
status: proposed
effort: medium
expected_impact: high
targets:
  - consistency_failures
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - Integration-System
  - Agentic-Workflow
change_type: structural
risk: Extra structure can increase verbosity and may overfit to process compliance instead of better level decisions.
prereqs: Keep existing level definitions and gates intact; add only process constraints.
related: [reverse-self-check, hypothesis-validation-step, evidence-ledger-decision-protocol]
explore_status: concentrated-signal
explore_tasks: [ec-15, ec-08, ec-33, ec-27, ec-32, ec-19]
explore_baseline_loss: 80.27
explore_loss: 80.09
explore_delta: -0.19
explore_date: 2026-04-10
---

## Core idea

Require a hard two-step reasoning flow for each behavior:

1) produce a provisional level + justification,
2) re-review that answer against contradiction checks and potentially revise.

The goal is to prevent first-thought anchoring (especially Integration defaults) and force an explicit second-pass audit.

## Implementation options

### A) True second runner (strongest, highest cost)

Run pass-1 and pass-2 as separate model invocations in the evaluation harness, where pass-2 receives pass-1 output and must either confirm or revise with explicit evidence.

### B) Structured-output gate with required `first_pass` and `final_pass` fields (no second runner)

Keep one invocation, but enforce schema fields that must both be populated:
- `first_pass.level` + `first_pass.justification`
- `second_pass.audit_checks` (what was challenged)
- `final_pass.level` + `final_pass.revision_reason`

Reject outputs where `second_pass` is empty or identical boilerplate. This forces at least textual second-pass work without changing runner topology.

### C) Prompt-level stop-and-continue protocol (no second runner)

Inside the prompt, require a strict marker sequence per behavior:
- `PASS1:` provisional choice
- `PASS2-AUDIT:` explicit challenge against higher/lower adjacent levels
- `PASS2-FINAL:` locked final choice

Add a hard instruction: if `PASS2-AUDIT` does not cite concrete disqualifying behavior text, keep the higher-risk alternative. This makes step 2 an obligation, not optional self-check prose.

### D) Tooling-time validator hook on reasoning trace (no second runner)

Add a post-generation validator in `run-probe.ts` (or scoring precheck) that rejects malformed two-pass traces:
- missing pass sections,
- no changed/confirmed decision rationale,
- no explicit rejection evidence for discarded levels.

On validation failure, retry the same prompt once with an auto-injected repair instruction. This forces two-step compliance through output contract enforcement, not a second model call.

## Steelman

This directly targets a recurring failure mode: model gives correct caveats, then still chooses an under-justified lower level. A mandatory second-pass with explicit contradiction handling should reduce that pattern.

## Scathing Critique

If the model treats pass-2 as a formatting ritual, quality may not improve while cost/latency rises. The approach needs validation checks strong enough to detect fake compliance.

## Epistemological status

Explore subset (stratified): `ec-15, ec-08, ec-33, ec-27, ec-32, ec-19`  
Baseline subset loss: `80.27`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-two-pass-self-check | 80.0878 | -0.1863 | improved 1, hurt 1, flat 4 | ec-33 drives 67% of gain |
| v2-pass-markers | 85.7232 | +5.4491 | improved 1, hurt 3, flat 2 | n/a |
| v3-adjacent-challenge | 90.8792 | +10.6051 | improved 1, hurt 4, flat 1 | n/a |

Winner: `v1-two-pass-self-check` by aggregate loss, classification is `concentrated-signal`.  
Recommendation: do not treat this as broad signal without either a second stratified explore set or full-corpus confirmation.
