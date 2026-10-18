#!/usr/bin/env bash
# Runs coach-my-finances against the mock Finary MCP with a fresh headless Claude Code.
# Requires a logged-in `claude` CLI. Outputs land in evals/out/<case>.md for review
# against ../skills/coach-my-finances/test_cases.md.
#
#   bash plugins/finary-coach/evals/run-evals.sh            # all cases
#   bash plugins/finary-coach/evals/run-evals.sh us-china   # one case
set -euo pipefail

EVALS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$EVALS_DIR/../skills/coach-my-finances" && pwd)"
OUT_DIR="$EVALS_DIR/out"
CLAUDE="${CLAUDE_BIN:-claude}"
mkdir -p "$OUT_DIR"

declare -A PROMPTS=(
  [no-mcp]="Analyse mes finances."
  [beginner]="Fais un bilan complet de mes finances. J'ai 30 ans, horizon 25 ans pour la retraite, CDI, célibataire, je garde le cap si -30 %, rien hors Finary."
  [us-china]="Est-ce que je suis trop exposé aux US ? Et à la Chine ? J'ai 38 ans, horizon retraite, je ne vends pas si -30 %."
  [cto-heavy]="Je mets tout sur mon CTO, c'est bien ? J'ai 33 ans, horizon 20 ans, rien hors Finary."
)

run_case() {
  local case="$1" work
  work="$(mktemp -d)"
  mkdir -p "$work/.claude/skills"
  cp -R "$SKILL_DIR" "$work/.claude/skills/"

  local mcp_args=(--strict-mcp-config)
  if [[ -f "$EVALS_DIR/fixtures/$case.json" ]]; then
    cat > "$work/mcp.json" <<EOF
{ "mcpServers": { "finary": { "command": "node", "args": ["$EVALS_DIR/mock-finary-mcp.mjs", "$EVALS_DIR/fixtures/$case.json"] } } }
EOF
    mcp_args+=(--mcp-config "$work/mcp.json")
  fi

  echo "▶ $case"
  (cd "$work" && "$CLAUDE" -p "/coach-my-finances ${PROMPTS[$case]}" \
    "${mcp_args[@]}" --allowedTools "mcp__finary__*" --max-turns 15) > "$OUT_DIR/$case.md"
  echo "  → $OUT_DIR/$case.md"
  rm -rf "$work"
}

if [[ $# -gt 0 ]]; then
  for case in "$@"; do run_case "$case"; done
else
  for case in "${!PROMPTS[@]}"; do run_case "$case"; done
fi
