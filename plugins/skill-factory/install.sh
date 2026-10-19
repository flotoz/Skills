#!/usr/bin/env bash
# Installs the skill-factory skills into Claude Code, Codex or Cursor.
#
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/skill-factory/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/skill-factory/install.sh | bash -s -- --agent all --project
#
# Options are forwarded to the repository installer (--agent, --project, --ref, --list).
set -euo pipefail

PLUGIN="skill-factory"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"

if [[ -n "$HERE" && -f "$HERE/../../install.sh" ]]; then
  exec bash "$HERE/../../install.sh" --plugin "$PLUGIN" "$@"
fi
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --plugin "$PLUGIN" "$@"
