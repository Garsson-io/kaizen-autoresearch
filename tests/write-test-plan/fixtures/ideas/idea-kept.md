---
id: mock-exposes-nothing
title: Add mock-exposes-nothing question before Agentic check
status: kept
effort: S
expected_impact: M
targets:
  - Unit→Integration under-prediction
confusion_pairs:
  - Unit/Integration
change_type: add-question
risk: May push borderline Unit→Integration cases to over-predict
---

## Summary

Add a diagnostic question asking whether a mock would hide the real failure,
placed before the Agentic check to catch Unit/Integration confusions early.
