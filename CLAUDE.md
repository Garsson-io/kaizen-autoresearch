# Claude Code Instructions: kaizen-autoresearch

## What this repo is

Autonomous prompt-improvement framework for AI evaluation experiments.
The loop: edit one file → measure a scalar metric → keep if improved, revert if not → repeat.

Each experiment lives in `experiments/<name>/` and follows the same pattern.
See [docs/creating-experiments.md](docs/creating-experiments.md) for the full directory layout and setup guide.

---

## Before working on any experiment — READ ITS program.md

**MANDATORY**: Before starting any autoresearch loop or making changes to an experiment, you MUST read that experiment's `program.md`. It contains the autoresearch config, scores, failure analysis, and constraints. See [docs/writing-program-md.md](docs/writing-program-md.md) for the full spec.

| Experiment | program.md | Treatment file |
|-----------|------------|---------------|
| write-test-plan | `experiments/write-test-plan/program.md` | `experiments/write-test-plan/prompts/treatment.md` |

When new experiments are added, add a row here.

---

## Key folders in each experiment

- **`ideas/`** — prompt-improvement hypotheses with frontmatter + steelman/critique. Read all before iterating. See `ideas/README.md` for schema.
- **`taxonomy/`** — one `.md` per reasoning pattern, append-only. Lines = occurrences across runs. Never remove old lines.
- **`corpus/catalog.json`** — task metadata (title, domain, difficulty, adversarial technique). Source of truth for corpus composition.

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

# 3. ~15s: single probe (one API call)
./run-eval.sh --single ec-09

# 4. Full eval (all tasks in parallel)
./run-eval.sh
```

### Post-run workflow

After every autoresearch batch:

1. **`/mine-ideas <experiment>`** — extract justifications from `runs/latest/`, classify reasoning patterns, update `taxonomy/`, generate new `ideas/`. Score tells you WHAT is wrong, justifications tell you WHY, taxonomy tells you what to FIX.
2. **`/post-run-report <experiment>`** — post summary to the experiment's GitHub discussion. Update `leaderboard.md`.

### Observability

- Each experiment's `leaderboard.md` — updated per kept commit
- https://github.com/Garsson-io/kaizen-autoresearch/discussions/1 — iteration log
- https://github.com/Garsson-io/kaizen-autoresearch/issues/2 — failure analysis
- https://github.com/Garsson-io/kaizen/issues/1016 — full round results

### Mining Garsson-io/kaizen for ideas

The `Garsson-io/kaizen` repo is the upstream project where these skills run in production. Mine its issues, PRs, and discussions for incident reports, failure analyses, and theories.

```bash
gh issue list --repo Garsson-io/kaizen --label bug --limit 30
gh issue list --repo Garsson-io/kaizen --label area/skills --limit 30
gh search issues "agentic test level" --repo Garsson-io/kaizen
```

What to look for: incident reports (reveal failure patterns), corpus design constraints (#1020), skill architecture (#1017), production failures (free adversarial examples).
