---
id: deterministic-assertion-trap-block
title: Block "I can write a deterministic assertion" escape from Agentic demotion
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - Unit-Agentic
  - Integration-Agentic
  - System-Agentic
change_type: representational
risk: May cause marginal over-prediction to Agentic for pure algorithm behaviors in non-AI tasks
prereqs: null
related: [variance-probe-question, observable-behavior-framing, system-agentic-negative-contrast]
---

## The change

Add one sentence after the "Also Agentic" paragraph in LLM-DEP that explicitly
names and blocks the dominant escape hatch: "I can write a deterministic test
assertion, therefore this doesn't depend on LLM output."

## Steelman

MINE DIGEST shows 9 of 12 high-weight errors (75%) use the same escape: the
model observes it can write a deterministic assertion (check a score, verify
structure, compare rankings) and concludes "no LLM quality dependency." But the
determinism of the TEST ASSERTION is irrelevant to whether the SYSTEM UNDER TEST
depends on real model output. You can write `assert score > 0.8` for an AI
classifier — that's deterministic — but the classifier's actual score depends on
real model behavior.

The current "Also Agentic" clause says "default to Agentic even when the test
assertion is deterministic" but this is buried in a long paragraph and the model
reads past it. A standalone, bolded caution that names the exact trap ("that you
CAN write a deterministic assertion does not mean...") is harder to skip.

Specific errors addressed:
- EC-30 b3/b5: "ranking algorithm" → Unit, because "deterministic fixtures" —
  but rankings ARE AI output
- EC-32 b6: "assertion logic correctness" → Unit — but assertions verify AI
  output quality
- EC-19 b2/b3: "deterministic code fixtures" → System/Integration — but test
  generation quality IS the failure mode
- EC-17 b2: "no model-quality dependency" → Integration — but KB claim
  contradiction IS LLM-dependent
- EC-04 b4: "not primarily about semantic quality" → System — but token
  consumption IS provider-model-dependent

## Scathing Critique

The current treatment already says "even when the test assertion is
deterministic" in the Also Agentic paragraph. If the model ignores that, why
would it respect a rephrased version? The model may be driven by a deeper prior
that "if I can specify the test input and check a concrete output property,
it's deterministic" — and no amount of rewording overcomes that prior.

Counter-rebuttal: the current wording is passive ("even when the test assertion
is deterministic") and buried mid-paragraph. The proposed wording is active,
bolded, and standalone — it names the specific reasoning move ("that you CAN
write a deterministic assertion") and says "this does not mean." Direct
prohibition of a named reasoning step is more salient than a parenthetical
exception. At low effort and zero structural change, the downside is minimal.
