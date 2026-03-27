---
id: strip-to-bare-minimum
title: Strip the prompt to absolute minimum — test if LESS guidance beats MORE
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Unit-Integration
change_type: structural
risk: May lose the correct classifications that the key questions currently enable
prereqs: null
related: [minimize-bias-reframe]
---

## Steelman

The baseline prompt (no guidance at all) scores 72.3%. The treatment prompt (with level defs + key questions) scores 85.2% on 30 tasks. But every attempt to ADD more text in run 1 HURT the score. This suggests haiku has a sweet spot — the current prompt may already be past it.

What if we strip even further? Remove the key questions entirely and keep only the level definitions + self-check. The key questions may be causing the minimize bias by encouraging the model to reason through a checklist where the first match (always a lower level) wins.

Test: definitions-only prompt (no key questions, no self-check). If it scores higher, the key questions are net negative.

## Scathing Critique

The baseline has NO definitions and scores 72%. The treatment has definitions + questions and scores 85%. Removing the questions would be somewhere between — likely 72-85%. The questions ARE providing value for non-Agentic classifications (EC-01, EC-05, EC-06, EC-18 all score 99-100%).

The Agentic failure is specific to 11 behaviors. Stripping the prompt hurts the 117 correct classifications to maybe fix 11. Bad tradeoff.
