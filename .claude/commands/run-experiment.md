---
name: run-experiment
description: Run the full experiment iteration loop with mandatory MINE and META steps.
argument-hint: "<experiment-name> [--iterations N]"
---

## Setup

Parse `$ARGUMENTS` for experiment name (default: `write-test-plan`) and optional `--iterations N` (default: unbounded).

## Read these files before doing anything

| File | Why |
|------|-----|
| `experiments/<name>/program.md` | **Your instructions.** Loop definition, metric, edit rules. Follow this. |
| `experiments/<name>/meta-failures.md` | Process mistakes to avoid repeating. |
| `experiments/<name>/leaderboard.md` | What's been tried and what scored what. |
| `experiments/<name>/prompts/` | All prompt variants — study what works vs what failed. |
| `experiments/<name>/taxonomy/README.md` | Failure patterns from the model's own reasoning. |
| `experiments/<name>/ideas/README.md` | Hypothesis backlog. Check `status` before retrying. |
| `.claude/skills/autoresearch/references/core-principles.md` | The methodology — git as memory, one change per iteration, mechanical verification. |
| `.claude/skills/autoresearch/references/autonomous-loop-protocol.md` | The 8-phase protocol — how to review, ideate, commit before verify, handle noise, recover from being stuck. |
| `.claude/skills/autoresearch/references/results-logging.md` | TSV logging format for `autoresearch-results.tsv`. |

## Execute

Follow `program.md`. If no baseline exists, run one first. If `--iterations N`, stop after N and run `/post-run-report <experiment>`.
