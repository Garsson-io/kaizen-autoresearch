You are writing a test plan for a software engineering issue.

For each behavior, reason about the minimum test infrastructure needed to catch
a real failure — not just to verify happy-path logic.

- **LEVEL-DEFS** — choose the level that matches the real failure boundary:
  - **Unit** — one local function or object boundary, no I/O
  - **Integration** — several modules wired together, local DB or filesystem
  - **System** — subprocess, OS behavior, real HTTP, or real external API call
  - **Agentic** — result depends on real LLM non-determinism or a real AI/ML model call (e.g., classification, scoring, generation APIs)
  - **Workflow** — multiple agentic steps in sequence, or a full agent pipeline

- **KEY-QUESTIONS** per behavior:
  - **MOCK-MISS**: Does THIS SPECIFIC BEHAVIOR describe a failure that only appears when multiple modules interact — not just a failure that could theoretically exist somewhere in the feature? If the behavior tests one function's logic, parsing, or algorithm, it is Unit even if the broader feature has integration points. Not Unit: if the bug appears only when local modules hand off data/state, Unit is too low. Only escalate to Integration when the behavior's own failure mode is at a module boundary. This sets the Unit floor only; then still apply REAL-INFRA, LLM-DEP, and MULTI-STEP to decide whether the required level is higher.
  - **REAL-INFRA**: Does the behavior depend on OS, real network, or real subprocess? → System.
    Think: could an in-process fake (mock HTTP client, fake filesystem, stub subprocess) reproduce the exact failure, or does the failure only appear with real infrastructure?
    Default: if the behavior's failure mode involves real HTTP responses, real subprocess behavior, real filesystem events, real network conditions, or real OS primitives, start at System and demote to Integration only if the test truly needs nothing beyond in-process module wiring.
    - Integration: "service layer calls repo layer and rollback state propagates correctly" — an in-process fake DB catches this.
    - System: "API handles real HTTP timeouts under load" / "CLI behaves correctly on real subprocess exit codes" / "file watcher detects real OS filesystem events" — in-process fakes hide these failures.
  - **MOCK-HIDE**: Would mocking this dependency always pass, hiding a real failure? If yes → raise the level.
  - **LLM-DEP**: Does correctness depend on what a real LLM produces? → Agentic.
    Think: would running this test 100 times with the real dependency give different outcomes? A deterministic API always returns the same result; an AI/ML model may classify or score differently each run. If outcomes vary → Agentic.
    Default: if the behavior's correctness depends on AI/ML model output quality (classification accuracy, generation quality, ranking relevance, scoring calibration, moderation decisions), start at Agentic and demote to Integration only if the test truly needs nothing beyond deterministic stub responses.
    - Integration: "service routes requests to the correct model endpoint and retries on failure" — a stub endpoint catches this.
    - Agentic: "model classifies documents accurately" / "recommendations are relevant" / "generated summaries preserve key facts" — stubs always pass, hiding real failures.
    Also Agentic: if the behavior's execution path passes through a real AI/ML API call (LLM, classifier, ranker, scorer), default to Agentic — even when the test assertion is deterministic. A mock replaces the real model with a constant, so any bug that depends on what the model actually returns is invisible. Only demote to Integration if the behavior EXCLUSIVELY tests infrastructure around the call (routing, retries, latency, payload format) with zero dependence on model output content.
    **Caution — deterministic-assertion trap**: Two things can be tested with fakes/stubs: (1) the code that wraps or orchestrates the LLM (routing, retries, state machine), (2) the tools the LLM calls (search, calculator, executor). One thing cannot: (3) the decisions the LLM itself makes — what it classifies, generates, ranks, selects, or how it responds to a skill/prompt/hook change intended to steer its behavior. A deterministic fixture replaces the model's actual judgment with a constant, so it can never verify whether the LLM decides correctly or whether steering worked. If the behavior tests LLM output quality or the effect of steering the LLM, keep Agentic regardless of how the assertion is written.
  - **MULTI-STEP**: Does it require multiple real agentic steps in sequence? → Workflow.

- **SELF-CHECK** (plan_consistent): After deciding each level, does your
  test_description actually require that level, or would it pass at a lower one?

- **INTEGRATION-BRAKE**: If your chosen level is Integration, explicitly verify:
  (a) Does the failure need real OS/network/subprocess? If yes → System.
  (b) Does correctness depend on real AI/ML output? If yes → Agentic.
  (c) Does it chain multiple agentic steps? If yes → Workflow.
  (d) If the behavior is about orchestration or state handoff across LLM-involved stages (planner→tool→critic, memory/context carryover, retry/replan loops), do not keep Integration by default: choose Agentic when one model decision governs handoff correctness, and Workflow when multiple model decisions are sequenced.
  If any answer is yes, upgrade unless you can quote behavior text that disqualifies the higher level.

- **REJECTION-GATE**: If during your reasoning you considered a level higher than
  your final choice and rejected it, state the specific behavior text that
  disqualifies the higher level. If you cannot point to concrete disqualifying
  evidence from the behavior description, keep the higher level.
  For demotions below Agentic, include two proofs: one quote that the failure target is deterministic plumbing, and one quote excluding dependence on model output content.

Issue (task_id: {{TASK_ID}}):
---
{{ISSUE_BODY}}
