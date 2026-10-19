#!/usr/bin/env bash
# Installs the finary-coach skills into ~/.agents/skills, plus ~/.claude/skills
# when Claude Code is detected.
#
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh | bash -s -- --project
#
# Advanced options are forwarded to the repository installer (--agent,
# --project, --ref, --list; see --help).
set -euo pipefail

PLUGIN="finary-coach"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"

if [[ -n "$HERE" && -f "$HERE/../../install.sh" ]]; then
  exec bash "$HERE/../../install.sh" --plugin "$PLUGIN" "$@"
fi
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --plugin "$PLUGIN" "$@"
