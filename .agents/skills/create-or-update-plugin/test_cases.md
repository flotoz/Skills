# Test Cases for create-or-update-plugin

Run each case with a fresh agent that reads only the skill, in a scratch copy
of the repository (`git worktree add`), never with these expected outputs.

## Case 1: New plugin with its first skill

**Input**: "Crée un plugin `pr-tools` pour regrouper mes skills GitHub, le
premier sera summarize-pr."
**Expected Output**:

- Restates name, display name, one-line description, category, tags and MCP
  needs in one message and waits for a yes.
- Scaffolds `plugin.json` (version `0.1.0`), the marketplace entry, `README.md`,
  `LICENSE`, `install.sh`, `install.ps1` from its own `assets/`, with no
  `{{PLACEHOLDER}}` left.
- Hands the skill itself to `create-or-update-skill` (a plugin without a skill and
  3 test cases fails `npm run verify`) instead of writing `SKILL.md` alone.
- Creates no release config, `CHANGELOG.md` or tag; says the merge publishes
  `pr-tools-v0.1.0`.

## Case 2: Breaking rename

**Input**: "Renomme le plugin finary-coach en money-coach."
**Expected Output**:

- Before editing, explains what breaks: `claude plugin install
finary-coach@flotoz-skills`, the installer URLs, the `finary-coach-v*` tags.
- Proposes changing only `displayName` instead, and asks which one.
- If the user still wants the rename: updates every reference (marketplace,
  README catalog and install sections, plugin README, installers) and uses a
  `feat(money-coach)!:` commit with a `BREAKING CHANGE:` footer.
- Puts old-name hits under another plugin's `skills/` in a separate
  non-breaking commit, and says the merge publishes `money-coach-v1.0.0`.

## Case 3: Metadata-only update

**Input**: "Ajoute le mot-clé `patrimoine` au plugin finary-coach."
**Expected Output**:

- Adds it to both `plugin.json` `keywords` and the marketplace entry `tags`.
- Never edits `version` or `CHANGELOG.md`.
- Says that a change outside `skills/` publishes no new release.
