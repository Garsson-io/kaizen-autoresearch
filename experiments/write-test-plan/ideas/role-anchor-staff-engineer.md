---
id: role-anchor-staff-engineer
title: Staff engineer PR review persona — justify not lower, not higher
status: rejected
effort: low
expected_impact: high
targets:
  - agentic_underprediction
  - unit_overprediction
  - integration_overprediction
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - Integration-Agentic
change_type: framing
risk: Persona framing may conflict with other instructions or cause inconsistent reasoning across tasks
prereqs: null
related: [precision-failure-boundary, concrete-agentic-example]
---

## The change

Add one sentence at the end of the prompt, before the Issue block:

```
Answer as a staff engineer justifying the testing strategy in a PR review. You must be ready to defend why this level — not lower, not higher — is the minimum that would actually catch a real production failure.
```

## Epistemological status

**Explore-run signal only (4 tasks, not full corpus). Do not treat as confirmed.**

Tested 2026-03-28 on tasks ec-03, ec-04, ec-19, ec-30 (the 4 worst-loss tasks in iter19 baseline).

| Metric | Baseline (iter19) | V2 role-anchor | Delta |
|--------|-------------------|----------------|-------|
| Loss (4-task subset) | 128.78 | 86.24 | **-42.54** |

This was the strongest signal of the three variations tested that day:
- V1 anti-lazy: +20.84 loss (worse)
- V2 role-anchor: **-42.54 loss (better)**
- V3 precision: -29.20 loss (better, but weaker)

## Why it might work

The "staff engineer in PR review" frame forces **bidirectional accountability**: you must defend against both under-prediction ("why not higher?") and over-prediction ("why not lower?"). The existing prompt only pushes upward (MOCK-MISS, MOCK-HIDE, LLM-DEP all raise the level — nothing lowers it).

On ec-03 (over-prediction: Integration→System x4) and ec-30 (over-prediction: Unit→Integration x9), the role-anchor reduced over-prediction errors while maintaining Agentic detection.

## Scathing critique

4 tasks is not enough signal. ec-03, ec-04, ec-19, ec-30 are the hardest tasks — improvement here may not generalize. The baseline subset loss (128.78) is disproportionately high, making the delta look large. On the full 30-task corpus, the effect may be much smaller or wash out entirely.

Also: the "not lower, not higher" instruction may create tension with the existing "choose LOWEST level" framing in KEY-QUESTIONS. The model might get confused about which direction to resolve ambiguity.

## Next step

Run on full 30-task corpus to get a real loss number. Compare against iter19 baseline (368.08).
