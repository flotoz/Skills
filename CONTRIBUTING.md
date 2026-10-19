# Contributing

## Onboarding

Prerequisites: Git and Node.js 26 (version in [.nvmrc](.nvmrc), e.g. `nvm use`).

```bash
git clone https://github.com/flotoz/Skills.git && cd Skills
npm run onboard
```

`npm run onboard` is safe to re-run. It:

1. checks Node.js against `.nvmrc`;
2. installs the tooling at the exact versions of `package-lock.json`, Claude Code CLI included, and links `.claude` → `.agents` ([link-agents.mjs](scripts/link-agents.mjs));
3. installs the Git hooks with [lefthook](https://lefthook.dev) and proves the `commit-msg` hook rejects a bad message;
4. runs `npm run verify`, including `claude plugin validate`.

The Claude Code CLI is a devDependency like the rest of the tooling: `npm ci` installs the pinned version locally, nothing global.

Hooks, defined in [lefthook.yml](lefthook.yml):

| Hook         | Runs                                                                                  | Blocks the commit when                                   |
| ------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `pre-commit` | Prettier + markdownlint on staged files (fixes restaged), then `npm run verify:rules` | a file is badly formatted or a repository rule is broken |
| `commit-msg` | `commitlint`                                                                          | the message is not a Conventional Commit                 |

Never bypass them with `--no-verify`: CI runs the same checks.

## Agent configuration — `.agents/`, never `.claude/`

`.agents/` is committed and shared by every agent: repository skills in `.agents/skills/`, subagents in `.agents/agents/`. `.claude` is a git-ignored link to it, so Claude Code reads the same files. Never create files under `.claude/`; if it already exists as a real folder, move what you need into `.agents/`, delete it and run `npm run setup` again. Agent rules: [AGENTS.md](AGENTS.md).

## Commit messages — Conventional Commits

```text
<type>(<optional scope>): <imperative summary, lowercase>

<optional body: why, not what>
```

| Type       | Use for                                           |
| ---------- | ------------------------------------------------- |
| `feat`     | new skill, plugin or skill behaviour              |
| `fix`      | wrong behaviour, broken install, invalid manifest |
| `docs`     | README, guides, comments only                     |
| `test`     | evals, fixtures, mock servers                     |
| `refactor` | restructuring without behaviour change            |
| `chore`    | tooling, dependencies, configuration              |
| `ci`       | GitHub Actions                                    |

Scope = the skill or plugin name, e.g. `feat(coach-my-finances): add fact-check step`.
Breaking change (renamed skill, removed plugin): add `!` after the type and a
`BREAKING CHANGE:` footer.

## Commands

| Command                                        | What it does                                                                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify:rules`                         | Repository rules ([check-repo.mjs](scripts/check-repo.mjs)) + skill structure ([validate_skill.js](.agents/skills/create-or-update-skill/scripts/validate_skill.js)) |
| `npm run verify:docs`                          | markdownlint + Prettier check                                                                                                                                        |
| `npm run fix:docs`                             | Fix formatting                                                                                                                                                       |
| `npm run verify:plugins`                       | Official `claude plugin validate` on the marketplace and each plugin (local CLI from devDependencies)                                                                |
| `npm run verify`                               | Everything CI runs                                                                                                                                                   |
| `node scripts/release-plugins.mjs --dry-run`   | Prints the releases the next merge to `main` would publish                                                                                                           |
| `npm run build:skills`                         | Compiles `dist/<plugin>/<skill>.zip` (claude.ai bundles)                                                                                                             |
| `bash scripts/test-installers.sh --remote`     | Tests `install.sh` and the plugin installers in throwaway homes; `BASH_UNDER_TEST=/bin/bash` runs them with macOS bash 3.2                                           |
| `powershell -File scripts/test-installers.ps1` | Same for `install.ps1` (Windows PowerShell 5.1, or `pwsh` for PowerShell 7)                                                                                          |

## Rules enforced by `npm run verify:rules`

- Every `plugins/<plugin>/` is listed in [marketplace.json](.claude-plugin/marketplace.json) and its `plugin.json` name equals the entry name.
- Each `SKILL.md` (plugins and `.agents/skills/`): valid YAML frontmatter, only the allowed keys, `name` = folder name (lowercase-hyphen, ≤ 64 chars, no `claude`/`anthropic`), description ≤ 1024 chars with a "Use when / Use whenever / Use for" clause, explicit invocation booleans, ≤ 200 lines.
- Shipped skills link nothing outside their own folder.
- Each plugin has `evals/test_cases.md` with at least 3 cases.
- Each plugin is isolated: its own `README.md` (listing its skills), `LICENSE` (MIT, `plugin.json` license `MIT`), `install.sh` and `install.ps1`.
- Each skill appears in the README catalog.
- Every `plugin.json` has an `x.y.z` version.
- Every relative Markdown link resolves.

How to write a skill: [docs/skill-authoring-guide.md](docs/skill-authoring-guide.md).

## Skills and plugins

Agents working here use two repository skills from `.agents/skills/`, never
shipped to users:

- [create-or-update-skill](.agents/skills/create-or-update-skill/SKILL.md) for
  every skill created, renamed, changed or reviewed;
- [create-or-update-plugin](.agents/skills/create-or-update-plugin/SKILL.md)
  for every plugin created, changed, renamed or removed (marketplace entry,
  README catalog and `## Plugins` table, installers).

A plugin is the unit users install and the unit that gets released. Renaming
or removing one is a breaking change: `!` after the type and a
`BREAKING CHANGE:` footer saying what users must do.

## Pull requests

1. Branch from `main` (`feat/<skill>`, `fix/<topic>`, `docs/<topic>`).
2. `npm run verify` and `npm run build:skills` pass.
3. Run the plugin's evals when behaviour changes (see its `evals/README.md`).
4. Squash-merge with a Conventional Commit title: its type sets the version
   bump of every plugin whose skills the PR changes.

## Releases

Never edit versions or `CHANGELOG.md` by hand. On every merge to `main`, the
[release workflow](.github/workflows/release.yml) runs
[release-plugins.mjs](scripts/release-plugins.mjs): each plugin with a commit
touching `plugins/<plugin>/skills/` since its last tag is released at once,
with no release PR (`!` → major, `feat` → minor, anything else → patch). It
commits the new `plugin.json` version and `CHANGELOG.md` to `main`, tags
`<plugin>-v<version>`, publishes the GitHub Release and attaches the skill zips
built by `npm run build:skills`. A plugin whose current version has no tag yet
is released at that version. A change only outside `skills/` (README,
`plugin.json` metadata, `.mcp.json`, installers) publishes no release.
`node scripts/release-plugins.mjs --dry-run` prints what the next run would
publish.

## Security

Never commit secrets, tokens, account identifiers or real personal or
financial data, fixtures included. Report vulnerabilities privately as
described in [SECURITY.md](SECURITY.md), never in a public issue.
