# Skills

Curated agent skills for Claude Code, Codex, Cursor and other agents, packaged
as a Claude Code plugin marketplace and released as versioned bundles.

[![Verify skills](https://github.com/flotoz/Skills/actions/workflows/verify.yml/badge.svg)](https://github.com/flotoz/Skills/actions/workflows/verify.yml)
[![Release skills](https://github.com/flotoz/Skills/actions/workflows/release.yml/badge.svg)](https://github.com/flotoz/Skills/actions/workflows/release.yml)

## Catalog

| Skill                                                                       | Plugin                                             | What it does                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [coach-my-finances](plugins/finary-coach/skills/coach-my-finances/SKILL.md) | [`finary-coach`](plugins/finary-coach/README.md)   | Personal finance coach reading your Finary account through the official MCP: safety cushion, 50/30/20 budget, PEA vs CTO, US / Europe / China exposure, fees, crypto share. Tax rates and ceilings fact-checked on official sources. |
| [create-skill](plugins/skill-factory/skills/create-skill/SKILL.md)          | [`skill-factory`](plugins/skill-factory/README.md) | Creates or updates a skill end to end: intent interview, SKILL.md with this repo's rules, evals run by fresh subagents, registration in the marketplace and the build, release.                                                      |

## Install

Replace `<plugin>` and `<skill>` with a row of the catalog. Each plugin README
also gives its own install commands, prerequisites and license.

### Option 1 — Claude Code plugin (recommended)

Also declares the MCP servers a plugin needs (e.g. Finary for `finary-coach`).

```bash
claude plugin marketplace add flotoz/Skills
```

```bash
claude plugin install <plugin>@flotoz-skills
```

| Action    | Command                                                                    |
| --------- | -------------------------------------------------------------------------- |
| Update    | `claude plugin marketplace update flotoz-skills`                           |
| Uninstall | `claude plugin marketplace remove flotoz-skills` (removes its plugins too) |

### Option 2 — Any agent with `npx skills`

Claude Code, Codex, Cursor and 40+ agents ([vercel-labs/skills](https://github.com/vercel-labs/skills)):

```bash
npx skills add flotoz/Skills --skill <skill> -g
```

Update with `npx skills update`, remove with `npx skills remove <skill>`.

### Option 3 — Install script (no Node.js)

macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --skill <skill> --agent all
```

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/install.ps1))) -Skill <skill> -Agent all
```

Each plugin also has its own installer and doc: `plugins/<plugin>/install.sh`
(or `install.ps1`) installs only that plugin's skills, e.g.
`curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh | bash`.

Options: `--list`, `--skill <name>` / `--plugin <name>` (repeatable), `--agent claude|codex|cursor|all`,
`--project` (current folder instead of home), `--ref <branch|tag>`. Re-run to update.

| Agent    | Global folder      | Project folder (`--project`) |
| -------- | ------------------ | ---------------------------- |
| `claude` | `~/.claude/skills` | `.claude/skills`             |
| `codex`  | `~/.agents/skills` | `.agents/skills`             |
| `cursor` | `~/.cursor/skills` | `.agents/skills`             |

Options 2 and 3 install skills only, not MCP servers: connect them yourself
(see each skill's `references/connect-*.md`).

### Option 4 — claude.ai / Claude API (not tested)

Download `<skill>.zip` from the plugin's latest
[GitHub Release](https://github.com/flotoz/Skills/releases) and upload it in
the claude.ai Skills settings. The zip keeps only the frontmatter keys claude.ai
accepts.

## Use

### coach-my-finances

```text
/coach-my-finances Est-ce que mon épargne est bien répartie pour mes 35 ans ?
```

Full check-up or targeted questions ("suis-je trop exposé aux US ?", "PEA ou
CTO ?"). It checks the Finary connection, asks only what your data cannot tell,
reads your accounts, fact-checks tax rates, then answers with a verdict,
diagrams, a scorecard and at most 3 actions. Connect Finary first:
[connect-finary-mcp.md](plugins/finary-coach/skills/coach-my-finances/references/connect-finary-mcp.md).

> Read-only: it cannot place orders or move money. Educational analysis, not
> regulated investment advice.

### create-skill

Run it inside a clone of this repository:

```text
/create-skill a skill that summarises a GitHub PR in 5 lines for non-developers
```

It interviews you, researches with subagents, writes test cases first, drafts
the skill, evaluates it with fresh subagents, registers it (marketplace,
catalog, release config) and opens the PR.

## Releases

Versioning is automatic from [Conventional Commits](https://www.conventionalcommits.org):

```text
merge to main ─▶ release-please opens a release PR per changed plugin
                 (feat → minor, fix → patch, ! → major, CHANGELOG.md)
merge release PR ─▶ tag <plugin>-v<version> + GitHub Release
                    + dist/<plugin>/<skill>.zip attached (claude.ai bundle)
```

Build the bundles locally with `npm run build:skills`.

## Repository structure

```text
.
├── AGENTS.md                         # rules for agents working here
├── .agents/                          # agent config, single source of truth (.claude links here)
│   ├── skills/create-or-update-skill/  # repo skill rules + validate_skill.js
│   └── agents/create-or-update-skill.md
├── .claude-plugin/marketplace.json   # plugin catalog (marketplace "flotoz-skills")
├── plugins/
│   ├── finary-coach/
│   │   ├── .claude-plugin/plugin.json  # name, version (bumped by releases)
│   │   ├── .mcp.json                   # Finary MCP server
│   │   ├── README.md, LICENSE          # plugin doc, MIT license
│   │   ├── install.sh / install.ps1    # installs this plugin only
│   │   ├── skills/coach-my-finances/   # installed: SKILL.md, references/
│   │   └── evals/                      # test cases, mock MCP, fixtures
│   └── skill-factory/
│       ├── .claude-plugin/plugin.json
│       ├── README.md, LICENSE, install.sh, install.ps1
│       ├── skills/create-skill/        # installed: SKILL.md, references/, assets/
│       └── evals/
├── scripts/
│   ├── check-repo.mjs                  # repository rules (npm run verify:rules)
│   ├── link-agents.mjs                 # links .claude → .agents (npm run setup)
│   └── build-skills.mjs                # compiles dist/<plugin>/<skill>.zip
├── release-please-config.json          # one release package per plugin
├── .release-please-manifest.json       # current version per plugin
├── docs/skill-authoring-guide.md
├── install.sh / install.ps1            # installers without Node.js
└── .github/workflows/                  # verify.yml (PRs), release.yml (main)
```

## Contributing

Agents follow [AGENTS.md](AGENTS.md). See [CONTRIBUTING.md](CONTRIBUTING.md): `npm run onboard` checks Node.js, installs
the tooling, the Git hooks (formatting, repository rules, Conventional Commits)
and the Claude Code CLI. Add skills with `/create-skill`, or by hand following
[docs/skill-authoring-guide.md](docs/skill-authoring-guide.md).

## License

[MIT](LICENSE)
