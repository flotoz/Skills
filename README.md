# Skills

Curated agent skills for Claude Code, Codex, Cursor and other agents, packaged
as a Claude Code plugin marketplace and released as versioned bundles.

[![Verify skills](https://github.com/flotoz/Skills/actions/workflows/verify.yml/badge.svg)](https://github.com/flotoz/Skills/actions/workflows/verify.yml)
[![Release skills](https://github.com/flotoz/Skills/actions/workflows/release.yml/badge.svg)](https://github.com/flotoz/Skills/actions/workflows/release.yml)

## Catalog

| Skill                                                                       | Plugin                                             | What it does                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [coach-my-finances](plugins/finary-coach/skills/coach-my-finances/SKILL.md) | [`finary-coach`](plugins/finary-coach/README.md)   | Personal finance coach reading your Finary account through the official MCP: safety cushion, 50/30/20 budget, PEA vs CTO, US / Europe / China exposure, fees, crypto share. Tax rates and ceilings fact-checked on official sources. |
| [illustrate-it](plugins/illustrate-it/skills/illustrate-it/SKILL.md)        | [`illustrate-it`](plugins/illustrate-it/README.md) | One verified, accessible illustration per question: workflow, mechanism, anatomy, layout, exchange, lifecycle or chart, in Mermaid or SVG. Every box maps to real code or data; contrast linted on light and dark themes.            |

## Plugins

| Plugin                                             | Latest release                                                                                                                                                                   | Install or update to the latest version (any agent)                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`finary-coach`](plugins/finary-coach/README.md)   | [![finary-coach](https://img.shields.io/github/v/release/flotoz/Skills?filter=finary-coach-v*&label=finary-coach)](https://github.com/flotoz/Skills/releases?q=finary-coach)     | `curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.sh \| bash`  |
| [`illustrate-it`](plugins/illustrate-it/README.md) | [![illustrate-it](https://img.shields.io/github/v/release/flotoz/Skills?filter=illustrate-it-v*&label=illustrate-it)](https://github.com/flotoz/Skills/releases?q=illustrate-it) | `curl -fsSL https://raw.githubusercontent.com/flotoz/Skills/main/plugins/illustrate-it/install.sh \| bash` |

`main` always carries the latest release of every plugin's skills: a merge
that changes a skill publishes its release at once. So the commands below
install the latest version, and re-running them updates it. To pin a version,
pass the release tag: `--ref finary-coach-v1.0.0` to the install scripts.

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

### illustrate-it

```text
/illustrate-it how does the job worker retry a failed job?
```

Asks one question only when a doubt would change the picture, reads the code,
docs or data behind the question, picks the kind (workflow, mechanism,
anatomy, layout, exchange, lifecycle, structure, data or chart), then answers
with the illustration, its sources and what it could not verify. It never
invents a box or a value, and it lints contrast and accessibility when Node.js
is available.

## Releases

Versioning is automatic from [Conventional Commits](https://www.conventionalcommits.org):

```text
merge to main ─▶ every plugin whose skills/ changed is released at once
                 (! → major, feat → minor, else patch, CHANGELOG.md)
               ─▶ tag <plugin>-v<version> + GitHub Release
                  + dist/<plugin>/<skill>.zip attached (claude.ai bundle)
```

A change only outside `skills/` publishes no release. Each plugin keeps its
history in `plugins/<plugin>/CHANGELOG.md`; every version is on the
[releases page](https://github.com/flotoz/Skills/releases). Build the bundles
locally with `npm run build:skills`, preview the next release with
`node scripts/release-plugins.mjs --dry-run`.

## Repository structure

```text
.
├── AGENTS.md                         # rules for agents working here
├── CONTRIBUTING.md, SECURITY.md      # how to contribute, how to report a vulnerability
├── .agents/                          # agent config, single source of truth (.claude links here)
│   ├── skills/create-or-update-skill/   # how to write a skill + validate_skill.js
│   ├── skills/create-or-update-plugin/  # how to create or change a plugin
│   └── agents/create-or-update-skill.md
├── .claude-plugin/marketplace.json   # plugin catalog (marketplace "flotoz-skills")
├── plugins/
│   ├── finary-coach/
│   │   ├── .claude-plugin/plugin.json  # name, version (bumped by releases)
│   │   ├── .mcp.json                   # Finary MCP server
│   │   ├── README.md, LICENSE          # plugin doc, MIT license
│   │   ├── CHANGELOG.md                # written by releases, never by hand
│   │   ├── install.sh / install.ps1    # installs this plugin only
│   │   ├── skills/coach-my-finances/   # installed: SKILL.md, references/
│   │   └── evals/                      # test cases, mock MCP, fixtures
│   └── illustrate-it/                  # same layout; skill ships linters in scripts/
├── scripts/
│   ├── onboard.mjs                     # first setup (npm run onboard)
│   ├── check-repo.mjs                  # repository rules (npm run verify:rules)
│   ├── validate-plugins.mjs            # claude plugin validate (npm run verify:plugins)
│   ├── link-agents.mjs                 # links .claude → .agents (npm run setup)
│   ├── build-skills.mjs                # compiles dist/<plugin>/<skill>.zip
│   └── release-plugins.mjs             # versions and publishes changed plugins
├── docs/skill-authoring-guide.md
├── lefthook.yml                      # Git hooks (formatting, rules, commit messages)
├── install.sh / install.ps1            # installers without Node.js
└── .github/workflows/                  # verify.yml (PRs), release.yml (main)
```

## Contributing

Agents follow [AGENTS.md](AGENTS.md). See [CONTRIBUTING.md](CONTRIBUTING.md): `npm run onboard` checks Node.js, installs
the tooling, the Git hooks (formatting, repository rules, Conventional Commits)
and the Claude Code CLI. Agents add skills with `/create-or-update-skill` and plugins with
`/create-or-update-plugin` (repository skills in `.agents/skills/`), or you
work by hand following
[docs/skill-authoring-guide.md](docs/skill-authoring-guide.md).

## Security

Report vulnerabilities privately, never in a public issue: see
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
