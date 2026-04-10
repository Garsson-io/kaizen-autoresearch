# Meta-Failures

Process failures caught by the user during this experiment. Each entry documents what went wrong, what it looked like, and what was built to prevent recurrence.

Read this before iterating. These are the ways the process itself broke, not the ways the prompt failed.

---

### GT labeled wrong — model penalized for being correct

**What happened**: EC-18 b1/b2/b3 (pure algorithms: trace ID grouping, timestamp sorting, p99 computation) and EC-25 b4/b5 (boolean OR gate, output formatting) were labeled Integration. The model predicted Unit and was scored as wrong. The model was right.

**Symptom**: Taxonomy showed the model giving convincing "pure logic" justifications for behaviors scored as errors. The justifications sounded correct because they were.

**Fix**: GT review (`taxonomy/gt-review.md`) audits every disagreement. Debatable behaviors are split into two clear behaviors — one at the lower level, one at the higher. `reasoning` field added to GT schema so every label has a justification.

**Lesson**: When the model's justification sounds right and the score says wrong, check the GT before assuming the model failed.

---

### Runs overwritten — no way to compare across iterations

**What happened**: `run-eval.sh` wrote outputs to `runs/latest/` directly. Each run destroyed the previous run's outputs. Couldn't re-score old runs against new GT or compare justifications across iterations.

**Symptom**: After fixing GT, couldn't re-score historical runs. After a score drop, couldn't tell if it was the prompt change or LLM noise.

**Fix**: Runs now go to timestamped directories (`runs/20260327-204500/`). `runs/latest` is a symlink. All old runs preserved.

**Lesson**: Never overwrite evaluation data. Timestamp everything.

---

### Taxonomy overwritten instead of appended

**What happened**: When updating taxonomy files after a new run, old `[run1]` lines were replaced with `[run2]` lines instead of appending. Lost the cross-run comparison that shows whether a pattern persists or was fixed.

**Symptom**: Taxonomy files had the same number of lines after each run instead of growing. Couldn't tell which patterns survived a prompt change.

**Fix**: Taxonomy is append-only. Each entry is one JSONL line (`{"run":"N","task":"EC-NN",...}`). `taxonomy/README.md` and `taxonomy-schema.ts` document the schema. Never delete old entries.

**Lesson**: The history of failure patterns IS the data. Destroying it to "update" it defeats the purpose.

---

### Prompt changes removed working elements

**What happened**: When applying `failure-mode-taxonomy`, the agent replaced the existing level definitions with a failure-mode table. The old definitions were scoring well on most tasks. The new table scored worse overall because it lost the working elements.

**Symptom**: Score dropped on tasks that were previously correct (EC-09, EC-01, etc.) even though the idea targeted Agentic under-prediction.

**Fix**: Rule in program.md: never remove lines from treatment.md that are scoring well. Ideas should add, not replace. If restructuring, diff carefully and verify no working elements were lost.

**Lesson**: A prompt change that improves one failure pattern but breaks three working ones is a net loss. Check git diff before committing — if working lines disappeared, reconsider.

---

### Ideas tested against wrong GT produced false rejections

**What happened**: `failure-mode-taxonomy` scored -4.2 and was rejected. But the GT it was scored against had 5 wrong labels (EC-18, EC-25). After GT correction, the baseline shifted. The idea might have scored differently against correct GT.

**Symptom**: An idea was rejected with confidence, but the confidence was based on a flawed measurement.

**Fix**: GT corrections applied. Ideas rejected before GT correction are candidates for retry — their `status: rejected` may be a false negative. Check whether the rejection was against pre-correction or post-correction GT before trusting it.

**Lesson**: A rejected idea is only as reliable as the GT it was tested against. When GT changes, reconsider past rejections.

---

### Replaced a working section instead of adding alongside it

**What happened**: `challenge-your-choice` replaced SELF-CHECK with an adversarial challenge — two changes in one (removal + addition). Score dropped -4.3. Can't attribute to removal vs addition.

**Fix**: Rule in program.md: be explicit about add vs replace. Both are valid hypotheses but must be a conscious choice stated in the commit message.

