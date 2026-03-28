# TODOs — Review Findings (2026-03-28)

From the ultrathink review of the full experiment infrastructure.

---

### ~~1. Migrate results log from TSV to JSONL~~ — DONE

### ~~5. ideas-index.sh parsing is fragile~~ — DONE (rewritten as TypeScript)

### 2. Cold start handling

Step 1 (MINE) assumes `runs/latest/` exists. First iteration of a fresh experiment has nothing to mine.

**Fix**: Add to program.md loop: "If runs/latest/ does not exist or is empty, skip MINE/DIAGNOSE/META and go directly to IDEATE with a note that this is the first iteration."

### 3. Measure noise floor for loss metric

program.md step 8 says "the noise floor for loss is TBD." First iteration should run the same prompt twice to establish it.

### 4. Verify that verify.ts outputs .loss

program.md says `Verify: ... | jq '.loss'` — need to confirm verify.ts actually outputs this after the metric change.

### 6. GT reasoning field incomplete

Only 5 of 30 GT files have the `reasoning` field. Low priority — optional field, doesn't affect scoring.

### 7. IDEATE subagent META_NOTE flow

The executor should check for META_NOTE in the subagent's response and evaluate during step 3 (META). Not yet documented in program.md step 3.
