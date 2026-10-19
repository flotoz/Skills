# Contributing

## Setup

```bash
npm run setup
```

`npm run setup` installs the tooling, links `.claude` → `.agents` ([link-agents.mjs](scripts/link-agents.mjs)) and installs the Git hooks ([husky](https://typicode.github.io/husky/)):

| Hook         | Runs                                                                                 | Blocks the commit when                                   |
| ------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `pre-commit` | `lint-staged` (Prettier + markdownlint on staged files), then `npm run verify:rules` | a file is badly formatted or a repository rule is broken |
| `commit-msg` | `commitlint`                                                                         | the message is not a Conventional Commit                 |

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

| Command                    | What it does                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify:rules`     | Repository rules ([check-repo.mjs](scripts/check-repo.mjs)) + skill structure ([validate_skill.js](.agents/skills/create-or-update-skill/scripts/validate_skill.js)) |
| `npm run verify:docs`      | markdownlint + Prettier check                                                                                                                                        |
| `npm run fix:docs`         | Fix formatting                                                                                                                                                       |
| `npm run verify`           | Everything CI runs, except `claude plugin validate`                                                                                                                  |
| `claude plugin validate .` | Official marketplace / plugin / frontmatter check                                                                                                                    |

## Rules enforced by `npm run verify:rules`

- Every `plugins/<plugin>/` is listed in [marketplace.json](.claude-plugin/marketplace.json) and its `plugin.json` name equals the entry name.
- Each `SKILL.md` (plugins and `.agents/skills/`): valid YAML frontmatter, only the allowed keys, `name` = folder name (lowercase-hyphen, ≤ 64 chars, no `claude`/`anthropic`), description ≤ 1024 chars with a "Use when / Use whenever / Use for" clause, explicit invocation booleans, ≤ 200 lines.
- Shipped skills link nothing outside their own folder.
- Each plugin has `evals/test_cases.md` with at least 3 cases.
- Each skill appears in the README catalog.
- Every relative Markdown link resolves.

How to write a skill: [docs/skill-authoring-guide.md](docs/skill-authoring-guide.md).

## Pull requests

1. Branch from `main` (`feat/<skill>`, `fix/<topic>`, `docs/<topic>`).
2. `npm run verify` and `claude plugin validate .` pass.
3. Run the plugin's evals when behaviour changes (see its `evals/README.md`).
4. Squash-merge with a Conventional Commit title.
