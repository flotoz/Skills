# Writing Guide

Distilled from the sources in [external-docs.md](external-docs.md).

## Contents

- Principles
- Structure of SKILL.md
- Progressive disclosure
- Patterns
- MCP tools and external services
- Volatile facts
- Review checklist

## Principles

- **The reader is smart.** Write only what the model does not already know.
  Every paragraph must earn its tokens.
- **Explain why.** A reason generalises to cases you did not foresee; an
  all-caps MUST does not. Keep hard rules for real red lines (safety, data,
  irreversible actions).
- **Match freedom to fragility.** Open field (analysis, writing) → heuristics.
  Narrow bridge (migrations, releases) → exact commands or a script.
- **Defaults, not menus.** "Use X. For Y, use Z instead." beats listing five
  options.
- **Consistent terms.** Pick one word per concept and keep it.
- **Generalise.** Never patch the skill for one test prompt; fix the
  underlying misunderstanding.

## Structure of SKILL.md

1. Frontmatter ([frontmatter.md](frontmatter.md)).
2. One paragraph: what the skill achieves and for whom.
3. Hard rules (≤ 7 bullets).
4. Workflow: numbered steps, a copyable checklist, decision points written as
   "If … → …".
5. Output format: a template in `assets/` or `references/`, or a short inline
   example.
6. Edge cases the evals revealed.

Stay ≤ 200 lines. Remove repository-only content (validation commands,
changelog) — the skill folder is copied to users' machines.

## Progressive disclosure

| Level                    | Loaded                               | Budget      |
| ------------------------ | ------------------------------------ | ----------- |
| `name` + `description`   | always, in every session             | ~100 words  |
| `SKILL.md` body          | when the skill triggers              | ≤ 200 lines |
| `references/`, `assets/` | when SKILL.md points to them         | unlimited   |
| `scripts/`               | executed; only output enters context | unlimited   |

- Link every reference directly from `SKILL.md` and say when to read it.
- Files over 100 lines start with a table of contents.
- Split by domain (`references/aws.md`, `references/gcp.md`) so the agent loads
  only what applies.
- **Self-contained**: a skill is installed and zipped alone, so links must stay
  inside its folder. To share a reference with a sibling skill, copy it
  (`verify:rules` rejects links that leave the folder).
- **No overlap**: compare the description with the other skills of the plugin.
  If both could trigger on the same request, narrow one and add a hand-off
  line ("for X, use the <other> skill").

## Patterns

- **Checklist** for multi-step work; the agent copies and ticks it.
- **Template** for output: strict when a format is consumed by code, flexible
  otherwise.
- **Examples** (input → output) when style matters more than rules.
- **Feedback loop**: do → validate (script or checklist) → fix → repeat.
- **Bundled script** when every eval run rewrote the same helper.
- **Forward slashes** in paths; descriptive file names.

## MCP tools and external services

- Name tools by suffix: the prefix depends on the client
  (`mcp__server__tool`, `mcp__plugin_<plugin>_<server>__tool`, `Server:tool`).
- First step checks the tools exist. Missing → stop, show setup steps for the
  user's client (in a reference file), ask them to confirm.
- Declare remote MCP servers in the plugin's `.mcp.json` so the Claude Code
  plugin install adds them.
- Never ask for passwords, API keys or bank credentials in chat.

## Volatile facts

Tax rates, prices, interest rates, limits, versions and index weights change.
Do not state them as truth in the skill. Add a step that verifies them on an
official source with web tools and cites source + date, or gives no number.
Example: the French flat tax moved from 30 % to 31.4 % on 2026-01-01 — a model
answering from memory gets it wrong.

## Review checklist

- [ ] Description: outcome + "Use when" + users' words, ≤ 1024 chars
- [ ] Name = folder, imperative verb + object
- [ ] ≤ 200 lines, English, no repository-only content
- [ ] Hard rules short and justified
- [ ] Workflow numbered with a checklist
- [ ] Every reference linked from SKILL.md, one level deep
- [ ] Missing prerequisites handled (MCP, files, credentials)
- [ ] Volatile facts fact-checked, not hard-coded
- [ ] No time-sensitive statements ("before August …")
- [ ] Test cases ≥ 3 and all passing with fresh subagents
- [ ] A baseline run without the skill fails at least one case the skill
      passes (otherwise the case, or the skill, adds nothing)
- [ ] Trigger check: 2–3 prompts that should load it and 1–2 near misses
      that should not (generic questions, out-of-scope requests)
