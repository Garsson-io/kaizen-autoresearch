# Autoresearch Program: Write-Test-Plan

## Canonical ownership (this file)

- **Canonical for:** this experiment's iteration loop, promotion gates, and keep/discard decision policy.
- **Not canonical for:** global repo ownership map, or generic idea frontmatter schema definitions.
- **Refer to for repo-wide ownership:** `.agents/AGENTS.md`.
- **Refer to for skill execution wrapper:** `.agents/skills/run-experiment/SKILL.md`.
- **Refer to for idea schema/explore field semantics:** `experiments/write-test-plan/ideas/README.md`.
- **Conflict rule:** if this file conflicts with skill guidance for this experiment, this file wins.

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

**Primary objective**: minimize weighted loss from `experiments/write-test-plan/scripts/verify.ts`.
Use score only as a secondary, legacy metric.

**CRITICAL — treatment.md MUST keep these template variables** (run-probe.ts replaces them):
- `{{TASK_ID}}` — replaced with e.g. "EC-04"
- `{{ISSUE_BODY}}` — replaced with the issue markdown
If you remove these, the eval produces garbage.

**Noise warning**: LLM-based evaluation is inherently noisy (same prompt can score differently
across runs). Prefer confirmation reruns for small deltas near the observed noise floor.

For keep/discard decisions, follow the iteration loop policy below (loss-based comparison to reference).

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

### Baseline policy (permanent)

- Do **not** run a fresh baseline at the start of every `/run-experiment` invocation.
- Use the latest baseline already recorded in `experiments/write-test-plan/autoresearch-results.jsonl` for the current model/corpus as the reference loss.
- Only run a new baseline when:
  - no baseline exists yet for the current setup, or
  - corpus/model/scoring changed and prior baseline is not comparable.
- After any kept iteration, the new best kept loss becomes the comparison target for subsequent iterations.

### Model/runner policy (permanent)

- Default execution path is Codex: run evaluations with `--cli codex --model gpt-5.3-codex`.
- IDEATE should prefer a Codex subagent by default.
- Claude/Sonnet runs are allowed when explicitly chosen; always label the model in logs.

### Run-artifact policy (permanent)

- Never leave run artifacts uncommitted. Each completed run must be committed before starting the next cognitive step.
- Required order after every run: `COMMIT RUNS` -> `COMMIT STATE`.
- Recovery gate at loop start: if `git status` already contains uncommitted `runs/<timestamp>/` or `run-stats.jsonl`, commit recovery first, then continue.

