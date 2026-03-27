#!/usr/bin/env bash
# run-eval.sh — Run all corpus tasks for a given prompt and score them.
#
# Usage:
#   ./run-eval.sh                          # runs treatment prompt (default)
#   ./run-eval.sh --prompt prompts/baseline.md
#   ./run-eval.sh --condition baseline     # uses built-in baseline prompt
#   ./run-eval.sh --model claude-haiku-4-5-20251001
#
# Outputs: writes JSON probe outputs to runs/latest/, scores them, prints avg.
# The final line of output is: "SCORE: <0.0-1.0>" (machine-readable for agents).

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Defaults
PROMPT_FILE="$SCRIPT_DIR/prompts/treatment.md"
CONDITION="treatment"
MODEL="claude-haiku-4-5-20251001"
OUT_DIR="$SCRIPT_DIR/runs/latest"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt) PROMPT_FILE="$2"; shift 2 ;;
    --condition) CONDITION="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    --out-dir) OUT_DIR="$2"; shift 2 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$OUT_DIR"

CORPUS=("ec-04" "ec-07" "ec-09")
GT_DIR="$SCRIPT_DIR/ground-truth"
CORPUS_DIR="$SCRIPT_DIR/corpus"

echo "=== run-eval: condition=$CONDITION model=$MODEL ==="
echo "prompt: ${PROMPT_FILE:-built-in $CONDITION}"
echo ""

for task_lower in "${CORPUS[@]}"; do
  task_upper="${task_lower^^}"          # ec-04 → EC-04
  task_upper="${task_upper/EC-/EC-}"   # ensure hyphen kept
  out_file="$OUT_DIR/out-${CONDITION}-${task_lower//-/}.json"
  issue_file="$CORPUS_DIR/${task_lower}.md"

  echo -n "  Running $task_upper/$CONDITION ... "

  extra_args=()
  if [[ -n "$PROMPT_FILE" && "$CONDITION" == "treatment" ]]; then
    extra_args+=(--prompt-file "$PROMPT_FILE")
  fi

  npx tsx "$SCRIPT_DIR/scripts/run-probe.ts" \
    --task "$task_upper" \
    --condition "$CONDITION" \
    --issue-file "$issue_file" \
    --model "$MODEL" \
    --out "$out_file" \
    "${extra_args[@]}"
done

echo ""
echo "=== Scoring ==="
npx tsx "$SCRIPT_DIR/scripts/score.ts" \
  --output-dir "$OUT_DIR" \
  --gt-dir "$GT_DIR"

# Extract the avg total line and emit machine-readable SCORE
AVG=$(npx tsx "$SCRIPT_DIR/scripts/score.ts" \
  --output-dir "$OUT_DIR" \
  --gt-dir "$GT_DIR" 2>/dev/null \
  | grep "Avg total" | grep -oP '[0-9]+\.[0-9]+' | head -1)

if [[ -n "$AVG" ]]; then
  # Convert percent (e.g. 72.3) to fraction (0.723)
  SCORE=$(echo "scale=4; $AVG / 100" | bc)
  echo ""
  echo "SCORE: $SCORE"
fi
