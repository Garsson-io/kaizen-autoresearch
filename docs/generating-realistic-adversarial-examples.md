# Generating Realistic Adversarial Examples

How to create corpus tasks that are both adversarial (tricky for the classifier) and realistic (look like real software engineering issues). Unrealistic adversarial examples train the prompt to handle contrived edge cases instead of production failures.

## The Realism Constraint

An adversarial example is only useful if a real engineer would plausibly write it. Every task should pass the **"would this show up in a real backlog?"** test:

- A real team would file this issue
- The behaviors listed are things a QA engineer would actually want to test
- The system described could exist in a real codebase
- The phrasing matches how engineers actually write (not how a puzzle-maker writes)

Adversarial examples that fail this test -- trick questions, artificial edge cases, gotcha phrasing -- make the prompt worse, not better. They teach the classifier to be paranoid about adversarial inputs instead of accurate on real ones.

## Realism Sources

The best adversarial examples come from real systems. Use these sources:

### 1. Real Codebases

Read actual open-source projects and extract scenarios where the test level is non-obvious:

```bash
# Browse real issues for inspiration
gh search issues "test plan" --language python --sort updated --limit 20
gh search issues "integration test vs unit test" --sort updated --limit 20
```

Look for:
- PRs where reviewers debated whether a test should be unit or integration
- Issues where a mock test passed but production failed
- Systems that mix deterministic and AI components

### 2. Production Incidents

Post-mortems are gold mines for adversarial examples. Real failures reveal where classification heuristics break:

- "We mocked the API and tests passed, but the real API behaved differently" -- System vs Agentic confusion
- "The unit test covered the logic, but the bug was in how modules wired together" -- Unit vs Integration confusion
- "Each step worked individually but the pipeline failed end-to-end" -- Agentic vs Workflow confusion

### 3. Your Own Team's Codebase

The most realistic examples come from systems you actually work with:

- Find components where you've personally debated the right test level
- Look at tests that were reclassified after a bug escaped
- Identify modules that mix pure logic with external dependencies

## Adversarial Techniques That Stay Realistic

### Ambiguous Terminology

**Technique**: Use the same word for both deterministic and non-deterministic components.

**Why it's realistic**: Engineers actually do this. "Model" can mean a data model (Unit), an ML model (Agentic), or a scoring model (could be either). "Analyzer" can be a regex parser or an LLM. "Engine" can be a rule engine or an inference engine.

**How to apply**: Describe a system with two components that share a name but differ in nature. Never clarify which is AI and which is rules -- let the behavior descriptions be the only signal.

**Example** (EC-25 -- Fraud Detector):
> "The scoring model applies configurable rules... The risk model analyzes transaction context..."

Both are called "model." The scoring model is deterministic (Unit). The risk model is ML (Agentic). A real fraud system would describe them exactly this way.

**Realism check**: Search for "scoring model" in any fintech codebase. This phrasing is standard.

### Escalation Trap

**Technique**: Describe complex pure logic that sounds like it needs infrastructure.

**Why it's realistic**: Many real systems have complex algorithms that are 100% unit-testable despite sounding complex. Timezone handling, cron parsing, graph algorithms, formula evaluation -- these are all pure functions that engineers frequently over-test with integration infrastructure.

**How to apply**: Describe a system that sounds infrastructure-heavy (caching, scheduling, routing) but where every behavior is actually a pure function operating on in-memory data structures.

**Example** (EC-26 -- Job Scheduler):
> "Handles timezone-aware scheduling including DST transitions..."

Sounds like it needs real clocks and timezones. But DST math is a pure function: input a timestamp and a timezone, output the correct next-run time. No I/O needed.

**Realism check**: Every scheduling library's test suite is 95% unit tests.

### Buried Signal

**Technique**: Put the key classification signal deep in the description, not in the title or first sentence.

**Why it's realistic**: Real issue descriptions bury the important details. An engineer writing a ticket about a "content moderation service" will describe the architecture first and mention "uses GPT-4 for classification" in paragraph 3.

**How to apply**: Lead with the system architecture (which suggests one level), then mention the critical dependency (which changes the level) later in the behavior description.

**Example** (EC-11 -- Chatbot):
> "The tone-checking step re-prompts the LLM if the initial response is flagged..."

The word "LLM" appears in the middle of a sentence about tone-checking. A classifier that only scans for AI keywords in the system description would miss it.

**Realism check**: Read any real GitHub issue about a chatbot. The AI dependency is rarely in the title.

### Fallback Level Change

**Technique**: A system where the primary path requires one test level and the fallback path requires a different (lower) level.

**Why it's realistic**: Real systems have graceful degradation. A translation service falls back from neural MT to dictionary lookup. A recommendation engine falls back from personalized ML to popularity-based sorting. Each path has a different test level.

**How to apply**: Describe both paths. The primary path behavior is one level (e.g., Agentic for AI translation). The fallback behavior is a different level (e.g., Integration for dictionary lookup). The fallback-triggering behavior is yet another level (e.g., System for API error handling).

**Example** (EC-24 -- Translation Service):
> "When the translation API returns a 503 error, the service falls back to a phrase-lookup dictionary stored in SQLite."

