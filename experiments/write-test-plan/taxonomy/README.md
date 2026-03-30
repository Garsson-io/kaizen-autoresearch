# Taxonomy System — Canonical Reference

The taxonomy captures **reasoning failure patterns** — the specific arguments a model makes when it misclassifies a behavior's minimum test level. Each file is one pattern. Each entry is one occurrence from one run. The system is designed to accumulate evidence longitudinally so patterns become visible across runs, not just within one.

→ For the iteration loop that uses this system, see `experiments/write-test-plan/program.md` step 1 (MINE)
→ For the step-by-step mining workflow, see `.agents/skills/mine-ideas/SKILL.md` step 6
→ For the run-experiment skill's cognitive step description, see `.agents/skills/run-experiment/SKILL.md`

---

## Design principles

**Append-only.** Never delete lines. The history of how excuses evolve across runs IS the signal. A behavior that appears in runs 1–6 with the same justification is a core unsolved problem. One that stops appearing after run 4 is evidence the treatment worked.

**Confusion pair as routing key.** Every entry has a `(Pred→GT)` routing key. `taxonomy-append.ts` routes each block mechanically by matching the pair in the block's first line against the `confusion_pair` frontmatter of every taxonomy file. This is fully mechanical — no judgment about content fit.

**unmatched.md as longitudinal accumulation.** When no taxonomy file matches a block's confusion pair, the block goes to `unmatched.md` (never discarded). After enough runs, patterns emerge in unmatched.md. An LLM cognitive step then decides whether each unmatched pair fits an existing pattern (update that file's `confusion_pair` list) or needs a new file.

**`--reprocess-unmatched` as retroactive backfill.** When a new taxonomy file is created or an existing one's `confusion_pair` list is expanded, run `--reprocess-unmatched` to re-route all historical unmatched blocks. New knowledge categorizes old evidence.

---

## Frontmatter schema

```yaml
---
id: U1                          # short ID used in cross-references (e.g. "see U1")
name: "Can mock the API"        # human-readable pattern name
direction: under | over         # under = model predicts too low, over = model predicts too high
predicted: Integration          # what the model predicted (use exact level name)
ground_truth: Agentic           # what GT says (use exact level name or "Integration or System")
weight: 4                       # GT level weight: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4
confusion_pair: Integration-Agentic, Unit-Agentic   # ALWAYS Pred-GT format, comma-separated list
description: "One sentence — the core reasoning failure this pattern captures"
self_aware: true                # optional — does thinking contain correct reasoning the model overrides?
self_aware_note: "..."          # optional — summarize the self-aware pattern
note: "..."                     # optional — updates as pattern evolves across runs
---
```

### CRITICAL: confusion_pair direction convention

The format is **ALWAYS `Predicted-GroundTruth`** (Pred-GT). Never GT-Pred.

| direction | example | correct pair | wrong pair (GT-Pred) |
|-----------|---------|-------------|---------------------|
| under (predicts too low) | model says Integration, GT is Agentic | `Integration-Agentic` | `Agentic-Integration` ✗ |
| over (predicts too high) | model says System, GT is Integration | `System-Integration` | `Integration-System` ✗ |

**Historical note**: O1–O4 were originally created with the pair reversed (GT-Pred). This caused all over-prediction blocks to route to U files instead of O files, and all real O-pattern blocks went to `unmatched.md`. Fixed in commit de4dc8d.

### confusion_pair as a list

The same reasoning trap can manifest at different starting levels. U1 ("can mock the API") produces `Integration-Agentic` AND `Unit-Agentic` AND `System-Agentic`. List all pairs that exhibit the same trap:

```yaml
confusion_pair: Integration-Agentic, Unit-Agentic, System-Agentic
```

When a new run surfaces a pair that isn't listed but shows the same reasoning pattern, update the list and run `--reprocess-unmatched` to backfill history.

---

## Body format — JSONL (one entry per line)

Each entry is a single JSON object on one line, validated against `TaxonomyEntrySchema` in `scripts/taxonomy-schema.ts`.

```jsonl
{"run":"7","task":"EC-10","b":4,"pred":"Integration","gt":"Agentic","w":4,"j":"Full justification text...","t":"Full thinking excerpt...","sa":true}
{"run":"7","task":"EC-17","b":2,"pred":"Integration","gt":"Agentic","w":4,"j":"MOCK-MISS: The likely failure boundary is module handoff..."}
```

