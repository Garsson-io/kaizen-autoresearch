# Claude Code Instructions: kaizen-autoresearch

## What this repo is

Autonomous prompt-improvement framework for AI evaluation experiments.
The loop: edit one file → measure a scalar metric → keep if improved, revert if not → repeat.

Each experiment lives in `experiments/<name>/`. See [docs/creating-experiments.md](docs/creating-experiments.md) for directory layout, setup guide, smoke tests, and upstream mining.

---

## Before working on any experiment — READ ITS program.md

**MANDATORY**: Before starting any autoresearch loop or making changes to an experiment, you MUST read that experiment's `program.md`. See [docs/writing-program-md.md](docs/writing-program-md.md) for the full spec.

| Experiment | program.md | Treatment file |
|-----------|------------|---------------|
| write-test-plan | `experiments/write-test-plan/program.md` | `experiments/write-test-plan/prompts/treatment.md` |

When new experiments are added, add a row here.

---

## Key folders in each experiment

- **`ideas/`** — prompt-improvement hypotheses with frontmatter + steelman/critique. See `ideas/README.md` for schema.
- **`taxonomy/`** — one `.md` per reasoning pattern, append-only. See `taxonomy/README.md`.
- **`corpus/catalog.json`** — task metadata. Source of truth for corpus composition.

---

## Repo-wide rules

### Structured outputs — never grep/awk for values

Write a TypeScript file with Zod instead of `grep | awk | sed`. Reference: `scripts/verify.ts`, `scripts/run-probe.ts`.

### Post-run workflow

After every autoresearch batch:
1. **`/mine-ideas <experiment>`** — extract justifications, update `taxonomy/`, generate `ideas/`.
2. **`/post-run-report <experiment>`** — post summary to GitHub discussion, update `leaderboard.md`.

### Observability

- Each experiment's `leaderboard.md` — updated per kept commit
- Each experiment's `justification-taxonomy.md` — failure pattern analysis
- https://github.com/Garsson-io/kaizen-autoresearch/discussions/1 — iteration log

### Mining upstream repos for ideas

See [docs/creating-experiments.md](docs/creating-experiments.md#mining-upstream-repos-for-ideas-and-corpus-tasks) for how to search upstream repos (e.g., `Garsson-io/kaizen`) for incident reports, failure analyses, and corpus task inspiration.
