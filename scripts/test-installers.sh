#!/usr/bin/env bash
# Tests install.sh and the plugin installers in throwaway homes, with a minimal
# PATH so no real Claude Code install leaks in. Prints one line per check and
# exits 1 if any fails.
#
#   bash scripts/test-installers.sh
#   BASH_UNDER_TEST=/bin/bash bash scripts/test-installers.sh   # macOS bash 3.2
#   bash scripts/test-installers.sh --remote   # also a piped run (needs GitHub)
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SH="${BASH_UNDER_TEST:-bash}"
BASE_PATH="/usr/bin:/bin"
failures=0

check() {
  local name="$1"
  shift
  if "$@"; then echo "✅ $name"; else echo "❌ $name"; failures=$((failures + 1)); fi
}

skills_in() { ls "$1" 2>/dev/null | sort | tr '\n' ' '; }
all_skills="$(ls -d "$ROOT"/plugins/*/skills/*/ | xargs -n1 basename | sort | tr '\n' ' ')"

# run <home> <path> <args…>: runs the root installer, output in $out, status in $status.
run() {
  local home="$1" path="$2"
  shift 2
  out="$(env -i HOME="$home" PATH="$path" "$SH" "$ROOT/install.sh" "$@" 2>&1)"
  status=$?
}

home="$(mktemp -d)"
run "$home" "$BASE_PATH"
check "default without Claude Code: .agents only" \
  test "$status" -eq 0 -a "$(skills_in "$home/.agents/skills")" = "$all_skills" -a ! -e "$home/.claude"

home="$(mktemp -d)" && mkdir "$home/.claude"
run "$home" "$BASE_PATH"
check "default with ~/.claude: .agents and .claude" \
  test "$(skills_in "$home/.agents/skills")" = "$all_skills" -a "$(skills_in "$home/.claude/skills")" = "$all_skills"

home="$(mktemp -d)" && stub="$(mktemp -d)" && printf '#!/bin/sh\n' >"$stub/claude" && chmod +x "$stub/claude"
run "$home" "$stub:$BASE_PATH"
check "default with claude on PATH: .agents and .claude" \
  test "$(skills_in "$home/.claude/skills")" = "$all_skills"

home="$(mktemp -d)"
run "$home" "$BASE_PATH" --agent agents,codex
check "agents and codex share one copy" test "$(grep -c '→' <<<"$out")" -eq "$(wc -w <<<"$all_skills")"

home="$(mktemp -d)"
run "$home" "$BASE_PATH" --agent all
check "all: .agents, .claude and .cursor" \
  test -n "$(skills_in "$home/.agents/skills")" -a -n "$(skills_in "$home/.claude/skills")" -a -n "$(skills_in "$home/.cursor/skills")"

home="$(mktemp -d)"
run "$home" "$BASE_PATH" --agent claude
check "claude only" test -n "$(skills_in "$home/.claude/skills")" -a ! -e "$home/.agents"

run "$(mktemp -d)" "$BASE_PATH" --agent vim
check "unknown agent fails" test "$status" -ne 0
run "$(mktemp -d)" "$BASE_PATH" --skill
check "missing option value fails with a message" grep -q "needs a value" <<<"$out"
run "$(mktemp -d)" "$BASE_PATH" --skill no-such-skill
check "unknown skill fails" test "$status" -ne 0

home="$(mktemp -d)"
run "$home" "$BASE_PATH" --skill illustrate-it
touch "$home/.agents/skills/illustrate-it/stale.txt"
run "$home" "$BASE_PATH" --skill illustrate-it
check "re-run replaces the old copy" test ! -e "$home/.agents/skills/illustrate-it/stale.txt"

project="$(mktemp -d)"
out="$(cd "$project" && env -i HOME="$(mktemp -d)" PATH="$BASE_PATH" "$SH" "$ROOT/install.sh" --project --skill illustrate-it 2>&1)"
check "--project installs into the current folder" test -f "$project/.agents/skills/illustrate-it/SKILL.md"

for plugin in "$ROOT"/plugins/*/; do
  home="$(mktemp -d)"
  env -i HOME="$home" PATH="$BASE_PATH" "$SH" "$plugin/install.sh" >/dev/null 2>&1
  check "$(basename "$plugin") installer installs only its own skills" \
    test "$(skills_in "$home/.agents/skills")" = "$(skills_in "$plugin/skills")"
done

if [[ "${1:-}" == "--remote" ]]; then
  # Piped from inside a clone, the script must still download the requested ref.
  home="$(mktemp -d)"
  out="$(cd "$ROOT" && env -i HOME="$home" PATH="$PATH" "$SH" -s -- --ref finary-coach-v1.0.0 --list <"$ROOT/install.sh" 2>&1)"
  check "curl | bash honours --ref inside a clone" grep -q "Downloading flotoz/Skills@finary-coach-v1.0.0" <<<"$out"
fi

[[ $failures -eq 0 ]] && echo "INSTALLERS OK ($SH)" || { echo "$failures check(s) failed ($SH)"; exit 1; }
