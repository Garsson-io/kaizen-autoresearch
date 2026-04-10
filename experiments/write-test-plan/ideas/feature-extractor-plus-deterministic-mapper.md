---
id: feature-extractor-plus-deterministic-mapper
title: Split classification into evidence extraction + deterministic level mapping
status: proposed
effort: high
expected_impact: high
targets:
  - consistency_failures
  - noise_sensitivity
  - agentic_underprediction
  - workflow_gap
confusion_pairs:
  - Unit-Integration
  - Integration-System
  - System-Agentic
  - Agentic-Workflow
change_type: structural
risk: If extracted features are wrong, the deterministic mapper confidently produces the wrong level.
prereqs: The model can reliably extract a compact set of binary/ordinal signals with quoted evidence.
related: [signal-scoring-rubric, boundary-proof-obligation-framework, reject-higher-must-justify]
explore_status: null
explore_tasks: []
explore_baseline_loss: null
explore_loss: null
explore_delta: null
explore_date: null
---

## Core idea

Stop asking the model to do "free-form classify in one shot." Instead, force a two-stage protocol:

1. Extract a fixed feature vector from each behavior with evidence quotes.
2. Map that vector to a level using a deterministic rule table.

Example feature vector:
- `requires_cross_module_wiring`: yes/no
- `requires_real_infra_artifact`: yes/no
- `requires_model_judgment_or_nondeterminism`: yes/no
- `requires_multi_step_agent_session`: yes/no
- `evidence_quality`: weak/strong

Example mapping (strict precedence):
- if `requires_multi_step_agent_session=yes` -> Workflow
- else if `requires_model_judgment_or_nondeterminism=yes` -> Agentic
- else if `requires_real_infra_artifact=yes` -> System
- else if `requires_cross_module_wiring=yes` -> Integration
- else -> Unit

## Why this is bold

This is a pipeline redesign, not a prompt wording tweak. It replaces subjective "pick a level" reasoning with explicit typed evidence + deterministic mapping. The model still reasons, but only in the extraction step.

## Steelman

Most regressions in this repo look like boundary drift: a phrase added for one confusion pair silently changes behavior elsewhere. A deterministic mapper prevents that drift. If a behavior flips labels, you can inspect exactly which extracted feature flipped and why.

This also creates a measurable debugging surface:
- extraction error (wrong feature)
- mapping error (wrong rule)
- GT disagreement (feature is right, label policy is wrong)

That decomposition could accelerate iterations versus editing natural-language definitions blind.

## Scathing Critique

This may just move the problem: feature extraction is itself classification in disguise. If the model cannot reliably decide "requires real infra artifact," a deterministic mapper won't save it.

It can also become brittle. Real behaviors often satisfy multiple signals (e.g., real infra + model judgment + orchestration). Hard precedence may overfit the current corpus and fail on new tasks.

Finally, this is expensive to integrate into the current eval harness and may break comparability unless carefully staged as an optional alternate scorer.
