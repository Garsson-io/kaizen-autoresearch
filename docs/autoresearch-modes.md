# Autoresearch Modes Reference

Overview of all autoresearch modes and how they apply to experiment development and adversarial training.

## Core Loop: /autoresearch

The main iteration loop. Modify -> Verify -> Keep/Discard -> Repeat.

```
/autoresearch
Goal: Maximize test level classification accuracy >= 75
Scope: experiments/<name>/prompts/treatment.md
Metric: Weighted average score 0-100 (higher is better)
Verify: npx tsx experiments/<name>/scripts/verify.ts | jq '.score'
```

**Key config fields:**
- **Goal**: What to optimize (measurable)
- **Scope**: File globs the loop can modify
- **Metric**: What the score represents, with direction
- **Verify**: Shell command that outputs a number
- **Guard** (optional): Command that must always pass (regression prevention)
- **Iterations** (optional): Stop after N iterations (default: unlimited)

**Loop phases:**
1. Review -- read state, git history, results log
2. Ideate -- pick next change based on patterns
3. Modify -- one atomic change
4. Commit -- before verification (enables clean rollback)
5. Verify -- run the metric command
6. Guard -- regression check (if configured)
7. Decide -- keep (improved) or discard (same/worse)
8. Log -- append to results TSV
9. Repeat

## /autoresearch:plan -- Goal to Config Wizard

Converts a plain-language goal into a validated autoresearch configuration.

```
/autoresearch:plan
Goal: Make the API respond faster
```

Walks through: Goal -> Scope -> Metric -> Direction -> Verify command (with dry-run validation).

**Use when:** Starting a new experiment and unsure how to configure the loop.

## /autoresearch:scenario -- Edge Case Generator

Generates situations, edge cases, and failure modes from a seed scenario.

```
/autoresearch:scenario
Scenario: Classify software behaviors by minimum test level
Domain: software
Focus: edge-cases
Depth: deep
Iterations: 30
```

**12 exploration dimensions:** happy path, error path, edge case, abuse/misuse, scale, concurrent, temporal, data variation, permission, integration, recovery, state transition.

**Use for experiments:**
- Generating new adversarial corpus items
- Discovering edge cases in your classification labels
- Stress-testing a feature before writing corpus tasks

## /autoresearch:predict -- Multi-Persona Analysis

3-5 expert personas independently analyze, debate, and reach consensus.

### Default personas
Architect, Security Analyst, Performance Engineer, Reliability Engineer, Devil's Advocate.

### Adversarial personas (--adversarial flag)
Red Team Attacker, Blue Team Defender, Insider Threat, Supply Chain Analyst, Judge.

```
/autoresearch:predict --adversarial
Scope: experiments/<name>/prompts/treatment.md
Goal: Find weaknesses in the classification prompt
```

**Use for experiments:**
- Red-teaming your prompt before shipping
- Finding systematic biases in model behavior
- Discovering inputs that reliably cause misclassification

## /autoresearch:security -- Security Audit

STRIDE threat model + OWASP Top 10 + 4 adversarial personas.

```
/autoresearch:security
Scope: experiments/<name>/scripts/**
Focus: scoring pipeline integrity
Iterations: 10
```

**Use for experiments:**
- Auditing the eval pipeline (can the prompt game the scorer?)
- Checking for data leakage between corpus and treatment
- Validating that scoring is tamper-resistant

## /autoresearch:debug -- Bug Hunting

Scientific method + iterative investigation to find all bugs.

```
/autoresearch:debug
Scope: experiments/<name>/scripts/
Issue: Score drops by 15% between rounds 1 and 2
```

**Use for experiments:**
- Diagnosing why specific tasks score low
- Finding bugs in the scoring pipeline
- Investigating unexpected score regressions

## /autoresearch:fix -- Error Repair

Iteratively repairs errors until zero remain.

```
/autoresearch:fix
Scope: experiments/<name>/scripts/
Target: TypeScript compilation errors
```

**Use for experiments:**
- Fixing broken eval scripts after modifications
- Resolving Zod validation failures

## /autoresearch:learn -- Documentation Engine

Scouts codebase, learns patterns, generates documentation.

```
/autoresearch:learn --mode init
Scope: experiments/<name>/
```

**Use for experiments:**
- Generating documentation for a new experiment
- Updating docs after significant changes

## /autoresearch:ship -- Shipping Workflow

Structured 8-phase workflow for shipping artifacts.

```
/autoresearch:ship
Target: experiments/<name>/
Type: code-pr
```

**Use for experiments:**
- Shipping experiment results as PRs
- Pre-deployment checklist for experiment changes

## Combining Modes for Experiment Development

### New Experiment Setup
```
/autoresearch:plan          # Define config
/autoresearch:scenario      # Generate corpus ideas
/autoresearch:predict       # Pre-analyze the task space
/autoresearch               # Run the optimization loop
```

### Adversarial Hardening
```
/autoresearch:scenario --focus edge-cases     # Generate adversarial tasks
/autoresearch:predict --adversarial           # Red-team the prompt
/autoresearch                                 # Optimize against adversarial rounds
```

### Debugging a Stuck Experiment
```
/autoresearch:debug         # Find the root cause
/autoresearch:predict       # Get multi-perspective analysis
/autoresearch               # Resume iteration with new insights
```

### Chaining (--chain flag on predict)
```
# Predict analyzes, then hands off to debug automatically
/autoresearch:predict --chain debug
Scope: experiments/<name>/scripts/
Goal: Why does EC-04 always score low?

# Full pipeline: predict -> scenario -> debug -> fix
/autoresearch:predict --chain scenario,debug,fix
Scope: experiments/<name>/
Goal: Full quality pipeline for experiment
```
