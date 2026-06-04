#!/usr/bin/env bash
# sync-content.sh — copy the canonical needs-analysis artifact markdown from the
# Cowork workspace (the source of truth you edit) into this repo's build-input
# folder, which the artifact pages import via Vite `?raw`.
#
#   Canonical (edit here):   ~/My Drive/.../008c_needs-analysis/008c_*.md
#   Build input (generated): claude-code/needs-analysis-content/0X_*.md
#
# Workflow: edit the canonical files -> run this script -> commit the updated
# copies -> push (Cloudflare builds from the committed copies). This is a LOCAL
# pre-commit step; do NOT wire it into `npm run build` — Cloudflare has no access
# to your Drive and the build would fail.
set -euo pipefail

SRC="$HOME/My Drive/02_professional/00_independent-work/01_personal-website/008_I-built-an-AI-course/008c_needs-analysis"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/needs-analysis-content" && pwd)"

if [ ! -d "$SRC" ]; then
  echo "ERROR: canonical source not found at:" >&2
  echo "  $SRC" >&2
  echo "Is your Drive mounted/synced? Aborting without changes." >&2
  exit 1
fi

copy() { cp "$SRC/$1" "$DEST/$2"; echo "  $1  ->  needs-analysis-content/$2"; }

echo "Syncing needs-analysis artifacts (Cowork canonical -> repo build input):"
copy "008c_executive-problem-statement.md" "01_executive-problem-statement.md"
copy "008c_capability-gap-analysis.md"     "02_capability-gap-analysis.md"
copy "008c_learner-persona.md"             "03_learner-persona.md"
copy "008c_action-map.md"                  "04_action-map.md"
echo "Done. Review 'git diff', commit, and rebuild."
