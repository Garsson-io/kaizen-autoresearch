# TODOs — Review Findings (2026-03-28)

From the ultrathink review of the full experiment infrastructure.

---

### 1. Migrate results log from TSV to JSONL

**Status**: schema done, migration pending

The current `autoresearch-results.tsv` has no header, rows out of order, and missing iterations. Migrate to `autoresearch-results.jsonl` (one JSON object per line).

Zod schema added to `src/schema.ts` as `IterationResult`. Fields: iteration, timestamp, commit, run_dir, idea_id, score, loss, delta, status, description, section, edit_type.

**Tasks**:
- [ ] Write a migration script that reads the old TSV and writes JSONL
- [ ] Backfill from git log + leaderboard.md for missing iterations
- [ ] Update program.md step 9 (LOG) to reference JSONL format
- [ ] Update the IDEATE subagent prompt to reference JSONL
- [ ] Delete the old TSV after migration

---

### 2. Cold start handling

**Status**: not started

Step 1 (MINE) assumes `runs/latest/` exists. First iteration of a fresh experiment has nothing to mine.

**Fix**: Add to program.md loop: "If runs/latest/ does not exist or is empty, skip MINE/DIAGNOSE/META and go directly to IDEATE with a note that this is the first iteration."

---

### 3. Measure noise floor for loss metric

**Status**: not started

program.md step 8 says "the noise floor for loss is TBD." Until measured, the loop can't distinguish real improvements from noise.

**Fix**: Before the first prompt change, run the same treatment twice and compare loss values. Record the delta as the noise floor. Update program.md step 8 with the measured threshold.

---

### 4. Verify that verify.ts outputs .loss

**Status**: not confirmed

program.md says `Verify: ... | jq '.loss'` but the scorer was recently changed (commit ffcb140). Need to confirm verify.ts actually outputs a `.loss` field.

**Fix**: Run `npx tsx scripts/verify.ts --mock 0.750` and check the output format. If `.loss` is missing, update verify.ts or program.md.

---

### 5. ideas-index.sh --tsv parsing is fragile

**Status**: known issue

The `--tsv` format's YAML array parsing uses shell variable state tracking that's brittle with non-standard YAML formatting.

**Fix**: The subagent should use the default format (raw frontmatter blocks), not `--tsv`. Consider rewriting as a TypeScript script with proper YAML parsing if the shell version causes issues.

---

### 6. GT reasoning field incomplete

**Status**: partial

Only 5 of 30 GT files have the `reasoning` field (EC-02, EC-06, EC-08, EC-13, EC-20 — the split tasks). The other 25 have just `behavior_id` + `ground_truth_level`.

**Fix**: Add reasoning to remaining GT files. Low priority — the field is optional and doesn't affect scoring. But it helps future GT audits.

---

### 7. IDEATE subagent META_NOTE flow

**Status**: schema done, executor handling not documented

The IDEATE subagent can now return a `META_NOTE:` field with process observations. The executor should check for this and update meta-failures.md during step 3 (META).

**Fix**: Add a note to program.md step 3: "If the previous IDEATE subagent returned a META_NOTE, evaluate it here and update meta-failures.md if warranted."
