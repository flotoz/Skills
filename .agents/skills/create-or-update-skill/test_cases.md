# Test Cases for create-or-update-skill

## Case 1: Create a distributed skill

**Input**: "Add a skill to the finary-coach plugin that reviews my ETF fees."

**Expected Output**:

- Checks existing skills first and notes the overlap with `coach-my-finances`
  (fees are already covered), proposing to extend it before creating anything.
- If the user still wants a new skill: test cases are written before
  `SKILL.md`, the name is verb + object (e.g. `review-etf-fees`), mode is Auto,
  the README catalog gets a row.
- `npm run verify` passes and the report lists the commands run.

## Case 2: Side effect requires manual mode

**Input**: "Create a skill that posts my weekly portfolio summary on LinkedIn."

**Expected Output**:

- Frontmatter sets `disable-model-invocation: true` and `user-invocable: true`.
- The description starts with `Manual only`.
- `agents/openai.yaml` sets `allow_implicit_invocation: false`.
- The validator rejects the skill if either is removed.

## Case 3: Agent-only background rules

**Input**: "Create a skill with the criteria to rate a savings account."

**Expected Output**:

- Frontmatter sets `disable-model-invocation: false` and
  `user-invocable: false`.
- A variant with `disable-model-invocation: true` and `user-invocable: false`
  fails the validator as unreachable.

## Case 4: Volatile facts are challenged

**Input**: "Write a skill that tells users the Livret A rate is 3% and the PEA
ceiling is 150 000 €."

**Expected Output**:

- Challenges hard-coding: rates and ceilings change.
- The skill instead verifies them on an official source and cites it with the
  date, or gives no number.

## Case 5: Oversized skill

**Input**: Update a skill whose `SKILL.md` would grow past 200 lines with a
long report template.

**Expected Output**:

- The template moves to `references/<topic>.md`, linked from `SKILL.md`.
- `SKILL.md` stays ≤ 200 lines; a reference over 100 lines starts with a table
  of contents.

## Case 6: Broken frontmatter

**Input**: A `SKILL.md` whose plain-YAML description contains `Note: read
first`, and no `user-invocable` key.

**Expected Output**:

- `npm run verify:rules` fails on invalid YAML and on the missing invocation
  field; the fix uses `description: >-` and writes both booleans out.

## Case 7: Turn the conversation into a skill

**Input**: after a conversation where the user corrected the agent twice,
"Transforme ce qu'on vient de faire en skill."
**Expected Output**:

- Extracts steps, tools and the two corrections from the conversation instead
  of re-asking them.
- The corrections become hard rules or workflow steps with their reason.

## Case 8: Update with a frontmatter trap

**Input**: "Ajoute 'Use for: budgets, PEA' à la description de
coach-my-finances."
**Expected Output**:

- Keeps the folded `>-` block so the `:` does not break YAML.
- Snapshots the old version and re-runs the plugin's evals against it.
- Commits `feat(coach-my-finances): …` without `--no-verify`.
