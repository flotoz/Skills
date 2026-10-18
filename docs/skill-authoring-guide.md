# Skill Authoring Guide

The fastest way to add or change a skill is the `create-skill` skill, run in a
clone of this repository:

```text
/create-skill <what the skill should do>
```

Its references are the single source of truth for how skills are written here
— read them directly when working by hand:

| Topic                                                                   | Reference                                                                                                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontmatter keys, invocation modes, YAML pitfalls, claude.ai build      | [frontmatter.md](../plugins/skill-factory/skills/create-skill/references/frontmatter.md)                                                                                                         |
| Writing principles, structure, progressive disclosure, review checklist | [writing-guide.md](../plugins/skill-factory/skills/create-skill/references/writing-guide.md)                                                                                                     |
| Test cases, mocks, evals with fresh subagents, iteration                | [evals-with-subagents.md](../plugins/skill-factory/skills/create-skill/references/evals-with-subagents.md)                                                                                       |
| Marketplace, catalog, release config, commits, releases                 | [registration-and-release.md](../plugins/skill-factory/skills/create-skill/references/registration-and-release.md)                                                                               |
| Official documentation                                                  | [external-docs.md](../plugins/skill-factory/skills/create-skill/references/external-docs.md)                                                                                                     |
| Templates                                                               | [SKILL.template.md](../plugins/skill-factory/skills/create-skill/assets/SKILL.template.md), [test_cases.template.md](../plugins/skill-factory/skills/create-skill/assets/test_cases.template.md) |

## Non-negotiables

- English, `SKILL.md` ≤ 200 lines, details in `references/`.
- Exactly `name`, `description`, `effort`, `disable-model-invocation`,
  `user-invocable`; multi-line description as `description: >-`.
- `plugins/<plugin>/evals/test_cases.md` with ≥ 3 cases, passed by fresh
  subagents.
- Registered in the marketplace, the README catalog and the release config.
- `npm run verify`, `npm run build:skills` and `claude plugin validate .` pass.
- Conventional Commits, hooks never bypassed.