**Fields** (see `TaxonomyEntrySchema` for the authoritative schema):
- `run` — run label, e.g. `"7"` or `"20260330-200818"` or `"pre-schema"` for pre-schema era entries
- `task` — corpus task ID, e.g. `"EC-10"`
- `b` — behavior number, e.g. `4`
- `pred` — what the model predicted, e.g. `"Integration"`
- `gt` — ground-truth level, e.g. `"Agentic"`
- `w` — GT level weight (Unit=1 Integration=2 System=3 Agentic=4 Workflow=4)
- `j` — full justification text (no truncation)
- `t` — thinking excerpt (optional)
- `sa` — self-aware: model's thinking had the right answer but public output chose wrong (optional)

**Writing**: call `serializeEntry(entry)` from `taxonomy-schema.ts`. Never format by hand.
**Reading**: call `parseEntryLine(line)` from `taxonomy-schema.ts`. Returns `null` for non-entry lines (frontmatter, blank lines, etc.).
**Routing key** (used by `taxonomy-append.ts`): derived from `pred` and `gt` fields as `"pred-gt"`.

---

## unmatched.md

`taxonomy/unmatched.md` accumulates all entries that have no matching taxonomy file. Same JSONL format as other taxonomy files.

```
---
note: "..."
---
{"run":"7","task":"EC-01","b":1,"pred":"Agentic","gt":"Integration","w":2,"j":"..."}
```

**Never manually edit unmatched.md to route entries.** Instead, either update a taxonomy file's `confusion_pair` list and run `--reprocess-unmatched`, or create a new taxonomy file and run `--reprocess-unmatched`.

---

## Tools

### taxonomy-append.ts

```bash
# Route current run's errors (pipe from extract-thinking)
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines | \
  npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts [--run N]

# Show cumulative confusion pair counts across all files + unmatched
npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --summary

# Re-route unmatched.md blocks after adding/updating taxonomy files
npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched

# Preview without writing
... | npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --dry-run
```

**`--summary` output** shows:
- MATCHED section: confusion pairs by file with counts across all runs
- UNMATCHED section: confusion pairs in unmatched.md with run list and `← consider new category` flag for pairs with ≥3 occurrences

**`--reprocess-unmatched`**: reads all blocks from unmatched.md, re-routes against current taxonomy files, appends matched blocks to their files, rewrites unmatched.md with only the remaining unmatched blocks. Safe to run multiple times.

### extract-thinking.ts

```bash
# Full output — all errors sorted by weight (high-impact first), aggregate summary at end
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest

# Block format for taxonomy routing (full text, no truncation)
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines

# Focus on one task
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --task EC-30

# Only self-aware contradictions
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --self-aware-only
```

---

## The three-step MINE taxonomy flow

### Step 1 — Route (mechanical)

```bash
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines | \
  npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts
```

Routes matched blocks to taxonomy files. Appends unmatched blocks to `unmatched.md`. Reports what moved.

### Step 2 — Summarize (mechanical)

```bash
npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --summary
```

Shows cumulative confusion pair counts. Pairs with `← consider new category` have ≥3 cumulative unmatched occurrences and warrant the cognitive step below.

### Step 3 — Pattern discovery (LLM cognitive)

For each confusion pair flagged in step 2:

1. Read those full blocks from `unmatched.md` — both J: and T: lines (full text, not snippets)
2. Read the descriptions of existing taxonomy files (id, name, description, direction)
3. Classify:
   - **Fits existing pattern** — same reasoning trap, new confusion pair: add pair to that file's `confusion_pair` frontmatter list
   - **New reasoning trap** — distinct failure mode: create new `taxonomy/XX-name.md` file
4. After any create or update, backfill history:
   ```bash
   npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched
   ```

**What distinguishes same-pattern vs new-pattern**: read the J: text. If the reasoning argument is structurally identical to an existing pattern (e.g., "can mock this" appearing at Unit level instead of Integration level), it's the same pattern. If the argument type is different (e.g., "apply REJECTION-GATE quality check" vs "mock is sufficient"), it's a new pattern even if the confusion pair is the same.

