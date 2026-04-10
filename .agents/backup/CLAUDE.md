# Claude Code Instructions: kaizen-autoresearch

Autonomous prompt-improvement framework for AI evaluation experiments.
The loop: edit one file → measure a scalar metric → keep if improved, revert if not → repeat.

---

## Canonical sources

This is the map. Each topic has exactly one canonical file — read it there, edit it there.

| Topic | Canonical file | What it covers |
|-------|---------------|----------------|
| **Experiment setup** | [docs/creating-experiments.md](docs/creating-experiments.md) | Directory layout, corpus/GT format, catalog.json, smoke tests, upstream mining |
| **Writing program.md** | [docs/writing-program-md.md](docs/writing-program-md.md) | Required sections, frontmatter config, best practices |
| **Adversarial design** | [docs/adversarial-training.md](docs/adversarial-training.md) | Noise rounds, adversarial technique tags, robustness criteria |
| **Realistic adversarial examples** | [docs/generating-realistic-adversarial-examples.md](docs/generating-realistic-adversarial-examples.md) | Realism checklist, anti-patterns, label distribution targets |
| **Autoresearch modes** | [docs/autoresearch-modes.md](docs/autoresearch-modes.md) | All /autoresearch subcommands and how they apply to experiments |
| **Ideas schema** | `experiments/<name>/ideas/README.md` | Frontmatter fields, status lifecycle, workflow |
| **Taxonomy schema** | `experiments/<name>/taxonomy/README.md` | Reasoning pattern format, append-only rules |
| **Failure analysis** | `experiments/<name>/justification-taxonomy.md` | Impact-ranked failure patterns with representative quotes |
| **Meta-failures** | `experiments/<name>/meta-failures.md` | Process failures caught by user — ways the experiment infrastructure broke |
| **Scores** | `experiments/<name>/leaderboard.md` | Score history, GT revision notes |
| **Iteration log** | `experiments/<name>/autoresearch-results.jsonl` | Zod-validated JSONL (schema: `IterationResult` in `src/schema.ts`). View: `npx tsx scripts/results.ts` |
| **Agent config** | `experiments/<name>/program.md` | Goal, Scope, Metric, Verify, iteration loop, IDEATE subagent template |
| **Corpus metadata** | `experiments/<name>/corpus/catalog.json` | Task titles, domains, difficulty, adversarial techniques, labels |
| **GT correctness** | `experiments/<name>/taxonomy/gt-review.md` | Per-behavior audit: GT_CORRECT, GT_WRONG, DEBATABLE |
| **Ideas index** | `npx tsx experiments/<name>/scripts/ideas-index.ts` | Views: `--table`, `--by-status`, `--by-target`, `--json` |
| **Results viewer** | `npx tsx experiments/<name>/scripts/results.ts` | Views: `--table`, `--summary`, `--keeps`, `--last N`, `--json` |

---

## Experiments

**MANDATORY**: Before working on any experiment, read its `program.md`.

| Experiment | program.md | Treatment file |
|-----------|------------|---------------|
| write-test-plan | `experiments/write-test-plan/program.md` | `experiments/write-test-plan/prompts/treatment.md` |

When new experiments are added, add a row here.

---

## Repo-wide rules

### Prompt edit-type discipline (always)

For any treatment prompt change, declare edit intent before editing:
- `ADD`: insert-only
- `REPLACE`: intentional remove+add of existing rule text
- `DELETE`: remove-only

Then verify the diff shape before commit:
```bash
git diff --unified=0 experiments/write-test-plan/prompts/treatment.md
```

If declared edit type and diff shape do not match, stop and fix before running eval or committing.
Never call a change "additive" if any relevant line was removed or modified.

### Structured outputs — never grep/awk for values

Write a TypeScript file with Zod instead. Reference: `scripts/verify.ts`, `scripts/run-probe.ts`.

### Post-run workflow

After every autoresearch batch:
1. **`/mine-ideas <experiment>`** — extract justifications, update `taxonomy/`, generate `ideas/`.
2. **`/post-run-report <experiment>`** — post summary to GitHub discussion, update `leaderboard.md`.

### Observability

- Each experiment's `leaderboard.md` — scores
- Each experiment's `justification-taxonomy.md` — why the model fails
- https://github.com/Garsson-io/kaizen-autoresearch/discussions/1 — iteration log
