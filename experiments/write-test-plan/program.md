# Autoresearch Program: Write-Test-Plan

Goal: Minimize weighted cross-entropy loss on 30-task classification corpus
Scope: experiments/write-test-plan/prompts/treatment.md
Metric: Weighted cross-entropy loss (lower is better) — see discussion #3
Verify: npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.loss'
Legacy metric: npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score' (0–100, higher is better)

**Working directory**: Repo root. All paths are relative to the repo root (e.g. `experiments/write-test-plan/scripts/results.ts`).
If you need to run TS helpers from arbitrary cwd, use `experiments/write-test-plan/scripts/run.sh <script.ts> ...`.
Do not `cd experiments/write-test-plan` and then use `experiments/write-test-plan/...` prefixes in the same command.

---

You are an autonomous research agent improving a prompt that classifies
software behaviors by minimum test level (Unit / Integration / System /
Agentic / Workflow).

**Your objective**: maximize the score printed by `experiments/write-test-plan/run-eval.sh`.
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
experiments/write-test-plan/run-eval.sh --round 1  # clean score
experiments/write-test-plan/run-eval.sh --round 2  # anchoring noise
experiments/write-test-plan/run-eval.sh --round 3  # pressure noise
```

A condition that passes round 1 but drops ≥10% on rounds 2/3 is not robust.
Report all three scores in `leaderboard.md`.

---

## The iteration loop (follow this exactly)

```
LOOP:
  1. MINE — use extract-thinking.ts to pair thinking blocks with outputs and detect self-aware errors:
     ```bash
     # Human-readable table of errors + self-aware flags:
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest

     # Lines ready to append to taxonomy/:
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines

     # Machine-readable JSON (all 173 behaviors with direction/gt/justification/thinking):
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --json
     ```
     The script pairs each behavior's structured output (justification, predicted level) with the
     model's internal thinking from the .log file. It also flags self-aware cases where thinking
     contains correct reasoning the model overrides. Append --taxonomy-lines output to taxonomy/.
  2. DIAGNOSE — read taxonomy/ for top patterns by impact, read ideas/ for candidates
  3. META — read meta-failures.md. Check: did this run's result confirm or weaken any meta-hypothesis?
     Update meta-failures.md with new evidence. A meta-hypothesis needs ≥3 supporting data points
     to be treated as confirmed, and ≥2 contradicting data points to be disproved. One run proves nothing.
     Also: if the previous IDEATE subagent returned a META_NOTE, evaluate it here and update
     meta-failures.md if the observation is warranted.
  4. IDEATE — spawn a subagent for this step (see "IDEATE subagent" section below).
     Give it the latest score summary and results log (from `npx tsx experiments/write-test-plan/scripts/results.ts --last 10`).
     It reads ideas/, taxonomy/, meta-failures.md, treatment.md itself.
     It returns: idea id, specific edit (with diff), rationale, skeptic view, and optional meta-note.
     If it creates new ideas, they'll be written to ideas/ by the subagent.
  4.5. EXPLORE (optional — skip if idea.explore_status is already set)
       If the idea returned by IDEATE has explore_status: null, run:
         /explore write-test-plan <idea-id>
       Signal: proceed to EDIT using the winning variation's diff
       No-signal: do NOT edit. Return to IDEATE with a new idea.
       Already-set: use the recorded explore result — no new run needed.
  5. EDIT — make one atomic change to treatment.md. Be explicit: adding X, removing Y, or replacing Y with X.
  6. COMMIT — git commit with experiment(treatment): prefix. Reference the idea id and named section.
  7. RUN — experiments/write-test-plan/run-eval.sh (or verify.ts). Monitor progress.
  8. SCORE — compare loss to baseline. Any decrease in loss → keep. Same or increase → git revert.
     NOTE: the noise floor for loss is TBD — run the same prompt twice to measure it.
     Until then, treat any loss decrease as signal. Update this after the first confirmation run.
  9. LOG — append one JSON line to experiments/write-test-plan/autoresearch-results.jsonl (schema: src/schema.ts IterationResult).
     Capture `metrics` from `verify.ts` output (`jq '.metrics'`) and include in the JSONL record.
     Always include `model` (e.g. `claude-haiku-4-5-20251001`, `gpt-5.3-codex`) so results can be compared across models.
     Update idea status in ideas/ (kept/rejected/no-op). View log: `npx tsx experiments/write-test-plan/scripts/results.ts`
  10. COMMIT RUNS — git add experiments/write-test-plan/runs/<timestamp>/ and commit the output JSONs.
  11. NEXT ITERATION — update task list: clear completed tasks, create fresh tasks for
      the next iteration's inner loop (MINE through COMMIT RUNS). This keeps the task
      list showing the CURRENT iteration's progress, not stale completed tasks.
      Then GOTO 1.
