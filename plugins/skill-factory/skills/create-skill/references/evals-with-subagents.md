# Evals with Subagents

A skill works when a model that has never seen this conversation gets the
right result from it. Subagents give you that model for free.

## Contents

- Test cases
- Mocks for external services
- Running the evals
- Grading
- Iterating

## Test cases

`plugins/<plugin>/evals/test_cases.md`, one `## Case N: <title>` per case
(the rules check needs ≥ 3), each with **Input** and **Expected Output** as
observable behaviour ("asks at most 5 questions", "cites the source with a
date"), never "works well". Cover: happy path, missing prerequisite, a
request to refuse or challenge, and every bug found later.

## Mocks for external services

When the skill calls an MCP server or API, add to `evals/`:

- `fixtures/<scenario>.json` — fake data per scenario, including traps
  (sensitive fields that must not be echoed, edge values);
- `mock-<service>-mcp.mjs` — a dependency-free stdio MCP server exposing the
  same tool names, serving the fixture;
- `call-tool.mjs` — calls one mock tool from a shell, for subagents that
  cannot attach an MCP server.

Copy the ones in `plugins/finary-coach/evals/` and change tool names and data.

## Running the evals

Launch every run of an iteration **in the same message** so they finish
together. Per case:

- **with skill** — the current skill;
- **baseline** — no skill (new skill) or a snapshot of the previous version
  (update).

Brief for a with-skill subagent:

```text
You are a fresh assistant with the skill <name> installed. Behave exactly as
it instructs, as with a real user.
Skill: <absolute path>/SKILL.md — read it, then only the files it links.
Do NOT read test_cases.md, fixtures, or anything else under evals/.
Environment: <tools available, e.g. "call Finary tools with
node <path>/call-tool.mjs <fixture> <tool> '<json>'">, <client: Claude Code>.
User message: "<case input, in the user's language>"
Return ONLY the exact reply to the user, then a line ---TRACE--- listing tools
called, web pages opened, and skill files read.
```

The trace shows whether the skill was followed (files read, tools called) —
read it, not only the reply.

## Grading

For each case, compare the reply with **Expected Output**:

| Case            | With skill | Baseline            | Evidence |
| --------------- | ---------- | ------------------- | -------- |
| 1 · missing MCP | ✅         | ❌ invented numbers | quote    |

- A pass needs evidence, not surface compliance (right heading, wrong
  content = fail).
- Flag weak cases that would pass even without the skill.
- Check factual claims in the reply (rates, limits) yourself.

## Iterating

1. Find the cause in the skill text: missing rule, ambiguous wording, rule in
   a file the agent did not read.
2. Fix it generally; prefer explaining why over adding a MUST.
3. If every run rebuilt the same helper, bundle it in `scripts/`.
4. Re-run the failed cases (and one passing case as a guard).
5. Record each new failure mode as a test case.

Stop when all cases pass, or after 3 iterations without progress — then
report the failing cases to the user instead of looping.
