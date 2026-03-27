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
