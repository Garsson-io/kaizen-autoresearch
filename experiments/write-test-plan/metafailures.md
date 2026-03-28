# Metafailures — process mistakes and lessons learned

Failures in HOW we run the loop, not in the prompt itself.

---

### M1: Replaced a working section instead of adding alongside it

**When**: Run 2, challenge-your-choice iteration
**What happened**: Replaced SELF-CHECK with adversarial challenge — two changes in one (removal + addition). Score dropped -4.3. Can't tell if the removal hurt or the addition hurt.
**Rule added**: Be explicit about add vs replace. "Replace A with B" is valid but must be a conscious choice, not accidental.

### M2: Reverted a no-op as if it were a regression

**When**: Run 2, swap-question-order-only iteration
**What happened**: Score was 89.4 vs baseline 89.5 (delta -0.1). Reverted as "discard" when this is clearly within noise (threshold is ±1.5).
**What it actually showed**: Rearranging bullets gives nearly identical results. This is POSITIVE evidence — it confirms measurement stability. Same prompt, different bullet order → same score (within 0.1%). The eval is reproducible.
**Rule added**: See no-op policy below.

### M3: Skipped mining prose before picking next idea

**When**: Multiple times in run 1 and early run 2
**What happened**: Jumped from score result straight to picking the next idea without extracting justifications and updating taxonomy. Led to repeating failed approaches and guessing instead of using evidence.
**Rule added**: Mining is MANDATORY step 1 of every loop iteration. Documented in program.md.

---

## No-op policy

When a change produces a score delta within the noise threshold (±1.5):

**Revert.** Rationale:
- The change had no measurable effect — keeping it adds complexity for zero benefit
- A simpler prompt is always preferred (haiku performs worse with more text)
- The prompt's git history stays clean — only changes with demonstrated impact survive
- The run data IS kept (committed in runs/) so the evidence is preserved regardless

**But log it as `no-op`, not `discard`.** A discard means "this hurt." A no-op means "this had no effect." The distinction matters for the taxonomy — a no-op idea might work combined with something else, while a discarded idea actively made things worse.

## Measurement stability evidence

| Run | Prompt change | Score | Delta |
|-----|--------------|-------|-------|
| Baseline (run3) | none | 89.5 | — |
| swap-question-order | reorder 2 bullets, zero text change | 89.4 | -0.1 |

Delta of 0.1% on a cosmetic-only change confirms the eval is stable. Noise floor is approximately ±1%.
