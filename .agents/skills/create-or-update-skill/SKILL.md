---
name: create-or-update-skill
description: >-
  Applies this repository's rules for agent configuration in .agents/: where a
  skill or subagent belongs, how repo-internal skills and subagents are
  written and checked, never .claude/. Delegates shipped plugin skills to
  create-skill. Use when creating, changing or reviewing a skill or subagent.
effort: low
disable-model-invocation: false
user-invocable: true
---

# Create or Update a Skill (repository layer)

This skill adds only what is specific to this repository's `.agents/` folder.
How to write a good skill (intent, writing, evals, registration, release) is
owned by `create-skill`, in
[plugins/skill-factory/skills/create-skill/](../../../plugins/skill-factory/skills/create-skill/SKILL.md).
Do not restate it here or anywhere else: link it.

## Hard rules

- **Never create or edit anything under `.claude/`.** It is a git-ignored link
  to `.agents/`, created by `npm run setup`. Write to `.agents/`; if a tool
  wrote through `.claude/`, check `git status` and commit only what belongs.
- **Challenge before writing.** Search existing skills and subagents first
  (`Grep` their `description:` lines). Extending one beats a near-duplicate
  that splits the trigger. Say so in two sentences, then follow the user.
- **Done means verified**: `npm run verify` passed, and you say what you ran.

## 1. Decide where it lives

| It is…                                                        | Path                              | Method                     |
| ------------------------------------------------------------- | --------------------------------- | -------------------------- |
| A skill for users (catalog, installers, marketplace, release) | `plugins/<plugin>/skills/<name>/` | `create-skill`, end to end |
| A skill for agents working in this repository only            | `.agents/skills/<name>/`          | steps 2–3 below            |
| A subagent that runs a workflow in its own context            | `.agents/agents/<name>.md`        | step 4 below               |

When unsure, ask: would a stranger who installs the catalog want it? Yes →
plugin. Only useful with this repository checked out → `.agents/`.

For a shipped skill, stop here and follow `create-skill`. If it is not loaded,
read its `SKILL.md` at the path above.

## 2. Write a repo-internal skill

Same writing standard as shipped skills: follow `create-skill`'s
[writing-guide.md](../../../plugins/skill-factory/skills/create-skill/references/writing-guide.md)
and [frontmatter.md](../../../plugins/skill-factory/skills/create-skill/references/frontmatter.md)
(five keys, booleans written out, `description: >-`, ≤ 200 lines). What
differs, because it never leaves the repository:

- `test_cases.md` sits **in the skill folder**, ≥ 3 cases, written first.
- It **may link** to repository files (docs, scripts, plugin references):
  link instead of copying.
- It is **not** registered: no marketplace entry, README catalog row,
  release-please entry or `build:skills` bundle.
- Shared tooling belongs to the skill that owns it, e.g. this skill's
  [validate_skill.js](scripts/validate_skill.js), which `check-repo.mjs` runs
  on every skill.

## 3. Verify and evaluate

```bash
node .agents/skills/create-or-update-skill/scripts/validate_skill.js .agents/skills/<name>
npm run verify
```

Then run its cases with fresh subagents as described in `create-skill`'s
[evals-with-subagents.md](../../../plugins/skill-factory/skills/create-skill/references/evals-with-subagents.md).
If you cannot start subagents, hand the cases to the caller.

## 4. Write a subagent

A subagent is a Markdown file with YAML frontmatter, read by Claude Code
through the `.claude` link:

```yaml
---
name: verb-object # = file name
description: >-
  <What it does end to end.> Use when <the situation that should delegate to
  it>.
tools: Read, Grep, Glob # least privilege: add Write, Edit, Bash only if needed
skills:
  - <skill it applies> # preloaded; the body names a fallback path
model: inherit
---
```

The body is its whole world: it sees none of the caller's conversation and
cannot ask the user anything. So it must say:

1. The job and the bar it is judged on.
2. When to **stop and return a question** instead of guessing.
3. What it may touch, and that it never commits or pushes unless the caller
   asked.
4. What it cannot do (subagents start no subagents) and what it hands back
   instead.
5. The exact shape of its final report: verdict first, no preamble.

Give it the same name as the skill it runs when it is that skill's isolated
runner (like this one: `.agents/agents/create-or-update-skill.md`).

## Updating

Read the whole file and its test cases first. Add a case that fails today,
make it pass, re-run the others. Keep the name and trigger words: renaming
breaks whoever relies on them.

## Report

Files changed, location and why, commands run with results, eval cases passed
/ failed / not run, and any challenge left open for the user.
