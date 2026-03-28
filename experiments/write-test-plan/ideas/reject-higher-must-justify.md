---
id: reject-higher-must-justify
title: Force explicit disqualifying evidence when rejecting a considered higher level
status: proposed
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
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
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
