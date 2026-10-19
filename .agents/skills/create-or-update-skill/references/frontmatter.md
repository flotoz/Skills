# Frontmatter

This repository uses exactly five keys. `npm run verify:rules` rejects any
other key and any YAML that does not parse. Repo-internal skills in
`.agents/skills/` add a sixth, required one, `metadata:` → `internal: true`:
`npx skills` scans `.agents/skills/` and would otherwise offer them to users.

```yaml
---
name: coach-my-finances
description: >-
  Coaches personal finances from live Finary data (MCP): safety cushion,
  budget, PEA vs CTO … Use for any question on savings, net worth or Finary
  (épargne, patrimoine, placements).
effort: medium
disable-model-invocation: false
user-invocable: true
---
```

| Key                        | Rule                                                                                             | Why                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `name`                     | lowercase-hyphen, ≤ 64 chars, = folder name, imperative verb + object, no `claude` / `anthropic` | It becomes the `/command`; reserved words are refused by Anthropic |
| `description`              | third person, ≤ 1024 chars (~250 ideal), what it does then `Use when …` / `Use for …`            | Only text every agent sees before loading the skill                |
| `effort`                   | `low` · `medium` · `high` · `xhigh` · `max`                                                      | Claude Code reasoning effort while the skill runs                  |
| `disable-model-invocation` | `true` / `false`, always written                                                                 | Whether the agent may start the skill on its own                   |
| `user-invocable`           | `true` / `false`, always written                                                                 | Whether it appears in the `/` menu                                 |

## YAML pitfall

A description containing a colon followed by a space breaks plain YAML, and Claude
Code then **silently drops the whole frontmatter**. Always use the folded
block `description: >-` for multi-line descriptions.

## Invocation mode

| Mode       | `disable-model-invocation` | `user-invocable` | Use for                                                   |
| ---------- | -------------------------- | ---------------- | --------------------------------------------------------- |
| Auto       | `false`                    | `true`           | Read-only or repository-only workflows                    |
| Agent only | `false`                    | `false`          | Background rules or knowledge, not a command              |
| Manual     | `true`                     | `true`           | Side effects outside the repo: publish, post, pay, deploy |

A manual skill also needs:

- a description starting with `Manual only` (Warp has no invocation field);
- `agents/openai.yaml` with `policy:` → `allow_implicit_invocation: false`
  (Codex).

`disable-model-invocation: true` with `user-invocable: false` is unreachable
and rejected.

## Description that triggers

- Lead with the outcome, then the trigger contexts.
- Use the words users type, including other languages if users write in them.
- Be slightly pushy: "Use whenever …, even if they don't say X". Models tend to
  under-trigger.
- No XML tags, no first person.

## Compiled per target

`npm run build:skills` writes `dist/<plugin>/<skill>.zip` for claude.ai and
the Claude API. Those only accept `name`, `description`, `license`,
`allowed-tools`, `metadata`, `compatibility`, so the build drops `effort` and
the invocation keys. Claude Code, Codex and Cursor install from the repository
and keep the full frontmatter.
