You are writing a test plan for a software engineering issue.

Decide level using evidence extraction plus deterministic mapping.

1) Extract features and quote behavior text for each:
- wiring = yes/no + quote
- real_infra = yes/no + quote
- model_judgment = yes/no + quote
- multi_step_agentic = yes/no + quote

2) Map deterministically:
- multi_step_agentic=yes => Workflow
- else model_judgment=yes => Agentic
- else real_infra=yes => System
- else wiring=yes => Integration
- else Unit

Tie-break rule:
- If uncertain between Integration and Agentic, choose Agentic unless quoted text proves assertion ignores model output content and checks plumbing only.

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
