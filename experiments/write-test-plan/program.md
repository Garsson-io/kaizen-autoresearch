# Autoresearch Program: Write-Test-Plan

You are an autonomous research agent improving a prompt that classifies
software behaviors by minimum test level (Unit / Integration / System /
Agentic / Workflow).

**Your objective**: maximize the score printed by `./run-eval.sh`.
The score is a weighted average over a 3-task corpus (0–100%). Higher is better.
This is your **val_bpb** — the only number that matters.

---

## Loop

Repeat until you reach a score ≥ 85% or have made 20 iterations:

1. **Measure current score**
   ```bash
   cd experiments/write-test-plan
   ./run-eval.sh 2>&1 | tee runs/current.log
   ```
   Read the final `SCORE:` line. This is your baseline for this iteration.

2. **Diagnose** — read `runs/latest/` output files + the scoring breakdown.
   - Which tasks score lowest?
   - Which behaviors are most wrong? (look at `direction: under` rows)
   - Which GT levels are systematically missed? (Agentic? Workflow? System?)
   - Is `plan_consistent` failing often?

3. **Form a hypothesis** — one specific, testable claim about why the prompt
   underperforms. Write it as a one-liner: *"The prompt fails to trigger Agentic
   because it doesn't explain what makes a behavior Agentic."*

4. **Edit `prompts/treatment.md`** — make the smallest change that tests your
   hypothesis. Do NOT rewrite the whole prompt. One targeted edit at a time.
   - Good: add a concrete example of an Agentic behavior
   - Good: sharpen the definition of one level with a negative example
   - Bad: restructure everything, change tone, add irrelevant context

5. **Measure again**
   ```bash
   ./run-eval.sh 2>&1 | tee runs/candidate.log
   ```
   Extract the `SCORE:` line.

6. **Keep or revert**
   - If new score > old score: **keep** the edit. Commit:
     ```bash
     git add experiments/write-test-plan/prompts/treatment.md \
             experiments/write-test-plan/leaderboard.md
     git commit -m "exp/write-test-plan: iter N — <score>% (+Δ%) — <hypothesis>"
     ```
   - If new score ≤ old score: **revert**:
     ```bash
     git checkout experiments/write-test-plan/prompts/treatment.md
     ```
     Mark the hypothesis as falsified in your notes and try a different angle.

7. **Update `leaderboard.md`** and **post to the discussion** (on every kept commit):
   - Post a reply to https://github.com/Garsson-io/kaizen-autoresearch/discussions/1
     with your iteration number, score, delta, and the hypothesis that worked.
     ```bash
     gh api graphql -f query='mutation($id:ID!,$body:String!){addDiscussionComment(input:{discussionId:$id,body:$body}){comment{url}}}' \
       -f id="D_kwDORybT0s4AlROe" \
       -f body="**Iter N — 75.2% (+2.9%)** Hypothesis: added positive Agentic example. EC-04 b3/b4 now 60% suff (was 5%)."
     ```
   - Add a row to the table: iteration number, score, delta, commit SHA, change summary.
   - Update the breakdown table with per-task scores.
   - If a new failure pattern emerges, document it under "Key failure patterns".

8. **Push**
   ```bash
   git push origin main
   ```

---

## Ground rules

- **Never edit corpus or ground truth files** — they are fixed.
- **Never edit `scripts/` or `src/`** — only `prompts/treatment.md` changes.
- **Never edit `leaderboard.md` without a score change** — it's a record, not a scratchpad.
- The `runs/` directory is gitignored. Use GitHub Releases to archive a full run
  (zip the `runs/` directory and attach to a release) if you want to share it.
- One hypothesis per iteration. If you're tempted to make two changes, pick the
  more important one and defer the other.

---

## Starting state

- Baseline score: **72.3%** (built-in baseline prompt, no guidance)
- Treatment-v0 score: **66.4%** (added level defs + key questions — worse!)
- Current `prompts/treatment.md` = treatment-v0

The treatment is currently worse than baseline. Primary failure mode: **Agentic
behaviors are almost never predicted correctly**. The model defaults to System or
Integration when the GT is Agentic (behaviors that call external AI APIs).

Start at step 1: measure the current score, then improve.

---

## Useful commands

```bash
# Run the full eval (3 tasks, treatment prompt)
cd experiments/write-test-plan && ./run-eval.sh

# Run baseline for comparison
./run-eval.sh --condition baseline

# Run a single task manually
npx tsx scripts/run-probe.ts \
  --task EC-04 \
  --condition treatment \
  --issue-file corpus/ec-04.md \
  --prompt-file prompts/treatment.md \
  --out runs/debug/out-treatment-ec04.json

# Score a single output
npx tsx scripts/score.ts \
  --output runs/debug/out-treatment-ec04.json \
  --gt ground-truth/ec-04.json

# Score all outputs in a directory
npx tsx scripts/score.ts \
  --output-dir runs/latest/ \
  --gt-dir ground-truth/
```

---

## Level definitions (for your own reference when diagnosing)

| Level | When it applies |
|-------|----------------|
| Unit | Pure in-process logic, no I/O, no external calls |
| Integration | Wires real modules together; local filesystem or DB |
| System | Subprocess, OS, real HTTP, real external API |
| **Agentic** | **Outcome depends on real LLM output / non-determinism** |
| Workflow | Multiple agentic steps in sequence; full agent pipeline |

**Agentic key signal**: the behavior involves calling an external AI/LLM API
where the content of the response matters and is non-deterministic.
A mock won't catch this — you need a real model call.

**Workflow key signal**: the behavior spans multiple sequential agentic steps
where the output of step N feeds step N+1 (e.g., classify → summarize → route).
