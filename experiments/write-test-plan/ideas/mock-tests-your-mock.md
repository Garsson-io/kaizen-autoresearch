---
id: mock-tests-your-mock
title: Add anti-rationalization clause to Agentic definition — "mocking the model tests your mock, not the system"
status: proposed
effort: low
expected_impact: high
targets:
  - agentic_underprediction
confusion_pairs:
  - System-Agentic
  - Integration-Agentic
change_type: representational
risk: Adding more text to the Agentic definition line may dilute the concrete examples that already work
prereqs: null
related: [concrete-agentic-example, mock-exposes-nothing, ai-api-equals-agentic-rule]
---

## Steelman

The U1 pattern (10 Agentic misses, impact 40) has a single rationalization: "we can mock the AI/ML API." In 4/10 cases the model explicitly acknowledges Agentic is needed, then picks lower because "we can mock it." The concrete-agentic-example (iter 19) improved loss by 79.84 by adding examples to the Agentic definition — proving the Agentic definition line is the safest edit location.

This adds 9 words to the same line: "mocking the model tests your mock, not the system." This directly counters the specific rationalization the model uses in U1 errors. It doesn't add a new rule or question — it embeds the counter-argument into the definition itself, so the model sees it at classification time, not just at self-check time.

The phrasing is deliberately colloquial ("tests your mock") to create a memorable decision shortcut: when the model is about to type "we can mock the LLM," it encounters this phrase and must reckon with it.

## Scathing Critique

The Agentic definition line is already long after concrete-agentic-example (28 words). Adding 9 more makes it 37 words — the longest definition by far. Long definitions dilute attention. The model may start skimming the Agentic line and miss the concrete examples that actually worked.

Also, "tests your mock, not the system" is meta-commentary about testing methodology, not a level definition. It changes the Agentic line from "here's what Agentic means" to "here's what Agentic means and here's why you shouldn't mock it." Mixing definition with advice may confuse the model.

The MOCK-HIDE question already says "Would mocking this dependency always pass, hiding a real failure? If yes, raise the level." This new clause is redundant with MOCK-HIDE — it's the same message in a different location. Redundancy isn't free; it costs attention tokens.
