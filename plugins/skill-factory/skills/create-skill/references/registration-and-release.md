# Registration and Release

A skill is shipped only when the marketplace, the catalog, the build and the
release pipeline all know it.

## New plugin

1. `plugins/<plugin>/.claude-plugin/plugin.json`:

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

2. Entry in `.claude-plugin/marketplace.json` → `plugins`: `name` equal to
   `plugin.json`, `source: "./plugins/<plugin>"`, `description`, `category`,
   `tags`.
3. `.mcp.json` next to `plugin.json` if the skill needs MCP servers.
4. Isolation files, copied from `assets/plugin/` with every `{{PLACEHOLDER}}`
   replaced (`{{PLUGIN}}`, `{{SKILL}}`, `{{DISPLAY_NAME}}`, `{{YEAR}}`,
   `{{AUTHOR}}`):
   - `README.md`: what the plugin does, skills table, prerequisites (MCP,
     accounts), install commands, usage, license;
   - `LICENSE`: MIT, current year and author;
   - `install.sh` / `install.ps1`: wrappers that call the root installer
     with `--plugin <plugin>`, locally or from GitHub. `chmod +x install.sh`.
5. Release config:
   - `release-please-config.json` → `packages["plugins/<plugin>"]` with
     `"component": "<plugin>"` and the `extra-files` entry that bumps
     `.claude-plugin/plugin.json` `$.version` (copy an existing package);
   - `.release-please-manifest.json` → `"plugins/<plugin>": "0.1.0"`.

## New skill in an existing plugin

- Folder `plugins/<plugin>/skills/<skill>/`.
- Test cases appended to `plugins/<plugin>/evals/test_cases.md`.
- Row in the plugin `README.md` skills table.

## Always

- README catalog row: `| [<skill>](plugins/<plugin>/skills/<skill>/SKILL.md) | \`<plugin>\` | <what it does> |`.
- Install commands in the README if the plugin is new.

## Verify

```bash
npm run verify          # repository rules + docs formatting
npm run build:skills    # compiles dist/<plugin>/<skill>.zip
claude plugin validate .
claude plugin validate plugins/<plugin>
```

`verify:rules` fails if the plugin is missing from the marketplace, names
differ, the skill is missing from the catalog or the plugin README, the plugin
lacks README.md, an MIT LICENSE or its installers, a link is broken or test
cases are fewer than 3.

Test the plugin installer with a throwaway home:

```bash
HOME="$(mktemp -d)" bash plugins/<plugin>/install.sh --agent all
```

## Commit and release

- Branch `feat/<skill>`; commits `feat(<skill>): …`, `fix(<skill>): …`,
  `docs(<skill>): …`, `test(<skill>): …`. The `commit-msg` hook rejects other
  formats.
- PR title is a Conventional Commit too (squash merge uses it).
- On merge to `main`, release-please opens or updates a **release PR** per
  plugin: `feat` → minor, `fix` → patch, `!` → major, CHANGELOG generated.
- Merging the release PR tags `<plugin>-v<version>`, creates the GitHub
  Release and the release workflow attaches `dist/<plugin>/*.zip`.
- Users update: `claude plugin marketplace update flotoz-skills`,
  `npx skills update`, or re-run the install script.