**Lesson**: "Replace A with B" is one hypothesis. "Remove A" and "Add B" are two. Don't conflate them accidentally.

---

### Reverted a no-op as if it were a regression

**What happened**: `swap-question-order-only` scored 89.4 vs baseline 89.5 (delta -0.1). Reverted as "discard." This is within noise — should have been logged as no-op.

**What it actually showed (positive)**: Rearranging bullets gives nearly identical results. This confirms measurement stability — same prompt content, different order → 0.1% delta. The eval is reproducible.

**Policy adopted** (from autoresearch protocol): same-or-worse → revert. This is correct. But log as `no-op` (no effect) not `discard` (actively hurt). The distinction matters for future idea selection — a no-op might work in combination, while a discard actively made things worse.

---

### Too conservative with prompt changes

**Status**: hypothesis (not yet confirmed)

**Observation**: Every "add one line" change either helped slightly (+2-3) or had no effect. Every "add multiple lines" change hurt (-3 to -5). This led to a bias toward tiny changes.

**Counter-hypothesis** (from user): the prompt is small enough that a few lines don't matter. Being too conservative means never making the structural changes that could produce breakthroughs. The right approach may be to make larger changes, let the prompt grow, THEN experiment with pruning once it's working well.

**Evidence needed**: try a medium-effort idea (e.g. few-shot-worked-examples) and see if the size penalty is real or just noise from bad ideas.

---

### Unit definition additions cause U2 explosion (O1/U2 opposing forces)

**What happened**: Added `(if the algorithm can be tested by passing data as arguments, it's Unit even if prod reads from DB)` to the Unit definition. Loss jumped from 368.08 to 495.25 (+127.17). The model started calling integration-wiring behaviors Unit because "I can pass data as arguments."

**Symptom**: Score drop from 88.0% to 84.6% on a single prompt change. MINE analysis showed U2 (Unit→Integration under-prediction) exploded — behaviors that require real module wiring were relabeled Unit because the algorithm inside them can be tested by passing data.

**Root cause**: There's a structural tension between O1 (Integration→Unit over-prediction) and U2 (Unit→Integration under-prediction). The model has a minimize-bias pull toward lower levels. Making Unit more permissive (easier to qualify for) amplifies this pull — the model reclassifies anything that could theoretically be tested with argument-passing as Unit, even when the failure mode requires real wiring.

**Fix**: Reverted with `git revert --no-edit de0914b`.

**Lesson**: Any addition to the Unit definition that makes Unit "easier to qualify for" will cause U2 explosion. The O1/U2 forces are in opposition — fixing one aggravates the other. Unit definition changes require special care. Agentic definition additions work because Agentic is above the minimize-bias pull; Unit is below it.

---

### post-run-report skill template uses score%, not loss

**What happened**: The `/post-run-report` skill template says "Baseline score" and `| Score | Delta |` throughout. After switching to loss as the primary metric (iter 15+), reports generated from that template end up score-focused — burying loss or omitting it.

**Symptom**: User: "FOCUS ON LOSS!!!! NOT ON SCORE!!!! WHY ARE YOU FOCUSING ON SCORE!!!"

**Fix**: Override the template: report loss as the primary column, score% as secondary (or omit entirely). The table header should be `| Loss | Δ Loss |` not `| Score | Delta |`. The "Baseline" line should say loss, not score.

**Lesson**: The skill template is a scaffold, not a constraint. When the experiment's primary metric diverges from the template's defaults, override explicitly.

---

### Noise floor is ~3% on score, loss baseline not yet established

**Status**: confirmed (1 data point, needs replication)

**What happened**: Run 20260328-142302 used the exact same treatment.md as baseline (no uncommitted changes) and scored 86.4% (loss 454.16) vs baseline 89.5%. Delta of -3.1% from pure LLM noise.

**Implication**: The two "kept" changes (minimize-bias-reframe +2.7%, mock-exposes-nothing +2.0%) are within the noise floor. They may not have been real improvements. Score-based keep/discard decisions with delta < 3% are unreliable.

**New metric**: Loss (cross-entropy) from calibrated level_probabilities is now available. Old runs had degenerate probabilities ({level: 1.0, others: 0.0}) making their loss values meaningless. Run 20260328-142302 (loss 454.16) is the first usable loss baseline.

