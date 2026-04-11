#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
EXP_ROOT="$ROOT/experiments/write-test-plan"

patterns=(
  "$EXP_ROOT/scripts/explore.ts"
  "$EXP_ROOT/run-eval.sh"
  "$EXP_ROOT/scripts/run-probe.ts"
)

killed=0
for pattern in "${patterns[@]}"; do
  mapfile -t pids < <(pgrep -f "$pattern" || true)
  for pid in "${pids[@]}"; do
    [[ -z "$pid" ]] && continue
    [[ "$pid" == "$$" || "$pid" == "$PPID" ]] && continue
    if kill "$pid" 2>/dev/null; then
      ((killed+=1))
    fi
  done
done

# Best effort hard kill for stubborn workers.
sleep 0.5
for pattern in "${patterns[@]}"; do
  mapfile -t pids < <(pgrep -f "$pattern" || true)
  for pid in "${pids[@]}"; do
    [[ -z "$pid" ]] && continue
    [[ "$pid" == "$$" || "$pid" == "$PPID" ]] && continue
    if kill -9 "$pid" 2>/dev/null; then
      ((killed+=1))
    fi
  done
done

echo "Stopped $killed experiment process(es)."
pgrep -af "$EXP_ROOT/scripts/explore.ts|$EXP_ROOT/run-eval.sh|$EXP_ROOT/scripts/run-probe.ts" || true
