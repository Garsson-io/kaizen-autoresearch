---
id: anti-deferral-gate
title: Explicit anti-deferral instruction — "never classify lower to avoid complexity"
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
change_type: framing
risk: May read as generic "try harder" instruction with no signal value
prereqs: null
related: [explicit-cost-of-error, persona-with-trauma]
last_run: null
last_iteration: null
last_outcome: null
last_delta: null
retry_trigger: null
owner: null
---
*Source: Garsson-io/kaizen#1014, #1019 — agents default to lower levels and self-certify correctness*

## Steelman

Issues #1014 and #1019 document a systematic pattern across the kaizen codebase: agents default to the lowest-effort classification and then rationalize it. In #1014, the agent correctly identified `SessionSimulator` as the seam but still wrote "unit tests only, E2E deferred." In #1019, the agent self-certified PASS despite stored FAIL findings.

The same pattern manifests in our experiment: the model classifies "external AI classification API" as System (lower, simpler) instead of Agentic (higher, more complex) because System is the path of least resistance. The model doesn't have a "this is too simple, I should reconsider" circuit.

A targeted anti-deferral instruction:

```
WARNING: Do NOT choose a lower level to avoid test complexity. If a behavior
requires a real AI model call to catch the failure, classify it as Agentic
even though Agentic tests are harder to write than System tests. The goal
is CORRECTNESS, not test simplicity.
```

This is not generic "think carefully" — it names the specific failure pattern (choosing lower to avoid complexity) and the specific level (Agentic) where it occurs. It's 3 lines, directly addresses the root cause from production incidents, and costs nothing.

## Scathing Critique

The model isn't choosing System because it's trying to avoid complexity. It's choosing System because it genuinely believes "external API call" = System. There's no evidence the model is performing cost-benefit analysis about test difficulty — it's just pattern-matching on "external API."

The #1014 and #1019 incidents involve a different cognitive architecture: multi-step plan formation where heuristics pre-fire and rationalization follows. Our task is single-shot classification — there's no plan to default to, no deferral mechanism, no self-certification. The model outputs one JSON per behavior. It doesn't have the opportunity to "defer" Agentic classification to a follow-up.

Adding "do NOT choose lower to avoid complexity" is functionally the same as "think carefully about Agentic" — which is exactly the kind of generic instruction the `program.md` ground rules say not to add ("Add generic 'think carefully' language — no signal value"). Unless the model is actively reasoning about test complexity (which we have no evidence for), this instruction addresses a phantom failure mode.

## Hypothesis

Explicit anti-deferral instruction — "never classify lower to avoid complexity" should reduce targeted confusion by improving decision-boundary clarity.

## Exact Edit

Specify the exact prompt section and minimal diff before running explore/full eval.

## Expected Signal

- Primary targets: See frontmatter confusion_pairs.
- Expected effect: lower weighted loss on targeted pairs.
- Risk watch: May read as generic "try harder" instruction with no signal value

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
|  |  |  |  | no run recorded |

## Reusable Lesson

TODO: record one portable lesson after each try.
