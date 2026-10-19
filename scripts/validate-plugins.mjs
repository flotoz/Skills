#!/usr/bin/env node
// Runs the official `claude plugin validate` on the marketplace and every plugin,
// with the Claude Code CLI pinned in devDependencies (no global install).
//
//   npm run verify:plugins
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  ".",
  ...readdirSync(join(ROOT, "plugins")).map((name) => `plugins/${name}`),
];

let failed = 0;
for (const target of targets) {
  const run = spawnSync(`npx --no -- claude plugin validate "${target}"`, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
  });
  const ok = run.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? "✅" : "❌"} ${target}`);
  if (!ok) console.log((run.stdout + run.stderr).trim());
}
if (failed > 0) process.exit(1);
console.log(`✅ Claude Code accepts ${targets.length} manifest(s).`);
