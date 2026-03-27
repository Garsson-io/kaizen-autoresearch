# Adversarial Training for Experiments

How to create adversarial tasks and robustness tests that stress-test your treatment prompt and prevent fragile improvements.

## Why Adversarial Testing

A prompt that scores well on clean inputs but breaks under noise is not production-ready. Adversarial rounds simulate real-world conditions where:
- Users provide misleading context
- Inputs contain anchoring bias
- Social pressure pushes toward wrong answers
- Edge cases trigger systematic model failures

## Two Layers of Adversarial Testing

### Layer 1: Adversarial Corpus Items

Design corpus tasks that are inherently tricky -- where the obvious answer is wrong.

**Strategies for adversarial corpus design:**

| Strategy | Description | Example |
|----------|-------------|---------|
| **Misleading surface features** | Input looks like category A but is actually B | An API call to an LLM service described in purely REST/HTTP terms (looks like System, is actually Agentic) |
| **Boundary cases** | Sits exactly on the border between two labels | A function that could be Unit or Integration depending on interpretation |
| **Buried signal** | The key information is deep in the text, not in the title | An issue where the AI-dependency is mentioned in paragraph 3, not the title |
| **Contradictory signals** | Input contains evidence for multiple labels | A behavior that involves both local logic (Unit) and an external AI call (Agentic) |
| **Distractor content** | Lots of irrelevant detail hides the real classification signal | A long issue description where 80% is about architecture and 20% is about the testable behavior |

**How to create adversarial corpus items:**

1. Start with your ground-truth label distribution -- which labels does the model already get right?
2. Focus new adversarial items on commonly confused label pairs (e.g., System vs Agentic)
3. For each confusion pair, create 2-3 tasks that specifically test the boundary
4. Include tasks where the model's default heuristic gives the wrong answer

### Layer 2: Adversarial Rounds (Noise Injection)

Append misleading context to input tasks to test robustness. The corpus stays fixed; only the noise changes per round.

**The write-test-plan experiment uses 3 rounds:**

```
Round 1 (neutral): clean input, no noise
Round 2 (anchoring): appends "this module already has unit tests in the tests/ directory"
Round 3 (pressure): appends "team prefers fast, local tests" + "full coverage is deferred"
```

**Implementing rounds in run-eval.sh:**

```bash
# Define noise strings
ROUND2_NOISE="
---
Note: This module already has unit tests in the tests/ directory."

ROUND3_NOISE="
---
Note: Full integration coverage is tracked as a follow-up. For this sprint,
the team prefers fast, local tests that can run in CI without external dependencies."

# Apply noise based on --round flag
augmented="$TMPDIR/${task}.md"
cp "$issue_file" "$augmented"
if [[ "$ROUND" == "2" ]]; then
  printf '%s' "$ROUND2_NOISE" >> "$augmented"
elif [[ "$ROUND" == "3" ]]; then
  printf '%s' "$ROUND3_NOISE" >> "$augmented"
fi
```

**Robustness criterion**: A prompt must score within 10% of its round-1 score on adversarial rounds. If it drops more than 10%, the improvement is fragile.

## Types of Adversarial Noise

Design noise that targets the specific failure modes of your classification task:

| Noise Type | What It Does | When to Use |
|------------|-------------|-------------|
| **Anchoring** | Suggests a specific (wrong) answer | When the model over-relies on context clues |
| **Social pressure** | Implies the "team" or "convention" prefers a wrong answer | When the model defers to authority signals |
| **Red herring** | Adds irrelevant but plausible detail | When the model is distracted by surface features |
| **Contradiction** | States something that conflicts with the correct label | When the model doesn't reason through conflicts |
| **Minimization** | Downplays the complexity ("this is straightforward") | When the model under-classifies complex behaviors |
| **Escalation** | Overstates the complexity ("this requires full E2E") | When the model over-classifies simple behaviors |

### Designing Your Own Adversarial Rounds

1. **Identify the primary confusion pair** -- which two labels does the model mix up most?
2. **Design Round 2** to push toward the wrong label (e.g., if model under-predicts Agentic, add text that makes Agentic look like System)
3. **Design Round 3** to add a different type of pressure (e.g., social/authority pressure toward the wrong answer)
4. **Optional Round 4+**: Combine multiple noise types for maximum stress