**Lesson**: Use loss as primary metric going forward. Establish loss noise floor by running the same prompt twice.

---

### Model transfer changed the error shape (Haiku -> Codex)

**Status**: confirmed (Codex baseline + one kept Codex iteration)

**What happened**:
- Codex cold baseline on current treatment (`20260328-193534`) reached loss `366.58` (better than prior best Haiku `368.08`).
- One targeted Agentic disambiguation line (`20260328-195648`) reduced loss further to `306.79` (`-59.79`).

**Pattern shift**:
- Under-prediction (especially Agentic/Workflow misses) dropped sharply.
- Remaining dominant error mass is now mostly **over-prediction Integration→Unit** and a few high-impact misses (notably EC-19/EC-30 agentic judgments).

**Lesson**:
- Hypotheses that were no-signal on Haiku can become high-signal on Codex.
- Keep evaluating per model; do not assume cross-model transfer in either direction.

---

### Agentic vs Workflow semantics were under-specified

**What happened**: `Workflow` wording was interpreted as generic software workflow,
not specifically multi-step AI-agent sessions. That ambiguity can skew both GT reasoning
and treatment ideas.

**Symptom**:
- Proposed edits drifted toward "workflow/pipeline" language without explicit AI-agent scope.
- Agentic vs Workflow boundary decisions became inconsistent across iterations.

**Fix**:
- Added canonical taxonomy lock in `program.md`:
  - `Agentic` = **AI Agentic Step**
  - `Workflow` = **AI Agentic Workflow**
- Added explicit guardrail: generic software workflow alone is not Workflow-level by default.

**GT implication**:
- During GT review, separate "single-model-step quality" (Agentic) from
  "multi-step agent session behavior" (Workflow).

**Prompt implication**:
- Keep current best treatment unless data says otherwise.
- If Agentic↔Workflow confusion reappears, test a dedicated treatment variant that
  explicitly uses the "Agentic Step / Agentic Workflow" aliases.

---

### Corpus expansion shifted dominant error mass to Integration→Unit

**Status**: confirmed (2 full runs + 1 kept intervention)

**What happened**:
- Fresh Codex baseline on expanded corpus (`run 20260328-204623`, 36 tasks) yielded loss `451.23`.
- Full run after `integration-middle-anchor` (`run 20260328-225446`) still showed over-prediction dominant behavior and worsened to loss `460.31` (reverted).
- `mock-miss-scope-clarification` (`run 20260328-231214`) improved loss to `390.59` (kept), while confusion mass remained dominated by `Integration→Unit` (49 cases), confirming this is a stable high-impact pattern rather than a one-run artifact.

**Implication**:
- The current prompt may now be too permissive toward Unit when module wiring is the true failure boundary.
- Ideas that only push higher levels (Agentic/Workflow) are less likely to improve total loss on the expanded corpus.

**Next check**:
- Prioritize atomic Unit-vs-Integration disambiguations in `KEY-QUESTIONS` over broad representational edits.
- Track side-effects on `Integration→Agentic/System/Workflow` to avoid solving `Integration→Unit` by creating new under-prediction clusters.

---

### Re-running baseline at loop start wastes iterations

**What happened**: A fresh baseline was run at the start of a new `/run-experiment` invocation even though a comparable latest baseline already existed.

**Symptom**: Extra full-corpus eval cost/time with no new decision signal; iteration budget consumed before any hypothesis test.

**Fix**: `program.md` now has a permanent baseline policy:
- reuse the latest recorded comparable baseline,
- run a new baseline only when none exists or comparability changed (model/corpus/scoring change).

**Lesson**: Baseline is a reference point, not a ritual. Avoid redundant baseline runs.

---

### Concentrated-signal ideas are failing on full corpus

**Status**: confirmed (multiple full-run disconfirmations)

**What happened**:
- `integration-middle-anchor` had `explore_status: concentrated-signal` and improved only on a subset outlier; full run worsened loss (`460.31`).
- `precision-failure-boundary` had `explore_status: concentrated-signal` and also worsened on full run (`431.05`) versus current reference (`390.59`).

