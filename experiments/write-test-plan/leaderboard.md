# Write-Test-Plan Leaderboard

For failure analysis see [justification-taxonomy.md](justification-taxonomy.md). For fix candidates see [ideas/](ideas/). For autoresearch config see [program.md](program.md).

---

## Iteration history

| # | Condition | Score (r1) | r2 | r3 | Δ | Commit | Change |
|---|-----------|-----------|----|----|---|--------|--------|
| 0 | baseline | 72.3%* | — | — | — | — | built-in, no guidance |
| 1 | treatment | 66.4%* | — | — | −5.9% | — | level defs + key questions (worse!) |
| — | treatment-l12 | 71.2%† | — | — | −10.5% | — | L12 → 5-step: over-predicts System, still misses Agentic — worse |
| 1b | treatment | **81.7%†** | — | — | — | dd30e90 | 4-task re-run after pipeline fix; EC-04 Agentic still primary miss |
| 2 | treatment | **87.2%‡** | — | — | — | 53ca886 | 10-task baseline (first full corpus run) |

*3-task corpus (EC-04, EC-07, EC-09).
†4-task core corpus (EC-04, EC-07, EC-09, EC-10). Pipeline bug fixed.
‡10-task full corpus (EC-01 through EC-10).

**[Autoresearch run 1 report](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1#discussioncomment-16346829)** — 5 iterations, 0 keeps, baseline 87.2‡. All changes hurt. Prompt is a local optimum for haiku.

---

**GT revision** (2026-03-27): Corrected 5 behaviors where GT was Integration but model correctly identified as Unit (EC-18 b1/b2/b3, EC-25 b4/b5). Pure algorithmic operations (trace ID grouping, timestamp sorting, p99 computation, boolean OR gate, output formatting) are Unit-testable — no module wiring needed. Scores below this line use revised GT and are not comparable to scores above.

| # | Condition | Loss | Score (r1) | Δ loss | Commit | Change |
|---|-----------|------|-----------|--------|--------|--------|
| 3 | treatment | — | **91.0%§** | — | — | re-scored existing run 2 outputs against revised GT |
| 15 | treatment | **454.16** | 86.4% | — | — | loss baseline — first run with calibrated probabilities |
| 16 | treatment | **447.92** | 84.4% | **-6.24** | 23e85af | variance-probe-question: 100-runs thought experiment under LLM-DEP |
| 19 | treatment | **368.08** | 88.0% | **-79.84** | a846ccc | concrete-agentic-example: expand Agentic def with AI/ML examples |

§30-task full corpus (EC-01 through EC-30), revised GT. Loss available from iteration 15+.

---

## Historical score breakdowns

Detailed per-task breakdowns for iterations 0, 1, l12, and 1b are preserved in git history (commit 757f0d6). Run `git show 757f0d6:experiments/write-test-plan/leaderboard.md` to view them.
