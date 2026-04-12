---
name: audit-excuses
description: Audit justification excuses across the last N runs, re-home them into taxonomy patterns, and codify routing/rule updates
argument-hint: "[experiment name, default: write-test-plan] [--last N, default: 12]"
---

Run a focused excuse-audit loop: mine recent errors, cluster recurring reasoning excuses, map them to the right taxonomy "home", and codify rule updates.

Cross-reference:
- For full mining + idea generation across the latest run (not just excuse re-homing), use `mine-ideas` (`.agents/skills/mine-ideas/SKILL.md`).

## Canonical ownership

- Canonical here: last-N-runs excuse audit and taxonomy re-homing.
- Canonical for taxonomy mechanics/rules: `experiments/write-test-plan/taxonomy/README.md`.
- Canonical for latest-run idea generation flow: `.agents/skills/mine-ideas/SKILL.md`.

## Purpose

Use this when you need to answer:
- "What excuses is the model making recently?"
- "Are these new patterns or just missing confusion_pair coverage?"
- "What taxonomy/routing rules should we update?"

## Inputs

- Experiment name (default `write-test-plan`)
- Window size `N` runs (default `12`)

Set:
- `EXPERIMENT_DIR=experiments/<name>`
- `RESULTS=$EXPERIMENT_DIR/autoresearch-results.jsonl`
- `TAXONOMY_DIR=$EXPERIMENT_DIR/taxonomy`

## Procedure

### 1) Select run window

```bash
jq -r '.["iteration"]? // empty' "$RESULTS" >/dev/null 2>&1 || true
jq -r "select(.iteration>=0) | [.iteration,.status,.run_dir,(.treatment_key // \"\")] | @tsv" "$RESULTS" | tail -n <N>
```

Record the exact iteration range and run dirs. If the same `run_dir` appears under multiple iterations, keep iteration labels for traceability.

### 2) Extract excuses from each run

For each selected `run_dir`:

```bash
npx tsx "$EXPERIMENT_DIR/scripts/extract-thinking.ts" --run-dir <run_dir> --taxonomy-lines
```

Build a consolidated JSONL with added metadata (`iter`, `status`, `run_dir`, `treatment`).

### 3) Quantify confusion pairs and impact

For each row compute `pair = pred-gt` and weighted impact (`w`).
Rank by:
1. Total weighted impact (`sum(w)`)
2. Frequency (`count`)

Also compute top task-behavior contributors per pair.

### 4) Mine recurring excuse language

For top pairs, inspect `j` text directly and collect recurring claims (e.g., "real model output required", "MULTI-STEP implies Workflow").

Do not rely on token counts alone; include representative full-line justifications.

### 5) Decide routing action: expand or create

For each high-signal pair in `taxonomy/unmatched.md`:
- **Expand existing file** if reasoning trap is structurally the same as an existing category.
- **Create new file** only if argument structure is genuinely different.

Reference `taxonomy/README.md` for all routing conventions (Pred-GT, append-only, unmatched handling). Do not restate or override those rules here.

### 6) Apply taxonomy updates

Update taxonomy files, then run the canonical reprocess flow:

```bash
npx tsx "$EXPERIMENT_DIR/scripts/taxonomy-append.ts" --reprocess-unmatched
npx tsx "$EXPERIMENT_DIR/scripts/taxonomy-append.ts" --summary
```

Success condition: unmatched count drops as expected for targeted pairs.

### 7) Codify rules in docs

Update:
- `taxonomy/README.md` (current pattern pair coverage + routing rule-of-thumb)
- `justification-taxonomy.md` (audit addendum with counts, dominant excuse families, and changed homes)

Include exact counts and date-stamped scope (iterations and/or run dirs).

### 8) Audit output format (deliver to user)

Provide:
1. Scope audited (iterations, run dirs)
2. Top excuse families by weighted impact and frequency
3. Routing decisions (`pair -> taxonomy file`)
4. Concrete rule changes made
5. Before/after summary (`--summary` unmatched + key pair counts)
6. Files changed

### 9) Commit

```bash
git add "$EXPERIMENT_DIR/taxonomy" "$EXPERIMENT_DIR/justification-taxonomy.md"
git commit -m "analysis: audit excuses from last <N> runs and re-home taxonomy patterns"
```

## Guardrails

- Do not manually move lines between taxonomy files; use `--reprocess-unmatched`.
- Do not create duplicate `confusion_pair` ownership across multiple taxonomy files.
- Keep taxonomy append-only; if cleanup is needed, document justification explicitly.
- Treat repeated runs with same `run_dir` as potential duplicates when reporting aggregate frequency; state whether counts are raw or deduplicated.
