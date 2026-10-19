---
name: <verb-object>
description: >-
  <Outcome in one sentence: what the agent achieves, on which data or tool>.
  Use when <the words users type, in their languages>, even if they don't say
  "<obvious keyword>".
effort: medium
disable-model-invocation: false
user-invocable: true
---

# <Title Case Name>

<One paragraph: what the skill achieves, for whom, and the approach it
follows.>

## Hard rules

- **<Rule>.** <Why it matters, in one line.>
- **Language**: answer in the user's language.

## Workflow

```text
- [ ] 1. Prerequisites checked
- [ ] 2. Missing information asked
- [ ] 3. <Core step>
- [ ] 4. Result checked
- [ ] 5. Answer delivered
```

### 1. Check prerequisites

<Tools, MCP servers, files or credentials needed. If missing → stop, show the
setup from `references/<setup>.md`, ask the user to
confirm.>

### 2. Ask only what is missing

<At most N questions, grouped in one message, only those that change the
result.>

### 3. <Core step>

<Instructions, defaults, decision points as "If … → …". Link details in
references/.>

### 4. Check the result

<Validation: a script to run, a checklist, or a fact-check of volatile
figures.>

### 5. Deliver

<Output format, or a link to a template in assets/.>
