#!/usr/bin/env bash
# ideas-index.sh — Extract frontmatter from all ideas/*.md as a compact index
#
# Output: one block per idea with all frontmatter fields, separated by ---
# Usage: ./scripts/ideas-index.sh
#        ./scripts/ideas-index.sh --tsv   # tab-separated one-liner per idea

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IDEAS_DIR="$SCRIPT_DIR/../ideas"

if [[ "${1:-}" == "--tsv" ]]; then
  echo -e "id\tstatus\teffort\texpected_impact\ttargets\tconfusion_pairs\tchange_type\trisk"
  for f in "$IDEAS_DIR"/*.md; do
    [[ "$(basename "$f")" == "README.md" ]] && continue
    # Extract YAML frontmatter between --- markers
    awk '/^---$/{n++; next} n==1{print}' "$f" | while IFS= read -r line; do
      echo "$line"
    done | {
      id=""; status=""; effort=""; impact=""; targets=""; pairs=""; ctype=""; risk=""
      while IFS= read -r line; do
        case "$line" in
          id:*) id="${line#id: }" ;;
          status:*) status="${line#status: }" ;;
          effort:*) effort="${line#effort: }" ;;
          expected_impact:*) impact="${line#expected_impact: }" ;;
          change_type:*) ctype="${line#change_type: }" ;;
          risk:*) risk="${line#risk: }" ;;
          *"- "*)
            val="${line#*- }"
            if [[ -n "$_in_targets" ]]; then targets="$targets,$val"
            elif [[ -n "$_in_pairs" ]]; then pairs="$pairs,$val"
            fi
            ;;
          targets:*) _in_targets=1; _in_pairs="" ;;
          confusion_pairs:*) _in_pairs=1; _in_targets="" ;;
          *) _in_targets=""; _in_pairs="" ;;
        esac
      done
      targets="${targets#,}"
      pairs="${pairs#,}"
      echo -e "${id}\t${status}\t${effort}\t${impact}\t${targets}\t${pairs}\t${ctype}\t${risk}"
    }
  done
else
  for f in "$IDEAS_DIR"/*.md; do
    [[ "$(basename "$f")" == "README.md" ]] && continue
    echo "--- $(basename "$f" .md) ---"
    awk '/^---$/{n++; next} n==1{print}' "$f"
    echo ""
  done
fi