**Lesson**:
- Treat `concentrated-signal` as weak evidence only.
- Prefer ideas with distributed improvement (majority tasks improved in explore) or directly target new error modes introduced by the current best prompt, not legacy clusters.

---

### Fixing Integration→Unit can shift error mass into under-prediction

**Status**: hypothesis (1 data point)

**What happened**:
- After `mock-miss-scope-clarification` keep (`run 20260328-231214`), over-prediction mass dropped.
- On follow-up run (`20260328-232623`), `Integration→Unit` decreased (`49 -> 36`) and total errors dropped (`82 -> 75`), but under-prediction rose (`16 -> 24`) with growth in `Integration→System` and `Workflow` under-calls.

**Lesson**:
- Unit-boundary fixes can help globally but may over-tighten escalation thresholds.
- Next edits should preserve the Unit gain while restoring correct escalation to System/Agentic/Workflow on multi-step or real-infra behaviors.

---

### "MOCK-MISS floor only" clarification helped without destabilizing

**Status**: hypothesis supported (2nd keep in same family)

**What happened**:
- Follow-up wording on top of `mock-miss-scope-clarification` added: "This sets the Unit floor only; then still apply REAL-INFRA, LLM-DEP, and MULTI-STEP..."
- Full run `20260329-002612` improved loss from `390.59` to `390.23` (`-0.36`), so it was kept.

**Lesson**:
- Keeping the strong Unit-vs-Integration disambiguation while explicitly re-opening higher-level checks can preserve gains and reduce over-anchoring risk.
- Effect size is small; needs more runs to confirm beyond noise.

---

### SELF-CHECK Unit guard can catastrophically over-anchor downward

**Status**: supported (1 strong disconfirmation run)

**What happened**:
- Added SELF-CHECK clause to downweight "hypothetical wiring bug" reasoning and push those cases to Unit before re-checking escalation gates.
- Full run `20260329-004233` regressed from `390.23` to `453.53` (`+63.30`), then was reverted.

**Lesson**:
- Unit-bias language in `SELF-CHECK` is high-risk even when paired with explicit higher-level gates.
- Keep Unit-vs-Integration disambiguation in `MOCK-MISS`; avoid repeating Unit-favoring policy in final validation blocks.

---

### Sonnet has an Integration anchor, not a Unit anchor

**Status**: hypothesis (1 data point — sonnet baseline run 20260329-012210)

**What happened**:
- Sonnet baseline on 36-task corpus yielded loss `439.54` (score 87.2%).
- 53 of 82 errors (65%) had Integration as the predicted level.
- Dominant patterns: Integration→Unit (25 cases), Integration→System (20 cases, impact 60), Integration→Agentic/Workflow (8 cases, impact 32).
- 35 of 82 errors (43%) were self-aware — model knew the right answer but chose Integration anyway.

**Contrast with Codex**: Codex's dominant error was Unit→Integration (U2 pattern). Sonnet doesn't get stuck at Unit — the bottom-up gates successfully pull it off Unit, but then it stops at Integration. Ideas that worked on Codex (mock-miss-scope-clarification) may not transfer.

**Lesson**:
- Model-specific error shapes require model-specific interventions.
- Test Integration-specific gates (INTEGRATION-CHECK) rather than Unit-definition changes.

---

### INTEGRATION-BRAKE is load-bearing despite side effects

**Status**: confirmed (1 removal = +31.74 regression)

**What happened**:
- INTEGRATION-BRAKE was added in iter 46 as part of a two-change edit (with LLM-DEP burden flip). Combined delta: -2.92.
- It caused Unit→Integration to grow from 5→12 (side effect).
- Attempted removal in iter 47 to fix the Unit→Integration regression.
- Removal caused loss 416.21 vs 384.47 (+31.74 regression) — far worse than expected.

**Lesson**:
- INTEGRATION-BRAKE prevents ~30 loss worth of Integration→System/Agentic/Workflow errors.
- The Unit→Integration side effect (impact ~14) is far smaller than the benefit.
- Do NOT remove load-bearing sections even when they have known side effects.
- Test subtractive changes cautiously — removal of a section that improves by -3 on addition can regress by +30 on removal (non-linear interaction with other sections).

