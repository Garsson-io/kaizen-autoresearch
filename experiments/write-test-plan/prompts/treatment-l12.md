You are writing a test plan for a software engineering issue.

For each behavior, reason about the minimum test infrastructure needed to catch
a real failure — not just to verify happy-path logic.

## Step 1: Classify using the rich 12-step ladder

First, internally classify each behavior using this rich ladder, then translate
to the 5-step scoring ladder in Step 2.

| Rung | Name | When to use |
|------|------|-------------|
| L0 | Static Analysis | TypeScript/lint only — no runtime behavior |
| L1 | Pure Unit | Single function, all deps mocked |
| L2 | Integrated Unit | Multiple real modules, real SQLite :memory:, real temp files |
| L3 | Build Verification | Build artifact must be produced in target env |
| L4 | Subprocess Boundary | Real OS subprocess spawned (stdin/stdout/exit codes) |
| L5 | Pipeline (stubbed) | Full pipeline with stubbed external services |
| L6 | Pipeline (observable) | Like L5 with structured stage-by-stage assertions |
| L7 | Real External Service | Real network, real credentials, real API |
| L8 | Single LLM Call | First real model call — tests prompt-to-response behavior |
| L9 | Tool-use Session | Real LLM + real tool calls in a bounded session |
| L10 | Skill Invocation | Full skill invocation with hooks and one bounded task |
| L11 | Skill Chain | Multiple skills in sequence with real handoffs |
| L12 | Full Behavioral | Real repo, real CI, realistic operational conditions |

## Step 2: Translate to the 5-step scoring ladder

| 5-step level | Corresponds to | Key signal |
|---|---|---|
| **Unit** | L0, L1, L2 | All in-process, no subprocess, no external call, no LLM |
| **Integration** | L3 | Build artifact is a meaningful boundary in this stack |
| **System** | L4, L5, L6, L7 | Real subprocess OR real external service, no LLM |
| **Agentic** | L8, L9 | Real LLM call — outcome depends on model non-determinism |
| **Workflow** | L10, L11, L12 | Multiple agentic steps in sequence |

**Critical distinction — System vs Agentic**: Not every external API call is
Agentic. An API call is Agentic only if the *content* of the response is
non-deterministic and that non-determinism can cause the behavior to fail or
pass differently. If you can fully control the response with a fixture, it is
System. If correctness depends on what a real language model produces, it is
Agentic (L8+).

**Critical distinction — Agentic vs Workflow**: Agentic = one bounded real
model/tool session. Workflow = multiple agentic steps where output of step N
feeds step N+1 (e.g., classify → summarize → route → post).

## Step 3: Self-check (plan_consistent)

After choosing a level, verify: does your test_description actually require
that level of infrastructure? A test that runs a mock where a real subprocess
is needed is NOT consistent with declaring System.

Set plan_consistent = true only if the test you described genuinely needs the
level you declared.

## Key questions per behavior

- Could a pure in-process mock miss this failure? If yes → at least Integration.
- Does the behavior depend on a real OS subprocess or real network? → System.
- Does correctness depend on what a real LLM produces? → Agentic.
- Does it require multiple real agentic steps in sequence? → Workflow.

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
