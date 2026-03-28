---
id: O1
name: "Needs real module wiring"
direction: over
predicted: Integration
ground_truth: Unit
weight: 1
confusion_pair: Unit-Integration
description: Model adds unnecessary Integration infrastructure when the behavior is testable at a single function boundary. Over-cautious — "a pure Unit test could miss an edge case."
---
EC-01 b3: "Testing config merge logic... This is pure in-process logic with no I/O" — correctly described as Unit logic but classified Integration anyway
EC-03 b1: "The failure mode is a logic/categorization error... A pure in-process mock with controlled git output is sufficient" — then classified Integration
EC-05 b1: "Pure function boundary test" — predicted Integration
EC-07 b1: "Data aggregation logic" — predicted Integration
EC-09 b2: "Plugin discovery logic" — predicted Integration
EC-15 b1: "Embedding generation is a pure function" — predicted Integration
EC-22 b3: "Configuration validation" — predicted Integration
EC-22 b4: "Schema validation logic" — predicted System
EC-28 b2: "String processing logic" — predicted Integration
EC-28 b3: "Format conversion" — predicted Integration
EC-28 b8: "Template rendering" — predicted Integration
[run5] EC-08 b7 (Integration→Unit): "FIFO ordering under concurrent async execution — Unit test with deterministic mocks might not expose ordering bugs."
[run5] EC-09 b1 (Integration→Unit): "Code execution despite invalid manifest — Unit-level test would not catch a real bug where the loader is wired."
[run5] EC-18 b4 (Integration→Unit): "Error handling and counting must work correctly under real pipeline conditions."
[run5] EC-19 b4 (Integration→Unit): "Loop control logic and response structure — both deterministic. Mock the LLM to return failing code."
[run5] EC-22 b2 (Integration→Unit): "Freshness rule calculation: deterministic, but model adds 'real failure boundaries include freshness rule read from wrong place'."
[run5] EC-24 b4 (Integration→Unit): "Edit distance computation is pure function (Unit), but model requires real storage wiring."
[run5] EC-25 b1 (Integration→Unit): "Threshold check logic is pure — model adds 'must load actual config from real DB' concern."
[run5] EC-25 b3 (Integration→Unit): "Time window boundary logic — model requires 'real database with real timestamps'."
[run5] EC-25 b5 (Integration→Unit): "Output structure — model requires 'real models' to catch serialization bugs."
[run5] EC-27 b5 (Integration→Unit): "Route deduplication consolidation: (1) duplicates consolidated (Unit-testable), (2) final route visits consolidated stops (model adds Integration need)."
[run5] EC-28 b8 (Integration→Unit): "Dependency-tracking and recalculation mechanism — model says 'single evaluation wouldn't catch ordering bugs'."
