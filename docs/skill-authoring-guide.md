# Skill Authoring Guide

How skills are written in this repository. Sources:
[Anthropic best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices),
[Claude Code skills](https://code.claude.com/docs/en/skills),
[Claude Code plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces),
[vercel-labs/skills](https://github.com/vercel-labs/skills).

## Layout

```text
plugins/<plugin>/
├── .claude-plugin/plugin.json   # manifest — name = marketplace entry name
├── .mcp.json                    # MCP servers the plugin needs (optional)
├── skills/<skill-name>/         # ← what gets installed on users' machines
│   ├── SKILL.md                 # ≤ 200 lines, loaded when the skill triggers
│   ├── references/<topic>.md    # loaded on demand, linked from SKILL.md
│   └── scripts/                 # executed, not read (optional)
└── evals/                       # repo only, never needed at runtime
    ├── README.md
    ├── test_cases.md            # ≥ 3 cases: expected behaviour
    └── fixtures/, mocks…
```

Keep anything the agent does not need at runtime (tests, fixtures, repo
commands) out of `skills/<skill-name>/`: installers copy that whole folder,
and links must not leave it.

## Add a skill

Agents: use the
[create-or-update-skill](../.agents/skills/create-or-update-skill/SKILL.md)
skill or subagent. Repository-only skills (tooling for agents working here)
go to `.agents/skills/<skill-name>/` instead of a plugin: same frontmatter
rules, not in the catalog, may link to the repository docs.

1. Create `plugins/<plugin>/skills/<skill-name>/SKILL.md` (new plugin: also
   `.claude-plugin/plugin.json` and an entry in
   [marketplace.json](../.claude-plugin/marketplace.json)).
2. Write `evals/test_cases.md` first (≥ 3 cases).
3. Add the skill to the README catalog.
4. `npm run verify` and `claude plugin validate .`.

## Rules

1. **Always in English.** The skill tells the agent to answer in the user's
   language.
2. **Name**: imperative verb + object, lowercase-hyphen, ≤ 64 chars, equal to
   the folder name (`coach-my-finances`). No `claude` / `anthropic`.
3. **Frontmatter**: `name`, `description`, `effort`,
   `disable-model-invocation`, `user-invocable` — nothing else.
4. **Description** (~250 chars, third person, ≤ 1024): what it does, then
   `Use when …` with the words users type, in their language too. It is the
   only text the agent sees before loading the skill. Write multi-line
   descriptions as `description: >-` (folded block): a colon followed by a
   space breaks plain YAML and Claude Code silently drops the frontmatter.
5. **Invocation mode**:
   - Auto (`false` / `true`): read-only workflows.
   - Agent only (`false` / `false`): background knowledge.
   - Manual (`true` / `true`): side effects (publish, deploy, pay). Description
     starts with `Manual only`; add `agents/openai.yaml` with
     `policy: { allow_implicit_invocation: false }`.
6. **Concise**: only what the model does not already know. Hard rules first,
   then a numbered workflow with a copyable checklist.
7. **Progressive disclosure**: long tables, templates and setup guides go to
   `references/`, linked directly from `SKILL.md` (one level deep). Files over
   100 lines start with a table of contents.
8. **MCP tools**: name the tools by suffix (the prefix depends on the client),
   say what to do when they are missing (setup steps + ask the user), never
   fail silently.
9. **Volatile facts** (tax rates, ceilings, interest rates, index weights):
   never hard-code them as truth. Add a fact-check step that verifies them on
   an official source and cites it with the date, or gives no number. See
   [fact-check.md](../plugins/finary-coach/skills/coach-my-finances/references/fact-check.md).
10. **Forward slashes** in paths.

## Evals

- Write `test_cases.md` before the skill: happy path, missing prerequisite,
  a request the skill must refuse or challenge.
- Mock external services (see
  [finary-coach/evals](../plugins/finary-coach/evals/README.md)) so evals run
  without real accounts.
- Run each case with a **fresh agent** that reads only the skill, never the
  test cases, then grade its answer against them. Fix, re-run.
