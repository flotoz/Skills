---
name: create-or-update-plugin
description: >-
  Creates, updates, renames or removes a plugin of the flotoz/Skills
  marketplace: plugin.json, marketplace entry, README, MIT license,
  installers, MCP servers, catalog, and moves skills between plugins. Use when
  the user wants a new plugin, to group skills, to change a plugin's
  description, keywords, tags or MCP servers, to rename or delete one, even if
  they say "pack", "bundle" or "catalogue" instead of plugin.
effort: medium
disable-model-invocation: false
user-invocable: true
---

# Create or Update a Plugin

A plugin is the unit users install (`claude plugin install <plugin>@flotoz-skills`,
`plugins/<plugin>/install.sh`) and the unit that gets released
(`<plugin>-v<version>`). Its name is a public contract; its files must stay in
sync across the marketplace, the catalog and its own folder. This skill keeps
them in sync. Writing the skills inside a plugin is the `create-skill` skill's
job.

Answer the user in their language; write every repository file in English.

## Hard rules

- **Work only in a checkout of flotoz/Skills or a fork.** If
  `.claude-plugin/marketplace.json` is missing, say so, give
  `git clone https://github.com/flotoz/Skills.git`, and stop without creating
  files.
- **Never edit `version` or `CHANGELOG.md`.** The release workflow bumps them
  from Conventional Commits on merge to `main`. A new plugin starts at `0.1.0`.
- **No plugin without a skill.** `npm run verify` rejects a plugin with no
  `skills/<name>/SKILL.md` or fewer than 3 test cases: a new plugin is created
  together with its first skill, written with `create-skill`.
- **Renaming or removing is breaking.** Explain what breaks and offer the
  non-breaking option before editing (see the table below).
- **An MCP server is a trust decision.** Add only an official server of the
  service, by its documented URL, and say that users' agents will connect to
  it. Never put credentials in `.mcp.json`.
- **Commit or push only when the user asks**, never with `--no-verify`.

## Workflow

```text
- [ ] 1. Checkout and plugin identified
- [ ] 2. Change restated and confirmed
- [ ] 3. Files edited (all places in sync)
- [ ] 4. npm run verify and npm run build:skills pass
- [ ] 5. Release effect told to the user
```

### 1. Identify

Read `.claude-plugin/marketplace.json` and the plugin's
`.claude-plugin/plugin.json`. For a new plugin, check no existing plugin
already covers the topic: adding a skill to it beats a new plugin.

### 2. Restate and confirm

In one message, restate what will change and ask only what is missing. For a
new plugin: name (lowercase-hyphen, a domain noun like `finary-coach`, no
`claude` or `anthropic`), display name, one-sentence description, category,
tags, MCP servers, first skill. Wait for a yes.

### 3. Edit

| Change                     | Files                                                                                                                                                                                                                      | Breaking                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| New plugin                 | [references/plugin-files.md](references/plugin-files.md), then `create-skill` for its first skill                                                                                                                          | no                                                            |
| Description, keywords/tags | `plugin.json` (`description`, `keywords`) and the marketplace entry (`description`, `tags`), plugin README intro                                                                                                           | no                                                            |
| Display name               | `plugin.json` `displayName`, plugin README title                                                                                                                                                                           | no                                                            |
| MCP server                 | `plugins/<plugin>/.mcp.json`, plugin README Prerequisites, the skill's `references/connect-<service>.md`                                                                                                                   | no                                                            |
| Move a skill in            | `git mv` the skill folder and its test cases, both plugin READMEs, the catalog row's Plugin column                                                                                                                         | yes for the plugin it leaves                                  |
| Rename                     | folder, `plugin.json` `name`, marketplace entry, installers (`PLUGIN=`), plugin README, root README catalog, install examples and tree, every `plugins/<old>/` path, MCP tool prefixes `mcp__plugin_<old>_…` in its skills | yes: install id, installer URLs, release tags, MCP tool names |
| Remove                     | folder, marketplace entry, catalog rows, README `## Use` sections and install examples                                                                                                                                     | yes: users can no longer install or update it                 |

Before a breaking change, list what breaks for users who installed the plugin
and propose the alternative (change `displayName` instead of renaming; keep
the skill where it is). If the user confirms, the commit is
`feat(<plugin>)!: …` with a `BREAKING CHANGE:` footer saying what users must
do. Published releases and tags stay; never delete them.

Search the whole repository for the old name after a rename or removal
(`git grep <old>`); only `CHANGELOG.md` may keep it. Hits under another
plugin's `skills/` (examples in other skills) go in a separate `docs(<other>):`
commit: in the `!` commit they would publish a major release of that other
plugin.

### 4. Verify

```bash
npm run verify          # repository rules, docs formatting, claude plugin validate
npm run build:skills    # one dist/<plugin>/<skill>.zip per skill
HOME="$(mktemp -d)" bash plugins/<plugin>/install.sh --agent all
```

Fix the cause of a failure, never the check.

### 5. Tell the release effect

- A change under `plugins/<plugin>/skills/` publishes `<plugin>-v<next>` on
  merge (`!` → major, `feat` → minor, anything else → patch).
- A new plugin is published at `0.1.0` on its first merge. A renamed plugin
  has no tag under its new name yet, so it is published at its current
  version, without the major bump the `!` would otherwise give.
- A change only outside `skills/` (plugin.json, README, `.mcp.json`,
  installers) publishes no release: say so, so the user is not surprised.

## Report

End with: what changed, the files touched, whether it is breaking and what
users must do, the commands run with their result, and the release the merge
will publish (or "none").