```
LOOP:
  1. MINE — run mine-report.ts for the full picture (diff, persistence, loss breakdown, MINE DIGEST):
     ```bash
     # PRIMARY: one command gives everything — run this first
     npx tsx experiments/write-test-plan/scripts/mine-report.ts

     # For taxonomy export (append to taxonomy/ files):
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines

     # For focused single-task deep read (when you need full thinking on one task):
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --task EC-30

     # Self-aware contradictions only:
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --self-aware-only
     ```
     mine-report.ts shows:
     - Loss breakdown by confusion pair with Δbaseline and Δprev
     - Behavioral diff vs previous run (new regressions, new improvements, persistent errors)
     - Cross-run persistence: which behaviors are ALWAYS WRONG across recent runs (core problem set)
     - A pre-filled MINE DIGEST template with justification quotes and persistence counts

     **CRITICAL: Don't just read the aggregate numbers.** READ the justification quotes in the
     MINE DIGEST section. The ALWAYS WRONG behaviors (wrong in 8/8 runs) are the core problem —
     focus analysis there first, then look at NEW REGRESSIONS to understand what the last treatment broke.

     **Complete the MINE DIGEST template before proceeding:**
     - Fill in `Pattern:` and `Trap:` for each pre-filled entry (what reasoning failure, which prompt section)
     - Fill in `Dominant pattern:` (one sentence)
     - Fill in `Fix hypothesis:` (what specific prompt change)
     - **Save the completed MINE DIGEST — you will paste it into IDEATE as {REASONING_PATTERNS}**

     Counting directions without reading the reasoning is a meta-failure: you're optimizing blind.

  2. DIAGNOSE — read taxonomy/ for top patterns by impact, read ideas/ for candidates
     **DOMINANT-LOSS TARGETING GATE (MANDATORY):**
     - Use the latest `mine-report.ts` loss table as the primary selector (weighted loss, not counts).
     - Extract the top 2 confusion pairs by weighted loss.
     - The selected idea must explicitly target at least one of those top-2 pairs.
     - If not, reject the idea and return to IDEATE.
     - Pattern counts from taxonomy are tie-breakers only after this gate is satisfied.
  3. META — read meta-failures.md. Check: did this run's result confirm or weaken any meta-hypothesis?
     Update meta-failures.md with new evidence. A meta-hypothesis needs ≥3 supporting data points
     to be treated as confirmed, and ≥2 contradicting data points to be disproved. One run proves nothing.
     Also: if the previous IDEATE subagent returned a META_NOTE, evaluate it here and update
     meta-failures.md if the observation is warranted.
     META is a hard gate: do not proceed to IDEATE/EDIT until you either (a) committed a meta-failures.md
     update, or (b) explicitly recorded "no new meta evidence" for this iteration in the state log.
  4. IDEATE — spawn a subagent for this step (see "IDEATE subagent" section below).
     Give it: results log, per-task totals, AND **your completed MINE DIGEST as {REASONING_PATTERNS}**.
     The MINE DIGEST is the primary signal — it gives IDEATE specific, quoted, quantified evidence
     about what's failing and why, grounded in THIS run's results.
     It reads ideas/, taxonomy/, meta-failures.md, treatment.md itself.
     It returns: idea id, specific edit (with diff), rationale, skeptic view, and optional meta-note.
     If it creates new ideas, they'll be written to ideas/ by the subagent.
  4.4. CANDIDATE BRIEF (MANDATORY, BEFORE EXPLORE)
       Before running explore (or before deciding to reuse an already-set explore result), write a brief in the
       iteration notes/TODO containing:
       - **Selected idea**: idea id + why it was chosen now (must reference top-loss targeting and mined evidence)
       - **Mechanism rationale**: what failure pattern this idea is expected to fix
       - **Variation set**:
         - if creating new variations: list each variation label and show the exact added/changed prompt lines
         - if reusing existing variations: list each variation label and show the exact diff vs treatment.md
       - **Decision expectation**: what would count as promote / family-signal / no-promote under current gate
       Also publish this brief to the user in-chat before explore:
       - selected idea
       - why chosen now
       - exact prompt changes for each variation (real diff lines, not summaries)
       This step is required for auditability; do not run explore without it.
  4.5. EXPLORE (optional — skip if idea.explore_status is already set)
       If the idea returned by IDEATE has explore_status: null:
         a. Write N variation treatment.md files into runs/explore/ dirs
         b. Run: npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id>
            (see scripts/explore.ts header for all options: --dry-run, --tasks, --seed, etc.)
       **PROMOTION-EVIDENCE GATE (MANDATORY):**
       - Promote to EDIT only on **stable and meaningful** evidence, not one-pass outliers.
       - Use one independent holdout check (different task subset and/or seed) before any promotion.
       - Define practical effect threshold: treat deltas better than `-2.0` loss as meaningful
         on explore subsets; values in `(-2.0, 0)` are weak/noisy evidence.
       - Hard `no-promote` cases:
         - any pass is `no-signal` (exit 2), or
         - best deltas are weak/noisy on either pass (>-2.0), or
         - holdout reverses sign for the chosen candidate.
       - `concentrated-signal` (exit 3) is **not auto-fail**. It is promotable only if holdout
         confirms the same candidate with meaningful negative delta and reduced concentration.
       - Winner flip handling:
         - if winner flips and only one candidate has meaningful negative holdout delta -> `no-promote`.
         - if winner flips but both candidates are meaningfully negative across passes -> treat as
           **family-signal** (idea family works, single winner unstable). Do not promote a single
           variant yet; create a merge/selector follow-up idea and re-run explore.
       - `no-promote` is a valid outcome. Never force a winner just to continue the loop.
       Already-set: use the recorded explore result — no new run needed.
       After any explore run, commit the output dirs:
       ```bash
       git add experiments/write-test-plan/runs/explore/
       git commit -m "experiment(explore): <idea-id> — <N> variations, winner: <variation|none>"
       ```

       Cross-references:
       - READ `docs/explore-tool.md` WHEN you need to understand the tool itself:
         CLI options, stratification algorithm, signal classification rules, JSON schema,
         modular API, validation, resume support.
       - READ `.agents/skills/explore/SKILL.md` WHEN you need the step-by-step agent workflow:
         what dirs to create before running, how to invoke the script, how to interpret
         results and decide next steps, when to commit.
       - READ `ideas/README.md` WHEN you need to understand explore_status field semantics
         or how IDEATE should prioritize explored vs unexplored ideas.
  4.6. POST-EXPLORE LEARNING SYNTHESIS (MANDATORY when outcome is `no-promote` or `family-signal`)
       Goal: turn explore evidence into a stronger next candidate instead of retrying blind.
       a. Mine justification deltas for the top 2 variants from pass 1 and holdout:
       ```bash
       # Compare reasoning errors/justifications for each candidate run dir
       npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir <explore-run-dir-A>
       npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir <explore-run-dir-B>

       # Deep read on decisive tasks (winner-driving task + major regression tasks)
       npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir <explore-run-dir-A> --task EC-XX
       npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir <explore-run-dir-B> --task EC-YY
       ```
       b. Produce a short "LEARNING DELTA" note in iteration logs/commit message:
         - Which high-weight errors variant A fixed that B did not
         - Which regressions A introduced that B avoided
         - Whether this is noise, concentration artifact, or true mechanism complementarity
       c. Decide next action (explicitly):
         - `no-promote`: no credible mechanism extracted; ideate a new idea
         - `family-signal`: complementary strengths detected; create a merge/selector follow-up idea
         - `promote`: only if step 4.5 thresholds are satisfied
       d. If `family-signal`, add a new idea file in `ideas/` with:
         - concrete evidence lines from both variants
         - one additive merged edit hypothesis
         - clear falsification criterion for next explore
  5. EDIT — make one atomic change to treatment.md. Be explicit: adding X, removing Y, or replacing Y with X.
     **EDIT-TYPE GATE (MANDATORY, ALWAYS):**
     - Before editing, declare intent in notes/commit text as exactly one of: `ADD`, `REPLACE`, `DELETE`.
     - `ADD` means insert-only (no removed lines in diff).
     - `REPLACE` means both remove+add for the same logic block (intentional replacement).
     - `DELETE` means remove-only (no added replacement text for that rule).
     - Before commit, validate diff shape:
       ```bash
       git diff --unified=0 experiments/write-test-plan/prompts/treatment.md
       ```
       If diff shape does not match declared edit type, STOP. Do not continue RUN/SCORE.
       Return to IDEATE, correct the change, and record the mismatch as a process note.
  6. COMMIT — git commit with experiment(treatment): prefix. Reference the idea id and named section.
     Include declared edit type in the subject, e.g. `(edit-type:add)`.
  7. RUN — experiments/write-test-plan/run-eval.sh (defaults to Codex; override `--cli/--model` when needed) or verify.ts. Monitor progress.
  8. SCORE — compare loss to the current reference baseline (see Baseline policy above). Any decrease in loss → keep. Same or increase → git revert.
     NOTE: the noise floor for loss is TBD — run the same prompt twice to measure it.
     Until then, treat any loss decrease as signal. Update this after the first confirmation run.
  9. LOG — use log-iteration.ts (handles JSONL append, delta computation, and idea status update):
     ```bash
     npx tsx experiments/write-test-plan/scripts/log-iteration.ts \
       --idea <idea-id> \
       --status keep|discard|no-op \
       --loss <loss from verify.ts> \
       --score <score from verify.ts> \
       --run-dir <timestamp> \
       --model <model-id> \
       --description "<idea-id>: keep|regression" \
       --section "<SECTION-NAME>" \
       --edit-type add|remove|replace \
       [--commit <hash-before-revert>]   # if reverting, capture hash BEFORE git revert
       [--metrics '<json from verify.ts | jq .metrics>']
     ```
     View log: `npx tsx experiments/write-test-plan/scripts/results.ts`
     Also run the 3-step taxonomy flow (→ full procedure: `experiments/write-test-plan/taxonomy/README.md`):
     ```bash
     # Step 1 — Route (mechanical): pipe errors into taxonomy files; unmatched go to unmatched.md
     npx tsx experiments/write-test-plan/scripts/extract-thinking.ts --run-dir latest --taxonomy-lines | \
       npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts

     # Step 2 — Summarize (mechanical): see cumulative counts and which pairs are ≥3 unmatched
     npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --summary

     # Step 3 — Pattern discovery (LLM cognitive): for each unmatched pair with ≥3 occurrences,
     # read those full blocks from unmatched.md, decide fit-existing or new-file, then backfill:
     npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched
     ```
     → Step 3 is the compounding value: new taxonomy files retroactively categorize all historical
     evidence in unmatched.md. See `taxonomy/README.md` § "The three-step MINE taxonomy flow" for the
     full cognitive procedure (what to read, how to classify, validation checklist).
  10. COMMIT RUNS (MANDATORY, immediate) — git add the timestamped run dir and commit run artifacts right after scoring:
      ```bash
      git add experiments/write-test-plan/runs/<timestamp>/ \
              experiments/write-test-plan/run-stats.jsonl
      git commit -m "experiment(runs): <timestamp> — <idea-id> <KEEP|DISCARD> loss <X>"
      ```
      If a run is partial/interrupted, commit it explicitly as recovery:
      ```bash
      git add experiments/write-test-plan/runs/<timestamp>/ \
              experiments/write-test-plan/run-stats.jsonl
      git commit -m "experiment(runs): recover interrupted run <timestamp> (partial outputs)"
      ```
  10.5. COMMIT STATE — commit all remaining dirty files so the working tree is clean:
      ```bash
      git add experiments/write-test-plan/autoresearch-results.jsonl \
              experiments/write-test-plan/run-stats.jsonl \
              experiments/write-test-plan/explore-log.jsonl \
              experiments/write-test-plan/ideas/ \
              experiments/write-test-plan/taxonomy/ \
              experiments/write-test-plan/taxonomy/unmatched.md \
              experiments/write-test-plan/justification-taxonomy.md \
              experiments/write-test-plan/leaderboard.md \
              experiments/write-test-plan/meta-failures.md \
              experiments/write-test-plan/TODO.md
      git status  # verify nothing else is dirty before committing
      git commit -m "experiment(state): iter <N> — update results, ideas, taxonomy, leaderboard"
      ```
      After this commit `git status` must show a clean working tree.
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

Spawn a subagent with `subagent_type: "general-purpose"` and preferred `model: "gpt-5.3-codex"` (or another explicitly chosen model for this run). Give it this prompt, filling in the `{PLACEHOLDERS}` from your MINE/DIAGNOSE output:

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

Reasoning patterns from MINE — your completed MINE DIGEST (paste it here verbatim):
{REASONING_PATTERNS — paste the completed MINE DIGEST from step 1 here. It contains
quoted justifications, persistence counts, identified patterns, and a fix hypothesis.
This is the primary signal for creative generation — use it.}

## Pre-assembled context (executor provides this — do NOT re-read these files)

Ideas index:
{IDEAS_INDEX — executor runs `npx tsx experiments/write-test-plan/scripts/ideas-index.ts --table` and pastes here}

Current treatment.md (full text):
{TREATMENT_MD — executor reads and pastes here}

Meta-failures:
{META_FAILURES — executor reads experiments/write-test-plan/meta-failures.md and pastes here}

Top taxonomy pattern files (top 3 by impact, executor pre-reads and pastes):
{TOP_TAXONOMY — relevant taxonomy file contents, focus on patterns matching MINE DIGEST}

## Your job

The executor has done all the perception work. Your ONLY job is creative generation.

Think deeply:
a. Which existing ideas directly address the dominant pattern in REASONING_PATTERNS above?
b. Are there behaviors in REASONING_PATTERNS that expose a pattern NOT in the existing ideas?
c. Can two existing ideas combine into something stronger than either alone?
d. Does a rejected idea deserve retry given the NEW REGRESSIONS evidence?
e. What would a skeptic say about your top candidate — steelman the objection, then rebut or concede?

For any idea you want to examine in detail, READ the full file in `ideas/`.
If you generate a new idea, WRITE it to `ideas/` with full frontmatter and steelman/critique.

## Output format

Return EXACTLY this:

IDEA: {idea id — existing or newly created}
EDIT: {symbolic description — which named section, adding/removing/replacing what}
TARGET_LOSS_PAIR: {which top-2 weighted-loss confusion pair(s) this idea directly targets}
DIFF:
```diff
- {exact lines to remove, if any}
+ {exact lines to add}
```
RATIONALE: {one sentence — why this should reduce the targeted weighted-loss pair(s)}
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
- **Effort labels are mandatory and concrete:**
- `low` = local wording/rule tweak in one place (usually sentence/paragraph level)
- `medium` = add/restructure a section or procedure without replacing core flow
- `high` = full prompt restructure (major re-organization/rewrite of decision flow)
- **Always distinguish ADD vs REPLACE vs DELETE.** Never describe a replace/delete as additive.
- If you intended ADD but diff shows removed lines, treat it as a process error and restart from IDEATE.
- Every commit message must state exactly one edit type and what changed: adding X, removing X, or replacing X with Y.
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
- `runs/` is versioned by timestamped directory; commit each run immediately after scoring.
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

## Level taxonomy — canonical decision framework

The five test levels map to three distinct things that can be tested in an AI-assisted system:

**Category A — The code surrounding the LLM** (Unit / Integration / System with synthetic/fake LLM)
- The orchestration, state machine, routing, retry logic, error handling AROUND the LLM
- Tests use a stub/mock LLM that returns deterministic canned responses
- Examples: "service routes requests to correct endpoint", "retry fires on 503", "pipeline state persists between steps"

**Category B — The tools the LLM calls** (Unit / Integration / System with synthetic inputs)
- The search tool, calculator, code executor, database query — tested independently
- Tests use synthetic inputs representing what the LLM might pass; no real LLM needed
- Examples: "search tool returns top-N results", "code executor handles timeout", "DB query paginates correctly"

**Category C — The decisions the LLM itself makes** (Agentic / Workflow)
- What the LLM classifies, generates, ranks, selects, or decides — and whether steering the LLM (via skills, prompts, hooks, fine-tuning) actually changes its behavior as intended
- A stub ALWAYS returns the same constant — it cannot verify whether the LLM decides correctly or responds to steering
- Examples: "recommendations are relevant", "classification is accurate", "generated code compiles and passes tests", "summary preserves key facts"
- **Key concrete case**: testing that a change to an agent skill / prompt / hook / system message steers the agent in the intended direction → requires real LLM, because only the real model exhibits the steering behavior
- Agentic = single LLM decision. Workflow = multiple sequential LLM decisions in a chain.

**The Agentic test**: if the behavior's failure mode is "the LLM made the wrong decision" OR "the steering change didn't take effect" → Agentic/Workflow. If the failure mode is "the surrounding code/tools behaved wrong" → A or B (Unit/Integration/System with fake LLM).

**Common trap**: "I can write a deterministic assertion for this" does NOT mean Category A/B. `assert ranking[0] == best_item` is a deterministic assertion about a Category C behavior. The assertion's determinism is irrelevant; what matters is whether you're verifying the LLM's judgment or the code around it.

---

## Current failure analysis

See [justification-taxonomy.md](justification-taxonomy.md) for the full pattern analysis. See [ideas/](ideas/) for hypotheses. See `taxonomy/README.md` for the current pattern table and cumulative evidence counts.

**Summary** (model-specific — check taxonomy/README.md for current counts):
- **Sonnet** (iters 40+): Integration anchor. Dominant pattern is O1 (Integration→Unit, 52 entries) — over-escalation, never directly targeted. U3 (Integration→System, 33) second. INTEGRATION-BRAKE is load-bearing; removing it causes +30 regression.
- **Codex** (iters 30–39): Unit anchor. U2 (Unit→Integration) dominated; mock-miss-scope-clarification helped.
- **U1** has pattern drift: old entries = "can mock" reasoning; run 6 entries = "REJECTION-GATE quality escape" (model knows right answer, gate structure suppresses it). Iter 58 treatment targets the latter.

**Warning**: the taxonomy distribution was invisible for the entire experiment due to reversed confusion_pair direction in O files. See meta-failures.md "O1 blind spot" entry. Re-examine assumptions after any taxonomy structural fix.

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

# EXPLORE: pre-screen idea variations on stratified task subsets
# READ docs/explore-tool.md for full tool reference (CLI, algorithm, JSON schema, API)
# READ .agents/skills/explore/SKILL.md for the agent workflow (create dirs, run, decide)
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id>               # full auto run
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id> --dry-run     # preview plan
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id> --score-only  # re-score existing
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id> --summary     # reprint past results
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id> --json        # machine-readable
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id> --seed 42     # seeded randomization
npx tsx experiments/write-test-plan/scripts/explore.ts <idea-id> --tasks ec-03,ec-14  # explicit tasks

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
| `extract-thinking.ts --taxonomy-lines` | JSONL (one `TaxonomyEntry` per line) | Pipe to `taxonomy-append.ts` |
| `results.ts --json` | JSON array of IterationResult | History in machine-readable form |
| `run-stats.ts --json` | JSON array of ProbeStats | Cost/token data in machine-readable form |
| `explore.ts <id>` | Per-task heatmap table | Explore pre-screening results |
| `explore.ts <id> --json` | JSON ExploreOutput | Machine-readable explore results |
| `explore.ts <id> --summary` | Summary table from log | Reprint past explore results |

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
