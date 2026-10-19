# Contributing

## Onboarding

Prerequisites: Git and Node.js 26 (version in [.nvmrc](.nvmrc), e.g. `nvm use`).

```bash
git clone https://github.com/flotoz/Skills.git && cd Skills
npm run onboard
```

`npm run onboard` is safe to re-run. It:

1. checks Node.js against `.nvmrc`;
2. installs the quality tooling at the exact versions of `package-lock.json`;
3. installs the Git hooks with [lefthook](https://lefthook.dev) and proves the `commit-msg` hook rejects a bad message;
4. installs the Claude Code CLI at the version CI pins (`config.claudeCodeVersion` in `package.json`) if it is missing; an existing install is kept;
5. runs `npm run verify` and `claude plugin validate .`.

Hooks, defined in [lefthook.yml](lefthook.yml):

| Hook         | Runs                                                                                  | Blocks the commit when                                   |
| ------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `pre-commit` | Prettier + markdownlint on staged files (fixes restaged), then `npm run verify:rules` | a file is badly formatted or a repository rule is broken |
| `commit-msg` | `commitlint`                                                                          | the message is not a Conventional Commit                 |

Never bypass them with `--no-verify`: CI runs the same checks.

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

| Command                    | What it does                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify:rules`     | Repository rules ([check-repo.mjs](scripts/check-repo.mjs)) + skill structure ([validate_skill.js](scripts/validate_skill.js)) |
| `npm run verify:docs`      | markdownlint + Prettier check                                                                                                  |
| `npm run fix:docs`         | Fix formatting                                                                                                                 |
| `npm run verify`           | Everything CI runs, except `claude plugin validate`                                                                            |
| `claude plugin validate .` | Official marketplace / plugin / frontmatter check                                                                              |
| `npm run build:skills`     | Compiles `dist/<plugin>/<skill>.zip` (claude.ai bundles)                                                                       |

## Rules enforced by `npm run verify:rules`

- Every `plugins/<plugin>/` is listed in [marketplace.json](.claude-plugin/marketplace.json) and its `plugin.json` name equals the entry name.
- Each `SKILL.md`: valid YAML frontmatter, only the allowed keys, `name` = folder name (lowercase-hyphen, ≤ 64 chars, no `claude`/`anthropic`), description ≤ 1024 chars with a "Use when / Use whenever / Use for" clause, explicit invocation booleans, ≤ 200 lines.
- Each plugin has `evals/test_cases.md` with at least 3 cases.
- Each plugin is isolated: its own `README.md` (listing its skills), `LICENSE` (MIT, `plugin.json` license `MIT`), `install.sh` and `install.ps1`.
- Each skill appears in the README catalog.
- Every plugin is in `release-please-config.json` (component = plugin name) and `.release-please-manifest.json`, with the same version as its `plugin.json`.
- Every relative Markdown link resolves.

How to write a skill: [docs/skill-authoring-guide.md](docs/skill-authoring-guide.md).

## Pull requests

1. Branch from `main` (`feat/<skill>`, `fix/<topic>`, `docs/<topic>`).
2. `npm run verify`, `npm run build:skills` and `claude plugin validate .` pass.
3. Run the plugin's evals when behaviour changes (see its `evals/README.md`).
4. Squash-merge with a Conventional Commit title.

## Releases

Never edit versions or `CHANGELOG.md` by hand. On every merge to `main`,
[release-please](https://github.com/googleapis/release-please-action) opens a
release PR per changed plugin (`feat` → minor, `fix` → patch, `!` → major).
Merging it tags `<plugin>-v<version>`, publishes the GitHub Release and attaches
the skill zips built by `npm run build:skills`.
