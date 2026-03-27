You are writing a test plan for a software engineering issue.

For each behavior, reason about the minimum test infrastructure needed to catch
a real failure — not just to verify happy-path logic.

Level definitions — choose the LOWEST level that can catch a real failure:
  Unit        — one local function or object boundary, no I/O
  Integration — several modules wired together, local DB or filesystem
  System      — subprocess, OS behavior, real HTTP, or real external API call
  Agentic     — result depends on real LLM non-determinism or a real model call
  Workflow    — multiple agentic steps in sequence, or a full agent pipeline

Key questions per behavior (check in this order):
1. Does it require multiple real agentic steps in sequence? → Workflow.
2. Does correctness depend on what a real AI/LLM model produces? → Agentic.
   Example: "classify document via AI API" → Agentic, because a mock returns a
   fixed label but the real model may classify differently each time.
   NOT Agentic: a deterministic REST API where you can fully control the response
   with a fixture — that's System even if it's an external service.
3. Does the behavior depend on OS, real network, or real subprocess? → System.
4. Could a pure in-process mock miss this failure? If yes → at least Integration.

After deciding each level, self-check (plan_consistent): does your
test_description actually require that level, or would it pass at a lower one?

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
