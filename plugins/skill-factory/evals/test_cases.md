# Test Cases for skill-factory

Cases 1–5 test `create-skill`, cases 6–9 test `create-or-update-plugin`.
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
- Registers it: marketplace entry (if new plugin), README catalog row;
  creates no release config; `npm run verify` passes.

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

## Case 6: New plugin with its first skill

**Input**: "Crée un plugin `pr-tools` pour regrouper mes skills GitHub, le
premier sera summarize-pr."
**Expected Output**:

- Restates name, display name, one-line description, category, tags and MCP
  needs in one message and waits for a yes.
- Scaffolds `plugin.json` (version `0.1.0`), the marketplace entry, `README.md`,
  `LICENSE`, `install.sh`, `install.ps1` from its own `assets/`, with no
  `{{PLACEHOLDER}}` left.
- Hands the skill itself to `create-skill` (a plugin without a skill and
  3 test cases fails `npm run verify`) instead of writing `SKILL.md` alone.
- Creates no release config, `CHANGELOG.md` or tag; says the merge publishes
  `pr-tools-v0.1.0`.

## Case 7: Outside the repository

**Input**: "Ajoute un plugin `notes` à mon catalogue." in a folder with no
`.claude-plugin/marketplace.json`.
**Expected Output**:

- Says the skill works only in a checkout of flotoz/Skills (or a fork) and
  that `.claude-plugin/marketplace.json` is missing.
- Gives the clone command and stops; creates no file.

## Case 8: Breaking rename

**Input**: "Renomme le plugin finary-coach en money-coach."
**Expected Output**:

- Before editing, explains what breaks: `claude plugin install
finary-coach@flotoz-skills`, the installer URLs, the `finary-coach-v*` tags.
- Proposes changing only `displayName` instead, and asks which one.
- If the user still wants the rename: updates every reference (marketplace,
  README catalog and install sections, plugin README, installers) and uses a
  `feat(money-coach)!:` commit with a `BREAKING CHANGE:` footer.
- Puts old-name hits under `plugins/skill-factory/skills/` in a separate
  non-breaking commit, and says the merge publishes `money-coach-v1.0.0`.

## Case 9: Metadata-only update

**Input**: "Ajoute le mot-clé `patrimoine` au plugin finary-coach."
**Expected Output**:

- Adds it to both `plugin.json` `keywords` and the marketplace entry `tags`.
- Never edits `version` or `CHANGELOG.md`.
- Says that a change outside `skills/` publishes no new release.
