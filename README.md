# kaizen-autoresearch

Autonomous prompt research for [kaizen](https://github.com/Garsson-io/kaizen) experiments.

Each experiment lives in `experiments/<name>/` and follows the autoresearch loop:
edit a prompt → measure a score → keep if improved → repeat.

## Experiments

| Experiment | Status | Best score | Description |
|------------|--------|------------|-------------|
| [write-test-plan](experiments/write-test-plan/) | active | 72.3% | Does prompt guidance improve minimum-level test classification? |

## How autoresearch works

Inspired by Karpathy's nanoGPT research loop:

1. **Edit** one file (`prompts/treatment.md`)
2. **Measure** — run `./run-eval.sh`, read the `SCORE:` line
3. **Keep** if score improved, **revert** if not
4. **Commit** with score in message, update leaderboard
5. **Repeat**

The `program.md` in each experiment folder is the agent's operating manual.
Run it with:
```bash
cd experiments/<name>
claude -p --dangerously-skip-permissions < program.md
```

## Setup

```bash
npm install
```
