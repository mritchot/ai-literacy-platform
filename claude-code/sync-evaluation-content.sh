#!/usr/bin/env bash
# sync-evaluation-content.sh — copy the canonical evaluation-framework artifact
# markdown from the Cowork workspace (source of truth you edit) into this repo's
# build-input folder, which the evaluation pages import via Vite `?raw`.
#
#   Canonical (edit here):   ~/My Drive/.../008d_evaluation-framework/008d_*.md
#   Build input (generated): claude-code/evaluation-content/0X_*.md
#
# Workflow: edit canonical -> run this -> commit copies -> push (Cloudflare
# builds from the committed copies). LOCAL pre-commit step only; do NOT wire
# into `npm run build` (Cloudflare has no Drive access).
set -euo pipefail

SRC="$HOME/My Drive/02_professional/00_independent-work/01_personal-website/008_I-built-an-AI-course/008d_evaluation-framework"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/evaluation-content" && pwd)"

if [ ! -d "$SRC" ]; then
  echo "ERROR: canonical source not found at:" >&2
  echo "  $SRC" >&2
  echo "Is your Drive mounted/synced? Aborting without changes." >&2
  exit 1
fi

copy() { cp "$SRC/$1" "$DEST/$2"; echo "  $1  ->  evaluation-content/$2"; }

echo "Syncing evaluation artifacts (Cowork canonical -> repo build input):"
copy "008d_level-1-reaction.md" "01_level-1-reaction.md"
copy "008d_level-2-learning.md" "02_level-2-learning.md"
copy "008d_level-3-behavior.md" "03_level-3-behavior.md"
copy "008d_level-4-results.md"  "04_level-4-results.md"
echo "Done. Review 'git diff', commit, and rebuild."
