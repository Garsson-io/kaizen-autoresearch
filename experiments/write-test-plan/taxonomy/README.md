# Taxonomy

Each `.md` file is one reasoning pattern. Front matter describes the category. Each line in the body is one occurrence (task + behavior + prose excuse).

**Count occurrences**: `wc -l taxonomy/U1-can-mock-the-api.md` (subtract frontmatter lines)
**Find patterns**: `grep -l "mock" taxonomy/*.md`
**Impact**: frequency x weight (from frontmatter)

## Frontmatter schema

```yaml
---
id: U1                    # short ID for cross-reference
name: "Human readable"    # the excuse pattern name
direction: under | over | correct
predicted: Unit           # what the model predicted
ground_truth: Agentic     # what the GT says
weight: 4                 # GT level weight (Unit=1, Integration=2, System=3, Agentic=4, Workflow=4)
confusion_pair: System-Agentic
description: One sentence explaining the reasoning failure
self_aware: true          # optional — does the model acknowledge the correct answer?
---
```

## Body format

One line per occurrence:
```
EC-04 b3: "quoted justification text from the model"
```

## Updating after a run

Taxonomy is **append-only**. Each line is one occurrence from one run. Never delete old lines.

After each run:
1. Extract justifications from `runs/latest/`
2. **Append** new lines for new occurrences, prefixed with `[runN]`
3. Create new files for newly discovered patterns
4. Update frontmatter description if the pattern's character changed

The line count across runs shows how persistent a pattern is:
- Same task+behavior appears in multiple runs → the pattern is stable, prompt didn't fix it
- A task+behavior stops appearing → the prompt change worked for that case
- Compare `[run1]` vs `[run2]` lines for the same behavior to see how the excuse evolved

**Never remove lines.** The history of excuses IS the data.