```

**Steps 1–4 are MANDATORY.** You must mine the prose, read the taxonomy, consult meta-failures, AND run the IDEATE subagent BEFORE editing the prompt.

### Task list management

The outer loop (`--iterations N`) is the experiment. Each iteration has an inner loop (steps 1-10).
Use the task list to show the inner loop of the CURRENT iteration:

```
Iteration 3/5: IDEATE
  ✓ Iter 3: MINE — extracted justifications, appended [run3] to taxonomy
  ✓ Iter 3: DIAGNOSE — top pattern: U1 (impact 40), 10 occurrences
  ✓ Iter 3: META — no new evidence for meta-hypotheses
  ~ Iter 3: IDEATE — spawning subagent...
  ◻ Iter 3: EDIT + COMMIT
  ◻ Iter 3: RUN + SCORE
  ◻ Iter 3: LOG + COMMIT RUNS
  ◻ Iter 3: → Next iteration (refresh tasks)
```

At step 11, mark "→ Next iteration" complete, then create a fresh set of tasks for iteration 4.
Include the iteration number and the current score in each task name for context.

### How to diagnose (step 2)
- Which tasks score lowest? Which behaviors are `direction: under`?
- Which GT levels are systematically missed?
- Most impactful targets: behaviors with **high weight (4) that score < 40% sufficiency**.
- Read `taxonomy/` files — which patterns have the most lines? Which grew since last run?

### IDEATE subagent (step 4)

Spawn a subagent with `subagent_type: "general-purpose"` and `model: "opus"`. Give it this prompt, filling in the `{PLACEHOLDERS}` from your MINE/DIAGNOSE output:

```
You are the IDEATE step of an experiment iteration loop. Your job is to decide
what prompt change to try next. Think deeply — this is the creative step.

## Context from this iteration

Latest run score: {SCORE}
Latest run per-task totals (paste the TOTAL lines):
{PER_TASK_TOTALS}

Results log (last 10 iterations):
{RESULTS_LOG — from `npx tsx experiments/write-test-plan/scripts/results.ts --last 10`}

Top taxonomy patterns (from DIAGNOSE):
{TOP_PATTERNS — e.g. "U1: can mock the API — 10 occurrences, impact 40"}

## What to do

1. Run `npx tsx experiments/write-test-plan/scripts/ideas-index.ts --table` to see all ideas with status/effort/impact
2. Read `experiments/write-test-plan/prompts/treatment.md` (the current prompt)
3. Read `experiments/write-test-plan/justification-taxonomy.md` (failure pattern summary)
4. Read `experiments/write-test-plan/meta-failures.md` (process pitfalls)
5. For any ideas you want to examine in detail, read the full file in `ideas/`
6. Check `explore_status` on each candidate idea:
   - `explore_status: signal`    → prioritize; use the recorded winning variation diff
   - `explore_status: no-signal` → deprioritize; skip unless no other options
   - `explore_status: null`      → viable candidate; will require EXPLORE before full run

Then think deeply:
a. Which existing ideas target the top taxonomy patterns from the context above?
b. Do the patterns suggest a NEW idea not in the backlog?
c. Can two existing ideas be COMBINED into something stronger?
d. Does a rejected idea deserve retry given new evidence?
e. What would a skeptic say about your top candidate?

If you generate a new idea, WRITE it to ideas/ with full frontmatter and steelman/critique.

## Output format

Return EXACTLY this:

