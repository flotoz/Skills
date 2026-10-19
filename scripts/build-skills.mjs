#!/usr/bin/env node
// Compiles every skill listed in the marketplace into release bundles.
//
//   node scripts/build-skills.mjs            # all plugins
//   node scripts/build-skills.mjs finary-coach
//
// Output, per skill: dist/<plugin>/<skill>.zip — the claude.ai / Claude API upload
// format. Claude Code users install from the repository itself, so they keep the
// full frontmatter; the zip keeps only the keys claude.ai accepts, sets the plugin
// license in the frontmatter and ships the plugin LICENSE as LICENSE.txt.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, deflateRawSync } from "node:zlib";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
// Frontmatter keys accepted by claude.ai skill uploads (Anthropic skill-creator quick_validate).
const CLAUDE_AI_KEYS = [
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
  "compatibility",
];

function filesOf(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.name.startsWith(".")) return [];
    return entry.isDirectory() ? filesOf(path) : [path];
  });
}

// SKILL.md for claude.ai: unsupported keys dropped, the rest unchanged.
function forClaudeAi(skillMd, license) {
  const match = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error("SKILL.md has no frontmatter");
  const frontmatter = parseYaml(match[1]);
  const kept = Object.fromEntries(
    Object.entries(frontmatter).filter(([key]) => CLAUDE_AI_KEYS.includes(key)),
  );
  if (license && !kept.license) kept.license = license;
  return `---\n${stringifyYaml(kept, { lineWidth: 0 }).trimEnd()}\n---\n${skillMd.slice(match[0].length)}`;
}

// Minimal ZIP writer (deflate), enough for text skills; no dependency.
function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const compressed = deflateRawSync(data);
    const checksum = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(8, 8); // deflate
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    locals.push(header, nameBytes, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);
    offset += header.length + nameBytes.length + compressed.length;
  }
  const centralSize = centrals.reduce(
    (size, buffer) => size + buffer.length,
    0,
  );
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

const marketplace = JSON.parse(
  readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"),
);
const only = process.argv[2];
const plugins = marketplace.plugins.filter(
  (plugin) =>
    typeof plugin.source === "string" && (!only || plugin.name === only),
);
if (only && plugins.length === 0) {
  console.error(`❌ Plugin "${only}" is not in the marketplace.`);
  process.exit(1);
}

rmSync(only ? join(DIST, only) : DIST, { recursive: true, force: true });
let built = 0;
for (const plugin of plugins) {
  const pluginDir = join(ROOT, plugin.source);
  const skillsDir = join(pluginDir, "skills");
  const { license } = JSON.parse(
    readFileSync(join(pluginDir, ".claude-plugin", "plugin.json"), "utf8"),
  );
  const licenseFile = join(pluginDir, "LICENSE");
  for (const skill of readdirSync(skillsDir).filter((name) =>
    statSync(join(skillsDir, name)).isDirectory(),
  )) {
    const skillDir = join(skillsDir, skill);
    const entries = filesOf(skillDir).map((path) => {
      const name = `${skill}/${relative(skillDir, path).replaceAll("\\", "/")}`;
      const raw = readFileSync(path);
      const data =
        name === `${skill}/SKILL.md`
          ? Buffer.from(forClaudeAi(raw.toString("utf8"), license))
          : raw;
      return { name, data };
    });
    if (existsSync(licenseFile))
      entries.push({
        name: `${skill}/LICENSE.txt`,
        data: readFileSync(licenseFile),
      });
    const out = join(DIST, plugin.name, `${skill}.zip`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, zip(entries));
    console.log(
      `📦 ${relative(ROOT, out).replaceAll("\\", "/")} (${entries.length} files)`,
    );
    built++;
  }
}
console.log(`✅ Built ${built} skill bundle(s) in dist/.`);
