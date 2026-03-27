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

### 3. Extract all justifications with verdicts

For each output file in `$RUNS_DIR/`, pair each behavior's prediction with its ground truth and classify as correct/under/over:

```bash
for f in $RUNS_DIR/out-treatment-*.json; do
  task=$(jq -r '.task_id' "$f")
  gt_base=$(echo "$task" | tr '[:upper:]' '[:lower:]')
  gt_file="$GT_DIR/${gt_base}.json"
  [ -f "$gt_file" ] || continue

  jq -r --slurpfile gt "$gt_file" '
    .behaviors[] as $b |
    ($gt[0].behaviors[] | select(.behavior_id == $b.behavior_id)) as $g |
    [.task_id, ($b.behavior_id|tostring), $b.minimum_level, $g.ground_truth_level,
     (if $b.minimum_level == $g.ground_truth_level then "correct"
      elif (["Unit","Integration","System","Agentic","Workflow"] | index($b.minimum_level)) < (["Unit","Integration","System","Agentic","Workflow"] | index($g.ground_truth_level)) then "under"
      else "over" end),
     $b.justification] | @tsv
  ' "$f"
done
```

### 4. Classify reasoning patterns

Read ALL the extracted justifications. For each under-prediction and over-prediction, identify the **reasoning pattern** — the recurring logical move the model makes that leads to the wrong answer.

Look for:
- **Recurring excuses** in under-predictions: "can mock this", "pure logic", "no I/O needed", "infrastructure concern not model quality"
- **Recurring mistakes** in over-predictions: "might miss edge case", "safer to test at higher level", "looks AI-related"
- **Self-aware failures**: model acknowledges the correct level in parentheticals or hedges, then picks wrong
- **Correct reasoning patterns**: what logical moves lead to correct answers? These are worth preserving.

Group into named patterns (e.g. U1, U2, O1) with:
- A short name (e.g. "can mock the API")
- Which tasks/behaviors exhibit it
- The predicted→GT confusion pair
- Frequency and score impact (frequency × row weight)
- Representative quotes from justifications

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

The `$EXPERIMENT_DIR/taxonomy/` folder has one `.md` file per reasoning pattern. Each line in the body is one occurrence from one run. **NEVER delete old lines — only append new ones.**

For each pattern file:
1. Determine the current run number (count previous `[runN]` prefixes, increment)
2. **Append** new lines for occurrences in this run, prefixed with `[runN]`
3. Update frontmatter `description` and `note` if the pattern's character changed
4. Create new `.md` files for newly discovered patterns

The line count across runs shows persistence:
- Same task+behavior in `[run1]` and `[run2]` → pattern is stable, prompt didn't fix it
- A task+behavior stops appearing → the prompt change worked for that case
- Compare excuses across runs for the same behavior to see how reasoning evolved

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
