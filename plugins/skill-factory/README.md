# Skill Factory

Create agent skills and the plugins that ship them the way this repository
expects them: custom frontmatter, short SKILL.md, references, tests with fresh
subagents, registration and GitHub release.

Part of [flotoz/Skills](https://github.com/flotoz/Skills) · MIT licensed ·
releases tagged `skill-factory-v*`

## Skills

| Skill                                                              | What it does                                                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [create-skill](skills/create-skill/SKILL.md)                       | Creates or updates a skill: intent, research with subagents, test cases first, draft, evals, registration |
| [create-or-update-plugin](skills/create-or-update-plugin/SKILL.md) | Creates, updates, renames or removes a plugin and keeps the marketplace, catalog and installers in sync   |

## Prerequisites

None. Works best in a checkout of this repository (it runs `npm run verify`
and registers the skill in the marketplace and release pipeline). Elsewhere
`create-skill` still produces a standalone skill folder;
`create-or-update-plugin` needs the checkout.

## Install

Claude Code plugin:

```bash
claude plugin marketplace add flotoz/Skills
claude plugin install skill-factory@flotoz-skills
```

Any agent (Claude Code, Codex, Cursor), macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/skill-factory/install.sh | bash -s -- --agent all
```

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/skill-factory/install.ps1))) -Agent all
```

With `npx skills`:

```bash
npx skills add flotoz/Skills --skill create-skill --skill create-or-update-plugin -g
```

claude.ai: download `create-skill.zip` and `create-or-update-plugin.zip` from the latest `skill-factory-v*`
[release](https://github.com/flotoz/Skills/releases) and upload it in the
Skills settings.

## Use

```text
/create-skill a skill that reviews Terraform plans before apply
```

- Clarifies intent and the invocation mode (auto, agent only, manual).
- Researches official docs with subagents and writes test cases before the
  skill.
- Drafts SKILL.md (≤ 200 lines) plus `references/`, then evaluates it with
  fresh subagents against a no-skill baseline.
- Registers the skill in the catalog and runs the repository checks.

```text
/create-or-update-plugin rename finary-coach display name to Finary Money Coach
```

- Creates, updates, renames or removes a plugin: plugin.json, marketplace
  entry, README, LICENSE, installers, MCP servers.
- Flags breaking changes (rename, removal, moved skills) before editing.

## License

[MIT](LICENSE)