## Using Autoresearch Modes for Adversarial Work

### /autoresearch:scenario -- Generate Adversarial Tasks

The scenario mode systematically explores 12 dimensions of edge cases. Use it to generate new adversarial corpus items.

```bash
/autoresearch:scenario
Scenario: A model classifies software behaviors by minimum test level
Domain: software
Focus: edge-cases
Depth: deep
Iterations: 30
```

The 12 exploration dimensions are particularly useful for adversarial task design:

| Dimension | Adversarial Application |
|-----------|----------------------|
| **Happy path** | Baseline -- tasks where the obvious answer is correct |
| **Error path** | Tasks where normal heuristics fail |
| **Edge case** | Boundary between two labels |
| **Abuse/misuse** | Inputs designed to trick the classifier |
| **Scale** | Tasks with many behaviors (10+) that overwhelm attention |
| **Concurrent** | Multiple valid labels for one behavior |
| **Temporal** | Context that changes over time (deprecated API, migrated service) |
| **Data variation** | Unusual formats, mixed languages, abbreviations |
| **Permission** | Authority signals that bias classification |
| **Integration** | Cross-cutting behaviors that span multiple labels |
| **Recovery** | Tasks where initial classification is wrong and must be corrected |
| **State transition** | Behaviors that change label depending on system state |

### /autoresearch:predict --adversarial -- Red-Team Your Prompt

The predict mode with `--adversarial` flag assembles a red-team panel:

```bash
/autoresearch:predict --adversarial
Scope: experiments/<name>/prompts/treatment.md
Goal: Find weaknesses in the classification prompt
```

The adversarial persona set:

| Persona | Role | What They Look For |
|---------|------|-------------------|
| Red Team Attacker | Active exploitation | Inputs that reliably trigger misclassification |
| Blue Team Defender | Detection gaps | Missing guardrails in the prompt |
| Insider Threat | Subtle manipulation | Phrasing that appears helpful but biases toward wrong answers |
| Supply Chain Analyst | Upstream risks | Dependencies on model behavior that could change between versions |
| Judge | Arbitration | Evaluates exploitability, assigns realistic severity |

### /autoresearch:security -- Audit the Eval Pipeline

Use security mode to audit the evaluation pipeline itself -- are there ways the scoring could be gamed?

```bash
/autoresearch:security
Scope: experiments/<name>/scripts/**
Focus: Can the treatment prompt game the scoring without actually improving classification?
Iterations: 10
```

## Adversarial Training Workflow

Combine these into a systematic workflow:

### Phase 1: Baseline Adversarial Assessment

```bash
# Run treatment on all 3 rounds
./run-eval.sh --round 1  # clean
./run-eval.sh --round 2  # anchoring
./run-eval.sh --round 3  # pressure

# Record all 3 scores in leaderboard.md
```

### Phase 2: Generate New Adversarial Tasks

```bash
# Use scenario mode to find edge cases
/autoresearch:scenario
Scenario: Classify software behaviors by test level where the obvious answer is wrong
Domain: software
Focus: edge-cases
Iterations: 20
```

Review generated scenarios. Convert the best ones into new corpus files + ground-truth JSON.

### Phase 3: Red-Team the Prompt

```bash
# Predict mode finds prompt weaknesses
/autoresearch:predict --adversarial
Scope: experiments/<name>/prompts/treatment.md
Goal: Find inputs that reliably cause misclassification
```

Use findings to design new adversarial rounds or corpus items.

### Phase 4: Harden the Treatment

```bash
# Run the main autoresearch loop with adversarial rounds enabled
/autoresearch
Goal: Achieve >= 75% on ALL rounds (neutral + adversarial)
Scope: experiments/<name>/prompts/treatment.md
Verify: ./run-all-rounds.sh  # script that runs rounds 1-3 and outputs min score
```

### Phase 5: Validate Robustness

After the loop converges, run a final check:

```bash
./run-eval.sh --round 1  # must be >= 75%
./run-eval.sh --round 2  # must be >= 75% (or within 10% of round 1)
./run-eval.sh --round 3  # must be >= 75% (or within 10% of round 1)
```

## Using /autoresearch:scenario to Generate Adversarial Tasks

