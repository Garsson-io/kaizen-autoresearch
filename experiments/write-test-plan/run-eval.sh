#!/usr/bin/env bash
# run-eval.sh — Run corpus tasks for a given prompt and score them.
#
# Usage:
#   ./run-eval.sh                                    # treatment prompt, round 1 (neutral)
#   ./run-eval.sh --condition baseline               # built-in baseline prompt
#   ./run-eval.sh --prompt prompts/treatment-l12.md  # custom prompt file
#   ./run-eval.sh --round 2                          # round 2: unit-test anchoring noise
#   ./run-eval.sh --round 3                          # round 3: "fast tests" + deferral noise
#   ./run-eval.sh --corpus ec-04,ec-07,ec-09,ec-10   # specific tasks (default: core set)
#   ./run-eval.sh --model claude-haiku-4-5-20251001
#
# Final line of output: "SCORE: <0.0-1.0>" (machine-readable for agents)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Defaults
PROMPT_FILE="$SCRIPT_DIR/prompts/treatment.md"
CONDITION="treatment"
MODEL="claude-haiku-4-5-20251001"
ROUND=1
OUT_DIR="$SCRIPT_DIR/runs/latest"
# Core corpus: covers all 5 levels (Unit, Integration, System, Agentic, Workflow)
CORPUS_CSV="ec-04,ec-07,ec-09,ec-10"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt)    PROMPT_FILE="$2";  shift 2 ;;
    --condition) CONDITION="$2";    shift 2 ;;
    --model)     MODEL="$2";        shift 2 ;;
    --round)     ROUND="$2";        shift 2 ;;
    --out-dir)   OUT_DIR="$2";      shift 2 ;;
    --corpus)    CORPUS_CSV="$2";   shift 2 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

IFS=',' read -ra CORPUS <<< "$CORPUS_CSV"
mkdir -p "$OUT_DIR"

GT_DIR="$SCRIPT_DIR/ground-truth"
CORPUS_DIR="$SCRIPT_DIR/corpus"

# Adversarial noise prefixes (appended to issue body)
ROUND2_NOISE="

---
Note: This module already has unit tests in the \`tests/\` directory. The team has
an established test suite; new behaviors should follow the existing unit-test patterns."

ROUND3_NOISE="

---
Note: Full integration or end-to-end coverage for this component is tracked as a
follow-up. For this sprint, the team prefers fast, local tests that can run in CI
without external dependencies. Implementation uses straightforward adapter patterns."

echo "=== run-eval: condition=$CONDITION round=$ROUND model=$MODEL ==="
echo "corpus: ${CORPUS[*]}"
if [[ "$CONDITION" == "treatment" ]]; then
  echo "prompt: $PROMPT_FILE"
fi
echo ""

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

for task_lower in "${CORPUS[@]}"; do
  task_upper="${task_lower^^}"
  out_file="$OUT_DIR/out-${CONDITION}-${task_lower//-/}.json"
  issue_file="$CORPUS_DIR/${task_lower}.md"

  # Apply adversarial noise for rounds 2/3
  augmented="$TMPDIR/${task_lower}.md"
  cp "$issue_file" "$augmented"
  if [[ "$ROUND" == "2" ]]; then
    printf '%s' "$ROUND2_NOISE" >> "$augmented"
  elif [[ "$ROUND" == "3" ]]; then
    printf '%s' "$ROUND3_NOISE" >> "$augmented"
  fi

  echo -n "  $task_upper/$CONDITION r$ROUND ... "

  extra_args=()
  if [[ "$CONDITION" == "treatment" ]]; then
    extra_args+=(--prompt-file "$PROMPT_FILE")
  fi

  npx tsx "$SCRIPT_DIR/scripts/run-probe.ts" \
    --task "$task_upper" \
    --condition "$CONDITION" \
    --issue-file "$augmented" \
    --model "$MODEL" \
    --out "$out_file" \
    "${extra_args[@]}"
done

echo ""
echo "=== Scoring ==="
npx tsx "$SCRIPT_DIR/scripts/score.ts" \
  --output-dir "$OUT_DIR" \
  --gt-dir "$GT_DIR"

# Extract avg total and emit SCORE: fraction
AVG_LINE=$(npx tsx "$SCRIPT_DIR/scripts/score.ts" \
  --output-dir "$OUT_DIR" \
  --gt-dir "$GT_DIR" 2>/dev/null \
  | grep "TOTAL" | tail -1)

AVG=$(echo "$AVG_LINE" | grep -oP '[0-9]+\.[0-9]+' | head -1)
if [[ -n "$AVG" ]]; then
  SCORE=$(echo "scale=4; $AVG / 100" | bc)
  echo ""
  echo "SCORE: $SCORE"
fi
