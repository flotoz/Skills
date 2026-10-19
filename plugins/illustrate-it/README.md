# Illustrate It

Turns a question about code, docs or data ("how does the worker run?", "what
is this screen made of?", "how did build time evolve?") into one verified,
accessible illustration that reads on light and dark themes.

Part of [flotoz/Skills](https://github.com/flotoz/Skills) · MIT licensed ·
releases tagged `illustrate-it-v*`

## Skills

| Skill                                          | What it does                                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [illustrate-it](skills/illustrate-it/SKILL.md) | Picks the right kind (workflow, mechanism, anatomy, layout, exchange, lifecycle, structure, data, chart), draws it in Mermaid or SVG from real sources, lints contrast and accessibility |

## Prerequisites

None. [Node.js](https://nodejs.org) lets the skill run its bundled linters
(no dependencies); without it, it checks by hand and says so. A Mermaid
renderer (`mmdc`, an IDE preview or GitHub) shows the result.

## Install

Claude Code plugin:

```bash
claude plugin marketplace add flotoz/Skills
claude plugin install illustrate-it@flotoz-skills
```

Any agent, macOS / Linux / Git Bash (installs into `~/.agents/skills`, plus
`~/.claude/skills` when Claude Code is detected):

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/illustrate-it/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/illustrate-it/install.ps1 | iex
```

Advanced options (`--agent`, `--project`, `--ref`): see the
[repository README](https://github.com/flotoz/Skills#advanced-options).

With `npx skills`:

```bash
npx skills add flotoz/Skills --skill illustrate-it -g
```

claude.ai: download `illustrate-it.zip` from the latest `illustrate-it-v*`
[release](https://github.com/flotoz/Skills/releases) and upload it in the
Skills settings.

## Use

```text
/illustrate-it how does the job worker retry a failed job?
```

- Reads only the code, docs or data the question needs; every box, part or
  value maps to a `path:line`, a command or a named data source.
- Asks one question when a doubt would change the picture (which flow, which
  reader, where the chart's numbers come from); never invents a value.
- Picks the kind from the question: workflow, mechanism, anatomy, layout,
  exchange, lifecycle, structure, data or chart.
- Uses a measured palette (WCAG contrast on white and dark pages), `accTitle`
  and `accDescr`, and runs its linters when Node.js is available.
- Read-only: it never edits code or docs to make a picture fit, and writes the
  diagram to a file only when you ask.

## License

[MIT](LICENSE)
