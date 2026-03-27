---
id: O2
name: "Needs real external service"
direction: over
predicted: System
ground_truth: Integration
weight: 2
confusion_pair: Integration-System
description: Model claims real HTTP/subprocess/OS is needed when local module wiring suffices.
---
EC-06 b2: "The behavior explicitly references 'the underlying platform emits more than one creation event', indicating the failure involves real OS file-watching behavior." — GT says Integration dedup logic is testable without real OS events
EC-08 b4: "Quota sharing under concurrency requires actual concurrent execution... Integration testing with actual Promise.all() reveals whether the quota tracking is truly atomic." — GT says Integration
EC-15 b5: "Workflow-level testing needed for search re-ranking" — predicted Workflow, GT is System (over by 2 levels)
EC-22 b4: "Schema validation needs real external service" — GT says Integration
