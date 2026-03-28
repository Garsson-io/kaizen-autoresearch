#!/usr/bin/env bash
# run.sh — Run any experiment script from anywhere.
# Resolves to the experiment directory so tsx imports work correctly.
#
# Usage (from repo root or anywhere):
#   experiments/write-test-plan/scripts/run.sh results.ts --last 5
#   experiments/write-test-plan/scripts/run.sh ideas-index.ts --table
#   experiments/write-test-plan/scripts/run.sh run-stats.ts --all
#   experiments/write-test-plan/scripts/run.sh verify.ts --mock 0.75

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <script.ts> [args...]" >&2
  exit 1
fi

SCRIPT_NAME="$1"
shift

cd "$EXP_DIR" && exec npx tsx "scripts/$SCRIPT_NAME" "$@"
