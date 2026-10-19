# External Docs

Read these when the repository guides are not enough. Prefer them over memory:
skill formats and CLI flags evolve.

| Topic                                                                 | Source                                                                             |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Authoring best practices (concision, freedom, patterns, evals)        | <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices> |
| How skills load (progressive disclosure, runtime)                     | <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview>       |
| Claude Code skills: frontmatter fields, `$ARGUMENTS`, invocation      | <https://code.claude.com/docs/en/skills>                                           |
| Plugins: manifest, components, `.mcp.json`                            | <https://code.claude.com/docs/en/plugins>                                          |
| Marketplaces: `marketplace.json`, sources, validation                 | <https://code.claude.com/docs/en/plugin-marketplaces>                              |
| Marketplace field reference                                           | <https://code.claude.com/docs/en/plugins/marketplace-reference>                    |
| Subagents in Claude Code                                              | <https://code.claude.com/docs/en/sub-agents>                                       |
| Anthropic's own skill-creator (eval loop, grader, description tuning) | <https://github.com/anthropics/skills/tree/main/skills/skill-creator>              |
| Example skills by Anthropic                                           | <https://github.com/anthropics/skills>                                             |
| Cross-agent installer (`npx skills`)                                  | <https://github.com/vercel-labs/skills>                                            |
| Model Context Protocol                                                | <https://modelcontextprotocol.io>                                                  |
| Conventional Commits                                                  | <https://www.conventionalcommits.org>                                              |

For a third-party service the skill uses (e.g. an MCP connector), find its
official help page and record install steps and tool names in a
`references/connect-<service>.md` of that skill.
