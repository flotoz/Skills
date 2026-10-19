# Skill Factory

Create agent skills the way this repository expects them: custom frontmatter,
short SKILL.md, references, tests with fresh subagents, registration and
GitHub release.

Part of [flotoz/Skills](https://github.com/flotoz/Skills) · MIT licensed ·
releases tagged `skill-factory-v*`

## Skills

| Skill                                        | What it does                                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [create-skill](skills/create-skill/SKILL.md) | Creates or updates a skill: intent, research with subagents, test cases first, draft, evals, registration |

## Prerequisites

None. Works best in a checkout of this repository (it runs `npm run verify`
and registers the skill in the marketplace and release pipeline). Elsewhere it
still produces a standalone skill folder.

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
npx skills add flotoz/Skills --skill create-skill -g
```

claude.ai: download `create-skill.zip` from the latest `skill-factory-v*`
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
- Registers the plugin (marketplace, README, LICENSE, installers) and runs
  the repository checks.

## License

[MIT](LICENSE)
