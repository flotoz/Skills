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

No release config: the version in `plugin.json` is the only source, and the
first merge publishes it.

## New skill in an existing plugin

- Folder `plugins/<plugin>/skills/<skill>/`.
- Test cases appended to `plugins/<plugin>/evals/test_cases.md`.
- Row in the plugin `README.md` skills table.

## Always

- README catalog row: `| [<skill>](plugins/<plugin>/skills/<skill>/SKILL.md) | \`<plugin>\` | <what it does> |`.
- Install commands in the README if the plugin is new.

## Verify

```bash
npm run verify          # repository rules, docs formatting, claude plugin validate
npm run build:skills    # compiles dist/<plugin>/<skill>.zip
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
- On merge to `main`, every plugin with a change under
  `plugins/<plugin>/skills/` is released automatically, with no release PR:
  `!` → major, `feat` → minor, anything else → patch. The workflow commits the
  new `plugin.json` version and `CHANGELOG.md`, tags `<plugin>-v<version>`,
  creates the GitHub Release and attaches `dist/<plugin>/*.zip`. Never edit
  the version or the changelog by hand.
- Users update: `claude plugin marketplace update flotoz-skills`,
  `npx skills update`, or re-run the install script.
