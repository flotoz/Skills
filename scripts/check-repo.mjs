#!/usr/bin/env node
// Enforces the repository rules from docs/skill-authoring-guide.md.
// Prints every violation, exits 1 if any.
//
//   node scripts/check-repo.mjs
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED_FRONTMATTER = [
  "name",
  "description",
  "effort",
  "disable-model-invocation",
  "user-invocable",
];
const EFFORTS = ["low", "medium", "high", "xhigh", "max"];
// Anthropic limits: name ≤ 64 chars, description ≤ 1024 chars.
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
// Repository rule from create-or-update-skill: SKILL.md stays short, details go to references/.
const MAX_SKILL_LINES = 200;
const MIN_TEST_CASES = 3;
const PLUGIN_FILES = ["README.md", "LICENSE", "install.sh", "install.ps1"];

const errors = [];
const fail = (file, message) => {
  errors.push(`${relative(ROOT, file).replaceAll("\\", "/")}: ${message}`);
};
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(file, `invalid JSON (${error.message})`);
    return undefined;
  }
};

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "out", "results"].includes(entry.name))
      continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function checkSkill(skillDir) {
  const file = join(skillDir, "SKILL.md");
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  if (lines.length > MAX_SKILL_LINES)
    fail(file, `${lines.length} lines, max ${MAX_SKILL_LINES}`);

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return fail(file, "missing YAML frontmatter");
  let frontmatter;
  try {
    frontmatter = parseYaml(match[1]);
  } catch (error) {
    return fail(
      file,
      `frontmatter is not valid YAML — quote it or use "description: >-" (${error.message.split("\n")[0]})`,
    );
  }

  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_FRONTMATTER.includes(key))
      fail(
        file,
        `frontmatter key "${key}" not allowed (${ALLOWED_FRONTMATTER.join(", ")})`,
      );
  }
  const { name, description, effort } = frontmatter;
  const folder = skillDir.split(/[\\/]/).pop();
  if (name !== folder)
    fail(file, `name "${name}" must equal its folder "${folder}"`);
  if (
    typeof name !== "string" ||
    !NAME_PATTERN.test(name) ||
    name.length > MAX_NAME
  ) {
    fail(file, `name must be lowercase-hyphen, ≤ ${MAX_NAME} chars`);
  }
  if (/claude|anthropic/.test(name ?? ""))
    fail(file, 'name must not contain "claude" or "anthropic"');
  if (typeof description !== "string" || description.length === 0)
    fail(file, "description is required");
  else {
    if (description.length > MAX_DESCRIPTION)
      fail(
        file,
        `description is ${description.length} chars, max ${MAX_DESCRIPTION}`,
      );
    if (!/\bUse (for|when|whenever)\b/.test(description))
      fail(
        file,
        'description must say when to use it ("Use when …" / "Use for …")',
      );
    if (/<[a-z]/i.test(description))
      fail(file, "description must not contain XML/HTML tags");
  }
  if (!EFFORTS.includes(effort))
    fail(file, `effort must be one of ${EFFORTS.join(", ")}`);
  for (const key of ["disable-model-invocation", "user-invocable"]) {
    if (typeof frontmatter[key] !== "boolean")
      fail(file, `${key} must be written out as true or false`);
  }
  if (/\]\([^)]*\\/.test(content)) fail(file, "use forward slashes in links");

  // A skill ships alone (installers, claude.ai zip): its links must stay inside its folder.
  for (const mdFile of walk(skillDir).filter((path) => path.endsWith(".md"))) {
    const text = readFileSync(mdFile, "utf8")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`\n]*`/g, "");
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const linked = resolve(dirname(mdFile), decodeURI(target.split("#")[0]));
      if (relative(skillDir, linked).startsWith("..")) {
        fail(
          mdFile,
          `link "${target}" leaves the skill folder — copy the file into references/ instead`,
        );
      }
    }
  }
  return name;
}

