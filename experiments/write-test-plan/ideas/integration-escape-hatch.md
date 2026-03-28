---
id: integration-escape-hatch
title: Force bidirectional escape from Integration default with concrete litmus tests
status: rejected
effort: medium
expected_impact: high
targets:
  - unit_overprediction
  - system_underprediction
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - Integration-Unit
  - Integration-System
  - Integration-Agentic
  - Integration-Workflow
change_type: structural
risk: Adding Integration-specific gates could over-correct and create new confusion at other boundaries.
prereqs: Keep existing MOCK-MISS, REAL-INFRA, LLM-DEP, MULTI-STEP questions intact.
related: [integration-contract-invariant-gate, top-down-elimination, contrastive-boundary-examples-pack, infra-probe-question, system-environment-artifact-split]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Hypothesis

Sonnet has an "Integration anchor" — 53 of 82 errors (65%) predict Integration. This is fundamentally different from Codex's Unit anchor. The model collapses everything to Integration in both directions: Unit behaviors get pulled up ("modules exist in this feature"), and System/Agentic behaviors get pulled down ("we can wire modules together to test this").

Current KEY-QUESTIONS are sequential gates that work bottom-up (MOCK-MISS sets a floor, then REAL-INFRA/LLM-DEP/MULTI-STEP escalate). But Sonnet doesn't get stuck at Unit like Codex did — it gets stuck at Integration. The bottom-up gates successfully pull it off Unit, but then it stops.

The fix: add an explicit INTEGRATION-CHECK that forces the model to justify staying at Integration once it arrives there. This is a bidirectional litmus test:

- **Down**: "Can this behavior's failure be reproduced by calling ONE function with crafted inputs?" If yes → Unit, not Integration.
- **Up**: "Does this behavior require something that no in-process module wiring can provide?" If yes → check REAL-INFRA/LLM-DEP/MULTI-STEP to find the right higher level.

This targets all three top-impact patterns simultaneously:
1. Integration→System (impact 60): the "up" check forces re-evaluation of real-infra need
2. Integration→Unit (impact 25): the "down" check forces re-evaluation of single-function testability
3. Integration→Agentic/Workflow (impact 32): the "up" check also covers LLM-DEP/MULTI-STEP

Total addressable impact: 117 out of 185 total weighted error impact.

## Proposed Prompt Edit (exact prose)

Add after the KEY-QUESTIONS block and before SELF-CHECK:

```md
- **INTEGRATION-CHECK** (apply only when your answer so far is Integration):
  - **Down-test**: Can this specific failure be reproduced by calling one function/method with crafted arguments, no module wiring needed? If yes → Unit.
  - **Up-test**: Does the failure require real OS/network/subprocess behavior, real AI model output, or multiple sequential AI steps that no in-process fake can reproduce? If yes → re-apply REAL-INFRA, LLM-DEP, MULTI-STEP to find the correct higher level.
  - Integration survives only when both: (a) the failure needs cross-module wiring, AND (b) in-process module wiring is sufficient to reproduce it.
```

## Why This Could Escape the Local Maximum

1. **Targets the dominant error mode for this specific model**: Unlike prior ideas designed for Codex's Unit anchor, this directly addresses Sonnet's Integration collapse.
2. **Bidirectional**: Prior ideas pushed in one direction (down or up). This pushes in both, which is correct for the Integration-anchor pattern where errors go both ways.
3. **Conditional application**: "Apply only when your answer so far is Integration" means it does NOT affect behaviors already correctly classified as Unit/System/Agentic/Workflow. This limits blast radius.
4. **Concrete litmus tests, not abstract principles**: "Can you call ONE function?" and "Does it need real OS/network?" are evaluable per-behavior.
5. **Medium structural change**: Big enough to potentially break out of local maximum, but not so large that it disrupts working elements.

## Scathing Critique

This adds another reasoning step specifically for Integration, making the prompt asymmetric. If the model sometimes arrives at Integration via legitimate reasoning and the INTEGRATION-CHECK pushes it away incorrectly, we lose correct Integration predictions (which are currently 35 correct out of 52 Integration GTs — 67% accuracy).

The "down-test" could be dangerous: the model might rationalize that ANY behavior can be tested with "crafted arguments," which is the same failure mode as the Unit definition expansion that caused the +127 loss regression. The phrasing "one function/method with crafted arguments, no module wiring needed" is critical — the "no module wiring" clause is the safeguard.

The "up-test" restates REAL-INFRA/LLM-DEP/MULTI-STEP which the model already applied and chose Integration over. Re-applying the same questions might just produce the same answer. The hope is that asking "does it need something no in-process fake can reproduce?" reframes the question enough to break the pattern.

Finally, this idea assumes the Integration anchor is stable across runs. If it's a one-run artifact of noise, this optimization is chasing ghosts. We need at least one more baseline run to confirm the pattern.
