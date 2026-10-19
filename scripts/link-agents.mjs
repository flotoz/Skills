#!/usr/bin/env node
// Points .claude at .agents, so Claude Code reads the same skills and agents as
// Codex, Cursor and every other tool. .agents/ is committed, .claude is ignored.
// Run by `npm run setup` (npm "prepare"). Never deletes anything, never fails the install.
//
//   node scripts/link-agents.mjs
import { lstatSync, realpathSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const link = join(ROOT, ".claude");
const target = join(ROOT, ".agents");

let stat;
try {
  stat = lstatSync(link);
} catch {
  // A junction needs no admin rights on Windows; elsewhere a relative symlink survives moving the clone.
  const windows = process.platform === "win32";
  symlinkSync(windows ? target : ".agents", link, windows ? "junction" : "dir");
  console.log("✅ .claude → .agents linked.");
  process.exit(0);
}

if (stat.isSymbolicLink() && realpathSync(link) === realpathSync(target)) {
  console.log("✅ .claude → .agents already linked.");
} else {
  console.warn(
    "⚠️  .claude exists and is not a link to .agents: move what you need into .agents/, delete .claude, then run `npm run setup` again.",
  );
}
