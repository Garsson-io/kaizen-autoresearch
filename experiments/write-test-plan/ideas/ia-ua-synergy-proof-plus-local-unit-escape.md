---
id: ia-ua-synergy-proof-plus-local-unit-escape
title: Combine strict AI demotion-proof with explicit local-unit escape hatch
status: proposed
effort: low
expected_impact: medium
targets:
  - agentic_underprediction
  - consistency_failures
confusion_pairs:
  - Integration-Agentic
  - Unit-Agentic
  - Integration-Unit
change_type: representational
risk: Could create contradictory branching if the "local-unit" escape is interpreted too broadly.
prereqs: Keep the escape narrowly scoped to explicit single-boundary local behaviors with no cross-module handoff.
related: [toploss-ia-ua-round-2, deterministic-assertion-trap-block, mock-miss-scope-clarification]
explore_status: no-signal
explore_tasks: [ec-28, ec-06, ec-20, ec-31, ec-17, ec-29]
explore_baseline_loss: 79.78
explore_loss: null
explore_delta: null
explore_date: 2026-04-11
---

## Core idea

Iteration 2 shows complementary strengths between `v1` and `v3`:
- `v3` ("PLUMBING-ONLY EXCEPTION (STRICT)") produced the strongest first-pass gain (`-23.46`) and reduced high-weight EC-11 misses.
- `v1` ("IA-UA DEMOTION PROOF") held up better on holdout and avoided a local Integration-over-Unit miss on EC-35.

Synergy hypothesis: keep `v3`'s strict anti-demotion rule for AI-dependent behaviors, but add a narrow explicit Unit escape for clearly local deterministic policy/mapping behaviors so the model does not over-escalate Integration.

## Evidence mined from Iteration 2

- Pass 1 (`seed 303`): winner `v3`, delta `-23.46`; largest lift came from EC-11.
- Holdout (`seed 404`): winner flipped to `v1`, delta `-1.32`; `v3` became almost flat (`-0.24`).
- EC-11 error profile:
  - `v1`: 3 errors (`b3`, `b5`, `b1`)
  - `v3`: 1 error (`b1`)  
  => `v3` clearly better on high-impact IA/UA boundary behavior.
- EC-35 profile:
  - `v1`: all correct
  - `v3`: `EC-35 b3` (`Integration→Unit`)  
  => `v1` better at preserving local Unit calls.

## Proposed prompt edit (single additive block)

Add near the LLM-DEP / rejection-gate region:

```md
- **IA-UA + LOCAL-UNIT SYNERGY CHECK**:
  - If behavior includes AI/ML/LLM dependency and final level is Unit/Integration, quote exact behavior text proving the assertion is plumbing-only (routing/retry/timeout/payload-shape) and not output-quality dependent.
  - Local Unit escape: if behavior explicitly scopes to a single local policy/mapping boundary (no cross-module handoff, no real infra dependence, no AI-output-quality dependence), keep Unit even if the broader feature contains AI stages.
```

## Steelman

This combines the strongest mechanism from each winner:
- `v3`'s strict demotion guard suppresses false drops below Agentic on AI-dependent behaviors (where high weighted loss currently sits).
- `v1`'s explicit proof framing helps prevent over-correcting to Integration when behavior text is clearly local deterministic logic.

Because this is one additive guard block (not a structural rewrite), it is low-effort and directly testable in one explore iteration.

## Scathing Critique

The combined rule may be cognitively heavy and produce branch confusion. The model may cherry-pick the local escape to bypass the demotion guard, or over-apply the demotion guard and ignore the escape. If that happens, this will simply preserve winner-flip instability in a new wording.

## Epistemological status

Explore subset (stratified): `ec-28, ec-06, ec-20, ec-31, ec-17, ec-29`  
Baseline subset loss: `79.78`

| Variation | Loss | Delta vs baseline | Per-task direction | Concentration |
|---|---:|---:|---|---|
| v1-synergy-core | 81.8680 | +2.0906 | improved 1, hurt 4, flat 1 | n/a |
| v2-synergy-strict | 108.3830 | +28.6056 | improved 0, hurt 6, flat 0 | n/a |
| v3-synergy-light | 87.1675 | +7.3901 | improved 1, hurt 4, flat 1 | n/a |

No winner — all variations flat or worse. Classification: `no-signal`.

