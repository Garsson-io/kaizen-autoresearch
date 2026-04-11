# Ideas

Each `.md` file is one prompt-improvement hypothesis with frontmatter metadata.

## Canonical ownership (this file)

- **Canonical for:** idea file frontmatter schema and `explore_*` field semantics.
- **Not canonical for:** whether an explored idea may be promoted to EDIT/full run.
- **Refer to for promotion/iteration policy:** `experiments/write-test-plan/program.md`.
- **Refer to for executor workflow wrapper:** `.agents/skills/run-experiment/SKILL.md`.
- **Conflict rule:** if this file conflicts with `program.md` on promotion policy, `program.md` wins.

## Frontmatter Schema

```yaml
---
id: short-kebab-case-identifier
title: Human-readable title
status: proposed | trying | kept | rejected | parked
effort: low | medium | high          # how much the prompt changes
expected_impact: low | medium | high  # expected score delta
targets:                              # which failure modes it addresses
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:                      # which label boundaries it targets
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: structural | representational | framing | meta-cognitive | ensemble
risk: What could go wrong (one sentence)
prereqs: What must be true for this to work (one sentence, or null)
related: [other-idea-id, ...]
# Explore pre-screening results (auto-populated by scripts/explore.ts)
# READ docs/explore-tool.md WHEN you need to understand how these fields are computed,
#   signal classification rules, or the JSON output schema
# READ .agents/skills/explore/SKILL.md WHEN you need the agent workflow around explore
explore_status: null           # null | signal | concentrated-signal | no-signal
explore_tasks: []              # task IDs used, e.g. [ec-04, ec-10]
explore_baseline_loss: null    # baseline loss on explore_tasks from runs/latest/
explore_loss: null             # best variation loss
explore_delta: null            # explore_loss - explore_baseline_loss (negative = better)
explore_date: null             # ISO date of explore run

# Optional v2 tracking fields (recommended)
last_run: null                 # e.g. 20260411-011347
last_iteration: null           # e.g. 66
last_outcome: null             # keep | discard | no-op | crash | no-promote | null
last_delta: null               # numeric delta from latest outcome, or null
retry_trigger: null            # short condition required to retry this idea
owner: null                    # optional maintainer tag
---
```

### Field Definitions

| Field | Description |
|-------|-------------|
| `status` | `proposed` = untested idea. `trying` = currently being evaluated. `kept` = tried and improved score. `rejected` = tried and didn't help. `parked` = interesting but not worth trying now. |
| `effort` | `low` = local wording/rule tweak in one place (typically a sentence/paragraph add/replace). `medium` = add or restructure a section/procedure without replacing the core prompt flow. `high` = full prompt restructure (major re-organization/rewrite of decision flow). |
| `targets` | Failure modes from `leaderboard.md`: `agentic_underprediction`, `workflow_gap`, `unit_overprediction`, `consistency_failures`, `noise_sensitivity`. |
| `confusion_pairs` | The specific label boundaries this idea targets. |
| `change_type` | `structural` = reorder/restructure. `representational` = change how levels are described. `framing` = change the task framing. `meta-cognitive` = add self-check/reasoning steps. `ensemble` = run multiple variants. |
| `explore_status` | `null` = not yet explored. `signal` = aggregate delta negative with distributed improvement (exit code 0). `concentrated-signal` = aggregate negative but concentrated in a small outlier subset (exit code 3). `no-signal` = flat or worse (exit code 2). Auto-set by `explore.ts`. See `docs/explore-tool.md` "Signal classification" for exact computation. Promotion policy is defined in `program.md` (not here). |
| `explore_tasks` | Task IDs used in the explore run (typically 4). Auto-selected by `explore.ts` stratification or overridden with `--tasks`. |
| `explore_baseline_loss` | Baseline loss on `explore_tasks` from `runs/latest/`. Computed by `explore.ts`. |
| `explore_loss` | Best variation loss on `explore_tasks`. Set by `explore.ts`. |
| `explore_delta` | `explore_loss − explore_baseline_loss`. Negative = better. Set by `explore.ts`. |
| `explore_date` | Date the explore run was done. Set by `explore.ts`. |
| `last_run` | Latest full-run timestamped directory for this idea from history, if any. |
| `last_iteration` | Latest iteration number where this idea appeared in results log. |
| `last_outcome` | Latest observed outcome from results history (`keep`, `discard`, `no-op`, `crash`, `no-promote`) or `null`. |
| `last_delta` | Latest delta associated with `last_outcome`, or `null` if unavailable. |
| `retry_trigger` | Explicit condition required before retrying idea (model/corpus/GT/top-loss-pair change, etc). |
| `owner` | Optional maintainer/owner tag for handoff clarity. |

## Body Format (v2, canonical)

Use these headings in this exact order for new ideas. Existing ideas should be backfilled toward this shape:

1. `## Hypothesis`
2. `## Exact Edit`
3. `## Expected Signal`
4. `## Explore Plan`
5. `## Promotion Gate`
6. `## Epistemological Status`
7. `## Run History` (append-only)
8. `## Reusable Lesson`

Notes:
- `## Core idea` is legacy; prefer `## Hypothesis`.
- `## The change` is legacy; prefer `## Exact Edit`.
- Promotion policy is canonical in `program.md`; link to it instead of restating divergent rules.

## How to Use

1. Read all ideas before starting an autoresearch loop
2. Update `status` after each attempt
   Prefer canonical values: `proposed|trying|kept|rejected|parked`. Tooling also normalizes legacy aliases (`keep|discard|no-op`) for indexing output.
3. One idea per iteration (atomic)
4. Before committing a full run: if `explore_status` is null, run `npx tsx scripts/explore.ts <idea-id>` first (or `/explore`)
5. IDEATE should prioritize ideas with `explore_status: signal` over `explore_status: null`.
6. Promotion to EDIT/full run follows `program.md` gates (including holdout/no-promote rules).
7. To view past explore results: `npx tsx scripts/explore.ts <idea-id> --summary`
8. To validate idea metadata shape: `npx tsx scripts/ideas-index.ts --table` (the script uses Zod validation and reports frontmatter issues to stderr).
