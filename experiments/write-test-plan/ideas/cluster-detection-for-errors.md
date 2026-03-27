---
id: cluster-detection-for-errors
title: Post-hoc error clustering — find categories of misclassification, fix categories not instances
status: proposed
effort: medium
expected_impact: high
targets:
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: meta-cognitive
risk: This is a diagnostic approach, not a prompt change — the insights still need to be translated into prompt edits
prereqs: At least 1 full corpus run with justification fields populated
related: [failure-mode-taxonomy, solution-collapse-prevention]
---

*Source: Garsson-io/kaizen#960 — "recognize when individual issues are symptoms of a systemic gap requiring meta-level prevention"*

## Steelman

Issue #960 identifies the most leveraged insight in the kaizen system: don't fix instances — fix categories. Applied to our experiment: don't fix individual misclassifications — find the category of misclassification and fix the category.

The current diagnostic approach looks at individual behaviors: "EC-04 behavior 3 was predicted System instead of Agentic." But #960's insight is that individual failures cluster: "ALL behaviors involving AI APIs are predicted System — that's a category, not an incident."

Process:
1. Run full corpus eval
2. Extract all misclassifications with their justifications
3. Cluster by reasoning pattern (not by task or behavior)
4. For each cluster, ask: "what single prompt change prevents this entire category?"

Example clusters we'd expect to find:
- **Cluster A**: "External API → System" (affects EC-04, EC-13, EC-14, EC-15, EC-21, EC-23, EC-24, EC-25, EC-29, EC-30). Category fix: better Agentic definition.
- **Cluster B**: "Complex logic → Integration" (affects EC-22, EC-26, EC-27, EC-28). Category fix: escalation-trap prevention.
- **Cluster C**: "Multi-step → Agentic not Workflow" (affects EC-07, EC-10, EC-14, EC-17, EC-19, EC-23). Category fix: Workflow definition.

The #960 insight: "What single category-level test would prevent this entire category from recurring?" Applied here: "What single prompt change would fix all 10 Agentic misclassifications at once?"

This is not a prompt change itself — it's a diagnostic methodology that makes every other idea more targeted. Instead of guessing which idea to try, you cluster the errors, identify the dominant category, and apply the idea that targets that specific category.

## Scathing Critique

This is a process improvement, not an idea for the `ideas/` folder. It describes HOW to diagnose, not WHAT to change in the prompt. The autoresearch loop already does this implicitly: the agent reads leaderboard.md, reads the failure analysis, and picks changes targeting the dominant failure mode. Formalizing it as "cluster detection" adds ceremony without adding insight.

Also, the clusters are already known. The leaderboard says: "Primary failure: Agentic almost never predicted. Secondary: Workflow gap." We don't need a clustering algorithm to discover this — one eval run + the score breakdown makes it obvious. The bottleneck is not "which category of error is dominant?" (we know: Agentic under-prediction). The bottleneck is "what prompt change fixes it?" (we don't know: 5 autoresearch iterations tried and none worked).

The #960 approach is powerful for systems with hundreds of issues where patterns are invisible to humans. Our experiment has 30 tasks with 165 behaviors — a human can scan the score breakdown and identify clusters in 5 minutes. The diagnostic methodology doesn't need automation at this scale.

That said: the justification-taxonomy analysis (already referenced in program.md) IS this idea in practice. Reading the model's justifications and clustering them by reasoning pattern is exactly what #960 proposes. So this idea is already partially implemented — it just needs someone to actually do the analysis after the next eval run.
