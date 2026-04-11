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

---

## Codex Iteration Loop (10 iterations) — 2026-04-11

### Iteration 1/10 (reference loss at start: 560.88 from run 20260411-011347)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss targeting: Integration→Agentic, Unit→Agentic)
- [x] META (applied stability-first promotion rule from Apr 10-11 findings)
- [x] IDEATE (selected `toploss-ia-ua-round-1` from top-loss-targeted candidates)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (seed 101: concentrated-signal; holdout seed 202: no-signal)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 2/10
- [x] MINE
- [x] DIAGNOSE (top-2 unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (stability gate remains binding due recent false promotions)
- [x] IDEATE (selected `toploss-ia-ua-round-2`, lower-aggression variants)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (seed 303: concentrated-signal winner `v3`; holdout seed 404: concentrated-signal winner `v1` -> sign/winner instability)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 3/10
- [x] MINE
- [x] DIAGNOSE (top-2 unchanged: Integration→Agentic, Unit→Agentic)
- [x] META
- [x] IDEATE (selected `non-negotiable-boundary-gates`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `concentrated-signal`, delta -4.72 -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 4/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `agentic-floor-content-dependence-gate`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `concentrated-signal`, delta -1.02 -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 5/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `sub-agentic-demotion-proof-gate`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `no-signal` -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 6/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `top2-runner-up-contrast-gate`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `no-signal` -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 7/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `system-agentic-negative-contrast`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `no-signal` -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 8/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `global-stated-failure-only-rule`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `no-signal` -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 9/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `under-testing-red-team-critic-pass`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (already-set: `no-signal` -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Next iteration (refresh tasks)

### Iteration 10/10
- [x] MINE
- [x] DIAGNOSE
- [x] META
- [x] IDEATE (selected `ai-api-equals-agentic-rule`)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (epistemology already records `no-signal` outcome -> no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (used existing epistemic log evidence)
- [x] COMMIT RUNS (not needed; no new run artifacts)
- [x] COMMIT STATE
- [x] → Loop complete (10/10)

---

## Codex Iteration Loop (10 more iterations) — 2026-04-11

### Iteration 11/20 (candidate: `integration-contract-invariant-gate`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (no new contradictory meta evidence before test)
- [x] IDEATE (re-tested prior `signal` candidate under updated gate)
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (holdout re-check: `no-signal`, all variants regressed)
- [x] POST-EXPLORE LEARNING SYNTHESIS (no credible mechanism; broad regressions across System/Integration-heavy tasks)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [ ] → Next iteration

### Iteration 12/20 (candidate: `competitive-critique-seeding`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (re-test prior `signal` candidate under calibrated gate)
- [x] IDEATE (selected for prior `signal` status + relevance to consistency/agentic failures)
- [x] CANDIDATE BRIEF
  - Rationale: previously showed `signal` but regressed on full run; re-check as potential salvage under updated gate.
  - Variations reused (exact diffs vs treatment):
    - `v1-competitor-audit`: add SELF-CHECK line forcing one adversarial flaw check.
    - `v2-mixed-quality-review`: add SELF-CHECK line generating top-choice + runner-up and evidence-based rejection.
    - `v3-bogus-trap-reject`: add SELF-CHECK line forcing explicit rejection of known bogus shortcuts.
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (holdout re-check: `concentrated-signal`, winner `v2`, delta `-1.47` = weak/noisy -> no-promote)
- [x] POST-EXPLORE LEARNING SYNTHESIS (v2 improved 4/8 tasks but effect too small; not meaningful under threshold)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [ ] → Next iteration

### Iteration 13/20 (candidate: `multi-candidate-test-design-then-select-lowest`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (retry of prior concentrated candidate under calibrated gate)
- [x] IDEATE (selected for direct decision-boundary forcing mechanism)
- [x] CANDIDATE BRIEF
  - Rationale: historically concentrated improvement (`-3.25`) but unstable; retest with explicit candidate-test mechanism.
  - Variations reused (exact prompt additions):
    - `v1-adjacent-two-candidates`: add CANDIDATE-TEST-CHECK requiring two adjacent candidate tests and lower-level catch check.
    - `v2-three-candidate-coverage`: add CANDIDATE-TEST-CHECK requiring low/current/high candidates with catch/miss analysis.
    - `v3-candidate-plus-miss-proof`: add CANDIDATE-TEST-CHECK requiring explicit lower-level miss proof tied to behavior text.
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (holdout re-check: `no-signal`, all 3 variants regressed)
- [x] POST-EXPLORE LEARNING SYNTHESIS (mechanism adds reasoning overhead; broad regressions, especially on mid/high mixed tasks)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [ ] → Next iteration

### Iteration 14/20 (candidate: `two-step-review-loop`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (re-test prior concentrated candidate with explicit user-facing brief)
- [x] IDEATE (selected for consistency mechanism + prior near-signal)
- [x] CANDIDATE BRIEF
  - Rationale: validate whether two-pass audit can deliver stable non-concentrated gains.
  - Variations reused (exact prompt additions):
    - `v1-two-pass-self-check`: add TWO-PASS provisional+review instruction.
    - `v2-pass-markers`: add explicit PASS1 -> PASS2-AUDIT -> FINAL sequence.
    - `v3-adjacent-challenge`: add adjacent counter-argument + evidence rejection rule.
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (pass1 seed614: concentrated-signal, v2 delta -2.26; holdout seed714: concentrated-signal, v2 delta -4.68)
- [x] POST-EXPLORE LEARNING SYNTHESIS (same winner and meaningful delta, but concentration did not reduce: 78% -> 79% on ec-34; gate outcome no-promote)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [ ] → Next iteration

### Iteration 15/20 (candidate: `integration-escape-hatch`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (high-leverage mode: novelty-first, mechanism + falsification pre-registered)
- [x] IDEATE (selected novel `explore_status:null` idea targeting Integration-anchor failure family)
- [x] CANDIDATE BRIEF
  - Rationale: explicit Integration anchor escape aimed at top-loss Integration→Agentic/System spillover.
  - Variations created (exact additions):
    - `v1-integration-check-core`: add Integration down-test/up-test with keep condition.
    - `v2-integration-check-quote-burden`: add quote-burden gate for Unit and higher-level disqualification.
    - `v3-integration-check-minimal`: add minimal neighbor-challenge Integration check.
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (seed715, 8 tasks: all variants regressed -> no-signal)
- [x] POST-EXPLORE LEARNING SYNTHESIS (mechanism over-constrains and harms broad mid/high mix; no credible positive mechanism extracted)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [ ] → Next iteration

### Iteration 16/20 (candidate: `bidirectional-rejection-evidence-gate`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (novelty-first check passed; untested candidate)
- [x] IDEATE (selected low-effort consistency mechanism with explicit adjacent evidence burden)
- [x] CANDIDATE BRIEF
  - Rationale: reduce arbitrary adjacent-level rejection and boundary inconsistency.
  - Variations created (exact additions):
    - `v1-bidirectional-adjacent`: adjacent L-1/L+1 disqualifying-quote requirement.
    - `v2-adjacent-plus-tie-rule`: same + higher-risk tie-break when unresolved.
    - `v3-adjacent-scope-limited`: scoped adjacent quote gate with SELF-CHECK fallback.
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (seed716, 8 tasks: all variants regressed -> no-signal)
- [x] POST-EXPLORE LEARNING SYNTHESIS (gate adds overhead and broad degradation; no credible positive mechanism)
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [x] COMMIT RUNS
- [x] COMMIT STATE
- [ ] → Next iteration

### Iteration 17/20 (candidate: `grounded-escalation-contract-suite`)
- [x] MINE
- [x] DIAGNOSE (top-2 weighted loss unchanged: Integration→Agentic, Unit→Agentic)
- [x] META (high-leverage novelty-first: selected untested idea with explicit falsification criterion)
- [x] IDEATE (selected synergy idea merging three grounding checks)
- [x] CANDIDATE BRIEF
  - Selected idea: `grounded-escalation-contract-suite` (novel `explore_status: null`)
  - Why now: novelty-first after two broad no-signals; directly targets top weighted-loss pairs `Integration→Agentic` and `Unit→Agentic`.
  - Mechanism rationale: combine three proven failure checks in one compact gate:
    quote evidence + lower-level miss-proof + anti-generic wiring justification.
  - Falsification criterion: if all variants regress or best meaningful delta is weak/noisy (> -2.0), mark `no-promote`.
  - Expected-win targets: `EC-17 b2` (`Integration→Agentic`), `EC-30 b5` (`Integration→Agentic`), `EC-30 b3` (`Unit→Agentic`).
  - Variations (exact prompt additions):
    - `v1-contract-strict`:
      - `- **GROUNDING-CONTRACT**: Before choosing Integration/System/Agentic/Workflow, require ALL:`
      - `  (1) quote the exact behavior phrase that requires escalation;`
      - `  (2) name one concrete failure the lower adjacent level would miss for THIS behavior;`
      - `  (3) do not use generic "could miss wiring" unless behavior explicitly states handoff/contract/order/state-boundary failure.`
      - `  If any item is missing, choose the lower adjacent level.`
    - `v2-contract-quote-relaxed`:
      - `- **GROUNDING-CONTRACT**: Before choosing Integration/System/Agentic/Workflow, require ALL:`
      - `  (1) quote OR high-fidelity paraphrase the behavior phrase that requires escalation;`
      - `  (2) name one concrete failure the lower adjacent level would miss for THIS behavior;`
      - `  (3) do not use generic "could miss wiring" unless behavior explicitly states handoff/contract/order/state-boundary failure.`
      - `  If any item is missing, choose the lower adjacent level.`
    - `v3-contract-high-level-only`:
      - `- **GROUNDING-CONTRACT**: Apply this only when provisional choice is System/Agentic/Workflow.`
      - `  Require: quote evidence + one lower-level miss-proof + no generic "could miss wiring" without explicit boundary text.`
      - `  If contract fails, demote by one adjacent level and re-check.`
- [x] EXPLORE + PROMOTION-EVIDENCE GATE (seed717, 8 tasks: `no-signal`; v1 +7.09, v2 +0.31, v3 +32.50 -> no-promote)
- [x] POST-EXPLORE LEARNING SYNTHESIS
  - LEARNING DELTA:
    - `v2` fixed the hardest sampled workflow confusions on `EC-11` (all-correct) where baseline had high-weight misses.
    - The same contract caused high-impact regressions on `EC-14` and `EC-34` (extra System over-escalations), and net loss remained worse.
    - Mechanism inference: combined contract can help explicit regeneration/workflow language but over-escalates on infra/orchestration tasks.
  - Action: `no-promote` (no stable meaningful improvement); keep lesson for a future scoped selector idea, not direct promotion.
- [x] EDIT + COMMIT (no-promote: skipped by gate)
- [x] RUN + SCORE (no-promote: skipped by gate)
- [x] LOG + TAXONOMY FLOW (explore log + idea epistemology updated)
- [ ] COMMIT RUNS
- [ ] COMMIT STATE
- [ ] → Next iteration

### Iteration 18/20 (candidate: `TBD-novelty-first-toploss`)
- [ ] MINE
- [ ] DIAGNOSE
- [ ] META
- [ ] IDEATE
- [ ] CANDIDATE BRIEF
- [ ] EXPLORE + PROMOTION-EVIDENCE GATE
- [ ] POST-EXPLORE LEARNING SYNTHESIS
- [ ] EDIT + COMMIT
- [ ] RUN + SCORE
- [ ] LOG + TAXONOMY FLOW
- [ ] COMMIT RUNS
- [ ] COMMIT STATE
- [ ] → Next iteration

### Iteration 19/20 (candidate: `TBD-novelty-first-toploss`)
- [ ] MINE
- [ ] DIAGNOSE
- [ ] META
- [ ] IDEATE
- [ ] CANDIDATE BRIEF
- [ ] EXPLORE + PROMOTION-EVIDENCE GATE
- [ ] POST-EXPLORE LEARNING SYNTHESIS
- [ ] EDIT + COMMIT
- [ ] RUN + SCORE
- [ ] LOG + TAXONOMY FLOW
- [ ] COMMIT RUNS
- [ ] COMMIT STATE
- [ ] → Next iteration

### Iteration 20/20 (candidate: `TBD-novelty-first-toploss`)
- [ ] MINE
- [ ] DIAGNOSE
- [ ] META
- [ ] IDEATE
- [ ] CANDIDATE BRIEF
- [ ] EXPLORE + PROMOTION-EVIDENCE GATE
- [ ] POST-EXPLORE LEARNING SYNTHESIS
- [ ] EDIT + COMMIT
- [ ] RUN + SCORE
- [ ] LOG + TAXONOMY FLOW
- [ ] COMMIT RUNS
- [ ] COMMIT STATE
- [ ] → Loop complete (20/20)
