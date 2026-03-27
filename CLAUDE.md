# Claude Code Instructions: kaizen-autoresearch

## What this repo is

Autonomous prompt-improvement framework for AI evaluation experiments.
The loop: edit one file → measure a scalar metric → keep if improved, revert if not → repeat.

Each experiment lives in `experiments/<name>/` and follows the same pattern.

---

## Active experiment: write-test-plan

**Question**: Does prompt guidance improve minimum-viable test level classification?

**The 5-level ladder** the AI must classify into:
- Unit — pure in-process logic, no I/O
- Integration — real local modules/DB/filesystem
- System — real subprocess, OS, external non-LLM API
- **Agentic** — real LLM call, outcome depends on model non-determinism
- **Workflow** — multiple agentic steps in sequence

**Success threshold**: ≥75% on round 1 (neutral), ≤10% drop on adversarial rounds 2/3.

---

## Current state (as of 2026-03-27)

| Condition | Score (r1) | Corpus | Notes |
|-----------|-----------|--------|-------|
| baseline | 72.3% | 3-task | No guidance — surprisingly strong |
| treatment-v0 | 66.4% | 3-task | Added level defs + key questions — WORSE (old pipeline) |
| treatment | **81.7%** | 4-task | Fresh run after pipeline fix (score.ts dir mode + grep pattern) |
| treatment-l12 | not yet run | — | L12 ladder → 5-step translation hypothesis |

**Pipeline note**: score.ts directory mode only scanned `.yaml` files (now fixed to also handle `.json`). run-eval.sh grep pattern also fixed. Old 66.4% was from broken pipeline or older probe outputs.

**Current breakdown** (4-task):
| Task | Total | Primary miss |
|------|-------|-------------|
| EC-04 | 55.9% | b3=Unit(GT=Agentic), b4=System(GT=Agentic) — Agentic still the main failure |
| EC-07 | 88.1% | b4=Agentic(GT=Workflow) |
| EC-09 | 97.0% | Clean (slight over-prediction only) |
| EC-10 | 85.7% | b4=Integration(GT=Agentic) |

**Primary failure**: Agentic behaviors score ~5% sufficiency in EC-04. Model calls "external AI API call" as System instead of Agentic.

**Root cause**: Prompt says "depends on real LLM non-determinism" but model doesn't connect "external AI classification API" → "LLM non-determinism."

**Fix candidates** (try in order):
1. Add concrete positive Agentic example: "classifies via AI API → Agentic because mock returns fixed label but real model varies"
2. Explicit disambiguation: "Not every external API = Agentic; only calls where the LLM's choice itself matters"
3. Move Agentic check before System check in key questions

**Secondary failure**: Workflow gap — EC-07 b5, EC-10 b5 (GT=Workflow) predicted as Agentic or lower.

---

## The autoresearch loop

**Plugin**: `autoresearch@uditgoenka` (installed in `~/.claude/settings.json`)

**Verify command**:
```bash
npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score'
```
Outputs a number like `66.4`. Target ≥75. Exits 1 with a clear error if the eval fails or produces no parseable score.

**Config block** is at the top of `experiments/write-test-plan/program.md`.
Run the loop with: `/autoresearch` using program.md as the goal file.

**What is FIXED — never edit**:
- `corpus/` — issue bodies (EC-01 through EC-10)
- `ground-truth/` — expert-labeled GT JSON
- `scripts/` — run-probe.ts, score.ts
- `src/` — Zod schemas
- `prompts/baseline.md` — fixed reference

**What the loop edits — ONLY this**:
- `experiments/write-test-plan/prompts/treatment.md`

---

## Iteration rules

- One hypothesis per iteration — specific, falsifiable in one run
- Smallest change that tests the hypothesis
- Good: add concrete positive example, add NOT-this disambiguation, reorder key questions
- Bad: rewrite whole prompt, add generic "think carefully" language
- Keep if new score > old score; revert otherwise

**Commit format**: `exp/write-test-plan: iter N — <score>% (+Δ%) — <hypothesis>`

