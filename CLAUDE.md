# Claude Code Instructions: kaizen-autoresearch

## What this repo is

Autonomous prompt-improvement framework for AI evaluation experiments.
The loop: edit one file → measure a scalar metric → keep if improved, revert if not → repeat.

Each experiment lives in `experiments/<name>/` and follows the same pattern.

---

## Before working on any experiment — READ ITS program.md

**MANDATORY**: Before starting any autoresearch loop or making changes to an experiment, you MUST read that experiment's `program.md`. It contains:
- Autoresearch config (Goal, Scope, Metric, Verify)
- Current scores and failure analysis
- What to try next, ranked by expected impact
- Level definitions, scoring model, adversarial rounds
- Constraints (what files are fixed, what template vars to preserve)

| Experiment | program.md | Treatment file |
|-----------|------------|---------------|
| write-test-plan | `experiments/write-test-plan/program.md` | `experiments/write-test-plan/prompts/treatment.md` |

When new experiments are added, add a row here.

---

## Experiment directory structure

```
experiments/<name>/
  program.md              ← autoresearch config + ALL iteration context (READ THIS FIRST)
  prompts/treatment.md    ← the ONLY file the loop edits
  run-eval.sh             ← outputs "SCORE: <fraction>"
  scripts/verify.ts       ← Zod-validated score extractor (--mock for fast test)
  corpus/                 ← fixed inputs (never edit)
  ground-truth/           ← fixed labels (never edit)
  leaderboard.md          ← score history
```

---

## Repo-wide rules

### Structured outputs — never grep/awk for values

Any time you'd use `grep | awk | sed` to extract a value, write a TypeScript file with Zod instead.

Reference implementations:
- `scripts/verify.ts` — wraps `run-eval.sh`, outputs `{"score": 74.2}`, exits 1 on failure
- `scripts/run-probe.ts` — pipes to `claude -p --json-schema`, extracts StructuredOutput, validates with Zod

### Smoke tests — always validate cheapest-first

```bash
cd experiments/<name>

# 1. Instant: verify.ts Zod schema
npx tsx scripts/verify.ts --mock 0.750 | jq '.score'

# 2. Instant: verify.ts rejects garbage
npx tsx scripts/verify.ts --mock garbage; echo "exit: $?"

# 3. Instant: score one existing output (needs prior run)
npx tsx scripts/score.ts --output runs/latest/out-treatment-ec04.json --gt ground-truth/ec-04.json

# 4. ~15s: single probe (one API call)
./run-eval.sh --single ec-09

# 5. ~90s: full eval (10 parallel API calls)
./run-eval.sh
```

### Observability

- Each experiment's `leaderboard.md` — updated per kept commit
- https://github.com/Garsson-io/kaizen-autoresearch/discussions/1 — iteration log
- https://github.com/Garsson-io/kaizen-autoresearch/issues/2 — failure analysis
- https://github.com/Garsson-io/kaizen/issues/1016 — full round results
