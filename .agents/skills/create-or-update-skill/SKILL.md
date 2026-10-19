---
name: create-or-update-skill
description: >-
  Creates or updates an agent skill in this repository to Anthropic quality
  standards: captures the intent, challenges the request, writes test cases
  first, keeps SKILL.md short, registers, verifies and evaluates it with fresh
  agents. Use whenever a skill is created, renamed, changed, tested or
  reviewed, or a workflow should become a skill, even if the user does not say
  "skill".
effort: medium
disable-model-invocation: false
user-invocable: true
metadata:
  internal: true
---

# Create or Update a Skill

A skill is a prompt that runs on machines you will never see, triggered by a
description the agent reads among dozens of others. It earns its place only if
an agent with it beats an agent without it on a job users actually ask for.
Everything below serves that test.

## Hard rules

- **Challenge before writing.** If the request duplicates a skill, has no clear
  trigger, hard-codes volatile facts or hides a side effect behind auto mode,
  say so in two sentences with a better option, then follow the user's call.
  Never "fix" scope silently in the diff.
- **Test cases before the skill.** No eval, no skill.
- **English only** in repository files; the skill tells the agent to answer in
  the user's language.
- **`SKILL.md` ≤ 200 lines.** Details go to `references/`, one level deep.
- **Only what the model does not already know.** Cut every sentence a strong
  model would do anyway; keep the decisions, the traps and the order.
- **Never edit under `.claude/`**: it is a link to `.agents/`.
- **Done means verified**: every command in step 6 passed, and you say which
  ones you ran.

## 0. Capture the intent

If the conversation already holds the workflow ("turn this into a skill"),
extract its steps, tools, corrections and output formats first. Then ask only
what is missing, in one message: the job and what "done" looks like, the words
users type (in which languages), external services, side effects, and the
plugin it joins. Restate the intent in 2–3 lines and get a yes. For a new
skill touching tools or APIs, research their official docs (in parallel
subagents when available), starting from
[references/external-docs.md](references/external-docs.md).

## 1. Decide where it lives

| Kind                                                  | Path                              | Ships to users |
| ----------------------------------------------------- | --------------------------------- | -------------- |
| Distributed (catalog, installers, plugin marketplace) | `plugins/<plugin>/skills/<name>/` | yes            |
| Repo-internal (tooling for agents working here)       | `.agents/skills/<name>/`          | no             |
| Subagent that runs a workflow in its own context      | `.agents/agents/<name>.md`        | no             |

Search first (`Grep` the `description:` lines of every `SKILL.md`): extending
an existing skill beats adding a near-duplicate that splits the trigger.

A distributed skill folder is copied alone by installers: no link may leave it,
nothing in it may be repo-only (tests, fixtures, repo commands).

## 2. Name it

Imperative verb + object, lowercase-hyphen, ≤ 64 chars, equal to the folder:
`coach-my-finances`, `build-harness`, `run-test`. Reject nouns (`harness`) and
vague verbs (`handle`, `manage`, `do`). No `claude` or `anthropic`. Renaming a
shipped skill is a breaking change (`feat!:` + `BREAKING CHANGE:` footer).

## 3. Write the test cases first

Distributed: `plugins/<plugin>/evals/test_cases.md`. Internal: `test_cases.md`
in the skill folder. At least 3 `## Case N: …` sections, each with **Input**
and **Expected Output**:

1. Happy path, with the exact words a user would type.
2. Missing prerequisite (no MCP, no data, no access): the skill says what is
   missing and how to fix it, never fails silently.
3. A request the skill must refuse, challenge or narrow.

Template: [assets/test_cases.template.md](assets/test_cases.template.md).
Mock external services so evals run without real accounts (see
`plugins/finary-coach/evals/`). Fixtures are synthetic: no real personal data.

## 4. Write `SKILL.md`

Start from [assets/SKILL.template.md](assets/SKILL.template.md). Details:
[references/frontmatter.md](references/frontmatter.md) (keys, modes, YAML
traps, claude.ai build) and
[references/writing-guide.md](references/writing-guide.md) (structure,
progressive disclosure, review checklist).