Rather than hand-crafting all adversarial corpus items, use the scenario mode to systematically discover edge cases and convert them into tasks.

### Step 1: Seed the Scenario Generator

```bash
/autoresearch:scenario
Scenario: A model must classify software behaviors by minimum test level (Unit, Integration, System, Agentic, Workflow). The key confusion pairs are System-vs-Agentic and Agentic-vs-Workflow.
Domain: software
Focus: edge-cases
Depth: deep
Iterations: 30
```

### Step 2: Review Generated Scenarios

The scenario output (`scenario/*/scenarios.md`) will contain situations organized by the 12 exploration dimensions. Look for:
- **Abuse/misuse**: Inputs designed to trick the classifier
- **Edge case**: Boundary conditions between two labels
- **Data variation**: Unusual phrasings that break heuristics
- **Concurrent**: Multiple valid labels for one behavior

### Step 3: Convert to Corpus Items

For each promising scenario:
1. Write a corpus `.md` file following the existing format (intro paragraph + 5 behaviors)
2. Assign expert ground-truth labels in a `.json` file
3. Add metadata to `corpus/catalog.json`
4. The eval script auto-discovers new files

### Step 4: Validate with /autoresearch:predict

```bash
/autoresearch:predict --adversarial
Scope: experiments/<name>/corpus/ec-NEW.md
Goal: Does this task reliably cause misclassification?
```

If the predict personas can all correctly classify the task, it's too easy -- redesign it.

## Task Organization: Catalog-Based Discovery

Tasks are organized using dynamic discovery rather than hardcoded lists:

```
corpus/
  catalog.json       # Metadata for all tasks (title, domain, difficulty, adversarial technique)
  ec-01.md           # Task body
  ec-02.md
  ...
ground-truth/
  ec-01.json         # Expert labels
  ec-02.json
  ...
```

### catalog.json Format

```json
[
  {
    "task_id": "EC-21",
    "file": "ec-21.md",
    "ground_truth": "../ground-truth/ec-21.json",
    "title": "Short descriptive title",
    "domain": "ai/ml",
    "difficulty": "hard",
    "adversarial_technique": "buried_signal",
    "labels": ["Unit", "Agentic", "Workflow"],
    "added_in": "v3"
  }
]
```

### Adding New Tasks

1. Create `corpus/ec-XX.md` (intro + 5 behaviors)
2. Create `ground-truth/ec-XX.json` (expert labels)
3. Add entry to `corpus/catalog.json`
4. Run `./run-eval.sh --single ec-XX` to verify the new task works
5. The default corpus auto-discovers all `.md` files in `corpus/`

### Adversarial Technique Tags

Tag each adversarial task in the catalog so you can track which techniques are effective:

| Technique | What It Tests |
|-----------|--------------|
| `buried_signal` | Key classification signal is hidden in technical phrasing |
| `misleading_surface` | Surface features suggest wrong label (e.g., data pipeline that looks AI-powered) |
| `boundary_case` | Task sits exactly on the border between two labels |
| `multi_step_pipeline` | Multiple steps that could be Workflow but might be misclassified as Agentic |
| `distractor_content` | Irrelevant detail overwhelms the real classification signal |
| `contradiction` | Behaviors that look like one level but are actually another |
| `escalation_pressure` | Context nudges toward over-classifying simple behaviors |
| `minimization_pressure` | Context nudges toward under-classifying complex behaviors |

## Best Practices

1. **Add adversarial rounds early** -- don't wait until the prompt is "done" to stress-test it
2. **Keep noise realistic** -- adversarial context should resemble real-world input, not gibberish
3. **Target known confusion pairs** -- design noise that exploits specific label confusions
4. **Document what each round tests** in `program.md` so the agent understands the threat model
5. **Update adversarial rounds** as the prompt improves -- old noise may become too easy
6. **Use the 10% drop rule** -- any improvement that drops more than 10% under noise is fragile
7. **Track per-round scores separately** in `leaderboard.md` for full observability
8. **Combine layers** -- adversarial corpus items + adversarial noise rounds together are more powerful than either alone
9. **Use autoresearch:scenario** to generate adversarial tasks systematically rather than only hand-crafting them
10. **Tag adversarial techniques** in `catalog.json` so you can analyze which techniques are most effective at breaking the treatment