---

### Requiring explicit handoff text under-calls true Integration

**Status**: supported (1 disconfirming run)

**What happened**:
- Added `MOCK-MISS` clause: escalate to Integration only when the behavior text explicitly names the handoff/state interaction.
- Full run `20260329-004857` regressed from `390.23` to `404.78` (`+14.55`), then was reverted.

**Lesson**:
- Some genuine Integration behaviors are phrased implicitly.
- Hard textual-evidence gates are too strict; keep failure-boundary semantics without requiring explicit wording patterns in the issue text.

---

### O1 (Integration→Unit over-prediction) was the dominant pattern for the entire experiment but was never targeted

**Status**: confirmed — taxonomy direction fix (commit de4dc8d) revealed 52 accumulated entries

**What happened**:
Every prompt change targeted under-prediction failures (Agentic/Workflow misses) because the "Current failure analysis" in program.md and the taxonomy summary both said U1 was the dominant pattern. After fixing the reversed confusion_pair direction in O1–O4, O1 emerged with 52 entries — more than any other single pattern. U1, the supposed "highest-impact" pattern, has 35 entries across three confusion pairs. All optimization effort had been directed at the wrong target.

The root cause was invisible: the O taxonomy files had GT-Pred confusion_pairs (see entry below), so all over-prediction blocks were mis-routed away from O files. The summary output showed near-zero O pattern counts, giving a false picture of the error distribution.

**Symptom**:
`--summary` showed U1/U2/U3 dominating and O files nearly empty. After the direction fix and `--reprocess-unmatched`, 51 blocks moved from unmatched.md into O1/O2/O3. O1 went from 1 entry to 52.

**Lesson**:
After any taxonomy structural change (direction fix, confusion_pair expansion, regex fix), discard all prior distribution assumptions and re-examine from scratch. The leaderboard treatment history was optimizing against a biased view of the error landscape. Before accepting "X is the dominant pattern," verify with `npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --summary` that the file counts are plausible and that no category is suspiciously empty.

---

### O taxonomy files had reversed confusion_pair direction for the entire experiment

**Status**: fixed — commit de4dc8d

**What happened**:
O1–O4 were created with confusion_pair in GT-Pred format instead of the required Pred-GT convention. Example: O3 ("model predicts Agentic, GT is System") had `confusion_pair: System-Agentic` instead of `Agentic-System`. This caused `taxonomy-append.ts` to route blocks with routing key `(System→Agentic)` — which are *under-prediction* blocks — into the over-prediction file O3. Every genuine over-prediction block (e.g. `(Agentic→System)`) had no matching taxonomy file and went to `unmatched.md` instead.

The mistake is intuitive-sounding: "O3 is about Agentic vs System, so the pair is System-Agentic." But the convention is always Pred-GT (what the model predicted → what GT says). An over-prediction where the model says Agentic and GT is System has routing key `(Agentic→System)`, so the pair must be `Agentic-System`.

**Symptom**:
Over-prediction evidence was invisible in summary output. Under-prediction blocks were silently contaminating O files. After the fix, `--reprocess-unmatched` recovered 51 historical blocks from unmatched.md (O1 got 49, O2 got 2, O3 got 0 new — its history was contaminated).

**Fix**:
All O files corrected. Contaminating wrong-direction entries removed from O1–O4 bodies. Validation checklist added to `taxonomy/README.md`. The mnemonic: **"the pair reads like the error"** — confusion_pair tells you what the model said first, then what the GT says. It is the arrow `Pred→GT` collapsed to `Pred-GT`. An over-prediction entry where model over-escalated always has a higher-level Pred than GT.

**Lesson**:
When creating any taxonomy file, immediately write one sample entry and verify it routes to the correct file using `--dry-run`. If it doesn't match, the frontmatter is wrong. Never trust that a new file is working just because the tool ran without error — verify the routing explicitly.

---

### U1 accumulated two distinct reasoning traps that require different fixes (pattern drift)

**Status**: hypothesis — iter 58 treatment targets the new trap (pending eval)

