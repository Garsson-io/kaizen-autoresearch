# Ideas

Each `.md` file is one prompt-improvement hypothesis with frontmatter metadata.

## Frontmatter Schema

```yaml
---
id: short-kebab-case-identifier
title: Human-readable title
status: proposed | trying | kept | rejected | parked
effort: low | medium | high          # how much the prompt changes
expected_impact: low | medium | high  # expected score delta
targets:                              # which failure modes it addresses
  - agentic_underprediction
  - workflow_gap
  - unit_overprediction
confusion_pairs:                      # which label boundaries it targets
  - System-Agentic
  - Agentic-Workflow
  - Unit-Integration
change_type: structural | representational | framing | meta-cognitive | ensemble
risk: What could go wrong (one sentence)
prereqs: What must be true for this to work (one sentence, or null)
related: [other-idea-id, ...]
---
```

### Field Definitions

| Field | Description |
|-------|-------------|
| `status` | `proposed` = untested idea. `trying` = currently being evaluated. `kept` = tried and improved score. `rejected` = tried and didn't help. `parked` = interesting but not worth trying now. |
| `effort` | `low` = change a few words/reorder. `medium` = restructure a section. `high` = rewrite the prompt or change the eval pipeline. |
| `targets` | Failure modes from `leaderboard.md`: `agentic_underprediction`, `workflow_gap`, `unit_overprediction`, `consistency_failures`, `noise_sensitivity`. |
| `confusion_pairs` | The specific label boundaries this idea targets. |
| `change_type` | `structural` = reorder/restructure. `representational` = change how levels are described. `framing` = change the task framing. `meta-cognitive` = add self-check/reasoning steps. `ensemble` = run multiple variants. |

## How to Use

1. Read all ideas before starting an autoresearch loop
2. Update `status` after each attempt
3. One idea per iteration (atomic)
