# Evals — finary-coach

Behavioural evals for [coach-my-finances](../skills/coach-my-finances/SKILL.md)
without a real Finary account.

| File                                       | Role                                                            |
| ------------------------------------------ | --------------------------------------------------------------- |
| [test_cases.md](test_cases.md)             | Expected behaviour per case (the grading rubric)                |
| [mock-finary-mcp.mjs](mock-finary-mcp.mjs) | Dependency-free stdio MCP server exposing the Finary tool names |
| [call-tool.mjs](call-tool.mjs)             | Calls one mock tool from a shell (for agents without MCP)       |
| [fixtures/](fixtures/)                     | Fake accounts: `beginner`, `us-china`, `cto-heavy`              |
| [run-evals.sh](run-evals.sh)               | Runs every case with a fresh headless `claude -p`               |

The mock data shapes are illustrative: Finary does not publish its MCP schemas.

## Run

With a logged-in `claude` CLI:

```bash
bash plugins/finary-coach/evals/run-evals.sh            # all cases
bash plugins/finary-coach/evals/run-evals.sh us-china   # one case
```

Outputs land in `out/` (git-ignored). Grade them against
[test_cases.md](test_cases.md).

Call a mock tool by hand:

```bash
node plugins/finary-coach/evals/call-tool.mjs plugins/finary-coach/evals/fixtures/us-china.json holdings
```