**What happened**:
U1 ("Can mock the API") was created for the pattern: *model says "I can stub/mock the LLM API, so Integration is sufficient."* Over the run history, a second structurally different trap appeared in run 6: **"REJECTION-GATE quality escape"** — the model correctly identifies LLM dependency in its thinking (sometimes writing the answer "Agentic" internally), but then applies the REJECTION-GATE structure to search for reasons to reject higher levels. It finds a technicality — "the behavior text doesn't explicitly state the AI call is the failure boundary" — and uses it to demote to Integration.

These are mechanically different:
- **"Can mock" trap**: the model believes mocks are equivalent to real model calls; fix by teaching that mocks replace non-deterministic output with a constant, hiding real failure modes.
- **"REJECTION-GATE quality escape"**: the model knows the right answer but the gate structure actively suppresses it; fix by adding an execution-path default rule that bypasses the gate (iter 58: "if execution path passes through a real AI/ML API, default to Agentic").

**Symptom**:
In run 6 U1 entries, the T: (thinking) lines contain explicit Agentic reasoning that the J: (justification) lines then override using REJECTION-GATE language. High self-aware rate in run 6 U1 entries.

**Lesson**:
As a taxonomy file grows, check whether the J: texts across entries still describe the same reasoning argument. Same confusion pair + different argument structure = pattern drift — the file is conflating distinct failure modes. Indicator that drift has occurred: suddenly high SELF-AWARE rates in a file that previously had low self-awareness. When drift is detected, split the file or create a new one for the new trap, then `--reprocess-unmatched` to route history correctly.

---

### taxonomy-append.ts --summary silently undercounted legacy entries

**Status**: fixed — all taxonomy files migrated to JSONL schema format

**What happened**:
Multiple generations of entry format (very-old bare, medium single-line, block multi-line) made counting fragile. The summary regex only matched entries that had the `(Pred→GT)` pair in the routing key line. Entries from run1/run2 (which predated the pair format) were invisible to `--summary`, undercounting U2 by 18 and U3 by 22.

**Fix**:
All entries migrated to JSONL via `migrate-taxonomy.ts`. Every entry is now one JSON object per line validated by `TaxonomyEntrySchema` in `taxonomy-schema.ts`. The `--summary` tool uses `parseEntryLine()` (schema-driven) — no regex. Counting is exact by construction.

**Lesson**:
Schema-driven I/O eliminates silent undercounting. Use `serializeEntry()` to write, `parseEntryLine()` to read — never format or parse entries by hand. The validation command is simply:
```bash
npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --summary
```
If `--summary` doesn't count an entry, that entry doesn't conform to `TaxonomyEntrySchema`. Fix the data, not the counter.

---

### Idea selection has predictable winners/losers — use evidence, not taste

**Status**: confirmed (history mining on 41 scored idea trials in `autoresearch-results.jsonl`, 2026-04-11)

**What happened**:
- Heuristic family **agentic/LLM disambiguation** had the best outcomes: `9/14` keeps (64%), average delta `-6.34`.
- **Heavy structure/process overlays** (two-pass frameworks, proof ledgers, seam/process scaffolds) had `0/6` keeps, average delta `+46.62`.
- **Integration/System/Unit boundary rewrites** underperformed: `2/11` keeps, average delta `+37.17`.
- Section-level pattern: edits in `KEY-QUESTIONS` were most reliable (`7/14` keeps), while `SELF-CHECK` changes were risky (`1/6` keeps, average delta `+23.59`).
- Explore produced multiple false positives on full corpus:
  - `precision-failure-boundary`: explore best `-29.20`, full run `+40.46`
  - `integration-contract-invariant-gate`: explore best `-6.93`, full run `+70.81`
  - `competitive-critique-seeding`: explore best `-9.87`, full run `+28.57`

**Lesson**:
- Default selection policy should favor small, additive `KEY-QUESTIONS` edits that sharpen Agentic/LLM failure boundaries.
- Treat heavy reasoning-framework ideas as high-risk by default unless supported by distributed explore signal and a strong mechanism argument.
- Treat `concentrated-signal` explore wins as weak evidence only; require broader validation before full-corpus promotion.

