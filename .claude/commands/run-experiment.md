---
name: run-experiment
description: Run the full experiment iteration loop with mandatory MINE, META, and IDEATE steps.
argument-hint: "<experiment-name> [--iterations N]"
---

## Setup

Parse `$ARGUMENTS` for experiment name (default: `write-test-plan`) and optional `--iterations N` (default: unbounded).

## You MUST read these files and follow their instructions

| File | Why |
|------|-----|
| `experiments/<name>/program.md` | **Your instructions.** The iteration loop, metric, edit rules. This is the authority — follow it. |
| `experiments/<name>/meta-failures.md` | Process mistakes to avoid repeating. |
| `experiments/<name>/leaderboard.md` | What's been tried and what scored what. |
| `experiments/<name>/justification-taxonomy.md` | Impact-ranked failure patterns — what goes wrong and why. |
| `experiments/<name>/prompts/` | All prompt variants — study what works vs what failed. |
| `experiments/<name>/taxonomy/` | Raw reasoning patterns from each run. Read the README and all pattern files. |
| `experiments/<name>/ideas/` | Hypothesis backlog. Read the README and ALL idea files. Check `status` before retrying. |

## The IDEATE step requires high-effort thinking

Step 4 of the loop (IDEATE) is the most important creative step. Do NOT rush it. Read all ideas, then think deeply:
- Which existing ideas target the patterns from MINE and DIAGNOSE?
- Do the patterns suggest a NEW idea not in the backlog?
- Can two ideas be COMBINED into something stronger?
- Does a rejected idea deserve retry given new evidence?
- What would a skeptic say about your top candidate?

Write new ideas to `ideas/` if you generate them. Then pick ONE to try.

## Execute

Follow `program.md`. It has the complete loop. If no baseline run exists, run one first. If `--iterations N`, stop after N and run `/post-run-report <experiment>`.
