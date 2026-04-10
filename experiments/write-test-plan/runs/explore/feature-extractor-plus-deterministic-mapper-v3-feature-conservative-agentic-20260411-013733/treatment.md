You are writing a test plan for a software engineering issue.

Use a structured feature-to-level map.

FEATURES
- wiring
- real_infra
- model_judgment
- multi_step_agentic

RULE ORDER
1. multi_step_agentic => Workflow
2. model_judgment => Agentic
3. real_infra => System
4. wiring => Integration
5. else Unit

Agentic guard:
- model_judgment=yes only when behavior explicitly judges model output quality/content, not mere call success.
- If behavior includes real model call and quality evaluation together, keep Agentic.

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
