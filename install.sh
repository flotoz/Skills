#!/usr/bin/env bash
# Installs skills from github.com/flotoz/Skills into one or more agents.
#
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --plugin finary-coach
#   ./install.sh --help
#
# With no option it installs every skill into ~/.agents/skills (Codex and the
# agents reading .agents), plus ~/.claude/skills when Claude Code is detected.
set -euo pipefail

REPO="flotoz/Skills"
REF="main"
AGENTS="auto"
SKILLS=()
PLUGINS=()
SCOPE="global"
LIST_ONLY=0

usage() {
  cat <<'EOF'
Usage: install.sh [advanced options]

With no option, installs every skill into ~/.agents/skills, plus
~/.claude/skills when Claude Code is detected (~/.claude or `claude` on PATH).

Advanced options:
  -s, --skill NAME    Skill to install (repeatable). Default: all skills.
  -P, --plugin NAME   Install every skill of a plugin (repeatable).
  -a, --agent NAME    auto | agents | claude | codex | cursor | all
                      (comma-separated). Default: auto. agents and codex both
                      mean .agents/skills; all = agents, claude and cursor.
  -p, --project       Install into the current project instead of the home directory.
  -r, --ref REF       Git branch or tag to install from. Default: main.
  -l, --list          List available skills and exit.
  -h, --help          Show this help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s|--skill) SKILLS+=("$2"); shift 2 ;;
    -P|--plugin) PLUGINS+=("$2"); shift 2 ;;
    -a|--agent) AGENTS="$2"; shift 2 ;;
    -p|--project) SCOPE="project"; shift ;;
    -r|--ref) REF="$2"; shift 2 ;;
    -l|--list) LIST_ONLY=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "❌ Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

# Use the local checkout when run from inside the repository, otherwise download it.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [[ -n "$SCRIPT_DIR" && -f "$SCRIPT_DIR/.claude-plugin/marketplace.json" ]]; then
  SRC="$SCRIPT_DIR"
else
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  echo "⬇️  Downloading $REPO@$REF..."
  if command -v git >/dev/null 2>&1; then
    git clone --quiet --depth 1 --branch "$REF" "https://github.com/$REPO.git" "$TMP/repo"
  else
    curl -fsSL "https://github.com/$REPO/archive/$REF.tar.gz" | tar -xz -C "$TMP"
    mv "$TMP"/Skills-* "$TMP/repo"
  fi
  SRC="$TMP/repo"
fi

# Every directory holding a SKILL.md under skills/ or plugins/*/skills/ is a skill.
mapfile -t SKILL_DIRS < <(find "$SRC/skills" "$SRC/plugins" -mindepth 1 -name SKILL.md -not -path '*/node_modules/*' 2>/dev/null | xargs -r -n1 dirname | sort)

if [[ ${#SKILL_DIRS[@]} -eq 0 ]]; then
  echo "❌ No skills found in $SRC." >&2
  exit 1
fi

selected() {
  local name plugin
  name="$(basename "$1")"
  plugin="$(basename "$(dirname "$(dirname "$1")")")"
  [[ ${#SKILLS[@]} -eq 0 || " ${SKILLS[*]} " =~ " $name " ]] &&
    [[ ${#PLUGINS[@]} -eq 0 || " ${PLUGINS[*]} " =~ " $plugin " ]]
}

if [[ $LIST_ONLY -eq 1 ]]; then
  echo "Available skills (plugin/skill):"
  for dir in "${SKILL_DIRS[@]}"; do
    selected "$dir" && echo "  - $(basename "$(dirname "$(dirname "$dir")")")/$(basename "$dir")"
  done
  exit 0
fi

target_dir() {
  local agent="$1"
  if [[ "$SCOPE" == "project" ]]; then
    case "$agent" in
      claude) echo ".claude/skills" ;;
      agents|codex|cursor) echo ".agents/skills" ;;
    esac
  else
    case "$agent" in
      claude) echo "$HOME/.claude/skills" ;;
      agents|codex) echo "$HOME/.agents/skills" ;;
      cursor) echo "$HOME/.cursor/skills" ;;
    esac
  fi
}

# Claude Code reads only .claude/skills, so auto adds it when Claude Code is here.
claude_detected() {
  [[ -d "$HOME/.claude" ]] || command -v claude >/dev/null 2>&1
}

auto_agents="agents"
if claude_detected; then auto_agents="agents,claude"; fi
AGENTS="${AGENTS//auto/$auto_agents}"
AGENTS="${AGENTS//all/agents,claude,cursor}"
IFS=',' read -ra AGENT_LIST <<< "$AGENTS"
TARGET_DIRS=()
for agent in "${AGENT_LIST[@]}"; do
  target="$(target_dir "$agent")"
  if [[ -z "$target" ]]; then
    echo "❌ Unknown agent: $agent (expected auto, agents, claude, codex, cursor or all)." >&2
    exit 1
  fi
  # agents and codex share a folder: copy there once.
  [[ " ${TARGET_DIRS[*]} " =~ " $target " ]] || TARGET_DIRS+=("$target")
done

installed=0
for dir in "${SKILL_DIRS[@]}"; do
  name="$(basename "$dir")"
  plugin_dir="$(dirname "$(dirname "$dir")")"
  selected "$dir" || continue
  for target in "${TARGET_DIRS[@]}"; do
    dest="$target/$name"
    mkdir -p "$(dirname "$dest")"
    rm -rf "$dest"
    cp -R "$dir" "$dest"
    # Each installed skill carries its plugin license.
    [[ -f "$plugin_dir/LICENSE" ]] && cp "$plugin_dir/LICENSE" "$dest/LICENSE.txt"
    echo "✅ $name → $dest"
  done
  installed=$((installed + 1))

  # Skills shipped in a plugin may need the plugin's MCP servers.
  mcp_file="$plugin_dir/.mcp.json"
  if [[ -f "$mcp_file" ]]; then
    echo "   ℹ️  $name needs these MCP servers (add them to your agent, then authenticate):"
    sed 's/^/      /' "$mcp_file"
  fi
done

if [[ $installed -eq 0 ]]; then
  echo "❌ No skill matches ${SKILLS[*]} ${PLUGINS[*]}. Run with --list." >&2
  exit 1
fi
echo "🎉 Installed $installed skill(s). Restart your agent to load them."