---

## Current taxonomy files

| File | Direction | Confusion pairs | Pattern |
|------|-----------|----------------|---------|
| U1-can-mock-the-api | under | Integration-Agentic | Model says stubs/mocks are sufficient, missing that mock hides real model output variability |
| U2-pure-logic-no-io | under | Unit-Integration | Model treats behavior as pure function logic, misses module boundary |
| U3-integration-suffices | under | Integration-System | Model says in-process wiring catches it, missing that real OS/network/subprocess is needed |
| U4-single-step-enough | under | Agentic-Workflow | Model says one real-model call is enough, missing that multiple sequential agentic steps are required |
| O1-needs-real-wiring | over | Integration-Unit | Model over-escalates to Integration, manufacturing a module boundary from single-function behavior |
| O2-needs-external-service | over | System-Integration | Model over-escalates to System, applying REAL-INFRA when in-process stubs suffice |
| O3-looks-like-ai | over | Agentic-System | Model over-escalates to Agentic when the real failure boundary is deterministic OS/network behavior |
| O4-agentic-to-workflow-overreach | over | Workflow-Agentic | Model over-escalates to Workflow for single agentic step behaviors |
| unmatched.md | — | (none yet) | Accumulator for pairs with no taxonomy file |

**Note on `confusion_pair` lists**: U1 currently has `confusion_pair: Integration-Agentic` in frontmatter but contains manually-added `Unit-Agentic` and `System-Agentic` entries from old runs. The frontmatter needs updating to include all three pairs so new entries route correctly.

---

## Known issues and pitfalls

### 1. Pre-fix contamination in O files
O2 contains 11 `Integration→System` entries (wrong direction, duplicates of U3 entries) from before the confusion_pair direction fix. O3 contains 2 `System→Agentic` and 1 `Integration→Agentic` wrong-direction entries. These cannot be auto-removed (append-only). They are recognized contamination — read O2 and O3 carefully for the correct (System→Integration and Agentic→System) entries.

### 2. Pattern drift — same confusion pair, different reasoning traps
A taxonomy file with a single `confusion_pair` will collect ALL entries for that pair, even if different runs exhibit different reasoning traps. Example: U1 (`Integration-Agentic`) contains "can mock" reasoning (old runs) AND "REJECTION-GATE quality escape" reasoning (new runs). If the traps require different fixes, the file needs to be split. The cognitive review step should detect this.

### 3. confusion_pair list gaps
U1 `confusion_pair` only lists `Integration-Agentic` but the file body also has `Unit-Agentic` (8 entries) and `System-Agentic` (3 entries) from manual curation. New Unit-Agentic and System-Agentic errors will route to `unmatched.md` until U1's frontmatter is updated. Same issue for U4 (`Integration-Workflow`, `System-Workflow` entries present but not in confusion_pair).

### 4. Summary undercounts legacy entries
`--summary` uses regex `\[run(\d+)\]` which only matches integer run labels. The ~400 entries using timestamp format (`[run-204623]`, `[run-203945]`) are invisible to the counter. The matched/unmatched counts are undercounts. This does not affect routing — routing works on any `[run...]` format. The summary fix would change the regex to `\[run\S+\]`.

### 5. Never-delete means contamination is permanent
Wrong entries from mis-routing cannot be removed by the tooling. Manual cleanup (with an explicit note in a commit message explaining why entries were removed) is acceptable for demonstrably misrouted entries, but must be deliberate.

---

## Validation checklist

Run these checks after any taxonomy file modification:

```bash
# 1. Check no two files share the same confusion pair (would cause double-routing)
grep "^confusion_pair:" experiments/write-test-plan/taxonomy/[UO]*.md

# 2. Check all O-file entries have the correct direction (Pred level > GT level)
#    For O1 (Integration→Unit): Pred=Integration, GT=Unit → Integration > Unit ✓
#    Any System→Agentic in O3 (Pred=System < GT=Agentic) is wrong direction ✗

# 3. Verify summary counts look reasonable after a run
npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --summary

# 4. Verify unmatched.md block count matches summary report
grep -c "^\[run" experiments/write-test-plan/taxonomy/unmatched.md
```