---

### Lesson-first: avoid false explore wins (Apr 10-11) by requiring stability before promotion

**Status**: confirmed (runs on 2026-04-10 and 2026-04-11)

**Core lesson**:
Most recent failures were not "bad wording only"; they were **promotion errors**. We promoted ideas whose explore signal was unstable (split across subsets or single-slice), then paid large full-corpus regressions.

**Examples**:
- `integration-contract-invariant-gate`:
  - Explore winner came from a single subset (`v3`, delta `-6.93`).
  - Full run `20260410-235407` regressed badly (`+70.81` loss, discard).
- `competitive-critique-seeding`:
  - Explore had mixed behavior by subset/variant (e.g., `v1` looked strong on one slice).
  - Full run `20260411-002056` still regressed (`+28.57` loss, discard).
- `determinism-test`:
  - Winner was selected from one slice (`v1`, delta `-4.96`), not cross-slice stable.
  - Full run `20260411-010159` regressed hardest (`+77.15` loss, discard).
- Cross-example instability:
  - `ai-api-equals-agentic-rule` had split signal in **all 3 variants** (improves on one subset, worsens on another), showing how easy it is to overfit a subset.

**Operational rule**:
- Do not promote a winner if it is `single-slice` or `split-signal`.
- Promote only when the winner is non-positive delta on both stratified subsets and has no sign flip.
- If no stable winner exists, log `no-promote` and ideate again (do not force a full run).

**Why this matters**:
Apr 10-11 regressions show the largest losses came from false-positive promotions, not from idea scarcity. Stability gating is higher leverage than inventing more variants.

---

### Top-loss targeting is necessary but not sufficient (Apr 11): explicit targeting still overfits without cross-slice stability

**Status**: confirmed (multiple explores on 2026-04-11)

**What happened**:
- We explicitly targeted top weighted-loss pairs from MINE (`Integration→Agentic`, `Unit→Agentic`).
- Two direct ideas (`non-negotiable-boundary-gates`, `agentic-floor-content-dependence-gate`) showed strong first-pass deltas but failed stability on rerun (winner flipped or delta collapsed).
- One high-effort full-restructure attempt (`feature-extractor-plus-deterministic-mapper`) had a strong first pass, then `no-signal` on second pass.

**Lesson**:
- Targeting dominant weighted-loss pairs is a hard prerequisite, but by itself does not justify promotion.
- Keep the two-pass explore stability gate strict: require repeated non-positive deltas with no sign flip before full-corpus promotion.
- Treat first-pass big deltas on top-loss slices as hypothesis generators, not promotion evidence.

---

### Iteration evidence (Apr 11): top-loss idea can fail immediately under holdout gate (no-promote is productive)

**Status**: confirms prior stability-gate hypothesis

**What happened**:
- Idea: `toploss-ia-ua-round-1` (explicitly targeted `Integration→Agentic` and `Unit→Agentic`).
- Explore pass 1 (`--seed 101`) returned `concentrated-signal` with winner `v3-unit-brake` (delta `-5.17`).
- Mandatory holdout pass 2 (`--seed 202 --force`) returned `no-signal` (all variations worse than baseline).

**Lesson**:
- The promotion-evidence gate prevented a likely false positive promotion.
- `no-promote` is a high-value outcome: it saves full-corpus spend while refining idea quality.

---

### Iteration evidence (Apr 11): winner-flip under holdout confirms instability even when both passes look "good"

**Status**: confirms stability-gate hypothesis

**What happened**:
- Idea: `toploss-ia-ua-round-2` (same top-loss target, more surgical variants).
- Explore pass 1 (`--seed 303`) returned `concentrated-signal`; winner was `v3` (delta `-23.46`) driven mostly by `ec-11`.
- Holdout pass 2 (`--seed 404 --force`) also returned `concentrated-signal`; winner flipped to `v1` (delta `-1.32`) dominated by `ec-35`.

**Lesson**:
- "Looks improved" in both passes is still insufficient when concentration and winner identity are unstable.
- Winner-flip + concentrated gain should be treated as hard `no-promote`, not as weak justification to proceed.
