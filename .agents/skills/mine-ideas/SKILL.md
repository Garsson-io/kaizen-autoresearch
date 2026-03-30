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
- `GT_DIR=$EXPERIMENT_DIR/ground-truth`
- `IDEAS_DIR=$EXPERIMENT_DIR/ideas`

### 2. Read existing context

Before generating anything, read:
- `$EXPERIMENT_DIR/program.md` — experiment design, level definitions, known failures
- `$EXPERIMENT_DIR/leaderboard.md` — score history
- `$EXPERIMENT_DIR/justification-taxonomy.md` (if exists) — previous taxonomy
- All files in `$IDEAS_DIR/` — existing ideas (to avoid duplicates)
- `$EXPERIMENT_DIR/prompts/treatment.md` — current prompt being optimized

### 3. Run the comprehensive mining report

```bash
# PRIMARY: one-command report — behavioral diff, cross-run persistence, loss breakdown, MINE DIGEST
npx tsx $EXPERIMENT_DIR/scripts/mine-report.ts

# For taxonomy export (append to taxonomy/ files):
npx tsx $EXPERIMENT_DIR/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines

# For focused single-task deep read:
npx tsx $EXPERIMENT_DIR/scripts/extract-thinking.ts --run-dir latest --task EC-30

# Self-aware contradictions only:
npx tsx $EXPERIMENT_DIR/scripts/extract-thinking.ts --run-dir latest --self-aware-only
```

mine-report.ts outputs four sections:
1. **Loss breakdown by confusion pair** — Δbaseline and Δprev for each pair
2. **Behavioral diff** — new regressions, new improvements, persistent errors vs previous run
3. **Cross-run persistence** — ALWAYS WRONG behaviors (wrong in N/N runs) are the core problem set
4. **Pre-filled MINE DIGEST template** — justification quotes + persistence counts, blank Pattern/Trap/Fix

**Read the justification quotes in the MINE DIGEST section.** Focus on ALWAYS WRONG first (these are what no treatment has fixed), then NEW REGRESSIONS (what the last treatment broke).

**After running, complete the MINE DIGEST template:**
```
MINE DIGEST:
- [TASK bN] [PRED→GT] [w=W, N/M runs]: "<direct quote from justification>"
  Pattern: <reasoning trap — e.g., "acknowledged LLM dependency then dismissed as mockable">
  Trap: <prompt phrase that caused it>
... (at least 5 errors)
Dominant pattern: <one sentence>
Fix hypothesis: <specific prompt change>
```
If you cannot produce direct quotes, re-run with `--task EC-XX` to focus on specific behaviors.

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

→ **Full system reference**: `experiments/write-test-plan/taxonomy/README.md`
  Covers: confusion_pair direction convention, block format, unmatched.md, tool commands, known pitfalls, validation checklist.


The `$EXPERIMENT_DIR/taxonomy/` folder has one `.md` file per reasoning pattern. **NEVER delete old lines — only append.**

#### 6a. Route current run's errors

```bash
# Route matched blocks to taxonomy files; persist unmatched to taxonomy/unmatched.md
npx tsx $EXPERIMENT_DIR/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines | \
  npx tsx $EXPERIMENT_DIR/scripts/taxonomy-append.ts

# Show cumulative confusion pair counts across all files + unmatched
npx tsx $EXPERIMENT_DIR/scripts/taxonomy-append.ts --summary
```

Taxonomy-lines output uses **multi-line block format** — full J: justification and T: thinking, no truncation — routed as atomic blocks. Unmatched blocks (no taxonomy file for their confusion pair) are persisted to `unmatched.md`, never discarded.

#### 6b. [LLM COGNITIVE] Discover and categorize new patterns

This is the cognitive step: mechanical routing only files what it already knows. The agent must decide what new patterns the data reveals.

From the `--summary` output, for each confusion pair with **≥3 cumulative unmatched occurrences**:
1. Read those full blocks from `taxonomy/unmatched.md` — both J: (justification) and T: (thinking). The full text is required; do not work from truncated quotes.
2. Read the existing taxonomy file descriptions (id, name, description fields).
3. **Classify**: does this confusion pair exhibit the same reasoning trap as an existing pattern?
   - **Yes (fits existing)**: Add the pair to that file's `confusion_pair` frontmatter (comma-separated list). Update `description` and `note` if the pattern's scope changed.
   - **No (new trap)**: Create a new `taxonomy/XX-name.md` file with `id`, `name`, `direction`, `confusion_pair`, `description`.
4. After any create/update, backfill history:
   ```bash
   npx tsx $EXPERIMENT_DIR/scripts/taxonomy-append.ts --reprocess-unmatched
   ```
   This re-routes all historical unmatched blocks against the updated taxonomy files, moving matched ones out of `unmatched.md`. This is the compounding benefit — every new pattern immediately categorizes all prior evidence.

**Pattern categories to distinguish:**
- Same confusion pair, same trap: just update `confusion_pair` in existing file
- Same trap, different confusion pair (e.g., U1 "can mock" now manifesting as Unit→Agentic, not just Integration→Agentic): add the new pair to U1's `confusion_pair` list
- Genuinely new trap with a distinct reasoning pattern: new file
- Too few occurrences or ambiguous: leave in unmatched.md, revisit after more runs

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
