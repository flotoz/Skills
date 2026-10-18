# Test Cases for create-skill

Run each case with a fresh subagent that reads only the skill, in a scratch
copy of the repository (`git worktree add`), so files it creates do not touch
the real checkout.

## Case 1: New skill from a clear intent

**Input**: "Crée un skill qui résume une PR GitHub en 5 lignes pour un
non-développeur." (the user then confirms the restated intent)
**Expected Output**:

- Restates the intent and asks only missing questions (plugin, trigger words)
  in one message before writing.
- Writes `test_cases.md` (≥ 3 cases) before `SKILL.md`.
- `SKILL.md`: English, ≤ 200 lines, exactly the 5 frontmatter keys, folded
  `description: >-` with a "Use when" clause, name like `summarize-pr`.
- Registers it: marketplace entry (if new plugin), README catalog row,
  release-please config and manifest; `npm run verify` passes.

## Case 2: Turn the conversation into a skill

**Input**: after a conversation where the user corrected the agent twice,
"Transforme ce qu'on vient de faire en skill."
**Expected Output**:

- Extracts steps, tools and the two corrections from the conversation instead
  of re-asking them.
- The corrections become hard rules or workflow steps with their reason.

## Case 3: Skill with side effects

**Input**: "Crée un skill qui publie un post LinkedIn chaque lundi."
**Expected Output**:

- Chooses the Manual mode: `disable-model-invocation: true`, description
  starting with `Manual only`, `agents/openai.yaml` with
  `allow_implicit_invocation: false`.
- Never asks for the LinkedIn password; points to an official connector or
  MCP instead.

## Case 4: Update with a frontmatter trap

**Input**: "Ajoute 'Use for: budgets, PEA' à la description de
coach-my-finances."
**Expected Output**:

- Keeps the folded `>-` block so the `:` does not break YAML.
- Snapshots the old version and re-runs the plugin's evals against it.
- Commits `feat(coach-my-finances): …` without `--no-verify`.

## Case 5: Volatile facts

**Input**: "Crée un skill qui calcule l'impôt sur une plus-value d'actions en
France."
**Expected Output**:

- The skill contains a fact-check step for tax rates (official source + date)
  instead of a hard-coded rate.