Three behaviors, three levels: Agentic (AI translation quality), System (API error handling), Integration (SQLite lookup).

**Realism check**: Every production service with an AI dependency has a fallback path.

### Parallel vs Sequential

**Technique**: Multiple AI agents that run in parallel (each is Agentic) vs a pipeline where each step depends on the previous (Workflow).

**Why it's realistic**: Real multi-agent systems use both patterns. A document analysis system might run 3 reviewers in parallel (each Agentic), then merge results (Integration), then deliver the report (could be Workflow if the delivery depends on the AI outputs).

**How to apply**: Describe a system with multiple AI components. Make it clear whether they run independently (parallel = each is Agentic) or depend on each other's outputs (sequential = Workflow).

**Example** (EC-23 -- Legal Contract Analyzer):
> "Three independent AI reviewers run in parallel... A merge step combines the three outputs..."

Each reviewer is Agentic (independent AI call). The merge is Integration (deterministic conflict resolution). The full pipeline is Workflow (multiple agentic steps + merge + deliver).

**Realism check**: This is how real document analysis systems work (e.g., legal tech, medical records).

## Label Distribution: Match Reality

Real codebases have approximately this test distribution:

| Level | Real-world % | Why |
|-------|-------------|-----|
| Unit | 60-70% | Most code is pure logic: validation, transformation, calculation |
| Integration | 15-25% | Module wiring, DB operations, file I/O |
| System | 5-10% | External APIs, subprocess, real network |
| Agentic | 2-5% | AI/LLM calls (growing rapidly) |
| Workflow | 1-2% | End-to-end pipelines |

Your corpus should reflect this distribution. If 50% of your behaviors are Agentic, you're over-indexing on the hard cases and under-representing the baseline.

**How we apply this**: EC-26 (Job Scheduler) has 5/5 Unit. EC-28 (Spreadsheet Engine) has 7/10 Unit. EC-22 (Caching Layer) has 4/5 Unit. These "boring" tasks are essential -- they test whether the classifier resists escalating complex-but-pure logic.

## The Realism Checklist

Before adding an adversarial task to the corpus, verify:

- [ ] **Would a real team build this system?** Not a toy example or contrived scenario
- [ ] **Would a real engineer write the description this way?** Not puzzle-like or obviously tricky
- [ ] **Are the behaviors things a QA engineer would actually test?** Not artificial gotchas
- [ ] **Does the adversarial technique arise naturally?** Ambiguous terminology that real codebases use, not invented jargon
- [ ] **Is the ground truth defensible?** Could you explain your label to a senior engineer and have them agree?
- [ ] **Does the label distribution match reality?** Roughly 60-70% Unit, not 50% Agentic

## Anti-Patterns: Unrealistic Adversarial Examples

| Anti-Pattern | Why It's Bad | Realistic Alternative |
|-------------|-------------|----------------------|
| "A system that uses AI but pretend it doesn't" | No real issue would hide this | Use ambiguous terminology that's genuinely ambiguous in real codebases |
| Behaviors that describe the test, not the system | Real issues describe what the system does, not how to test it | Write behaviors as requirements, not test prescriptions |
| Trick questions with gotcha answers | Teaches the prompt to be paranoid | Use confusion pairs that arise from genuine architectural ambiguity |
| All-Agentic tasks | Unrealistic -- most systems are mostly Unit-testable | Mix levels with realistic proportions |
| Systems that don't exist | Can't validate ground truth | Base on real open-source projects or production architectures |
| Jargon soup | Real engineers write plainly | Use domain-standard terminology |

## Generating at Scale

Use `/autoresearch:scenario` (see [autoresearch-modes.md](autoresearch-modes.md)) to systematically generate tasks. Embed realism constraints directly in the seed scenario:

```
/autoresearch:scenario
Scenario: Generate realistic software engineering issue descriptions for systems
  that mix deterministic and AI components. Each task should describe a plausible
  production system with 5-10 behaviors. The adversarial element should come from
  natural architectural ambiguity, not trick phrasing. Label distribution should
  be roughly 60% Unit, 20% Integration, 10% System, 8% Agentic, 2% Workflow.
Domain: software
Focus: edge-cases
Depth: deep
Iterations: 10
```

After generation, apply the realism checklist to each task before adding it to the corpus. See [adversarial-training.md](adversarial-training.md#generating-adversarial-tasks-with-autoresearchscenario) for the full generate→review→convert→validate workflow.

## Validating Adversarial Quality

A good adversarial task should:

1. **Cause misclassification** -- run it through the current treatment and confirm the model gets at least one behavior wrong
2. **Be fixable** -- there exists a prompt change that could fix the misclassification without breaking other tasks
3. **Be realistic** -- pass the realism checklist above
4. **Target a known confusion pair** -- not random difficulty, but specific label boundaries

```bash
# Test a new task against current treatment
./run-eval.sh --single ec-NEW

# Check which behaviors it gets wrong
npx tsx scripts/score.ts --output runs/latest/out-treatment-ecNEW.json --gt ground-truth/ec-NEW.json
```

If the model gets everything right, the task isn't adversarial enough. If the model gets everything wrong, the task might be unrealistic or the ground truth might be wrong. The sweet spot is 1-2 misclassified behaviors per task.
