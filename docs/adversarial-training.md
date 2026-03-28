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

For a concrete example, see `experiments/write-test-plan/run-eval.sh` which implements 3 rounds (neutral, unit-anchoring, fast-tests pressure) and `experiments/write-test-plan/program.md` which documents what each round tests.

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

Three autoresearch modes are particularly useful for adversarial testing. See [autoresearch-modes.md](autoresearch-modes.md) for full usage, flags, and persona details.

- **`/autoresearch:scenario`** -- Systematically explore 12 edge-case dimensions to generate adversarial corpus items
- **`/autoresearch:predict --adversarial`** -- Red-team your prompt with 5 adversarial personas (attacker, defender, insider, supply chain, judge)
- **`/autoresearch:security`** -- Audit the eval pipeline itself for ways scoring could be gamed

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

## Generating Adversarial Tasks with /autoresearch:scenario

Use scenario mode to systematically generate adversarial corpus items. The workflow:

1. **Seed**: Run `/autoresearch:scenario` with your classification confusion pairs as the scenario
2. **Review**: Check generated situations across the 12 exploration dimensions
3. **Convert**: Turn promising scenarios into corpus `.md` + ground-truth `.json` + `catalog.json` entry
4. **Validate**: Run `/autoresearch:predict --adversarial` on new tasks — if the model gets everything right, it's not adversarial enough

For mode usage details and flags, see [autoresearch-modes.md](autoresearch-modes.md). For corpus file formats, see [creating-experiments.md](creating-experiments.md#2-create-the-corpus). For realism constraints when generating tasks, see [generating-realistic-adversarial-examples.md](generating-realistic-adversarial-examples.md).

## Task Organization and Catalog

For corpus directory structure, catalog.json format, and how to add new tasks, see [creating-experiments.md](creating-experiments.md#2-create-the-corpus).

### Adversarial Technique Tags

Tag each adversarial task in `catalog.json` so you can track which techniques are effective:

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
