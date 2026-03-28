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
