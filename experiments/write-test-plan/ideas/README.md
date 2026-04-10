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
| `explore_status` | `null` = not yet explored. `signal` = candidate only (exit code 0): use as a promotion candidate, then require one independent holdout check (different subset/seed) before EDIT/full-run promotion. `concentrated-signal` = weak evidence (exit code 3): do not promote without rerun confirmation. `no-signal` = flat or worse (exit code 2). Auto-set by `explore.ts`. See `docs/explore-tool.md` "Signal classification" for the exact rules. |
| `explore_tasks` | Task IDs used in the explore run (typically 4). Auto-selected by `explore.ts` stratification or overridden with `--tasks`. |
| `explore_baseline_loss` | Baseline loss on `explore_tasks` from `runs/latest/`. Computed by `explore.ts`. |
| `explore_loss` | Best variation loss on `explore_tasks`. Set by `explore.ts`. |
| `explore_delta` | `explore_loss − explore_baseline_loss`. Negative = better. Set by `explore.ts`. |
| `explore_date` | Date the explore run was done. Set by `explore.ts`. |

## How to Use

1. Read all ideas before starting an autoresearch loop
2. Update `status` after each attempt
3. One idea per iteration (atomic)
4. Before committing a full run: if `explore_status` is null, run `npx tsx scripts/explore.ts <idea-id>` first (or `/explore`)
5. IDEATE should prioritize ideas with `explore_status: signal` over `explore_status: null`, but `signal` is not auto-promotion: it still requires holdout confirmation before EDIT/full-run.
6. `no-promote` is a valid iteration outcome even when `explore_status` is `signal` (for example: holdout sign-flip or concentrated follow-up).
7. To view past explore results: `npx tsx scripts/explore.ts <idea-id> --summary`
