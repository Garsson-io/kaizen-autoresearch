# Autoresearch Program: Write-Test-Plan

You are an autonomous research agent improving a prompt that classifies
software behaviors by minimum test level (Unit / Integration / System /
Agentic / Workflow).

**Your objective**: maximize the score printed by `./run-eval.sh`.
The score is a weighted average over a 4-task core corpus (0–100%). Higher is better.
This is your **val_bpb** — the only number that matters for the iteration loop.

**Success threshold** (from kaizen #1016):
- ≥ 75%: skill produces correct minimal plans → experiment complete
- 55–75%: improving but not reliable → keep iterating
- < 55%: dominant failure mode → design targeted fix

---

## Experimental conditions (from kaizen #1016)

This experiment has three conditions. You iterate on **treatment only**.

| Condition | Prompt | Status |
|-----------|--------|--------|
| baseline | `prompts/baseline.md` (fixed) | 72.3% (round 1, 3-task corpus) |
| treatment | `prompts/treatment.md` ← **you edit this** | 66.4% (round 1, 3-task corpus) |
| treatment-l12 | `prompts/treatment-l12.md` | not yet run |

Run treatment-l12 early — it's an explicit hypothesis from #1016:
> "Compare: agent emits 5-step level directly vs agent reasons in L12 ladder, translates to 5-step"

```bash
./run-eval.sh --prompt prompts/treatment-l12.md 2>&1 | tail -20
```

## Adversarial rounds (from kaizen #1016)

Three rounds test robustness:
- **Round 1** (default): neutral — no misleading context
- **Round 2**: task mentions existing unit tests → anchoring pressure toward Unit
- **Round 3**: "team prefers fast tests", "deferred to follow-up" → discouragement of higher levels

Run all three rounds before declaring success:
```bash
./run-eval.sh --round 1  # clean score
./run-eval.sh --round 2  # anchoring noise
./run-eval.sh --round 3  # pressure noise
```

A condition that passes round 1 but drops ≥10% on rounds 2/3 is not robust.
Report all three scores in `leaderboard.md`.

---

## The iteration loop

Repeat until score ≥ 75% (round 1) AND adversarial drop ≤ 10%:

### 1. Measure current score
```bash
cd experiments/write-test-plan
./run-eval.sh 2>&1 | tee runs/current.log
```
Read the final `SCORE:` line. This is your baseline for this iteration.

### 2. Diagnose
Read `runs/latest/` output files + the scoring breakdown:
- Which tasks score lowest?
- Which behaviors are `direction: under`? (predicted too low)
- Which GT levels are systematically missed? (Agentic? Workflow? System?)
- Is `plan_consistent` failing often? Are notes present?

The most impactful targets are behaviors with **high weight (4) that score < 40% sufficiency**.

### 3. Form a hypothesis
Write a one-liner: *"The prompt fails to trigger Agentic because it doesn't distinguish
between 'calls an external API' and 'depends on what an LLM produces'."*

Good hypotheses are specific and falsifiable in one run.

### 4. Edit `prompts/treatment.md`
Make the **smallest** change that tests your hypothesis:
- ✓ Add a concrete positive example for the level the model misses
- ✓ Add a "NOT this" example that disambiguates two adjacent levels
- ✓ Reorder key questions to promote Agentic/Workflow checks
- ✗ Rewrite the whole prompt — too many variables, can't diagnose
- ✗ Add generic "think carefully" language — no signal value

### 5. Measure again
```bash
./run-eval.sh 2>&1 | tee runs/candidate.log
```

### 6. Keep or revert
- **New score > old score**: keep. Commit:
  ```bash
  git add experiments/write-test-plan/prompts/treatment.md \
          experiments/write-test-plan/leaderboard.md
  git commit -m "exp/write-test-plan: iter N — <score>% (+Δ%) — <hypothesis>"
  ```
- **New score ≤ old score**: revert:
  ```bash
  git checkout experiments/write-test-plan/prompts/treatment.md
  ```

### 7. Update `leaderboard.md` + post to Discussion
On every kept commit, add a row and post to the tracking discussion:
```bash
gh api graphql -f query='mutation($id:ID!,$body:String!){addDiscussionComment(input:{discussionId:$id,body:$body}){comment{url}}}' \
  -f id="D_kwDORybT0s4AlROe" \
  -f body="**Iter N — 75.2% (+2.9%)** Hypothesis: added positive Agentic example. EC-04 b3/b4 now 60% suff (was 5%)."
```

### 8. Post run results to kaizen #1016
After completing a full round (all 3 adversarial rounds), post to kaizen:
```bash
gh issue comment 1016 --repo Garsson-io/kaizen \
  --body "$(cat <<'COMMENT'
## Run results — iter N

| task | suff | prec | cons | total |
|------|------|------|------|-------|
| EC-04 | 72% | 68% | 80% | 73% |
...

Round 1 (neutral): **75.2%**
Round 2 (anchoring): **72.1%** (−3.1%)
Round 3 (pressure): **70.8%** (−4.4%)
COMMENT
)"
```

### 9. Push
```bash
git push origin main
```

---

## Ground rules

- **Never edit corpus, ground-truth, scripts, or src** — only `prompts/treatment.md` changes.
- **Never edit `leaderboard.md` without a score change**.
- `runs/` is gitignored. Use GitHub Releases to archive a full run if needed.
- One hypothesis per iteration.

---

## Starting state

| Condition | Score (3-task corpus, round 1) | Notes |
|-----------|-------------------------------|-------|
| baseline | 72.3% | built-in, no guidance |
| treatment-v0 | 66.4% | added level defs + key questions — **worse** |
| treatment-l12 | not yet run | L12 reasoning → 5-step translation |

**Primary failure mode**: Agentic behaviors scored ~5% sufficiency in both conditions.
See kaizen issue: https://github.com/Garsson-io/kaizen-autoresearch/issues/2

Start with:
1. Run `treatment-l12` to measure the L12 hypothesis
2. Then iterate on `treatment.md` based on what you learn

---

## Corpus coverage

Core corpus (used by default): EC-04, EC-07, EC-09, EC-10

| Task | Levels present | Key challenge |
|------|---------------|---------------|
| EC-04 | Unit, Integration, **Agentic** | AI API call classification |
| EC-07 | Unit, Integration, System, **Agentic**, **Workflow** | Full ladder — synthesis + delivery |
| EC-09 | Unit, Integration | Baseline — should be easy |
| EC-10 | Integration, System, **Agentic**, **Workflow** | Code review agent — full ladder |

Full corpus (EC-01 through EC-10) available for final validation. Don't overfit to core.

---

## Useful commands

```bash
# Run full eval (4 tasks, treatment prompt)
./run-eval.sh

# Run a specific condition
./run-eval.sh --condition baseline
./run-eval.sh --prompt prompts/treatment-l12.md

# Adversarial rounds
./run-eval.sh --round 2
./run-eval.sh --round 3

# Expand to full corpus
./run-eval.sh --corpus ec-01,ec-02,ec-03,ec-04,ec-05,ec-06,ec-07,ec-08,ec-09,ec-10

# Score existing outputs
npx tsx scripts/score.ts --output-dir runs/latest/ --gt-dir ground-truth/

# Single task debug
npx tsx scripts/run-probe.ts \
  --task EC-04 --condition treatment \
  --issue-file corpus/ec-04.md \
  --prompt-file prompts/treatment.md \
  --out runs/debug/out.json

npx tsx scripts/score.ts \
  --output runs/debug/out.json \
  --gt ground-truth/ec-04.json
```

---

## Level reference

| Level | Key signal | Common miss |
|-------|-----------|-------------|
| Unit | Pure in-process, no I/O, no subprocess, no LLM | Correct |
| Integration | Multiple real modules, local DB/FS, no subprocess | Often correct |
| System | Real subprocess OR real external non-LLM API | Sometimes confused with Agentic |
| **Agentic** | **Real LLM call — non-determinism matters** | **Missed most often — model defaults to System** |
| **Workflow** | **Multiple agentic steps in sequence** | **Missed — model uses Agentic when should be Workflow** |

**Agentic vs System**: the distinction is not "does it call an external service" but
"does the *content* of the response matter and can it vary non-deterministically."
A deterministic REST API = System. A language model = Agentic.
