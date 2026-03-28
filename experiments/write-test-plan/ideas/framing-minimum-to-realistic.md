---
id: framing-minimum-to-realistic
title: Change "minimum test infrastructure" to "realistic test infrastructure" in framing sentence
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
risk: "Realistic" is slightly vague but less directional than "minimum" — may cause small over-prediction on easy tasks
prereqs: null
related: [minimize-bias-reframe, replace-lowest-with-realistic]
---

## Steelman

The minimize-bias-reframe (iter 11, kept) changed the LEVEL-DEFS header from "choose the LOWEST level" to "choose the level that matches the real failure boundary." This worked (-2.7% score improvement). But there is a SECOND minimize anchor that was not addressed: line 3 says "reason about the **minimum** test infrastructure needed to catch a real failure."

This second anchor reinforces the exact same optimization mindset that minimize-bias-reframe successfully weakened. The model reads "minimum" before it reads anything else — it's the FIRST instruction. Anchoring research shows primacy effects are strong: the first framing instruction sets the optimization target for all subsequent reasoning.

The change: "minimum" → "realistic." One word. No new content, no structural change, no definition modification. This completes the debiasing that minimize-bias-reframe started.

Evidence this mechanism works: minimize-bias-reframe changed one phrase in the same direction and was kept. The remaining U1 errors (8 behaviors) still show the model acknowledging Agentic then selecting lower — the minimize anchor is still active because the FIRST sentence still says "minimum."

## Scathing Critique

"Realistic" is weaker than "minimum" as an instruction. "Minimum" tells the model exactly what to optimize — lowest sufficient level. "Realistic" is ambiguous — realistic for whom? A startup might realistically skip integration tests. A bank might realistically test everything at System level.

The minimize-bias-reframe worked, but the delta was within noise (2.7% vs 3% noise floor). This second-order change targets the same mechanism with a weaker lever. Expected impact is likely smaller than the first change, possibly within noise.

Also, the model's remaining U1 errors may not be caused by the "minimum" anchor at all. They may be caused by genuine confusion about what constitutes an AI dependency (the definitional problem, not the framing problem). Changing framing won't fix a model that doesn't know "classification API" implies non-determinism.
