# Evals — illustrate-it

Behavioural evals for [illustrate-it](../skills/illustrate-it/SKILL.md).

| File                                       | Role                                             |
| ------------------------------------------ | ------------------------------------------------ |
| [test_cases.md](test_cases.md)             | Expected behaviour per case (the grading rubric) |
| [fixtures/job-queue/](fixtures/job-queue/) | Synthetic codebase to illustrate (cases 1, 4, 5) |

## Run

For each case, start a fresh agent with only the skill and the case input
(never `test_cases.md`), working in `fixtures/job-queue/` when the case says
so, then grade its reply against [test_cases.md](test_cases.md). The method is
in `.agents/skills/create-or-update-skill/references/evals-with-subagents.md`.

Lint a reply saved to a file:

```bash
node plugins/illustrate-it/skills/illustrate-it/scripts/lint-diagrams.mjs reply.md
```