---

## Observability

- `leaderboard.md` — updated on every kept commit
- https://github.com/Garsson-io/kaizen-autoresearch/discussions/1 — iteration log
- https://github.com/Garsson-io/kaizen-autoresearch/issues/2 — failure analysis
- https://github.com/Garsson-io/kaizen/issues/1016 — full round results

---

## Adversarial rounds (run all three before declaring success)

```bash
./run-eval.sh --round 1   # neutral
./run-eval.sh --round 2   # "module already has unit tests" — anchoring pressure
./run-eval.sh --round 3   # "team prefers fast tests / deferred" — social pressure
```
A robust prompt drops ≤10% from round 1 to round 3.

---

## Scoring model

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Sufficiency | 55% | Did predicted level ≥ GT minimum? |
| Precision | 20% | Distance from minimum (penalizes over-testing too) |
| Consistency | 15% | plan_consistent: true=1.0, false+note=0.5, false=0.0 |
| Structure | 10% | All required fields present |

Row weights: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4.
Agentic/Workflow behaviors count most — fix those first.

---

## Structured outputs — never grep/awk for values

**Rule**: Any time you'd use `grep | awk | sed` to extract a value from a command, write a TypeScript file with Zod instead.

The pattern (same as `scripts/run-probe.ts`):
1. Run the subprocess with `spawnSync` (or `execSync` for simple cases)
2. Parse the output to extract the value
3. Validate with a Zod schema — fail loudly with a clear error if invalid
4. Output clean JSON (`console.log(JSON.stringify(result))`) or exit 1

**Reference implementations:**
- `scripts/verify.ts` — wraps `run-eval.sh`, outputs `{"score": 74.2}`, exits 1 on failure
- `scripts/run-probe.ts` — pipes prompt to `claude -p --json-schema`, extracts StructuredOutput block, validates with Zod

**For subagent calls inside the loop** (e.g. "what hypothesis should I test next?"), use `claude -p --json-schema` with a schema rather than free-form prose:

```typescript
const HypothesisSchema = {
  type: "object",
  required: ["hypothesis", "edit_description", "target_level"],
  properties: {
    hypothesis: { type: "string", minLength: 20 },
    edit_description: { type: "string", minLength: 20 },
    target_level: { type: "string", enum: ["Unit","Integration","System","Agentic","Workflow"] }
  }
};

const result = spawnSync("claude", [
  "-p", "--json-schema", JSON.stringify(HypothesisSchema),
  "--output-format", "stream-json",
  "--dangerously-skip-permissions", "--max-turns", "3",
], { input: diagnosticsPrompt, encoding: "utf-8" });
// extract StructuredOutput tool_use block — same as run-probe.ts
```

The schema is the contract. Zod validation at the boundary means the loop fails loudly instead of silently passing garbage downstream.

---

## Key commands

```bash
cd experiments/write-test-plan

# Fast smoke test (no API calls — validates parsing + schema only)
npx tsx experiments/write-test-plan/scripts/verify.ts --mock 0.664 | jq '.score'
# → 66.4

# Full verify (runs eval, takes ~2min)
npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score'

# Run all three adversarial rounds
./run-eval.sh --round 1
./run-eval.sh --round 2
./run-eval.sh --round 3

# Test the L12 hypothesis (once, don't iterate)
./run-eval.sh --prompt prompts/treatment-l12.md

# Run baseline reference
./run-eval.sh --condition baseline

# Single task debug
npx tsx scripts/run-probe.ts --task EC-04 --condition treatment \
  --issue-file corpus/ec-04.md --prompt-file prompts/treatment.md \
  --out runs/debug/out.json
```

---

## Future experiment template

```
experiments/<name>/
  prompts/treatment.md    ← loop edits this only
  run-eval.sh             ← outputs "SCORE: <fraction>"
  program.md              ← autoresearch config block + rich context
  corpus/                 ← fixed inputs
  ground-truth/           ← fixed labels
  leaderboard.md          ← score history
```
