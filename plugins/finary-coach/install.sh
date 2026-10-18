#!/usr/bin/env bash
# Installs the finary-coach skills into Claude Code, Codex or Cursor.
#
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh | bash -s -- --agent all --project
#
# Options are forwarded to the repository installer (--agent, --project, --ref, --list).
set -euo pipefail

PLUGIN="finary-coach"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"

if [[ -n "$HERE" && -f "$HERE/../../install.sh" ]]; then
  exec bash "$HERE/../../install.sh" --plugin "$PLUGIN" "$@"
fi
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --plugin "$PLUGIN" "$@"
