# Plugin Files

Everything a new plugin needs. `npm run verify` checks each item.

## 1. `plugins/<plugin>/.claude-plugin/plugin.json`

```json
{
  "name": "<plugin>",
  "displayName": "<Human Name>",
  "version": "0.1.0",
  "description": "<what it brings, one sentence>",
  "author": { "name": "<author>", "url": "https://github.com/<user>" },
  "homepage": "https://github.com/flotoz/Skills",
  "repository": "https://github.com/flotoz/Skills",
  "license": "MIT",
  "keywords": ["<topic>"]
}
```

`name` equals the folder and the marketplace entry. `version` is `x.y.z` and
is never edited by hand afterwards. `license` is `MIT`.

## 2. Marketplace entry

Append to `.claude-plugin/marketplace.json` → `plugins`:

```json
{
  "name": "<plugin>",
  "source": "./plugins/<plugin>",
  "description": "<same sentence as plugin.json, may be shorter>",
  "category": "<development | finance | productivity | …>",
  "tags": ["<same as plugin.json keywords>"]
}
```

## 3. MCP servers (only if a skill needs one)

`plugins/<plugin>/.mcp.json`, next to `.claude-plugin/`:

```json
{
  "mcpServers": {
    "<service>": { "type": "http", "url": "<official MCP URL>" }
  }
}
```

Only Claude Code plugin installs read it; `npx skills` and the install scripts
do not. The skill therefore needs a `references/connect-<service>.md` with the
official setup steps, linked from the plugin README Prerequisites.

## 4. Isolation files

Copy from [assets/](../assets/README.md) into `plugins/<plugin>/` and replace
every placeholder: `{{PLUGIN}}`, `{{SKILL}}`, `{{DISPLAY_NAME}}`, `{{YEAR}}`,
`{{AUTHOR}}`. Then check none is left:
`git grep -n "{{" plugins/<plugin>/` must print nothing.

- `README.md`: one-sentence pitch, skills table (one row per skill),
  prerequisites ("None" if none), install commands, usage, license.
- `LICENSE`: MIT, current year and author.
- `install.sh` / `install.ps1`: wrappers that call the root installer with
  `--plugin <plugin>`, locally or from GitHub. Keep `install.sh` executable
  (`git update-index --chmod=+x plugins/<plugin>/install.sh` on Windows).

## 5. Skill and evals

Hand over to `create-or-update-skill` for `plugins/<plugin>/skills/<skill>/` and
`plugins/<plugin>/evals/test_cases.md` (at least 3 cases). It also adds the
root README catalog row and the `## Use` example.

## 6. Root README

Add a row to the `## Plugins` table (latest-release badge filtered on
`<plugin>-v*`, install command) and the plugin folder to the "Repository
structure" tree. Add it to the install
examples only if they list plugins by name; the catalog row comes with the
skill.

No release config: the first merge to `main` publishes `<plugin>-v0.1.0`.
