#!/usr/bin/env node
// Gets a fresh clone ready to contribute, in one command:
//
//   npm run onboard
//
// 1. Node.js matches .nvmrc.
// 2. Tooling installed at the exact versions of package-lock.json, Claude Code
//    CLI included (local, no global install).
// 3. Git hooks active (lefthook: pre-commit, commit-msg).
// 4. The repository passes its own checks, `claude plugin validate` included.
//
// Safe to re-run: every step checks before it changes anything.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NODE_MAJOR = readFileSync(join(ROOT, ".nvmrc"), "utf8").trim();

const run = (command, { quiet = false } = {}) =>
  spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    stdio: quiet ? "pipe" : "inherit",
  });
const output = (command) => {
  const result = run(command, { quiet: true });
  return result.status === 0 ? result.stdout.trim() : undefined;
};

let step = 0;
const title = (text) => console.log(`\n${++step}. ${text}`);
const ok = (text) => console.log(`   ✅ ${text}`);
const stop = (text) => {
  console.error(`   ❌ ${text}`);
  process.exit(1);
};

title(`Node.js ${NODE_MAJOR} (from .nvmrc)`);
const nodeMajor = process.versions.node.split(".")[0];
if (nodeMajor !== NODE_MAJOR) {
  stop(
    `running Node.js ${process.versions.node}. Install Node.js ${NODE_MAJOR}, e.g.:\n` +
      `      nvm install ${NODE_MAJOR} && nvm use ${NODE_MAJOR}\n` +
      `      fnm use --install-if-missing ${NODE_MAJOR}\n` +
      `      winget install OpenJS.NodeJS   (then re-open the terminal)`,
  );
}
ok(`Node.js ${process.versions.node}`);

title(
  "Tooling (Prettier, markdownlint, commitlint, lefthook, Claude Code CLI)",
);
if (!existsSync(join(ROOT, ".git")))
  stop("not a Git clone: git clone https://github.com/flotoz/Skills.git");
if (run("npm ci").status !== 0) stop("npm ci failed, see the output above.");
const claudeVersion = output("npx --no -- claude --version");
if (!claudeVersion)
  stop("Claude Code CLI missing from node_modules: re-run npm ci.");
ok(`installed from package-lock.json (claude ${claudeVersion.split(" ")[0]})`);

title("Git hooks");
// --reset-hooks-path: clones set up with husky still point Git at .husky/_.
if (
  run("npx lefthook install --reset-hooks-path", { quiet: true }).status !== 0
)
  stop("lefthook install failed: run `npx lefthook install` to see why.");
const hooksDir = output("git rev-parse --git-path hooks");
for (const hook of ["pre-commit", "commit-msg"]) {
  const file = join(ROOT, hooksDir ?? ".git/hooks", hook);
  if (!existsSync(file) || !readFileSync(file, "utf8").includes("lefthook"))
    stop(`${hook} hook not installed: run \`npx lefthook install\`.`);
}
const commitlint = run(
  'echo "not a conventional commit" | npx --no -- commitlint',
  { quiet: true },
);
if (commitlint.status === 0)
  stop(
    "commitlint accepted a bad message: the commit-msg hook would not protect you.",
  );
ok(
  "pre-commit (format + repository rules) and commit-msg (Conventional Commits) active",
);

title("Repository checks");
if (run("npm run --silent verify").status !== 0)
  stop("the repository does not pass its own checks, see above.");
ok("rules, docs and plugin manifests pass");

console.log(`
🎉 Ready. Next:
   - create a branch: git switch -c feat/<skill>
   - add a skill with /create-skill (skill-factory plugin) or see docs/skill-authoring-guide.md
   - commit as <type>(<scope>): <summary>; the hooks check the rest
   - before a PR: npm run verify && npm run build:skills`);
