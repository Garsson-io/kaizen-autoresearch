# explore.ts — Pre-screening tool for prompt variations

Pre-screen an idea with cheap N-variation x M-task subset runs before committing a full corpus evaluation. Automates task selection, baseline computation, parallel execution, scoring, concentration analysis, signal classification, and persistence.

## Quick start

```bash
# 1. Agent writes variation prompts into dirs
mkdir -p experiments/write-test-plan/runs/explore/my-idea-v1-short-20260329-120000
cp experiments/write-test-plan/prompts/treatment.md \
   experiments/write-test-plan/runs/explore/my-idea-v1-short-20260329-120000/treatment.md
# (edit the copy with your variation)

# 2. Run explore — everything else is automated
npx tsx experiments/write-test-plan/scripts/explore.ts my-idea
```

## What it automates

| What | How |
|------|-----|
| Task selection | Stratified sampling from per-task loss tiers + catalog label matching |
| Baseline | Scored from `runs/latest/` for the selected tasks |
| Evaluation | Parallel `run-eval.sh` with `--no-latest` and resume support |
| Scoring | In-process via imported `score.ts` functions (no subprocess) |
| Analysis | Per-task delta, concentration detection, signal classification |
| Persistence | Appends to `explore-log.jsonl`, updates idea frontmatter |

What it does **not** do: write variation prompts (agent's job), git commit (agent decides), or decide what to do with results (agent's judgment).

## CLI reference

