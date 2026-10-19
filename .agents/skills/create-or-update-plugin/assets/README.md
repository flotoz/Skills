# {{DISPLAY_NAME}}

<One sentence: what this plugin brings and for whom.>

Part of [flotoz/Skills](https://github.com/flotoz/Skills) · MIT licensed ·
releases tagged `{{PLUGIN}}-v*`

## Skills

| Skill                                  | What it does |
| -------------------------------------- | ------------ |
| [{{SKILL}}](skills/{{SKILL}}/SKILL.md) | <one line>   |

## Prerequisites

<MCP servers, CLIs or accounts needed, with a link to the skill's
`references/connect-*.md`. "None" if none.>

## Install

Claude Code plugin (also declares the plugin's MCP servers):

```bash
claude plugin marketplace add flotoz/Skills
claude plugin install {{PLUGIN}}@flotoz-skills
```

Any agent (Claude Code, Codex, Cursor), macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/{{PLUGIN}}/install.sh | bash -s -- --agent all
```

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/{{PLUGIN}}/install.ps1))) -Agent all
```

With `npx skills`:

```bash
npx skills add flotoz/Skills --skill {{SKILL}} -g
```

claude.ai: download `{{SKILL}}.zip` from the latest `{{PLUGIN}}-v*`
[release](https://github.com/flotoz/Skills/releases) and upload it in the
Skills settings.

## Use

```text
/{{SKILL}} <a realistic request>
```

<What happens, in 3–5 bullets or one short paragraph. Limits and safety
notes.>

## License

[MIT](LICENSE)
