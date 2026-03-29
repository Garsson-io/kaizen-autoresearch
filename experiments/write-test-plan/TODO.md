# TODOs — Review Findings (2026-03-28)

---

### ~~1. Migrate results log from TSV to JSONL~~ — DONE
### ~~4. Verify that verify.ts outputs .loss~~ — DONE (outputs `{"score":75,"loss":0}`)
### ~~5. ideas-index.sh parsing is fragile~~ — DONE (rewritten as TypeScript)
### ~~7. IDEATE subagent META_NOTE flow~~ — DONE (documented in program.md step 3)
### ~~10. Baseline policy: do not re-run baseline every /run-experiment start~~ — DONE (documented in program.md + meta-failures.md)

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

## Codex Iteration Loop (5 iterations) — 2026-03-28

### Iteration 1/5 (baseline loss at start: 451.23)
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE — `integration-middle-anchor` tested, run `20260328-225446`, loss `460.31` vs baseline `451.23` (reverted)
- [x] LOG — appended iterations 34 (baseline) and 35 (discard) with model + metrics
- [x] → Next iteration (refresh tasks)

### Iteration 2/5 (current, reference loss: 390.59)
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE — `precision-failure-boundary` tested, run `20260328-232623`, loss `431.05` vs reference `390.59` (reverted)
- [x] LOG — appended iteration 36 with model + metrics; marked idea rejected
- [x] → Next iteration (refresh tasks)

### Iteration 3/5 (reference loss at start: 390.59)
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE — `mock-miss-floor-not-ceiling` tweak applied to `MOCK-MISS`, run `20260329-002612`, loss `390.23` vs reference `390.59` (kept)
- [x] LOG — appended iteration 37 with model + metrics
- [x] → Next iteration (refresh tasks)

### Iteration 4/5 (current, reference loss: 390.23)
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE — `self-check-hypothetical-wiring-guard` tested, run `20260329-004233`, loss `453.53` vs reference `390.23` (reverted)
- [x] LOG — appended iteration 38 with model + metrics
- [x] → Next iteration (refresh tasks)

### Iteration 5/5 (current, reference loss: 390.23)
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE
- [x] EDIT + RUN + SCORE — `mock-miss` evidence-text escalation gate tested, run `20260329-004857`, loss `404.78` vs reference `390.23` (reverted)
- [x] LOG — appended iteration 39 with model + metrics
- [x] → Experiment loop complete (5/5)
