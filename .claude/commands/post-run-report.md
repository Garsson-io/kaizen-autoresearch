---
name: post-run-report
description: Post an autoresearch run report (iterations, treatments, learnings) to the GitHub discussion and link from leaderboard.md
argument-hint: "[experiment name, e.g. write-test-plan]"
---

Post a structured run report to the experiment's GitHub discussion. Gathers all data from git history — no manual input needed.

## Steps

### 1. Determine the experiment

If $ARGUMENTS is provided, use it as the experiment name. Otherwise default to `write-test-plan`.

Set:
- `EXPERIMENT_DIR=experiments/<name>`
- `TREATMENT_FILE=$EXPERIMENT_DIR/prompts/treatment.md`

### 2. Gather iteration data from git history

Run these commands to collect all experiment commits and their diffs:

```bash
# All experiment commits (kept and reverted) for this treatment file
git log --oneline --all --grep="experiment(treatment)" --reverse

# For each experiment commit, get the diff (shows the actual prompt change attempted)
git log --all --grep="experiment(treatment)" --reverse --format="%H %s" | while read hash msg; do
  echo "### $msg"
  echo '```diff'
  git show "$hash" --format="" -- "$TREATMENT_FILE"
  echo '```'
  # Check if it was reverted
  if git log --oneline --all --grep="Revert \"$msg\"" | grep -q .; then
    echo "**Status: REVERTED**"
  else
    echo "**Status: KEPT**"
  fi
  echo ""
done
```

### 3. Read current state

- Read `$EXPERIMENT_DIR/leaderboard.md` for the iteration summary table and learnings
- Read `$TREATMENT_FILE` for the current (best) prompt
- Read `$EXPERIMENT_DIR/prompts/baseline.md` for comparison
- Read any other prompts in `$EXPERIMENT_DIR/prompts/` (rejected variants)

### 4. Read the autoresearch results log if it exists

```bash
cat autoresearch-results.tsv 2>/dev/null
```

### 5. Compose the discussion comment

Format the comment as:

```markdown
## Autoresearch Run Report — <experiment> (<date>)

### Config
- **Scope**: <treatment file path>
- **Verify**: <verify command>
- **Metric**: <metric description>
- **Baseline score**: <score>

### Iteration Summary

| Iter | Score | Δ | Status | Hypothesis |
|------|-------|---|--------|-----------|
| ... from results log or leaderboard ... |

### Treatments Attempted

For each experiment commit, show:
- The hypothesis (from commit message)
- The diff (what was changed)
- The result (kept/reverted, score delta)

<details>
<summary>Iter N: <commit message> — <status> (<score>, Δ)</summary>

```diff
<the actual diff from git show>
```

</details>

### Current Best Prompt

```
<full content of treatment.md>
```

### Learnings

<bullet points of what was learned — from leaderboard.md "What we learned" section>

### What to Try Next

<from leaderboard.md "What to try next" section>
```

### 6. Post to GitHub Discussion

```bash
gh api graphql -f query='mutation($id:ID!,$body:String!){addDiscussionComment(input:{discussionId:$id,body:$body}){comment{url}}}' \
  -f id="D_kwDORybT0s4AlROe" \
  -f body="$COMMENT_BODY"
```

Print the returned comment URL.

### 7. Update leaderboard.md

Replace the detailed "Autoresearch run N" section in leaderboard.md with a one-line link:

```markdown
**[Autoresearch run 1 report](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1#discussioncomment-XXXXX)** — 5 iterations, 0 keeps, baseline 87.2
```

Commit and push the leaderboard change.
