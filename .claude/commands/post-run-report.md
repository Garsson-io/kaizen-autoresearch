---
name: post-run-report
description: Post an autoresearch run report (iterations, treatments, learnings) to the experiment's GitHub discussion and link from leaderboard.md
argument-hint: "[experiment name, e.g. write-test-plan]"
---

Post a structured run report to the experiment's GitHub discussion. Each experiment has ONE discussion; each batch of runs is ONE comment. Gathers all data from git history.

## Steps

### 1. Determine the experiment

If $ARGUMENTS is provided, use it as the experiment name. Otherwise default to `write-test-plan`.

Set:
- `EXPERIMENT_DIR=experiments/<name>`
- `TREATMENT_FILE=$EXPERIMENT_DIR/prompts/treatment.md`

### 2. Read the discussion ID from program.md

```bash
grep "Discussion ID" $EXPERIMENT_DIR/program.md
```

Extract the ID (e.g. `D_kwDORybT0s4AlROe`). Every experiment's program.md MUST have a line:
```
**Discussion ID** (for `/post-run-report`): `<node_id>`
```

If missing, create the discussion first:
```bash
gh api graphql -f query='mutation($repoId:ID!,$catId:ID!,$title:String!,$body:String!){createDiscussion(input:{repositoryId:$repoId,categoryId:$catId,title:$title,body:$body}){discussion{id url}}}' \
  -f repoId="<repo_node_id>" -f catId="<category_node_id>" \
  -f title="<experiment-name>: experiment log + iteration tracker" \
  -f body="Tracking discussion for the <experiment-name> experiment."
```
Then add the ID to program.md.

### 3. Gather iteration data from git history

```bash
# All experiment commits (kept and reverted) for this treatment file
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
done
```

### 4. Read current state

- `$EXPERIMENT_DIR/leaderboard.md` — iteration summary and learnings
- `$TREATMENT_FILE` — current best prompt
- All files in `$EXPERIMENT_DIR/prompts/` — all prompt variants for comparison
- `autoresearch-results.tsv` (if exists) — raw iteration log

### 5. Compose the discussion comment

Write the comment body to a temp file (to avoid shell escaping issues with special chars):

```markdown
## Autoresearch Run <N> Report — <experiment> (<date>)

### Config
- **Scope**: <treatment file path>
- **Verify**: <verify command from program.md>
- **Metric**: <metric from program.md>
- **Baseline score**: <iter 0 score>
- **Iterations**: <count>
- **Keeps / Discards**: <counts>

### Iteration Summary

| Iter | Score | Delta | Status | Hypothesis |
|------|-------|-------|--------|-----------|
| ... |

### Treatments Attempted

For each experiment commit, use collapsible details with the diff:

<details>
<summary>Iter N: <commit message> — <status> (<score>)</summary>

(the diff from git show)

</details>

### Current Best Prompt

(full content of treatment.md in a code block)

### Learnings

(bullet points from the run)

### What to Try Next

(ideas for the next batch)
```

### 6. Post to GitHub Discussion

Use jq to properly JSON-encode the body (avoids shell escaping issues with arrows, backticks, etc.):

```bash
jq -n --rawfile body /tmp/run-report-body.md \
  '{query: "mutation($id:ID!,$body:String!){addDiscussionComment(input:{discussionId:$id,body:$body}){comment{url}}}", variables: {id: "<DISCUSSION_ID>", body: $body}}' \
  | gh api graphql --input -
```

Print the returned comment URL.

### 7. Update leaderboard.md

Replace any detailed run section with a one-line link to the discussion comment:

```markdown
**[Autoresearch run N report](<comment_url>)** — <iterations> iterations, <keeps> keeps, baseline <score>
```

Commit and push.
