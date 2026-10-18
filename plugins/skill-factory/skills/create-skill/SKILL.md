---
name: create-skill
description: >-
  Creates or updates an agent skill in this repository end to end: intent
  interview, SKILL.md with the repo frontmatter, references, evals run by
  fresh subagents, marketplace and build registration, release. Use whenever
  the user wants a new skill, to turn a workflow into a skill, or to improve,
  test or publish one, even if they don't say "skill".
effort: high
disable-model-invocation: false
user-invocable: true
---

# Create Skill

Turn an intent into a skill that triggers at the right time, does the job with
few tokens, passes its evals and ships through the release pipeline.

A skill is read by another model with none of today's context. Write for that
reader: explain why a rule exists, give defaults instead of menus, and keep
everything it does not need at runtime out of the skill folder.

## Hard rules

- **English only** in skill files. The skill tells its agent to answer in the
  user's language.
- **`SKILL.md` ≤ 200 lines.** Detail goes to `references/`, linked from
  `SKILL.md`, one level deep.
- **Repository frontmatter**, exactly these keys:
  [references/frontmatter.md](references/frontmatter.md).
- **Evals before polish.** No skill is done until fresh subagents passed its
  test cases.
- **Never commit without the hooks** (`--no-verify` is forbidden) and use
  Conventional Commits.

## Workflow

Copy and tick:

```text
- [ ] 1. Intent captured
- [ ] 2. Research done (subagents)
- [ ] 3. Test cases written
- [ ] 4. Skill drafted
- [ ] 5. Evals passed (subagents)
- [ ] 6. Registered in marketplace, catalog and build
- [ ] 7. Verified, committed, PR opened
```

Jump in where the user is: a draft already exists → start at step 3 or 5.

### 1. Capture intent

If the conversation already holds the workflow ("turn this into a skill"),
extract the steps, tools, corrections and output formats from it first. Then
ask only what is missing, in one grouped message:

1. What should the agent be able to do, and what does "done" look like?
2. When should it trigger — which words do users type, in which languages?
3. Inputs, outputs, external services (MCP servers, APIs, credentials)?
4. Side effects outside the repository (publish, pay, deploy)? → decides the
   invocation mode.
5. Which plugin does it belong to (existing or new)?

Restate the intent in 2–3 lines and get a yes before writing.

### 2. Research with subagents

Launch in parallel, in one message, when the client supports subagents
(otherwise do it inline):

- **Explore** the repository: similar skills, the plugin it joins, shared
  references to link instead of copy.
- **Docs**: the official documentation of every tool, API or MCP server the
  skill uses — current install steps, tool names, limits. Start from
  [references/external-docs.md](references/external-docs.md).

Give each subagent a self-contained brief and ask for a short summary with
links, not file dumps.

### 3. Write test cases first

Create `plugins/<plugin>/evals/test_cases.md` with at least 3 cases, using
[assets/test_cases.template.md](assets/test_cases.template.md):

- the happy path, phrased the way a real user would say it;
- a missing prerequisite (no MCP, no file, no credentials);
- a request the skill must refuse, challenge or redirect.

External services get a mock and fixtures (see
[references/evals-with-subagents.md](references/evals-with-subagents.md)).

### 4. Draft the skill

Start from [assets/SKILL.template.md](assets/SKILL.template.md) and follow
[references/writing-guide.md](references/writing-guide.md). In short:

- **Name**: imperative verb + object, folder name = `name`.
- **Description**: what it does, then "Use when …" with the users' own words
  — slightly pushy, models tend to under-trigger skills.
- **Body**: hard rules, then a numbered workflow with a copyable checklist,
  then output format. Explain the why; avoid shouting MUST.
- **Volatile facts** (rates, prices, versions, limits): add a fact-check step,
  never hard-code them as truth.
- **Scripts** for deterministic or repeated work, in `scripts/`, executed not
  read.

Layout:

```text
plugins/<plugin>/
├── .claude-plugin/plugin.json
├── .mcp.json                 # only if the skill needs MCP servers
├── README.md, LICENSE        # plugin doc + MIT license (from assets/plugin/)
├── install.sh, install.ps1   # plugin installers (from assets/plugin/)
├── skills/<skill>/           # installed on users' machines
│   ├── SKILL.md
│   ├── references/*.md
│   ├── assets/               # templates the agent fills (optional)
│   └── scripts/              # optional
└── evals/                    # repository only
```

### 5. Run evals with fresh subagents

Follow [references/evals-with-subagents.md](references/evals-with-subagents.md):

1. For each test case, launch **in the same message** one subagent with the
   skill and one baseline without it (or with the previous version).
2. A subagent reads only `SKILL.md` and what it links — never the test cases
   or fixtures — and returns the exact reply it would give plus a trace.
3. Grade each reply against the case; quote evidence for every fail.
4. Fix the cause in the skill, generalise (no case-specific patches), re-run
   the failed cases. Stop when all pass or progress stalls; tell the user
   which cases still fail.

Also launch one **reviewer** subagent on the finished `SKILL.md` with the
checklist from the writing guide.

### 6. Register the skill

Follow [references/registration-and-release.md](references/registration-and-release.md):

- new plugin → entry in `.claude-plugin/marketplace.json`, `plugin.json`,
  its own `README.md`, `LICENSE` (MIT) and `install.sh`/`install.ps1`
  from [assets/plugin/](assets/plugin/README.md), release-please config and
  manifest;
- skill → row in the root README catalog (Plugin column links the plugin
  README) and in the plugin README;
- `npm run build:skills` must produce `dist/<plugin>/<skill>.zip`.

### 7. Verify and ship

```bash
npm run verify
npm run build:skills
claude plugin validate .
```

All three pass, then:

- branch `feat/<skill>` (or `fix/<skill>`), commit with
  `feat(<skill>): …` — the hooks run formatting and the rules;
- push and open the PR with the eval results in the description;
- after merge, release-please opens a release PR that bumps the plugin version
  and changelog; merging it publishes the GitHub Release with the zip.

## Updating an existing skill

Snapshot it first (copy to a temp folder) so the baseline subagent can run the
old version. Keep the name unless the user accepts a breaking change
(`feat(<skill>)!:` + `BREAKING CHANGE:` footer).

Size the evals to the change — each subagent run costs time and tokens:

| Change                           | Re-run                                                |
| -------------------------------- | ----------------------------------------------------- |
| Description or wording only      | 2–3 prompts that should trigger it, 1 that should not |
| One workflow step or rule        | the cases touching it + 1 unrelated case as a guard   |
| Workflow, tools or output format | every case, with baseline                             |

## Report to the user

End with: what the skill does (one line), the files created, the eval table
(case → pass/fail), what was not verified, and the PR link.
