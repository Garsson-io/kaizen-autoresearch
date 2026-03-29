# Write-Test-Plan Leaderboard

For failure analysis see [justification-taxonomy.md](justification-taxonomy.md). For fix candidates see [ideas/](ideas/). For autoresearch config see [program.md](program.md).

---

## Iteration history

> **Legacy metric**: Iterations 0–2 used score % (higher = better) before loss tracking was introduced. The second table (iteration 15+) uses weighted cross-entropy loss (lower = better) which is the current primary metric.

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
| 20 | treatment | 495.25 | 84.6% | +127.17 | — | unit-algo-parenthetical: add algorithm parenthetical to Unit def — massive U2 over-trigger, REVERTED |

§30-task full corpus (EC-01 through EC-30), revised GT. Loss available from iteration 15+.

---

**Sonnet model transfer** (2026-03-29): Switched to claude-sonnet-4-6 for iterations 40+. 36-task corpus.

| # | Condition | Loss | Score (r1) | Δ loss | Model | Commit | Change |
|---|-----------|------|-----------|--------|-------|--------|--------|
| 40 | treatment | **439.54** | 87.2% | — | sonnet | c32c90c | sonnet baseline — first run with claude-sonnet-4-6 |
| 41 | treatment | 459.18 | 85.7% | +19.64 | sonnet | — | integration-escape-hatch: bidirectional Integration gate — REVERTED |
| 42 | treatment | **412.48** | 87.2% | **-27.06** | sonnet | 8a1978f | reject-higher-must-justify: REJECTION-GATE forces evidence for downward override |
| 43 | treatment | **400.03** | 89.3% | **-12.45** | sonnet | 6a7f89b | infra-probe-question: Think probe + contrastive Int/Sys examples under REAL-INFRA |
| 44 | treatment | **387.39** | 89.6% | **-12.64** | sonnet | 3115841 | system-default-infra-keywords: burden-of-proof flip for System in REAL-INFRA |
| 45 | treatment | 389.68 | 90.9% | +2.29 | sonnet | — | external-command-is-system: bright-line CLI tool rule — errors ↓ but loss ↑, REVERTED |
| 46 | treatment | **384.47** | 89.0% | **-2.92** | sonnet | 89f7bed | LLM-DEP burden flip + INTEGRATION-BRAKE checkpoint |
| 47 | treatment | 416.21 | 88.2% | +31.74 | sonnet | — | remove INTEGRATION-BRAKE: massive regression, BRAKE is load-bearing — REVERTED |
| 48 | treatment | 422.92 | 89.0% | +38.45 | sonnet | — | reasoning-commitment-lock: replaced SELF-CHECK → COMMIT-TO-REASONING — REVERTED |

**Autoresearch run 5** (sonnet) — 9 iterations (iters 40–48), 4 keeps, 3 discards, 1 no-op, 1 baseline. Baseline loss 439.54 → best **384.47** (-12.5%). Biggest gain: reject-higher-must-justify (-27.06). Key findings: SELF-CHECK and INTEGRATION-BRAKE are both load-bearing (removing either causes +30-38 regression). Sonnet has Integration anchor (not Unit like Codex). Additive changes work; replacements/removals are dangerous.

**[Autoresearch run 2 report](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1#discussioncomment-16356414)** — 5 iterations, 2 keeps, baseline loss 454.16 → best 368.08 (-19%). Largest gain: concrete-agentic-example (-79.84 loss). Unit def changes cause O1/U2 explosion — avoid.

---

**[Autoresearch run 3 report](https://github.com/Garsson-io/kaizen-autoresearch/discussions/1#discussioncomment-16357640)** — 5 iterations (iters 21–25), 0 keeps, 4 discards, 1 no-op. Baseline loss held at 368.08. Key finding: **ceiling effect confirmed** — any definition addition to lower levels (Unit, System) causes model to cap there, missing higher levels. Only safe territory: Agentic/Workflow. Self-check is post-hoc (changing its direction didn't help). Explore selection bias documented. Prompt is near a local optimum; next batch should try few-shot examples or a larger model.

---

## Historical score breakdowns

Detailed per-task breakdowns for iterations 0, 1, l12, and 1b are preserved in git history (commit 757f0d6). Run `git show 757f0d6:experiments/write-test-plan/leaderboard.md` to view them.
