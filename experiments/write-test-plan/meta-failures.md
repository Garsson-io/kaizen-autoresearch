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

**Fix**: Taxonomy is append-only. Each line prefixed with `[runN]`. `taxonomy/README.md` documents the rule. Never delete old lines.

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
