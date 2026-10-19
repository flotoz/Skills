# Skill Authoring Guide

Skills and plugins are written with two repository skills in `.agents/skills/`,
loaded automatically by agents working in a clone of this repository:

```text
/create-or-update-skill <what the skill should do>
/create-or-update-plugin <the plugin to create, change, rename or remove>
```

Their references are the single source of truth for how skills are written here
— read them directly when working by hand:

| Topic                                                                     | Reference                                                                                                                                                                                |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontmatter keys, invocation modes, YAML pitfalls, claude.ai build        | [frontmatter.md](../.agents/skills/create-or-update-skill/references/frontmatter.md)                                                                                                     |
| Writing principles, structure, progressive disclosure, review checklist   | [writing-guide.md](../.agents/skills/create-or-update-skill/references/writing-guide.md)                                                                                                 |
| Test cases, mocks, evals with fresh subagents, iteration                  | [evals-with-subagents.md](../.agents/skills/create-or-update-skill/references/evals-with-subagents.md)                                                                                   |
| Marketplace, catalog, commits, releases                                   | [registration-and-release.md](../.agents/skills/create-or-update-skill/references/registration-and-release.md)                                                                           |
| New plugin files: plugin.json, marketplace entry, MCP servers, installers | [plugin-files.md](../.agents/skills/create-or-update-plugin/references/plugin-files.md), templates in [assets/](../.agents/skills/create-or-update-plugin/assets/README.md)              |
| Official documentation                                                    | [external-docs.md](../.agents/skills/create-or-update-skill/references/external-docs.md)                                                                                                 |
| Templates                                                                 | [SKILL.template.md](../.agents/skills/create-or-update-skill/assets/SKILL.template.md), [test_cases.template.md](../.agents/skills/create-or-update-skill/assets/test_cases.template.md) |

Repository-only skills (tooling for agents working here) go to
`.agents/skills/<skill-name>/`: same frontmatter rules plus `metadata:` →
`internal: true` (hides them from `npx skills`), not in the catalog, may link
to the repository docs; agents use
[create-or-update-skill](../.agents/skills/create-or-update-skill/SKILL.md).

## Non-negotiables

- English, `SKILL.md` ≤ 200 lines, details in `references/`.
- Exactly `name`, `description`, `effort`, `disable-model-invocation`,
  `user-invocable` (plus `metadata:` → `internal: true` for repository-only
  skills); multi-line description as `description: >-`.
- `plugins/<plugin>/evals/test_cases.md` with ≥ 3 cases, passed by fresh
  subagents, with a baseline run and a trigger check that show the skill adds
  something.
- Registered in the marketplace and the README catalog.
- `npm run verify` (which runs `claude plugin validate`) and `npm run build:skills` pass.
- Conventional Commits, hooks never bypassed.
