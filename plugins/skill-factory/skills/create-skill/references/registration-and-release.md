# Registration and Release

A skill is shipped only when the marketplace, the catalog, the build and the
release pipeline all know it.

## New plugin

Use the `create-or-update-plugin` skill: it creates `plugin.json`, the
marketplace entry, the plugin README, LICENSE and installers, then hands the
first skill back to this skill. No release config: the first merge publishes
`<plugin>-v0.1.0`.

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
