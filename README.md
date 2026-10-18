# Skills

A curated collection of modular skills, prompts, and workflows to extend and
enhance AI agent capabilities.

## Catalog

| Skill | Plugin | What it does |
| --- | --- | --- |
| [coach-my-finances](plugins/finary-coach/skills/coach-my-finances/SKILL.md) | `finary-coach` | Personal finance coach reading your Finary account through the official MCP: safety cushion, budget 50/30/20, PEA vs CTO, US / Europe / China exposure, fees, crypto and exotic share — passive, long-term method. |

## Install

### Option 1 — Claude Code plugin (recommended)

Installs the skill **and** declares the Finary MCP server.

```bash
claude plugin marketplace add flotoz/Skills
```

```bash
claude plugin install finary-coach@flotoz-skills
```

Then in Claude Code run `/mcp`, select **finary** and sign in to Finary.
Update later with `claude plugin marketplace update flotoz-skills`.

### Option 2 — Any agent with `npx skills`

Works with Claude Code, Codex, Cursor and 40+ agents
([vercel-labs/skills](https://github.com/vercel-labs/skills)).

```bash
npx skills add flotoz/Skills --skill coach-my-finances -g
```

### Option 3 — Install script (no Node.js)

macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/install.sh | bash -s -- --skill coach-my-finances --agent all
```

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/install.ps1))) -Skill coach-my-finances -Agent all
```

| Agent | Global folder | Project folder (`--project`) |
| --- | --- | --- |
| `claude` | `~/.claude/skills` | `.claude/skills` |
| `codex` | `~/.agents/skills` | `.agents/skills` |
| `cursor` | `~/.cursor/skills` | `.agents/skills` |

Options 2 and 3 install the skill only: connect the Finary MCP yourself — see
[connect-finary-mcp.md](plugins/finary-coach/skills/coach-my-finances/references/connect-finary-mcp.md).

### Claude.ai / Claude Desktop

Zip the skill folder and upload it in **Settings → Capabilities → Skills**,
then connect Finary from <https://claude.ai/directory/finary-mcp>.

## Use

Ask in natural language, or call it directly:

```text
/coach-my-finances Est-ce que mon épargne est bien répartie pour mes 35 ans ?
```

Full check-up or targeted questions ("suis-je trop exposé aux US ?", "PEA ou
CTO ?", "mon matelas de sécurité suffit-il ?"). The skill checks the Finary
connection, asks what your data cannot tell (age, horizon, risk tolerance…),
reads your accounts, then answers with a verdict, diagrams, a scorecard and
max 3 actions.

> Read-only. Educational analysis, not regulated investment advice.

## Evaluate

A mock Finary MCP and fixtures live in
[plugins/finary-coach/evals](plugins/finary-coach/evals). With a logged-in
`claude` CLI:

```bash
bash plugins/finary-coach/evals/run-evals.sh
```

Compare `evals/out/*.md` with
[test_cases.md](plugins/finary-coach/skills/coach-my-finances/test_cases.md).

## Contribute a skill

Follow [docs/skill-authoring-guide.md](docs/skill-authoring-guide.md), then
validate:

```bash
node scripts/validate_skill.js plugins/finary-coach/skills
```

## License

[MIT](LICENSE)
