# Skill Authoring Guide

How skills are written in this repository. Sources:
[Anthropic best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices),
[Claude Code plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces),
[vercel-labs/skills](https://github.com/vercel-labs/skills).

## Layout

```
.claude-plugin/marketplace.json        # catalog: one entry per plugin
plugins/<plugin>/
  .claude-plugin/plugin.json           # plugin manifest (name = marketplace entry name)
  .mcp.json                            # MCP servers the plugin needs (optional)
  skills/<skill-name>/
    SKILL.md                           # ≤ 200 lines, always loaded when triggered
    references/<topic>.md              # loaded on demand, one level deep
    scripts/                           # executed, not read
    test_cases.md                      # behavioural evals
```

## Rules

1. **Always in English.** The skill tells the agent to answer in the user's
   language.
2. **Name**: imperative verb + object, lowercase-hyphen, ≤ 64 chars
   (`analyze-finary-wealth`). No `claude` / `anthropic`.
3. **Frontmatter**: `name`, `description`, `effort`,
   `disable-model-invocation`, `user-invocable` — nothing else.
4. **Description** (~250 chars, third person): what it does, then
   `Use when …` with the words users actually type. It is the only text the
   agent sees before deciding to load the skill.
5. **Invocation mode**:
   - Auto (`false` / `true`): read-only workflows.
   - Agent only (`false` / `false`): background knowledge.
   - Manual (`true` / `true`): side effects (publish, deploy, pay). Description
     starts with `Manual only` and add `agents/openai.yaml` with
     `policy: { allow_implicit_invocation: false }`.
6. **Concise**: only what the model does not already know. Hard rules first,
   then a numbered workflow with a copyable checklist.
7. **Progressive disclosure**: long tables, templates, setup guides go to
   `references/`, linked directly from `SKILL.md`. Files > 100 lines start with
   a table of contents.
8. **MCP tools**: name the tools and say what to do when they are missing
   (setup instructions + ask the user), never fail silently.
9. **Forward slashes** in paths, no time-sensitive statements.
10. **Evals first**: at least 3 cases in `test_cases.md` covering the happy
    path, missing prerequisites and a request the skill must refuse or
    challenge.

## Checklist before merging

- [ ] `node scripts/validate_skill.js plugins/<plugin>/skills` passes
- [ ] `claude plugin validate .` passes (if the Claude CLI is installed)
- [ ] Skill added to the README catalog
- [ ] Tested on a real request in a fresh session
