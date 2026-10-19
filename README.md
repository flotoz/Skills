# Skills

Curated agent skills for Claude Code, Codex, Cursor and other agents, packaged
as a Claude Code plugin marketplace.

[![Verify skills](https://github.com/flotoz/Skills/actions/workflows/verify.yml/badge.svg)](https://github.com/flotoz/Skills/actions/workflows/verify.yml)

## Catalog

| Skill                                                                       | Plugin         | What it does                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [coach-my-finances](plugins/finary-coach/skills/coach-my-finances/SKILL.md) | `finary-coach` | Personal finance coach reading your Finary account through the official MCP: safety cushion, 50/30/20 budget, PEA vs CTO, US / Europe / China exposure, fees, crypto share. Tax rates and ceilings fact-checked on official sources. |

## Install

Replace `<plugin>` and `<skill>` with a row of the catalog.

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

Options: `--list`, `--skill <name>` (repeatable), `--agent claude|codex|cursor|all`,
`--project` (current folder instead of home), `--ref <branch|tag>`. Re-run to update.

| Agent    | Global folder      | Project folder (`--project`) |
| -------- | ------------------ | ---------------------------- |
| `claude` | `~/.claude/skills` | `.claude/skills`             |
| `codex`  | `~/.agents/skills` | `.agents/skills`             |
| `cursor` | `~/.cursor/skills` | `.agents/skills`             |

Options 2 and 3 install skills only, not MCP servers: connect them yourself
(see each skill's `references/connect-*.md`).

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

## Repository structure

```text
.
├── AGENTS.md                         # rules for agents working here
├── .agents/                          # agent config, single source of truth (.claude links here)
│   ├── skills/create-or-update-skill/  # how skills are written + validate_skill.js
│   └── agents/create-or-update-skill.md
├── .claude-plugin/marketplace.json   # plugin catalog (marketplace "flotoz-skills")
├── plugins/
│   └── finary-coach/
│       ├── .claude-plugin/plugin.json
│       ├── .mcp.json                   # Finary MCP server
│       ├── skills/coach-my-finances/   # installed: SKILL.md, references/
│       └── evals/                      # test cases, mock MCP, fixtures
├── scripts/
│   ├── check-repo.mjs                  # repository rules (npm run verify:rules)
│   └── link-agents.mjs                 # links .claude → .agents (npm run setup)
├── docs/skill-authoring-guide.md
├── install.sh / install.ps1            # installers without Node.js
└── .github/workflows/verify.yml        # CI
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md): `npm run setup` installs the tooling
and the Git hooks (formatting, repository rules, Conventional Commits). Agents
follow [AGENTS.md](AGENTS.md); skill rules are in
[docs/skill-authoring-guide.md](docs/skill-authoring-guide.md).

## License

[MIT](LICENSE)
