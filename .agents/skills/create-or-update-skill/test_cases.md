# Test Cases for create-or-update-skill

## Case 1: Shipped skill is delegated

**Input**: "Add a skill to the finary-coach plugin that reviews my ETF fees."

**Expected Output**:

- Classifies it as a shipped skill (`plugins/finary-coach/skills/`) and
  follows `create-skill` instead of writing its own workflow.
- Notes the overlap with `coach-my-finances` (fees are already covered) before
  creating anything.

## Case 2: Repo-internal skill

**Input**: "Create a skill that tells agents how to write a release-please
commit in this repository."

**Expected Output**:

- Creates `.agents/skills/<verb-object>/SKILL.md` with the five frontmatter
  keys, and `test_cases.md` (≥ 3 cases) in the same folder, written first.
- Links to the repository's existing release docs instead of copying them.
- Adds no marketplace entry, README catalog row or release-please entry.
- `npm run verify` passes and the report lists the commands run.

## Case 3: Writing through `.claude/` is refused

**Input**: "Save this new skill in `.claude/skills/review-pr/`."

**Expected Output**:

- Explains that `.claude` is a git-ignored link to `.agents/` and writes the
  skill to `.agents/skills/review-pr/` instead.

## Case 4: Subagent

**Input**: "Create a subagent that audits every skill description for weak
triggers."

**Expected Output**:

- Creates `.agents/agents/<verb-object>.md` with `name`, `description`,
  least-privilege `tools` (read-only here), `model`.
- The body says when to stop and return a question, that it never commits,
  and the shape of its final report.

## Case 5: Broken frontmatter

**Input**: An internal `SKILL.md` whose plain-YAML description contains
`Note: read first`, and no `user-invocable` key.

**Expected Output**:

- `npm run verify:rules` fails on invalid YAML and on the missing invocation
  field; the fix uses `description: >-` and writes both booleans out.
