# Finary Coach

A personal finance coach that reads your live Finary data (read-only) and
challenges your allocation with a passive, long-term "bon père de famille 2.0"
method.

Part of [flotoz/Skills](https://github.com/flotoz/Skills) · MIT licensed ·
releases tagged `finary-coach-v*`

## Skills

| Skill                                                  | What it does                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| [coach-my-finances](skills/coach-my-finances/SKILL.md) | Safety cushion, 50/30/20 budget, wealth pyramid, PEA vs CTO, US/Europe/China exposure, fees, crypto and exotic assets, with diagrams |

## Prerequisites

- A [Finary](https://finary.com) account with **Security → Allow AI assistants
  (MCP)** enabled.
- The official Finary MCP server (`https://public-api.finary.com/mcp`,
  OAuth, read-only). The Claude Code plugin declares it in
  [.mcp.json](.mcp.json); for other clients see
  [connect-finary-mcp.md](skills/coach-my-finances/references/connect-finary-mcp.md).

## Install

Claude Code plugin (also declares the Finary MCP server):

```bash
claude plugin marketplace add flotoz/Skills
claude plugin install finary-coach@flotoz-skills
```

Then run `/mcp`, select **finary** and authenticate in the browser.

Any agent (Claude Code, Codex, Cursor), macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh | bash -s -- --agent all
```

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.ps1))) -Agent all
```

With `npx skills`:

```bash
npx skills add flotoz/Skills --skill coach-my-finances -g
```

claude.ai: connect Finary from the
[connector directory](https://claude.ai/directory/finary-mcp), then download
`coach-my-finances.zip` from the latest `finary-coach-v*`
[release](https://github.com/flotoz/Skills/releases) and upload it in the
Skills settings.

## Use

```text
/coach-my-finances Is my safety cushion big enough, and am I too exposed to the US?
```

- Checks the Finary connection first and walks you through it if missing.
- Asks what it cannot read (income stability, projects, horizon) instead of
  guessing.
- Answers in your language with a short verdict, a few diagrams and a ranked
  action list.
- Verifies volatile figures (tax rates, ceilings, savings rates) on official
  sources and cites them with the date.
- Read-only: it never moves money, and it is not a licensed financial advisor.

## License

[MIT](LICENSE)
