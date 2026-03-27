# Autoresearch Program: Write-Test-Plan

Goal: Maximize test level classification accuracy — get weighted avg score to ≥75 on 10-task corpus
Scope: experiments/write-test-plan/prompts/treatment.md
Metric: Weighted average score 0–100 (higher is better)
Verify: npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score'

---

You are an autonomous research agent improving a prompt that classifies
software behaviors by minimum test level (Unit / Integration / System /
Agentic / Workflow).

**Your objective**: maximize the score printed by `./run-eval.sh`.
The score is a weighted average over the 10-task corpus (0–100%). Higher is better.
This is your **val_bpb** — the only number that matters for the iteration loop.

**CRITICAL — treatment.md MUST keep these template variables** (run-probe.ts replaces them):
- `{{TASK_ID}}` — replaced with e.g. "EC-04"
- `{{ISSUE_BODY}}` — replaced with the issue markdown
If you remove these, the eval produces garbage.

**Noise warning**: LLM-based scoring is inherently noisy (same prompt can score differently
across runs). Ignore improvements < 1.5%. If a change shows a small delta, re-run verify
to confirm before keeping.

**Success threshold** (from kaizen #1016):
- ≥ 75%: skill produces correct minimal plans → experiment complete
- 55–75%: improving but not reliable → keep iterating
- < 55%: dominant failure mode → design targeted fix

---

## Experimental conditions (from kaizen #1016)

This experiment has three conditions. You iterate on **treatment only**.

| Condition | Prompt | Status |
|-----------|--------|--------|
| baseline | `prompts/baseline.md` (fixed, never edit) | Reference — read for comparison |
| treatment | `prompts/treatment.md` ← **you edit this** | Active — iterate on this |
| treatment-l12 | `prompts/treatment-l12.md` (fixed, never edit) | Rejected — read to avoid repeating |

**Before iterating, read these files**:
- `experiments/write-test-plan/prompts/` — all prompt variants (study what each does differently)
- `experiments/write-test-plan/leaderboard.md` — score history and per-task breakdowns
- `git log --follow experiments/write-test-plan/prompts/treatment.md` — past changes

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

## Diagnostic guidance (supplements the autoresearch loop protocol)

The autoresearch loop handles measure → modify → verify → keep/revert → commit automatically.
Use this section for **what to look at** when deciding your next change.

### How to diagnose
After each verify run, read `runs/latest/` output files + the scoring breakdown:
- Which tasks score lowest?
- Which behaviors are `direction: under`? (predicted too low)
- Which GT levels are systematically missed? (Agentic? Workflow? System?)
- Is `plan_consistent` failing often? Are notes present?

The most impactful targets are behaviors with **high weight (4) that score < 40% sufficiency**.

### Read ideas/ before iterating

The `ideas/` folder contains prompt-improvement hypotheses with structured frontmatter and steelman/critique analysis. **Read all ideas before choosing your next change.** Each file has:
- `status`: proposed, trying, kept, rejected, parked
- `effort`: low, medium, high
- `expected_impact`: low, medium, high
- `targets`: which failure modes it addresses
- `confusion_pairs`: which label boundaries it targets
- Body: **Steelman** (why it would work) + **Scathing Critique** (why it wouldn't)

Update `status` after trying each idea.

### What makes a good edit to `prompts/treatment.md`
- ✓ Add a concrete positive example for the level the model misses
- ✓ Add a "NOT this" example that disambiguates two adjacent levels
- ✓ Reorder key questions to promote Agentic/Workflow checks
- ✗ Rewrite the whole prompt — too many variables, can't diagnose
- ✗ Add generic "think carefully" language — no signal value

### After achieving ≥75% on round 1
Run adversarial rounds and update `leaderboard.md`:
```bash
./run-eval.sh --round 2  # anchoring noise
./run-eval.sh --round 3  # pressure noise
```

---

## Ground rules

- **Never edit corpus, ground-truth, scripts, or src** — only `prompts/treatment.md` changes.
- **Never edit `leaderboard.md` without a score change**.
- `runs/` is gitignored. Use GitHub Releases to archive a full run if needed.
- One hypothesis per iteration.
- **Before each iteration, read `leaderboard.md`** — it has the full score history and per-task breakdowns. Use it alongside git log and `autoresearch-results.tsv` to avoid repeating failed approaches.

---

## Upstream knowledge: Garsson-io/kaizen

The `Garsson-io/kaizen` repo is where these skills run in production. Its issues, PRs, and discussions contain incident reports, failure analyses, and theories that directly inform this experiment. Mine it for ideas using `gh`:

```bash
gh issue list --repo Garsson-io/kaizen --label bug --limit 20
gh issue list --repo Garsson-io/kaizen --label area/skills --limit 20
gh search issues "test level" --repo Garsson-io/kaizen
```

Key upstream issues already mined:
- **#1016**: Original experiment design, round results, failure mode analysis
- **#1020**: Corpus design constraints — vocabulary leak prevention, observable behavior framing
- **#1014**: Incident — agent correctly identified seam but defaulted to unit-only test plan
- **#1019**: Incident — agent self-certified PASS despite stored FAIL findings
- **#1017**: Skill eval infrastructure vision — how this experiment fits the bigger picture

When stuck or generating new ideas, search for new incidents and discussions upstream. Production failures are the best source of adversarial corpus tasks and prompt improvement hypotheses.

---

## Current failure analysis

**Primary failure**: Agentic behaviors score ~5% sufficiency in EC-04.
The model classifies "calls external AI API" as System instead of Agentic.
**Root cause**: prompt says "depends on real LLM non-determinism" but model doesn't connect
"external AI classification API" → "LLM non-determinism."

**Fix candidates** (try in order of expected impact):
1. Add concrete positive Agentic example: "classifies via AI API → Agentic because mock returns fixed label but real model varies"
2. Explicit disambiguation: "Not every external API = Agentic; only calls where the LLM's choice itself matters"
3. Move Agentic check before System check in key questions

**Secondary failure**: Workflow gap — EC-07 b4, EC-10 b5 (GT=Workflow) predicted as Agentic.

**What was tried**: read `experiments/write-test-plan/prompts/baseline.md`, `experiments/write-test-plan/prompts/treatment-l12.md`, and `experiments/write-test-plan/leaderboard.md` for full history. Don't repeat failed approaches.

**Links**: [failure analysis](https://github.com/Garsson-io/kaizen-autoresearch/issues/2) · [leaderboard](leaderboard.md) · [discussion](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1)

**Discussion ID** (for `/post-run-report`): `D_kwDORybT0s4AlROe`

---

## Corpus coverage

Full corpus is dynamically discovered from `corpus/*.md` files (currently 20 tasks, EC-01 through EC-20).

**Task catalog**: `corpus/catalog.json` contains metadata for each task (title, domain, difficulty, adversarial technique, labels). This is the source of truth for corpus composition — read it instead of hardcoded tables.

**Key subsets** (use `--corpus` flag):
- Full corpus (default): all `corpus/*.md` files, auto-detected
- Original core: `--corpus ec-04,ec-07,ec-09,ec-10` (4 tasks covering all 5 levels)
- Adversarial only: `--corpus ec-11,ec-12,ec-13,ec-14,ec-15,ec-16,ec-17,ec-18,ec-19,ec-20`
- Single task debug: `--single ec-09`

**Adversarial techniques in v2 tasks** (EC-11 to EC-20):
- `buried_signal` — LLM dependency hidden in technical phrasing
- `misleading_surface` — looks like AI/Agentic but is actually deterministic
- `boundary_case` — sits on the boundary between two labels
- `multi_step_pipeline` — multiple agentic steps that could be Workflow
- `distractor_content` — irrelevant detail hides classification signal
- `contradiction` — behaviors that look like one level but are actually another

**Adding new tasks**: Drop a new `.md` file in `corpus/` and matching `.json` in `ground-truth/`. Update `corpus/catalog.json` with metadata. The eval script auto-discovers new tasks.

All tasks run in parallel. `--single ec-09` for fast single-task debug.

---

## Useful commands

```bash
# Run full eval (10 tasks in parallel, treatment prompt)
./run-eval.sh

# Run a specific condition
./run-eval.sh --condition baseline
./run-eval.sh --prompt prompts/treatment-l12.md

# Adversarial rounds
./run-eval.sh --round 2
./run-eval.sh --round 3

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
