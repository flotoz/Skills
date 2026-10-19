# Security Policy

The skills in this repository run inside people's agents and some of them read
financial data through MCP connectors, so security reports are taken
seriously.

## Supported versions

Only the latest release of each plugin is supported: fixes ship as a new
release (see the [Plugins table](README.md#plugins)), never as patches to
older tags. Update with the command in that table.

## Report a vulnerability

Do not open a public issue. Use GitHub's private
[**Report a vulnerability**](https://github.com/flotoz/Skills/security/advisories/new)
form on this repository and include:

- the plugin and skill, and the version or commit;
- the agent and how the skill was installed;
- what an attacker can do, with steps or a prompt that reproduces it.

Confirmed issues are fixed in a new release of the affected plugin.

## In scope

- A skill that leaks, sends or stores user data outside the agent session.
- A skill that performs a side effect (orders, transfers, posts, deletions)
  without being manual-only, or that can be steered into one by prompt
  injection from data it reads.
- An installer (`install.sh`, `install.ps1`) that writes outside the target
  skills folder or runs untrusted code.
- A secret, token, account identifier or real personal data committed to the
  repository, fixtures included.

## Out of scope

- Vulnerabilities in third-party services or MCP servers a skill connects to
  (report them to that vendor), and in the agents themselves.
- Financial analysis you disagree with: skills are educational, not regulated
  advice. Open a regular issue instead.