Frontmatter — these five keys, nothing else, booleans written out
(repo-internal skills add `metadata:` → `internal: true`, see frontmatter.md):

```yaml
---
name: verb-object
description: >-
  <What it does, third person, concrete nouns.> Use when <the words users
  type, in their languages>.
effort: low | medium | high | xhigh | max
disable-model-invocation: false
user-invocable: true
---
```

**The description is the trigger.** Agents list only `name` and `description`,
in every session; nothing else is seen before the skill loads. ~250 chars,
≤ 1024, no XML tags, always `>-` (a colon followed by a space in plain YAML drops the
frontmatter in Claude Code).

- Weak: `Helps with finances.` — no object, no trigger, collides with
  everything.
- Strong: `Coaches a French investor on their Finary portfolio: safety cushion,
PEA vs CTO, fees. Use when the user asks about savings, épargne, PEA…`

**Invocation mode** — choose deliberately, always both fields:

| Mode       | `disable-model-invocation` | `user-invocable` | For                                                   |
| ---------- | -------------------------- | ---------------- | ----------------------------------------------------- |
| Auto       | `false`                    | `true`           | read-only workflows                                   |
| Agent only | `false`                    | `false`          | background rules the agent applies (criteria, styles) |
| Manual     | `true`                     | `true`           | side effects: publish, post, deploy, pay; costly runs |

Manual also requires: description starting with `Manual only`, and
`agents/openai.yaml` containing `policy:` → `allow_implicit_invocation: false`
(Codex). `true` / `false` is unreachable and rejected.

**Body**, in this order:

1. One paragraph: the job and the outcome.
2. Hard rules (never / always / ask first) — the lines that prevent damage.
3. A numbered workflow, with a copyable checklist when it has more than 4
   steps.
4. Links to `references/<topic>.md` for templates, long tables, setup guides.
   Reference files over 100 lines start with a table of contents.

Craft rules: forward slashes in paths; MCP tools named by suffix (the prefix
depends on the client) with setup steps when missing; volatile facts (rates,
ceilings, prices, versions) verified on an official source and cited with the
date, or not given at all; scripts are executed, not read — say what they
print.

## 5. Register it (distributed only)

- New plugin: use [create-or-update-plugin](../create-or-update-plugin/SKILL.md)
  first (plugin.json, marketplace entry, README, LICENSE, installers).
- A row in the README catalog and the plugin README, and a usage example
  under `## Use`.
- Details and release effect:
  [references/registration-and-release.md](references/registration-and-release.md).

## 6. Verify

```bash
node .agents/skills/create-or-update-skill/scripts/validate_skill.js <skill-folder>
npm run verify          # includes claude plugin validate
npm run build:skills    # shipped skills: claude.ai bundles
```

Fix the cause of a failure, never the check. Never `--no-verify`.

## 7. Evaluate

For each test case, start a **fresh agent** that gets only the skill and the
case input — never the expected output — and grade its answer against the
case. Fix the skill, re-run the failing cases. A behaviour change without a
re-run eval is not done. If you cannot start agents, say so and hand the cases
to the caller. Baseline runs, grading and iteration:
[references/evals-with-subagents.md](references/evals-with-subagents.md).

## Updating a skill

Read the whole skill and its test cases first, and snapshot it so a baseline
agent can run the old version. Add a case that fails today, make it pass,
re-run the others: an update must not regress a case. Keep the name and the
trigger words users already rely on. Size the re-run to the change:

| Change                           | Re-run                                                |
| -------------------------------- | ----------------------------------------------------- |
| Description or wording only      | 2–3 prompts that should trigger it, 1 that should not |
| One workflow step or rule        | the cases touching it + 1 unrelated case as a guard   |
| Workflow, tools or output format | every case, with baseline                             |

## Report

End with: files changed, invocation mode and why, commands run with results,
eval cases passed / failed / not run, and any challenge left open for the user.
