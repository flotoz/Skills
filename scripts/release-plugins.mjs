#!/usr/bin/env node
// Publishes a GitHub Release for every plugin whose skills changed since its
// last release. Run by .github/workflows/release.yml on each push to main.
//
//   node scripts/release-plugins.mjs --dry-run   # print the plan, change nothing
//   node scripts/release-plugins.mjs             # bump, commit, push, release
//
// A plugin is released when a commit since its last tag `<plugin>-v<version>`
// touches `plugins/<plugin>/skills/`. Bump from those commits: `!` or
// BREAKING CHANGE → major, `feat` → minor, anything else → patch. A plugin whose
// current plugin.json version has no tag yet (new plugin, or a failed run) is
// released at that version without a bump.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...options,
  })?.trim();
const git = (...args) => run("git", args);
const tagExists = (tag) => {
  try {
    git("rev-parse", "--quiet", "--verify", `refs/tags/${tag}`);
    return true;
  } catch {
    return false;
  }
};
const compare = (a, b) => {
  const [x, y] = [a, b].map((v) => v.match(SEMVER).slice(1).map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

// Latest released version of a plugin, from its tags.
function lastTag(plugin) {
  const prefix = `${plugin}-v`;
  const versions = git("tag", "--list", `${prefix}*`)
    .split("\n")
    .map((tag) => tag.slice(prefix.length))
    .filter((version) => SEMVER.test(version))
    .sort(compare);
  return versions.length ? `${prefix}${versions.at(-1)}` : undefined;
}

// Commits since `from` (or since the beginning) that touch `path`.
function commitsTouching(path, from) {
  const range = from ? [`${from}..HEAD`] : ["HEAD"];
  return git("log", "--format=%h%x1f%s%x1f%b%x1e", ...range, "--", path)
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, subject, body = ""] = record.split("\x1f");
      return { hash, subject, body };
    });
}

function bump(version, commits) {
  const [major, minor, patch] = version.match(SEMVER).slice(1).map(Number);
  const breaking = commits.some(
    ({ subject, body }) =>
      /^\w+(\([^)]*\))?!:/.test(subject) || /BREAKING[ -]CHANGE:/.test(body),
  );
  if (breaking) return `${major + 1}.0.0`;
  if (commits.some(({ subject }) => /^feat(\(|!|:)/.test(subject)))
    return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const notesOf = (commits) =>
  commits.length
    ? commits.map(({ hash, subject }) => `- ${subject} (${hash})`).join("\n")
    : "- First release.";

const marketplace = JSON.parse(
  readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"),
);
const releases = [];
for (const entry of marketplace.plugins) {
  if (typeof entry.source !== "string") continue;
  const plugin = entry.name;
  const dir = entry.source.replace(/^\.\//, "");
  const manifestFile = join(ROOT, dir, ".claude-plugin", "plugin.json");
  const { version } = JSON.parse(readFileSync(manifestFile, "utf8"));
  if (!SEMVER.test(version ?? ""))
    throw new Error(`${manifestFile}: version "${version}" is not x.y.z`);

  const released = tagExists(`${plugin}-v${version}`);
  const commits = commitsTouching(`${dir}/skills`, lastTag(plugin));
  if (released && commits.length === 0) {
    console.log(`⏭️  ${plugin} ${version}: no skill change since its release`);
    continue;
  }
  const next = released ? bump(version, commits) : version;
  releases.push({ plugin, dir, manifestFile, version, next, commits });
  console.log(
    `🚀 ${plugin} ${released ? `${version} → ${next}` : `${next} (not yet released)`}, ${commits.length} commit(s)`,
  );
}

if (releases.length === 0 || DRY_RUN) {
  if (DRY_RUN) console.log("Dry run: nothing written, committed or published.");
  process.exit(0);
}

// Version and changelog, committed once for all plugins.
const today = new Date().toISOString().slice(0, 10);
for (const { dir, manifestFile, version, next, commits } of releases) {
  if (next !== version) {
    const manifest = readFileSync(manifestFile, "utf8");
    writeFileSync(
      manifestFile,
      manifest.replace(/("version"\s*:\s*")[^"]+(")/, `$1${next}$2`),
    );
  }
  const changelogFile = join(ROOT, dir, "CHANGELOG.md");
  const changelog = existsSync(changelogFile)
    ? readFileSync(changelogFile, "utf8").replace(/^# Changelog\s*/, "")
    : "";
  if (!changelog.includes(`## ${next} `))
    writeFileSync(
      changelogFile,
      `# Changelog\n\n## ${next} (${today})\n\n${notesOf(commits)}\n\n${changelog}`.trimEnd() +
        "\n",
    );
  git("add", manifestFile, changelogFile);
}
if (git("diff", "--cached", "--name-only")) {
  const summary = releases.map(({ plugin, next }) => `${plugin} ${next}`);
  git("commit", "--message", `chore(release): ${summary.join(", ")}`);
  git("push", "origin", "HEAD:main");
}

// One GitHub Release per plugin, tagged on the pushed commit, zips attached.
const target = git("rev-parse", "HEAD");
for (const { plugin, next, commits } of releases) {
  const tag = `${plugin}-v${next}`;
  run("npm", ["run", "build:skills", "--", plugin], { stdio: "inherit" });
  const zips = readdirSync(join(ROOT, "dist", plugin)).map(
    (file) => `dist/${plugin}/${file}`,
  );
  run("gh", [
    "release",
    "create",
    tag,
    ...zips,
    "--target",
    target,
    "--title",
    `${plugin} v${next}`,
    "--notes",
    notesOf(commits),
  ]);
  console.log(`✅ Published ${tag} with ${zips.length} bundle(s)`);
}
