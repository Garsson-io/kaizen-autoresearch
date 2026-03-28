# TODOs — Review Findings (2026-03-28)

---

### ~~1. Migrate results log from TSV to JSONL~~ — DONE
### ~~4. Verify that verify.ts outputs .loss~~ — DONE (outputs `{"score":75,"loss":0}`)
### ~~5. ideas-index.sh parsing is fragile~~ — DONE (rewritten as TypeScript)
### ~~7. IDEATE subagent META_NOTE flow~~ — DONE (documented in program.md step 3)

### 2. Cold start handling

Step 1 (MINE) assumes `runs/latest/` exists. First iteration of a fresh experiment has nothing to mine.

**Fix**: Add to program.md loop: "If runs/latest/ does not exist or is empty, skip MINE/DIAGNOSE/META and go directly to IDEATE with a note that this is the first iteration."

### 3. Measure noise floor for loss metric

program.md step 8 says "the noise floor for loss is TBD." First iteration should run the same prompt twice to establish it.

### 6. GT reasoning field incomplete

Only 5 of 30 GT files have the `reasoning` field. Low priority — optional field, doesn't affect scoring.

### 8. run-stats.ts — per-run cost/time/token reporting

Parse `.log` files from each run and report per-probe and aggregate stats: time, cost, input/output tokens, cache hits, tool calls. Show as a table like results.ts.

### 9. Verify --strict-mcp-config works on all probes

Smoke-tested on EC-09 (42s vs 82s, $0.039 vs $0.061). Need to verify a full 30-task run completes without errors with the stripped flags.

---

## Codex Iteration Loop (5 iterations)

### Iteration 1/5 (current)
- [x] MINE — extract-thinking / taxonomy lines from latest run
- [x] DIAGNOSE — summarize dominant misses and impacted tasks
- [x] META — update/check meta-failures against this run
- [x] IDEATE — choose one atomic edit hypothesis
- [x] EDIT + RUN + SCORE — added Agentic disambiguation line; run `20260328-195648`, loss `306.79`
- [x] LOG — append iteration result with model + metrics

### Iteration 2/5
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE
- [x] LOG

### Iteration 3/5
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE
- [x] LOG

### Iteration 4/5
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE
- [x] LOG

### Iteration 5/5
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE
- [x] LOG
