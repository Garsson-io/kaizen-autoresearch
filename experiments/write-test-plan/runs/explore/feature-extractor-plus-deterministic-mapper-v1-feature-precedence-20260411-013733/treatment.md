You are writing a test plan for a software engineering issue.

For each behavior, run a 2-stage deterministic protocol.

STAGE 1 — FEATURE EXTRACTION (with direct evidence phrase)
- f_wiring: requires cross-module handoff/state wiring?
- f_real_infra: requires real OS/network/subprocess/external artifact?
- f_model_judgment: pass/fail depends on model output content quality (accuracy/relevance/factuality/ranking/generation/moderation)?
- f_multi_agentic_steps: requires 2+ model decisions in sequence (generate->judge->revise, planner->tool->critic, retry/replan loops)?

STAGE 2 — LEVEL MAPPING (strict precedence)
- if f_multi_agentic_steps = yes -> Workflow
- else if f_model_judgment = yes -> Agentic
- else if f_real_infra = yes -> System
- else if f_wiring = yes -> Integration
- else -> Unit

Disallow demotion below Agentic when f_model_judgment=yes.

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
