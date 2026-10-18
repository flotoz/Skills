# Skills

A curated collection of modular skills, prompts, and workflows to extend and
enhance AI agent capabilities.

## Catalog

| Skill | Plugin | What it does |
| --- | --- | --- |
| [analyze-finary-wealth](plugins/finary-wealth/skills/analyze-finary-wealth/SKILL.md) | `finary-wealth` | Reads your Finary account through the official MCP connector and audits it with a passive, long-term "wealth pyramid" method (budget 50/30/20, emergency fund, PEA + ETFs, ≤ 10 % exotic assets). |

## Install

### Option 1 — Claude Code plugin (recommended)

Installs the skill **and** declares the Finary MCP server.

```bash
claude plugin marketplace add flotoz/Skills
```

```bash
claude plugin install finary-wealth@flotoz-skills
```

Then in Claude Code run `/mcp`, select **finary** and sign in to Finary.
Update later with `claude plugin marketplace update flotoz-skills`.

### Option 2 — Any agent with `npx skills`

Works with Claude Code, Codex, Cursor and 40+ agents
([vercel-labs/skills](https://github.com/vercel-labs/skills)).

```bash
npx skills add flotoz/Skills --skill analyze-finary-wealth -g
```

### Option 3 — Install script (no Node.js)

macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --skill analyze-finary-wealth --agent all
```

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/install.ps1))) -Skill analyze-finary-wealth -Agent all
```

| Agent | Global folder | Project folder (`--project`) |
| --- | --- | --- |
| `claude` | `~/.claude/skills` | `.claude/skills` |
| `codex` | `~/.agents/skills` | `.agents/skills` |
| `cursor` | `~/.cursor/skills` | `.agents/skills` |

Options 2 and 3 install the skill only: connect the Finary MCP yourself — see
[connect-finary-mcp.md](plugins/finary-wealth/skills/analyze-finary-wealth/references/connect-finary-mcp.md).

### Claude.ai / Claude Desktop

Zip the skill folder and upload it in **Settings → Capabilities → Skills**,
then connect Finary from <https://claude.ai/directory/finary-mcp>.

## Use

Ask in natural language, or call it directly:

```text
/analyze-finary-wealth Est-ce que mon épargne est bien répartie pour mes 35 ans ?
```

The skill first checks the Finary connection, asks what your data cannot tell
(age, horizon, risk tolerance…), reads your accounts, then returns a verdict,
your pyramid, a scorecard and the top 3 actions.

> Read-only. Educational analysis, not regulated investment advice.

## Contribute a skill

Follow [docs/skill-authoring-guide.md](docs/skill-authoring-guide.md), then
validate:

```bash
node scripts/validate_skill.js plugins/finary-wealth/skills
```

## License

[MIT](LICENSE)
