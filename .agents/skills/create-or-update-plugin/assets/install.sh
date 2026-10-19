#!/usr/bin/env bash
# Installs the {{PLUGIN}} skills into ~/.agents/skills, plus ~/.claude/skills
# when Claude Code is detected.
#
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/{{PLUGIN}}/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/{{PLUGIN}}/install.sh | bash -s -- --project
#
# Advanced options are forwarded to the repository installer (--agent,
# --project, --ref, --list; see --help).
set -euo pipefail

PLUGIN="{{PLUGIN}}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"

if [[ -n "$HERE" && -f "$HERE/../../install.sh" ]]; then
  exec bash "$HERE/../../install.sh" --plugin "$PLUGIN" "$@"
fi
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --plugin "$PLUGIN" "$@"
