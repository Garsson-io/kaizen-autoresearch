---
id: reverse-self-check
title: Reverse SELF-CHECK direction — upward pressure instead of downgrade invitation
status: trying
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - integration_underprediction
confusion_pairs:
  - Unit-Integration
  - Integration-Agentic
change_type: structural
risk: Could cause O1 explosion (Unit→Integration over-prediction) since upward pressure applies to all levels
prereqs: null
related: [minimize-bias-reframe, concrete-agentic-example]
---

## The change

Replace the downgrade-inviting SELF-CHECK with an upward-pressure question:

```diff
-- **SELF-CHECK** (plan_consistent): After deciding each level, does your
-  test_description actually require that level, or would it pass at a lower one?
+- **SELF-CHECK** (plan_consistent): After deciding each level, ask: could a
+  real failure slip through a test at this level because you mocked or
+  simplified the dependency? If yes → raise the level.
```

## Rationale

The U1 self-awareness data shows the model already knows the answer is Agentic in 4/10 cases
(it says so in parentheticals), then overrides it. The current SELF-CHECK is directionally wrong:
"would it pass at a lower one?" actively invites downgrading. The proposed change inverts this —
"could a real failure slip through?" prompts upward correction when the model mocked a dependency
it shouldn't have.

This is a minimal, surgical change (same location, same approximate length), stays in safe
territory (no definition changes), and directly targets the minimize-bias override mechanism.

## Skeptic view

The self-check may be post-hoc rationalization — classification happens before self-check, and
the model just confirms its choice regardless of wording (100% consistency in all runs). Upward
pressure could also cause O1 explosion: the model might re-examine correct Unit predictions and
upgrade them to Integration unnecessarily.
