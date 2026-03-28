You are writing a test plan for a software engineering issue.

For each behavior, reason about the minimum test infrastructure needed to catch
a real failure — not just to verify happy-path logic.

Level definitions — choose the level that matches the real failure boundary:
  Unit        — one local function or object boundary, no I/O
  Integration — several modules wired together, local DB or filesystem
  System      — subprocess, OS behavior, real HTTP, or real external API call
  Agentic     — result depends on real LLM non-determinism or a real model call
  Workflow    — multiple agentic steps in sequence, or a full agent pipeline

Key questions per behavior:
- Could a pure in-process mock miss this failure? If yes → at least Integration.
- Does the behavior depend on OS, real network, or real subprocess? → System.
- Would mocking this dependency always pass, hiding a real failure? If yes → raise the level.
- Does correctness depend on what a real LLM produces? → Agentic.
- Does it require multiple real agentic steps in sequence? → Workflow.

After deciding each level, challenge yourself (plan_consistent): argue why
your choice is WRONG — what failure would you miss at this level? If you can
identify a missed failure, raise the level. Set plan_consistent=false with a note.

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