The CLI is self-documenting via `--help` (powered by [commander](https://www.npmjs.com/package/commander)):

```
$ npx tsx experiments/write-test-plan/scripts/explore.ts --help
Usage: explore [options] <idea-id>

Pre-screen prompt variations on stratified task subsets.

Docs:     docs/explore-tool.md (full reference)
Workflow: .agents/skills/explore/SKILL.md (agent steps)

Arguments:
  idea-id             idea ID to explore (must have a file in ideas/)

Options:
  --tasks <ids>       override task selection (comma-separated ec-NN)
  --labels <ids>      run only specific variation labels (comma-separated)
  --latest-batch      use only variations from the latest timestamp batch
  --strict-variation-count <n>  fail if discovered variation count after filters != N
  --select-count <n>  pick N tasks instead of default 6
  --seed <n>          seed for deterministic weighted randomization
  --dry-run           show the plan without executing
  --score-only        skip eval, just score existing outputs
  --summary           reprint results from explore-log.jsonl
  --json              machine-readable JSON on stdout (status to stderr)
  --force             re-run even if explore_status is already set
  --no-persist        skip writing to explore-log.jsonl and idea file
  -h, --help          display help for command

Exit codes: 0=signal  1=error  2=no-signal  3=concentrated-signal
```

### Variation selection QoL flags

Use these together to avoid accidentally re-running legacy variation dirs:

```bash
npx tsx experiments/write-test-plan/scripts/explore.ts my-idea \
  --latest-batch \
  --labels v1-primary-only,v2-primary-plus-counterbalance \
  --strict-variation-count 2
```

- `--latest-batch`: keep only dirs from the newest `YYYYMMDD-HHMMSS` batch.
- `--labels`: choose exact variation labels; if duplicates exist, picks latest dir per label.
- `--strict-variation-count`: hard-fail if filtered set size is not exactly what you expected.

If you accidentally launch too many probes, stop them safely with:

```bash
experiments/write-test-plan/scripts/stop-evals.sh
```

Invalid arguments produce clear errors with the usage hint:

```
$ npx tsx scripts/explore.ts my-idea --select-count abc
error: option '--select-count <n>' argument 'abc' is invalid. "abc" must be an integer >= 2
```

### Exit codes

| Code | Signal | Meaning |
|------|--------|---------|
| 0 | `signal` | Aggregate delta negative, majority of tasks improved, no single-task concentration. Proceed to EDIT. |
| 1 | error | Missing idea file, no variations found, scoring failure, invalid args. |
| 2 | `no-signal` | All variations flat or worse. Park the idea, return to IDEATE. |
| 3 | `concentrated-signal` | Delta negative but one task drives >60% of improvement. Weak evidence — re-run with different tasks or proceed cautiously. |

## Variation directory naming convention

The script discovers variations by globbing:

```
runs/explore/<idea-id>-v<N>-<label>-<YYYYMMDD-HHMMSS>/treatment.md
```

- The segment after `<idea-id>-` must start with `v` followed by a digit (e.g. `v1`, `v2`).
- The timestamp suffix (`-YYYYMMDD-HHMMSS`) is stripped to produce the display label.
- Each dir must contain a `treatment.md` file — dirs without one are ignored.

Examples:
```
integration-middle-anchor-v1-anchor-basic-20260328-225104/treatment.md    -> label: v1-anchor-basic
anti-lazy-dont-mock-v1-20260328-163117/treatment.md                       -> label: v1
role-anchor-staff-engineer-v2-20260328-163118/treatment.md                -> label: v2
```

## Task selection: stratified sampling

When `--tasks` is not provided, the script selects tasks automatically:

### Algorithm

1. **Score `runs/latest/`** to get per-task losses for the full corpus.
2. **Sort by loss** and divide into tiers:
   - **Low** (bottom 25%) — easy tasks, low diagnostic value.
   - **Mid** (25th-75th percentile) — representative of typical corpus behavior.
   - **High** (top 25%) — hard tasks, high loss, potentially noisy.
3. **Match against idea's `confusion_pairs`**: each pair like `Unit-Integration` extracts levels (`Unit`, `Integration`). Tasks whose `catalog.json` labels contain any of these levels get a 2x weight boost in their tier.
4. **Select by composition**: default 4 mid + 2 high (for `--select-count 6`). Matching tasks are preferred within each tier.
5. **Post-selection guardrail**: any task contributing >35% of the subset total loss is removed and backfilled. This prevents outlier tasks from dominating the explore signal.

### Priority weights

When using the modular API, pass `priorities: { "ec-03": 3.0, "ec-17": 0.5 }` to boost or demote specific tasks within their tier. Higher weight = more likely to be selected. The default weight is 1.0.

### Seeded randomization

`--seed N` uses a deterministic PRNG (mulberry32) to shuffle tasks within each tier using weighted random sampling. Same seed = same selection. Without `--seed`, tasks are sorted by weight (deterministic but not randomized).

### Task reuse from frontmatter

If the idea already has `explore_tasks` set in its frontmatter (from a previous explore), the script reuses those tasks by default (idempotent re-run). Pass `--seed` or `--select-count` to override and trigger fresh auto-selection.

## Output: per-task heatmap

The primary output is a per-task comparison table:

```
=== EXPLORE: integration-middle-anchor (3 variations x 4 tasks) ===

Tasks: ec-03 (mid, 14.39), ec-14 (mid, 15.09), ec-17 (mid, 14.57), ec-20 (mid, 11.90)
Selection: 4 mid
Baseline loss: 55.95

Task          Baseline  v1-anchor-ba  v2-anchor-un  v3-anchor-bo
ec-03            14.39         12.59         14.02         15.27
ec-14            15.09         15.63         17.37         15.60
ec-17            14.57          8.27          7.73         13.54
ec-20            11.90         13.16         13.83         11.77
────────────────────────────────────────────────────────────────
TOTAL            55.95         49.65         52.95         56.18
Delta                —         -6.31         -3.01         +0.22
Impr.                —           2/4           1/4           1/4
Conc.                —     ec-17 78%     ec-17 95%             —

Signal: concentrated-signal
  Winner: v1-anchor-basic (delta -6.31) — but ec-17 drives 78% of improvement
  => CONCENTRATED: Re-run with different tasks or proceed with caution.
```

### Reading the table

- **TOTAL**: Sum of per-task losses. Lower = better.
- **Delta**: `variation_total - baseline_total`. Negative = improvement.
- **Impr.**: How many tasks improved (delta < -1.0) out of total.
- **Conc.**: If one task accounts for >60% of the total improvement, names it with percentage. `none` = improvement is distributed.

## Signal classification

| Signal | Criteria | Action |
|--------|----------|--------|
| `signal` | Delta < 0 AND majority of tasks improved AND no single task > 60% of improvement | Proceed to EDIT with winning variation |
| `concentrated-signal` | Delta < 0 BUT one task drives > 60% of improvement, OR minority of tasks improved | Weak evidence. Re-run with `--seed` for different tasks, or proceed cautiously |
| `no-signal` | Delta >= 0 | Park the idea, return to IDEATE |

### Winner selection

1. Prefer variations classified as `signal` over `concentrated-signal`.
2. Among same classification, pick lowest delta (most improvement).
3. Tiebreak (delta within 0.5): prefer more tasks improved.

## JSON output schema

With `--json`, stdout contains a validated JSON object. Status messages go to stderr.

```jsonc
{
  "idea_id": "integration-middle-anchor",
  "tasks": ["ec-03", "ec-14", "ec-17", "ec-20"],
  "baseline_loss": 55.95,
  "signal": "concentrated-signal",  // "signal" | "concentrated-signal" | "no-signal"
  "winner": {
    "variation": "v1-anchor-basic",
    "loss": 49.65,
    "delta": -6.31,
    "improved": 2,
    "concentration_task": "ec-17",  // null if none
    "concentration_pct": 0.78
  },
  "variations": [
    {
      "variation": "v1-anchor-basic",
      "loss": 49.65,
      "delta": -6.31,
      "improved": 2,
      "hurt": 1,
      "flat": 1,
      "concentration_task": "ec-17",
      "concentration_pct": 0.78,
      "per_task": [
        { "task": "ec-03", "baseline": 14.39, "variation": 12.59, "delta": -1.80, "direction": "improved" },
        { "task": "ec-14", "baseline": 15.09, "variation": 15.63, "delta": 0.54, "direction": "flat" }
        // ...
      ]
    }
    // ...
  ]
}
```

The output is validated against `ExploreJsonOutputZ` (Zod schema in `scripts/explore.ts`) before emission. Invalid output is a hard error — it means a bug in the script.

## Persistence

Unless `--no-persist` is passed, the script writes to two locations:

### `explore-log.jsonl`

One JSON line per variation (schema: `ExploreResult` in `src/schema.ts`):

```json
{"timestamp":"2026-03-28T22:56:00Z","idea_id":"integration-middle-anchor","variation":"v1-anchor-basic","run_dir":"runs/explore/...","tasks":["ec-03","ec-14","ec-17","ec-20"],"baseline_loss":55.78,"variation_loss":49.65,"delta":-6.13,"prompt_diff":"v1-anchor-basic","winner":true}
```

### Idea frontmatter

Updates these fields in `ideas/<idea-id>.md`:

| Field | Value |
|-------|-------|
| `explore_status` | `signal` / `concentrated-signal` / `no-signal` |
| `explore_tasks` | `[ec-03, ec-14, ec-17, ec-20]` |
| `explore_baseline_loss` | Baseline loss on the selected tasks |
| `explore_loss` | Winner's loss (or `null`) |
| `explore_delta` | Winner's delta (or `null`) |
| `explore_date` | ISO date |

Also adds/updates an `## Epistemological status` section with the comparison table.

## Resume support

If a run crashes partway through, re-running the same command picks up where it left off:

- The script checks which output files (`out-treatment-*.json`) exist in each variation dir.
- Only missing tasks are sent to `run-eval.sh`.
- If all outputs exist for a variation, it skips eval and goes straight to scoring.

This means a crashed 3-variation x 6-task explore (18 probes) won't re-run the probes that already completed.

## Modular API

All functions are exported for programmatic use. Import from `./explore.js`:

```typescript
import {
  // Data loading
  scoreLatestRun,           // Per-task losses from runs/latest/
  scoreRunDir,              // Per-task losses from any run directory
  loadCatalog,              // Parse corpus/catalog.json (Zod-validated)

  // Task selection
  computeTiers,             // Compute low/mid/high tiers from loss distribution
  selectTasksStratified,    // Full stratification with priority weights + seed

  // Baseline
  computeBaseline,          // Extract baseline losses for a task subset

  // Variation handling
  discoverVariations,       // Find variation dirs by naming convention
  checkExistingOutputs,     // Which tasks are missing output files
  runVariation,             // Execute one variation via run-eval.sh

  // Scoring + analysis
  scoreVariation,           // Score a variation dir, returns per-task losses
  analyzeVariation,         // Compute delta, concentration, direction per task
  classifySignal,           // signal / concentrated-signal / no-signal
  pickWinner,               // Select best variation from results

  // Output
  printHeatmap,             // Print terminal comparison table
  printJson,                // Print validated JSON to stdout

  // Persistence
  writeExploreLog,          // Append to explore-log.jsonl (Zod-validated)
  updateIdeaFrontmatter,    // Update idea file explore fields + epistemological status
  printSummary,             // Reprint from explore-log.jsonl

  // Schemas (for validation in consuming code)
  ExploreOutputZ,
  ExploreJsonOutputZ,
  VariationResultZ,
  StratificationOptsZ,
  TaskLossZ,
  SignalZ,
} from "./explore.js";
```

### Example: agent does its own task selection, skips persistence

```typescript
const perTaskLoss = scoreLatestRun();
const myTasks = ["ec-03", "ec-14", "ec-17", "ec-20"];
const baseline = computeBaseline(perTaskLoss, myTasks);
const variations = discoverVariations("my-idea");

for (const v of variations) {
  const missing = checkExistingOutputs(v.dir, myTasks);
  if (missing.length > 0) await runVariation(v, missing, v.dir);
}

const results = variations.map(v => {
  const losses = scoreVariation(v.dir, myTasks);
  return analyzeVariation(v, baseline, losses, myTasks);
});

const winner = pickWinner(results);
const signal = winner ? classifySignal(winner) : "no-signal";
// Agent decides what to do next based on signal
```

## Validation

All data boundaries use Zod schemas:

| Boundary | Schema | Validates |
|----------|--------|-----------|
| CLI args | `CliOptsZ` | idea-id format, numeric flags, task-id format |
| Catalog load | `CatalogEntryZ` | catalog.json structure |
| Stratification opts | `StratificationOptsZ` | count range, concentration cap, priorities |
| Probe output files | `ProbeOutput` (from schema.ts) | Output JSON from eval probes |
| Ground truth files | `GroundTruth` (from schema.ts) | GT JSON structure |
| Variation dirs | `VariationDirZ` | Non-empty label, dir, treatmentPath |
| Analysis results | `VariationResultZ` | Per-task results, counts, concentration |
| Final output | `ExploreOutputZ` | Complete explore output before display |
| JSON emission | `ExploreJsonOutputZ` | Serialized JSON before stdout |
| Log entries | `ExploreResult` (from schema.ts) | Each line before appending to JSONL |

If any validation fails, the script throws with the Zod error path — no silent corruption.
