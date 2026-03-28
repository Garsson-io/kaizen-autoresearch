# Creating Experiments

How to set up a new autoresearch experiment from scratch.

## Directory Structure

Every experiment lives in `experiments/<name>/` and follows this layout:

```
experiments/<name>/
  program.md              # Autoresearch config + iteration context (agent reads this first)
  prompts/
    baseline.md           # Fixed reference prompt (never edited by the loop)
    treatment.md          # The ONLY file the loop edits
  run-eval.sh             # Orchestrator script, outputs "SCORE: <fraction>"
  scripts/
    run-probe.ts          # Runs a single task via Claude API
    score.ts              # Mechanistic scorer (weighted dimensions)
    verify.ts             # Wraps run-eval.sh, outputs {"score": N}, exits 1 on failure
  src/
    schema.ts             # Zod schemas for structured output validation
  corpus/                 # Fixed input tasks (never edit)
  ground-truth/           # Expert-labeled answers (never edit)
  leaderboard.md          # Score history, updated per kept commit
  runs/                   # gitignored output directory
```

## Mining Upstream Repos for Ideas and Corpus Tasks

If the experiment relates to a production skill or system, the upstream repo is a rich source of:

- **Incident reports**: Real failures reveal systematic prompt weaknesses and become adversarial corpus tasks
- **Design discussions**: Theories about what works/doesn't inform the hypothesis space
- **Corpus design constraints**: Principles like vocabulary leak prevention, observable behavior framing
- **Production failure patterns**: Cases where the skill produced wrong results -- these are adversarial examples reality provides for free

```bash
# Search for incidents, skill issues, and testing discussions
gh issue list --repo <upstream-repo> --label bug --limit 20
gh issue list --repo <upstream-repo> --label area/skills --limit 20
gh search issues "<relevant keywords>" --repo <upstream-repo>
```

Convert findings into:
- New `ideas/` files with source attribution (`*Source: repo#issue*`)
- New adversarial corpus tasks based on real failure modes
- Updated `program.md` failure analysis with upstream evidence

## Step-by-Step Setup

### 1. Define Your Classification Task

An experiment evaluates how well a prompt classifies inputs against expert labels.

You need:
- **Inputs** (corpus): 5-10 problem scenarios, stored as markdown in `corpus/`
- **Labels** (ground-truth): Expert-assigned correct answers, stored as JSON in `ground-truth/`
- **Output schema**: Zod-validated structure the model must produce (in `src/schema.ts`)

### 2. Create the Corpus

Each corpus file is a standalone task. Example from `write-test-plan`:

```markdown
<!-- corpus/ec-04.md -->
A classification module accepts a document string and returns one label...

## Behaviors to cover
1. The request sent to the external API always includes the complete list...
2. When the API returns a label that is not in the taxonomy...
```

Create a `corpus/catalog.json` with metadata for all tasks (dynamic discovery):

```json
[
  {
    "task_id": "EC-01",
    "file": "ec-01.md",
    "ground_truth": "../ground-truth/ec-01.json",
    "title": "Short descriptive title",
    "domain": "infrastructure",
    "difficulty": "easy",
    "adversarial_technique": null,
    "labels": ["Unit", "Integration"],
    "added_in": "v1"
  }
]
```

The eval script auto-discovers tasks from `corpus/*.md` -- no need to hardcode task lists.

Guidelines:
- Each task should have 3-5 behaviors/items to classify
- Include a range of difficulty (some easy, some hard)
- Design tasks that cover the full spectrum of your classification labels
- Use `/autoresearch:scenario` to generate adversarial tasks systematically (see [Adversarial Training](./adversarial-training.md))

### 3. Create Ground-Truth Labels

Each ground-truth file maps to a corpus file. Example:

```json
{
  "task_id": "EC-04",
  "behaviors": [
    { "behavior_id": 1, "ground_truth_level": "Unit" },
    { "behavior_id": 2, "ground_truth_level": "Unit" },
    { "behavior_id": 3, "ground_truth_level": "Agentic" },
    { "behavior_id": 4, "ground_truth_level": "Agentic" },
    { "behavior_id": 5, "ground_truth_level": "Integration" }
  ]
}
```

