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
    catalog.json          ← task metadata (title, domain, difficulty, adversarial technique)
  ground-truth/           ← fixed labels (never edit)
  ideas/                  ← prompt-improvement hypotheses with frontmatter + steelman/critique
  leaderboard.md          ← score history
```

### ideas/ folder

Each experiment has an `ideas/` folder containing `.md` files — one per prompt-improvement hypothesis. Each file has YAML frontmatter (`id`, `status`, `effort`, `expected_impact`, `targets`, `confusion_pairs`, `change_type`, `risk`) and a body with **Steelman** (why it would work) and **Scathing Critique** (why it wouldn't).

**Before starting an autoresearch loop, read all ideas/** to understand the hypothesis space. Update the `status` field after trying each one (`proposed` → `trying` → `kept` or `rejected`).

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

### Post-run analysis — read the agent's prose reasoning

After each autoresearch run, don't just look at the score. The structured outputs contain **justification** fields where the model explains WHY it chose each level. These are a goldmine:

1. **Extract all justifications** with their predicted vs GT levels (correct/under/over)
2. **Categorize the reasoning patterns** — find recurring excuses, correct reasoning, and edge cases
3. **Taxonomize and count** — which excuse pattern causes the most score damage? Which correct reasoning pattern is most common?
4. **Write it up** as `justification-taxonomy.md` in the experiment directory

This qualitative analysis often reveals insights that the scalar metric hides. For example, in write-test-plan we discovered that the model frequently acknowledges "Agentic-level tests would be required" in parentheticals, then talks itself into a lower level — a systematic "minimize bias" that no definition tweak can fix but a framing change might.

**The pattern**: score tells you WHAT is wrong, justifications tell you WHY, taxonomy tells you what to FIX.

### Observability

- Each experiment's `leaderboard.md` — updated per kept commit
- https://github.com/Garsson-io/kaizen-autoresearch/discussions/1 — iteration log
- https://github.com/Garsson-io/kaizen-autoresearch/issues/2 — failure analysis
- https://github.com/Garsson-io/kaizen/issues/1016 — full round results

### Mining Garsson-io/kaizen for ideas

The `Garsson-io/kaizen` repo is the upstream project where these skills are used in production. Its issues, PRs, and discussions contain incident reports, failure analyses, and theories about what works and what doesn't. **Mine it for ideas when generating hypotheses or designing new corpus tasks.**

Use `gh` to search:

```bash
# Incident reports — real failures that reveal prompt weaknesses
gh issue list --repo Garsson-io/kaizen --label bug --limit 30

# Skill-related issues — ideas about how skills should work
gh issue list --repo Garsson-io/kaizen --label area/skills --limit 30

# Testing-related issues — how testing should be done
gh issue list --repo Garsson-io/kaizen --label area/testing --limit 30

# Search for specific topics
gh search issues "agentic test level" --repo Garsson-io/kaizen
gh search issues "unit test default" --repo Garsson-io/kaizen
```

What to look for:
- **Incident reports** (#1014, #1019): reveal systematic failure patterns (e.g., agents defaulting to unit tests, self-certifying incorrect results)
- **Corpus design constraints** (#1020): principles for writing realistic tasks (vocabulary leak prevention, observable behavior framing)
- **Skill architecture** (#1017): how the eval infrastructure is supposed to work
- **Production failures**: cases where a prompt/skill produced wrong results — these are the adversarial examples reality provides for free
