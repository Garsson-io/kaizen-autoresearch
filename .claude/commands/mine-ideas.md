---
name: mine-ideas
description: Analyze experiment results — extract agent justifications, build/update taxonomy, and generate new improvement ideas grounded in data
argument-hint: "[experiment name, e.g. write-test-plan]"
---

Mine the agent's prose reasoning from the latest experiment run to discover failure patterns and generate data-grounded ideas for prompt improvement.

## Steps

### 1. Determine the experiment

If $ARGUMENTS is provided, use it as the experiment name. Otherwise default to `write-test-plan`.

Set:
- `EXPERIMENT_DIR=experiments/<name>`
- `RUNS_DIR=$EXPERIMENT_DIR/runs/latest`
- `GT_DIR=$EXPERIMENT_DIR/ground-truth`
- `IDEAS_DIR=$EXPERIMENT_DIR/ideas`

### 2. Read existing context

Before generating anything, read:
- `$EXPERIMENT_DIR/program.md` — experiment design, level definitions, known failures
- `$EXPERIMENT_DIR/leaderboard.md` — score history
- `$EXPERIMENT_DIR/justification-taxonomy.md` (if exists) — previous taxonomy
- All files in `$IDEAS_DIR/` — existing ideas (to avoid duplicates)
- `$EXPERIMENT_DIR/prompts/treatment.md` — current prompt being optimized

### 3. Extract justifications AND thinking blocks

Use the extract-thinking tool to get both layers of reasoning:

```bash
# Full error analysis with thinking + self-aware detection
$EXPERIMENT_DIR/scripts/run.sh extract-thinking.ts

# Just the self-aware contradictions (model knew and overrode)
$EXPERIMENT_DIR/scripts/run.sh extract-thinking.ts --self-aware-only

# Lines ready to append to taxonomy/
$EXPERIMENT_DIR/scripts/run.sh extract-thinking.ts --taxonomy-lines

# Machine-readable for deeper analysis
$EXPERIMENT_DIR/scripts/run.sh extract-thinking.ts --json
```

The tool pairs each behavior's structured output (justification, predicted level) with the model's internal thinking from the .log file. It automatically flags ⚠ SELF-AWARE cases where thinking contains correct reasoning the model overrides.

### 4. Classify reasoning patterns

Read the extract-thinking output. For each error, you have TWO sources:
- **Justification** (from output JSON): what the model said publicly — often post-hoc rationalization
- **Thinking** (from .log file): what the model actually reasoned — often contains the correct answer

Focus especially on **⚠ SELF-AWARE** cases: these reveal that the model KNOWS the right answer but its framing/structure causes it to pick wrong. The fix for self-aware failures is in prompt framing, not in teaching the model new facts.

Look for:
- **Recurring excuses** in justifications: "can mock this", "pure logic", "no I/O needed"
- **Thinking contradictions**: thinking says "mock would hide this" but justification says "mock is sufficient"
- **Self-aware patterns**: what percentage of each error type is self-aware? High self-awareness means the definition is fine but the framing suppresses correct reasoning
- **Correct reasoning patterns**: what logical moves lead to correct answers? Preserve these.

Group into named patterns (e.g. U1, U2, O1) with:
- A short name (e.g. "can mock the API")
- Which tasks/behaviors exhibit it
- The predicted→GT confusion pair
- Frequency and score impact (frequency × row weight)
- Representative quotes from BOTH justification and thinking
- Self-aware count: N/M errors in this pattern are self-aware

### 5. Quantify and rank

For each pattern:
- Count occurrences
- Sum the weight-adjusted score impact (Agentic=4, Workflow=4, System=3, Integration=2, Unit=1)
- Rank by total impact — the pattern causing the most score damage goes first

Also compute:
- Total correct / under / over counts
- Under vs over ratio (>1 = minimize bias, <1 = maximize bias)
- Per-level accuracy (which GT levels are most/least accurately predicted?)

### 6. Update taxonomy/ folder (APPEND-ONLY)

The `$EXPERIMENT_DIR/taxonomy/` folder has one `.md` file per reasoning pattern. **NEVER delete old lines — only append.**

Use the taxonomy-lines output as a starting point:
```bash
$EXPERIMENT_DIR/scripts/run.sh extract-thinking.ts --taxonomy-lines
```

This gives pre-formatted lines with justifications, thinking excerpts, and ⚠ SELF-AWARE flags. For each pattern file:
1. Determine the current run number (count previous `[runN]` prefixes, increment)
2. **Append** the taxonomy-lines output for occurrences in this pattern
3. Update frontmatter `description` and `note` if the pattern's character changed
4. Update `self_aware` and `self_aware_note` in frontmatter with the self-aware count
5. Create new `.md` files for newly discovered patterns

Also update `$EXPERIMENT_DIR/justification-taxonomy.md` with summary counts and key insights.

### 7. Generate ideas

For each high-impact pattern (top 3-5 by score damage), generate ONE idea file in `$IDEAS_DIR/`. Each idea must:

- **Follow the frontmatter schema** from `$IDEAS_DIR/README.md`
- **Be grounded in specific taxonomy data** — cite pattern ID, frequency, example behaviors
- **Not duplicate existing ideas** — check all files in `$IDEAS_DIR/` first. If an existing idea addresses the same pattern, update its status or add new evidence instead.
- **Have both Steelman and Scathing Critique** — steelman uses the data to argue why it would work, critique uses data or prior run results to argue why it might not
- **Reference prior failed attempts** — if run 1 tried something similar, explain why this variant is different

Good ideas are:
- Grounded in a specific, quantified failure pattern (not vague "improve Agentic")
- Low effort with high expected impact (small prompt change, targets many high-weight misses)
- Falsifiable in one autoresearch iteration
- Informed by what the model's OWN reasoning reveals about its failure mode

### 8. Summarize

Print a summary:
- How many behaviors analyzed, correct/under/over split
- Top 3 failure patterns by impact
- Ideas generated (new) and updated (existing)
- Recommended next autoresearch run order (which ideas to try first, based on effort/impact/risk)

### 9. Commit

```bash
git add $EXPERIMENT_DIR/justification-taxonomy.md $IDEAS_DIR/
git commit -m "analysis: mine ideas from run results — <N> patterns, <M> new ideas"
```