function checkPlugin(pluginDir, entry, marketplaceFile) {
  const manifestFile = join(pluginDir, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestFile))
    return fail(
      marketplaceFile,
      `plugin "${entry.name}" has no .claude-plugin/plugin.json`,
    );
  const manifest = readJson(manifestFile);
  if (manifest && manifest.name !== entry.name) {
    fail(
      manifestFile,
      `name "${manifest.name}" must equal the marketplace entry "${entry.name}"`,
    );
  }
  const mcpFile = join(pluginDir, ".mcp.json");
  if (existsSync(mcpFile)) readJson(mcpFile);

  const skillsDir = join(pluginDir, "skills");
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir).filter((name) =>
        existsSync(join(skillsDir, name, "SKILL.md")),
      )
    : [];
  if (skills.length === 0)
    fail(pluginDir, "plugin has no skills/<name>/SKILL.md");

  // Each plugin is isolated: its own doc, MIT license and installers.
  for (const file of PLUGIN_FILES) {
    if (!existsSync(join(pluginDir, file)))
      fail(pluginDir, `missing ${file} (see create-skill assets/plugin/)`);
  }
  if (manifest && manifest.license !== "MIT")
    fail(manifestFile, 'license must be "MIT"');
  const licenseFile = join(pluginDir, "LICENSE");
  if (
    existsSync(licenseFile) &&
    !/^MIT License/.test(readFileSync(licenseFile, "utf8"))
  )
    fail(licenseFile, "must be the MIT License");
  const pluginReadme = join(pluginDir, "README.md");
  if (existsSync(pluginReadme)) {
    const text = readFileSync(pluginReadme, "utf8");
    for (const name of skills) {
      if (!text.includes(`[${name}]`))
        fail(pluginReadme, `skill "${name}" missing from the Skills table`);
    }
  }
  for (const installer of ["install.sh", "install.ps1"]) {
    const file = join(pluginDir, installer);
    if (existsSync(file) && !readFileSync(file, "utf8").includes(entry.name))
      fail(file, `must install plugin "${entry.name}"`);
  }

  const testCases = join(pluginDir, "evals", "test_cases.md");
  if (!existsSync(testCases)) fail(pluginDir, "missing evals/test_cases.md");
  else {
    const count = (readFileSync(testCases, "utf8").match(/^## Case /gm) ?? [])
      .length;
    if (count < MIN_TEST_CASES)
      fail(testCases, `${count} cases, min ${MIN_TEST_CASES}`);
  }
  return skills.map((name) => checkSkill(join(skillsDir, name)));
}

function checkLinks(files) {
  for (const file of files.filter((path) => path.endsWith(".md"))) {
    // Code blocks and inline code hold examples, not links.
    const content = readFileSync(file, "utf8")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`\n]*`/g, "");
    for (const [, target] of content.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      if (target.includes("{{")) continue; // template placeholder (assets/)
      const path = resolve(dirname(file), decodeURI(target.split("#")[0]));
      if (!existsSync(path)) fail(file, `broken link "${target}"`);
    }
  }
}

const marketplaceFile = join(ROOT, ".claude-plugin", "marketplace.json");
const marketplace = readJson(marketplaceFile);
const readme = readFileSync(join(ROOT, "README.md"), "utf8");
const skillNames = [];

for (const entry of marketplace?.plugins ?? []) {
  if (typeof entry.source !== "string") continue; // remote sources are validated by the CLI
  const pluginDir = resolve(ROOT, entry.source);
  if (!existsSync(pluginDir) || !statSync(pluginDir).isDirectory()) {
    fail(marketplaceFile, `source "${entry.source}" does not exist`);
    continue;
  }
  if (!entry.description)
    fail(marketplaceFile, `plugin "${entry.name}" needs a description`);
  skillNames.push(...(checkPlugin(pluginDir, entry, marketplaceFile) ?? []));
}

const pluginsRoot = join(ROOT, "plugins");
for (const folder of existsSync(pluginsRoot) ? readdirSync(pluginsRoot) : []) {
  if (
    !(marketplace?.plugins ?? []).some(
      (entry) => entry.source === `./plugins/${folder}`,
    )
  ) {
    fail(
      pluginsRoot,
      `plugins/${folder} is not listed in .claude-plugin/marketplace.json`,
    );
  }
}
// Release pipeline: every plugin is versioned by release-please and built by build-skills.
const releaseConfigFile = join(ROOT, "release-please-config.json");
const releaseManifestFile = join(ROOT, ".release-please-manifest.json");
if (existsSync(releaseConfigFile)) {
  const releaseConfig = readJson(releaseConfigFile) ?? {};
  const releaseManifest = existsSync(releaseManifestFile)
    ? (readJson(releaseManifestFile) ?? {})
    : {};
  for (const entry of marketplace?.plugins ?? []) {
    if (typeof entry.source !== "string") continue;
    const path = entry.source.replace(/^\.\//, "");
    const pkg = releaseConfig.packages?.[path];
    if (!pkg)
      fail(
        releaseConfigFile,
        `packages["${path}"] missing for plugin "${entry.name}"`,
      );
    else if (pkg.component !== entry.name)
      fail(
        releaseConfigFile,
        `packages["${path}"].component must be "${entry.name}"`,
      );
    if (!releaseManifest[path]) fail(releaseManifestFile, `"${path}" missing`);
    const manifestFile = join(ROOT, path, ".claude-plugin", "plugin.json");
    const version = existsSync(manifestFile)
      ? readJson(manifestFile)?.version
      : undefined;
    if (releaseManifest[path] && version !== releaseManifest[path]) {
      fail(
        manifestFile,
        `version ${version} differs from .release-please-manifest.json (${releaseManifest[path]})`,
      );
    }
  }
}

for (const name of skillNames.filter(Boolean)) {
  if (!readme.includes(`[${name}]`))
    fail(join(ROOT, "README.md"), `skill "${name}" missing from the catalog`);
}
checkLinks(walk(ROOT));

// Invocation-mode rules (manual skills, Codex policy) from the create-or-update-skill validator.
for (const folder of existsSync(pluginsRoot) ? readdirSync(pluginsRoot) : []) {
  const skillsDir = join(pluginsRoot, folder, "skills");
  if (!existsSync(skillsDir)) continue;
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "scripts", "validate_skill.js"), skillsDir],
    { encoding: "utf8" },
  );
  if (run.status !== 0) fail(skillsDir, (run.stderr || run.stdout).trim());
}

if (errors.length > 0) {
  console.error(
    `❌ ${errors.length} rule violation(s):\n${errors.map((error) => `  - ${error}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(`✅ Repository rules OK (${skillNames.length} skill(s)).`);
