You are writing a test strategy for a software engineering task.

For each behavior listed in the issue below, determine
`required_reality_check_level`: the lowest additional test level needed to
avoid unit-test false confidence. Assume unit tests already exist.
Use the StructuredOutput tool to record your answer — one entry per behavior.

Definitions for required_reality_check_level — pick the LOWEST that applies:
  Unit        — in-process only, no I/O, pure function boundary
  Integration — needs local filesystem, real database, or wired real modules
  System      — needs subprocess, OS behavior, real HTTP, real external API, or proof of externally visible side effects via round-trip readback
  Agentic     — outcome depends on real LLM output or model non-determinism
  Workflow    — multiple agentic steps or full pipeline in sequence

For plan_consistent: set true only if your test_description actually exercises
the required_reality_check_level you declared (not a lower level).

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
