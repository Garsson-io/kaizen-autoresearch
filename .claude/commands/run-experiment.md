---
name: run-experiment
description: Run the full experiment iteration loop with mandatory MINE and META steps.
argument-hint: "<experiment-name> [--iterations N]"
---

## Setup

Parse `$ARGUMENTS` for experiment name (default: `write-test-plan`) and optional `--iterations N` (default: unbounded).

## Read these files before doing anything

```
experiments/<name>/program.md                  — the loop definition, config, rules (FOLLOW THIS)
experiments/<name>/meta-failures.md            — process mistakes to avoid
experiments/<name>/taxonomy/README.md          — how taxonomy works
experiments/<name>/ideas/README.md             — idea schema
experiments/<name>/prompts/                    — all prompt variants (study differences)
experiments/<name>/leaderboard.md              — score history
.claude/skills/autoresearch/references/core-principles.md    — autoresearch principles
.claude/skills/autoresearch/references/autonomous-loop-protocol.md
```

## Execute

Follow the iteration loop defined in `program.md` exactly. It has the steps, the rules, the keep/revert policy, and the edit constraints. Do not improvise — the loop is there because we learned from mistakes documented in `meta-failures.md`.

If no baseline exists in `autoresearch-results.tsv`, run one first (step 0).

If `--iterations N` was given, stop after N iterations and print a summary. Then run `/post-run-report <experiment>`.