Guidelines:
- Labels must come from an expert (not the model being tested)
- Use the same label vocabulary as your schema
- Include cases where the correct answer is non-obvious (adversarial ground truth)

### 4. Define the Scoring Model

The scorer (`scripts/score.ts`) converts raw outputs into a single 0-100 number.

The `write-test-plan` experiment uses 4 weighted dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Sufficiency | 55% | Did predicted level >= ground truth minimum? |
| Precision | 20% | Distance from ground truth (symmetric) |
| Consistency | 15% | Does test_description match declared level? |
| Structure | 10% | All required fields present (Zod guarantees) |

Row weights emphasize hard classifications:
- Easy labels (Unit) = 1x weight
- Hard labels (Agentic, Workflow) = 4x weight

Design your scoring to penalize the failures that matter most.

### 5. Write the Baseline Prompt

`prompts/baseline.md` is the control. It should be a reasonable first attempt that the treatment will improve upon. It is **never edited** by the loop.

Requirements:
- Must include template variables that `run-probe.ts` substitutes (e.g., `{{TASK_ID}}`, `{{ISSUE_BODY}}`)
- Should be a straightforward, neutral prompt without special tricks

### 6. Write the Initial Treatment Prompt

`prompts/treatment.md` starts as a copy of the baseline (or slightly improved). This is the **only file** the autoresearch loop will modify.

Requirements:
- Must preserve template variables (`{{TASK_ID}}`, `{{ISSUE_BODY}}`)
- Should be the same format as baseline so improvements are attributable to prompt changes

### 7. Write run-eval.sh

The orchestrator that runs all tasks and produces a machine-readable score.

Key requirements:
- Final line of output must be `SCORE: <0.0-1.0>` (machine-readable for agents)
- Should run probes in parallel for speed
- Must support flags: `--condition`, `--round`, `--corpus`, `--prompt`, `--model`

See `experiments/write-test-plan/run-eval.sh` for a complete reference implementation.

### 8. Write program.md

This is the most important file. See [Writing program.md](./writing-program-md.md) for the full guide.

### 9. Register in CLAUDE.md

Add a row to the experiment table in the repo's `CLAUDE.md`:

```markdown
| my-experiment | `experiments/my-experiment/program.md` | `experiments/my-experiment/prompts/treatment.md` |
```

### 10. Smoke Test

Always validate cheapest-first before running the full loop:

```bash
cd experiments/<name>

# 1. Instant: verify.ts Zod schema
npx tsx scripts/verify.ts --mock 0.750 | jq '.score'

# 2. Instant: verify.ts rejects garbage
npx tsx scripts/verify.ts --mock garbage; echo "exit: $?"

# 3. ~15s: single probe (one API call)
./run-eval.sh --single ec-09

# 4. Full eval (all tasks in parallel)
./run-eval.sh
```

## Example: Creating a New Experiment

Suppose you want to test a prompt that classifies API endpoints by security risk level.

```bash
mkdir -p experiments/api-security-classifier/{corpus,ground-truth,prompts,scripts,src,runs}

# 1. Create 8 corpus files (api-01.md through api-08.md)
#    Each describes an API endpoint with its middleware, auth, input handling

# 2. Create ground-truth JSON for each
#    Labels: "low", "medium", "high", "critical"

# 3. Copy and adapt scripts from write-test-plan
cp experiments/write-test-plan/scripts/*.ts experiments/api-security-classifier/scripts/
cp experiments/write-test-plan/src/schema.ts experiments/api-security-classifier/src/

# 4. Modify schema.ts for your output format
# 5. Modify score.ts for your scoring dimensions
# 6. Write baseline.md and treatment.md
# 7. Write program.md (see writing-program-md.md)
# 8. Write run-eval.sh (adapt from write-test-plan)
```
