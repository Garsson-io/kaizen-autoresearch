# Writing program.md

`program.md` is the agent's instruction manual for an experiment. It contains the autoresearch config, diagnostic guidance, and iteration context. The agent reads it before every loop.

## Required Sections

### 1. Header Config Block (4 required fields)

The first lines must declare the autoresearch loop configuration:

```markdown
# Autoresearch Program: <experiment-name>

Goal: <what to maximize/minimize — one sentence>
Scope: <path to the file(s) the loop can edit>
Metric: <what the score measures, with range and direction>
Verify: <shell command that outputs the score>
```

Example from `write-test-plan`:

```markdown
Goal: Maximize test level classification accuracy — get weighted avg score to >= 75 on 10-task corpus
Scope: experiments/write-test-plan/prompts/treatment.md
Metric: Weighted average score 0-100 (higher is better)
Verify: npx tsx experiments/write-test-plan/scripts/verify.ts | jq '.score'
```

Rules:
- **Goal** must be specific and measurable (not "improve the prompt")
- **Scope** must be exact file globs (the agent will only modify these files)
- **Metric** must state the range and direction (higher/lower is better)
- **Verify** must be a single shell command that outputs a parseable number

### 2. Context Section

Give the agent the full picture:

```markdown
You are an autonomous research agent improving a prompt that <does what>.

**Your objective**: maximize/minimize the score printed by `./run-eval.sh`.
The score is a <what> over the <N>-task corpus (range). Higher/lower is better.
```

### 3. Template Variable Warnings

If the treatment file has template variables, document them prominently:

```markdown
**CRITICAL -- treatment.md MUST keep these template variables** (run-probe.ts replaces them):
- `{{TASK_ID}}` -- replaced with e.g. "EC-04"
- `{{ISSUE_BODY}}` -- replaced with the issue markdown
If you remove these, the eval produces garbage.
```

### 4. Noise Warning

LLM-based scoring is noisy. Set a minimum delta:

```markdown
**Noise warning**: LLM-based scoring is inherently noisy (same prompt can score differently
across runs). Ignore improvements < 1.5%. If a change shows a small delta, re-run verify
to confirm before keeping.
```

### 5. Success Thresholds

Define clear bands so the agent knows when to stop vs. keep iterating:

```markdown
**Success threshold**:
- >= 75%: experiment complete
- 55-75%: improving but not reliable -- keep iterating
- < 55%: dominant failure mode -- design targeted fix
```

### 6. Experimental Conditions

List all prompt variants and their status:

```markdown
## Experimental conditions

| Condition | Prompt | Status |
|-----------|--------|--------|
| baseline | `prompts/baseline.md` (fixed, never edit) | Reference |
| treatment | `prompts/treatment.md` <-- **you edit this** | Active |
| treatment-v2 | `prompts/treatment-v2.md` (fixed, never edit) | Rejected -- read to avoid repeating |
```

### 7. Adversarial Rounds

If your eval supports robustness testing, document the rounds:

```markdown
## Adversarial rounds

Three rounds test robustness:
- **Round 1** (default): neutral -- no misleading context
- **Round 2**: <describe the adversarial noise injected>
- **Round 3**: <describe different adversarial noise>

A condition that passes round 1 but drops >= 10% on rounds 2/3 is not robust.
```

See [Adversarial Training](./adversarial-training.md) for how to design adversarial rounds.

### 8. Diagnostic Guidance

Tell the agent what to look at after each run:

```markdown
## Diagnostic guidance

After each verify run, read `runs/latest/` output files + the scoring breakdown:
- Which tasks score lowest?
- Which behaviors are predicted too low?
- Which ground-truth labels are systematically missed?
- Is consistency failing often?

The most impactful targets are behaviors with **high weight that score < 40% sufficiency**.
```

### 9. What Makes a Good Edit

Give concrete positive and negative examples:

```markdown
## What makes a good edit to treatment.md

- [good] Add a concrete positive example for the level the model misses
- [good] Add a "NOT this" example that disambiguates two adjacent labels
- [good] Reorder key questions to promote checks for commonly missed labels
- [bad] Rewrite the whole prompt -- too many variables, can't diagnose
- [bad] Add generic "think carefully" language -- no signal value
```

### 10. Current Failure Analysis

Keep this section updated with the latest known failures:

```markdown
## Current failure analysis

**Primary failure**: <what's going wrong, with specific tasks/behaviors>
**Root cause**: <why the model fails here>

**Fix candidates** (try in order of expected impact):
1. <most likely fix>
2. <alternative approach>
3. <fallback approach>
```

### 11. Ground Rules

Non-negotiable constraints:

```markdown
## Ground rules

- **Never edit corpus, ground-truth, scripts, or src** -- only treatment.md changes
- **Never edit leaderboard.md without a score change**
- `runs/` is gitignored
- One hypothesis per iteration
- **Before each iteration, read leaderboard.md** for full score history
```

### 12. Corpus Coverage Table

Help the agent understand which tasks matter most:

```markdown
## Corpus coverage

| Task | Labels present | Key challenge |
|------|---------------|---------------|
| EC-04 | Unit, Integration, **Agentic** | AI API call classification |
| EC-07 | Unit, Integration, System, **Agentic**, **Workflow** | Full ladder |
```

### 13. Useful Commands

Quick-reference for the agent:

```markdown
## Useful commands

./run-eval.sh                           # full eval
./run-eval.sh --condition baseline      # baseline comparison
./run-eval.sh --round 2                 # adversarial round 2
./run-eval.sh --single ec-04            # debug single task
```

## Best Practices

1. **Keep program.md up to date** -- the agent reads it every iteration. Stale failure analysis wastes iterations
2. **Be specific about failures** -- "Agentic missed in EC-04 behaviors 3-4" beats "some tasks are wrong"
3. **Rank fix candidates** -- the agent tries them in order, so put highest-expected-impact first
4. **Document rejected approaches** -- prevents the agent from repeating failed experiments
5. **Set realistic thresholds** -- too high and the agent spins forever; too low and you ship a bad prompt
6. **Include level/label reference** -- the agent needs to know exactly what each classification means
