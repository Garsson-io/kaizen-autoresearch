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

### Noise floor is ~3% on score, loss baseline not yet established

**Status**: confirmed (1 data point, needs replication)

**What happened**: Run 20260328-142302 used the exact same treatment.md as baseline (no uncommitted changes) and scored 86.4% (loss 454.16) vs baseline 89.5%. Delta of -3.1% from pure LLM noise.

**Implication**: The two "kept" changes (minimize-bias-reframe +2.7%, mock-exposes-nothing +2.0%) are within the noise floor. They may not have been real improvements. Score-based keep/discard decisions with delta < 3% are unreliable.

**New metric**: Loss (cross-entropy) from calibrated level_probabilities is now available. Old runs had degenerate probabilities ({level: 1.0, others: 0.0}) making their loss values meaningless. Run 20260328-142302 (loss 454.16) is the first usable loss baseline.

**Lesson**: Use loss as primary metric going forward. Establish loss noise floor by running the same prompt twice.
