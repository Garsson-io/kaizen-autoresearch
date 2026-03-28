---
id: unit-algo-parenthetical
title: Add parenthetical to Unit definition — "algorithm testable by passing data as arguments"
status: trying
effort: low
expected_impact: high
targets:
  - unit_overprediction
confusion_pairs:
  - Integration-Unit
change_type: representational
risk: Could worsen U2 (Unit→Integration under-prediction, 17 cases) if model over-applies "pass data as arguments" to legitimate wiring behaviors
prereqs: null
related: [concrete-agentic-example, variance-probe-question]
---

## Steelman

EC-30 alone contributes 67.98 loss (18% of total) with 6 O1 (Integration→Unit) errors. The model's justification is consistent: "real failure is whether data is actually loaded from storage" → upgrades to Integration. But the GT behaviors are pure algorithms (sort, filter, deduplicate) that can be tested by passing mock data as arguments.

The concrete-agentic-example change (adding "(e.g., classification, scoring, generation APIs)" to Agentic) produced -79.84 loss. Same pattern: small parenthetical clarifying what counts as a level.

**Current Unit definition:**
```
Unit — one local function or object boundary, no I/O
```

The model reads "no I/O" and then thinks: "but the real behavior reads from a DB, so that's I/O, so it's Integration." The parenthetical corrects this:

**Proposed addition:**
```
Unit — one local function or object boundary, no I/O (if the algorithm can be tested by passing data as arguments, it's Unit even if prod reads from DB)
```

This directly tells the model: data-origin (DB, file, API) is irrelevant if the algorithm under test accepts data as input parameters. EC-30 b1 ("filter by availability") is Unit because you can pass a mock availability list. EC-30 b2 ("apply user settings") is Unit because you can pass mock settings.

## Scathing Critique

U2 (Unit→Integration under-prediction, 17 cases, impact 34) is larger than O1 (22 cases, impact 22). If this parenthetical causes the model to start calling legitimate Integration behaviors "Unit because I can mock the input data," U2 gets worse and we lose more than we gain.

The parenthetical says "testable by passing data as arguments" — but almost ANY behavior can be tested this way with enough mocking. EC-02 b1 (webhook signature validation) could be described as "pass a raw body and a signature as arguments." The model might apply the parenthetical to integration-wiring behaviors incorrectly.

Also, the O1 cases in EC-04 b1/b2 (taxonomy list in API request, out-of-taxonomy handling) are NOT pure algorithms — they test module coordination between classifier, API client, and taxonomy validator. The parenthetical might not fix those and could actually make things worse.

One data point (concrete-agentic-example) is not yet a confirmed pattern. It could have worked for reasons specific to Agentic definitions (which are inherently fuzzy) that don't apply to Unit definitions (which are more precise).