IDEA: {idea id — existing or newly created}
EDIT: {symbolic description — which named section, adding/removing/replacing what}
DIFF:
```diff
- {exact lines to remove, if any}
+ {exact lines to add}
```
RATIONALE: {one sentence — why this targets the top taxonomy pattern}
SKEPTIC: {one sentence — the strongest argument against this idea}
EXPLORE: {yes|skip}   — yes if explore_status is null, skip if already set or trivial reorder
META_NOTE: {optional — any observation about process patterns, e.g. "3 rejections from replacements confirms add-not-replace hypothesis"}
```

The subagent runs the index script, reads 3-5 files, thinks, possibly writes new ideas, and returns a 4-line recommendation. You then execute it in step 5 (EDIT).

### Edit rules (step 5)
- ✓ Add a concrete positive example for the level the model misses
- ✓ Add a "NOT this" example that disambiguates two adjacent levels
- ✓ Reorder key questions to promote Agentic/Workflow checks
- ✗ Rewrite the whole prompt — too many variables, can't diagnose
- ✗ Add generic "think carefully" language — no signal value
- **Be explicit about add vs replace.** "Replace A with B" is a valid hypothesis, but say so clearly. Each commit message must state: adding X, removing X, or replacing X with Y.
- Each section/bullet in treatment.md has a **name** (e.g. `**LEVEL-DEFS**`, `**MOCK-CHECK**`). Reference sections by name in commit messages, ideas, and taxonomy.

### After achieving ≥75% on round 1
Run adversarial rounds and update `leaderboard.md`:
```bash
experiments/write-test-plan/run-eval.sh --round 2  # anchoring noise
experiments/write-test-plan/run-eval.sh --round 3  # pressure noise
```

---

## Ground rules

- **Never edit corpus, ground-truth, scripts, or src** — only `prompts/treatment.md` changes.
- **Never edit `leaderboard.md` without a score change**.
- `runs/` is gitignored. Use GitHub Releases to archive a full run if needed.
- One hypothesis per iteration.
- **Before each iteration, read `leaderboard.md`** — it has the full score history. Use alongside `npx tsx experiments/write-test-plan/scripts/results.ts` and git log to avoid repeating failed approaches.

---

## Upstream knowledge: Garsson-io/kaizen

See CLAUDE.md "Mining Garsson-io/kaizen for ideas" for how to search the upstream repo.

Key issues already mined (ideas in `ideas/` have source attribution):
- **#1016**: experiment design, round results, failure modes
- **#1020**: corpus design constraints (vocabulary leak, observable behavior framing)
- **#1014**: agent correctly identified seam but defaulted to unit-only
- **#1019**: agent self-certified PASS despite stored FAIL findings
- **#1017**: skill eval infrastructure vision

---

## Current failure analysis

See [justification-taxonomy.md](justification-taxonomy.md) for the full pattern analysis with impact rankings and representative quotes. See [ideas/](ideas/) for hypotheses targeting each pattern.

**Summary** (from taxonomy): U1 "can mock the API" is the highest-impact pattern (impact 40). The model treats AI APIs as mockable and talks itself out of Agentic. In 4/10 cases it explicitly acknowledges Agentic would be required, then picks lower.

**Discussion ID** (for `/post-run-report`): `D_kwDORybT0s4AlROe`

---

## Corpus coverage

Full corpus is dynamically discovered from `corpus/*.md` files (currently 30 tasks, EC-01 through EC-30).

**Task catalog**: `corpus/catalog.json` contains metadata for each task (title, domain, difficulty, adversarial technique, labels). This is the source of truth for corpus composition — read it instead of hardcoded tables.

**Key subsets** (use `--corpus` flag):
- Full corpus (default): all `corpus/*.md` files, auto-detected
- Original core: `--corpus ec-04,ec-07,ec-09,ec-10` (4 tasks covering all 5 levels)
- Adversarial only: `--corpus ec-11,ec-12,ec-13,ec-14,ec-15,ec-16,ec-17,ec-18,ec-19,ec-20`
- Single task debug: `--single ec-09`

**Adding new tasks**: Drop a new `.md` file in `corpus/` and matching `.json` in `ground-truth/`. Update `corpus/catalog.json` with metadata. The eval script auto-discovers new tasks. See [docs/adversarial-training.md](../../docs/adversarial-training.md) for adversarial technique definitions and [docs/generating-realistic-adversarial-examples.md](../../docs/generating-realistic-adversarial-examples.md) for design principles.

All tasks run in parallel. `--single ec-09` for fast single-task debug.

---

## Useful commands

```bash
# Run full eval (30 tasks in parallel, treatment prompt) — outputs SCORE: and LOSS: lines
experiments/write-test-plan/run-eval.sh

# Get machine-readable JSON {score, loss} — use this for the metric, NOT score.ts
npx tsx experiments/write-test-plan/scripts/verify.ts | jq '{loss: .loss, score: .score}'

# Run a specific condition
experiments/write-test-plan/run-eval.sh --condition baseline
experiments/write-test-plan/run-eval.sh --prompt experiments/write-test-plan/prompts/treatment-l12.md

# Adversarial rounds
experiments/write-test-plan/run-eval.sh --round 2
experiments/write-test-plan/run-eval.sh --round 3

# Score existing outputs — human-readable table (NOT JSON; don't pipe to jq)
npx tsx experiments/write-test-plan/scripts/score.ts \
  --output-dir experiments/write-test-plan/runs/latest/ \
  --gt-dir experiments/write-test-plan/ground-truth/

# MINE: extract thinking + justifications, detect self-aware errors
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --json
npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --task EC-04

# View iteration history
npx tsx experiments/write-test-plan/scripts/results.ts --last 10
npx tsx experiments/write-test-plan/scripts/results.ts --summary
npx tsx experiments/write-test-plan/scripts/results.ts --keeps

# View run cost/token stats (--run for specific run, --all for all runs)
npx tsx experiments/write-test-plan/scripts/run-stats.ts
npx tsx experiments/write-test-plan/scripts/run-stats.ts --run 20260328-155121
npx tsx experiments/write-test-plan/scripts/run-stats.ts --all
npx tsx experiments/write-test-plan/scripts/run-stats.ts --json

# View ideas
npx tsx experiments/write-test-plan/scripts/ideas-index.ts --table
npx tsx experiments/write-test-plan/scripts/ideas-index.ts --by-status
npx tsx experiments/write-test-plan/scripts/ideas-index.ts --json

# Single task debug
npx tsx experiments/write-test-plan/scripts/run-probe.ts \
  --task EC-04 --condition treatment \
  --issue-file experiments/write-test-plan/corpus/ec-04.md \
  --prompt-file experiments/write-test-plan/prompts/treatment.md \
  --out experiments/write-test-plan/runs/debug/out-treatment-ec04.json

npx tsx experiments/write-test-plan/scripts/score.ts \
  --output experiments/write-test-plan/runs/debug/out-treatment-ec04.json \
  --gt experiments/write-test-plan/ground-truth/ec-04.json
```

### Script output formats (important — don't mix these up)

| Script | Output | Use for |
|--------|--------|---------|
| `verify.ts` | JSON `{score, loss}` | Machine-readable metric; pipe to `jq` |
| `score.ts` | Human-readable table | Per-task breakdown; **not JSON, don't pipe to jq** |
| `extract-thinking.ts --json` | JSON array of BehaviorThinking | MINE step analysis |
| `extract-thinking.ts --taxonomy-lines` | Plain text lines | Append to taxonomy/ |
| `results.ts --json` | JSON array of IterationResult | History in machine-readable form |
| `run-stats.ts --json` | JSON array of ProbeStats | Cost/token data in machine-readable form |

### Ground-truth file naming

GT files are named `ec-NN.json` (with hyphen): `ground-truth/ec-01.json` through `ground-truth/ec-30.json`.
Use the scripts above — they all handle naming correctly. Don't hardcode `ec01.json` (no hyphen) in Python.

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

### Canonical semantics (taxonomy lock)

Use these meanings consistently across GT review, taxonomy, prompt edits, and IDEATE:

- **Agentic** = **AI Agentic Step**
  One real AI/LLM model step where correctness depends on the model's judgment/output
  (classification, ranking/scoring quality, generation quality, moderation quality).

- **Workflow** = **AI Agentic Workflow**
  A full multi-step AI-agent run/session where correctness depends on cross-step behavior
  (state carried across steps, retry/refinement loops, multi-skill/hook/prompt orchestration),
  not just one model call.

Guardrail:
- Do **not** interpret `Workflow` as generic software workflow/pipeline alone.
  If it is multi-module software wiring without multi-step AI-agent behavior, it is usually
  Integration or System, not Workflow.

GT policy implication:
- When a behavior says "single model step should be correct" -> prefer Agentic.
- When a behavior says "the multi-step agent run should converge/coordinate across steps" -> Workflow.

Prompting policy implication:
- A future treatment can include this aliasing explicitly ("Agentic Step" vs "Agentic Workflow")
  if diagnostics show persistent Agentic↔Workflow confusion on the active model.
