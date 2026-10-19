const fs = require("fs");
const path = require("path");

function validateSingleSkill(skillPath) {
  const skillFile = path.join(skillPath, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    console.error(`❌ Error: ${skillFile} not found.`);
    return false;
  }

  const content = fs.readFileSync(skillFile, "utf-8");
  const lines = content.split("\n");

  if (lines.length > 200) {
    console.error(
      `❌ Error: ${skillFile} exceeds 200 lines (current: ${lines.length}).`,
    );
    return false;
  }

  if (!lines[0].trim().startsWith("---")) {
    console.error(`❌ Error: ${skillFile} missing YAML frontmatter.`);
    return false;
  }

  const invocationError =
    invocationModeError(skillPath, frontmatterOf(lines)) ||
    userInvocationError(frontmatterOf(lines));
  if (invocationError) {
    console.error(`❌ Error: ${skillFile} ${invocationError}`);
    return false;
  }

  console.log(
    `✅ Success: ${path.basename(skillPath)}/SKILL.md is valid (${lines.length} lines).`,
  );
  return true;
}

const INVOCATION_MODE_PATTERN = /^disable-model-invocation:\s*(true|false)\s*$/;
const USER_INVOCATION_PATTERN = /^user-invocable:\s*(true|false)\s*$/;
const MANUAL_DESCRIPTION_PREFIX = "Manual only";
const CODEX_POLICY_PATTERN = /^\s*allow_implicit_invocation:\s*false\s*$/m;

function frontmatterOf(lines) {
  const closingFence = lines.indexOf("---", 1);
  return lines.slice(1, closingFence === -1 ? lines.length : closingFence);
}

function descriptionOf(frontmatter) {
  const start = frontmatter.findIndex((line) =>
    line.startsWith("description:"),
  );
  if (start === -1) return "";
  const continuation = frontmatter
    .slice(start + 1)
    .filter((line, index, rest) =>
      rest.slice(0, index + 1).every((previous) => previous.startsWith(" ")),
    );
  return [frontmatter[start].replace(/^description:\s*/, ""), ...continuation]
    .map((line) => line.trim())
    .join(" ")
    .trim();
}

function invocationModeError(skillPath, frontmatter) {
  const modeLine = frontmatter.find((line) =>
    INVOCATION_MODE_PATTERN.test(line),
  );
  if (!modeLine)
    return "must declare its invocation mode: disable-model-invocation: true | false.";
  if (modeLine.match(INVOCATION_MODE_PATTERN)[1] === "false") return undefined;
  if (!descriptionOf(frontmatter).startsWith(MANUAL_DESCRIPTION_PREFIX)) {
    return `is manual: its description must start with "${MANUAL_DESCRIPTION_PREFIX}".`;
  }
  const codexPolicy = path.join(skillPath, "agents", "openai.yaml");
  if (
    !fs.existsSync(codexPolicy) ||
    !CODEX_POLICY_PATTERN.test(fs.readFileSync(codexPolicy, "utf-8"))
  ) {
    return "is manual: agents/openai.yaml must set policy.allow_implicit_invocation: false.";
  }
  return undefined;
}

function declaredValue(frontmatter, pattern) {
  const line = frontmatter.find((candidate) => pattern.test(candidate));
  return line && line.match(pattern)[1];
}

function userInvocationError(frontmatter) {
  const userInvocable = declaredValue(frontmatter, USER_INVOCATION_PATTERN);
  if (!userInvocable)
    return "must declare who may invoke it: user-invocable: true | false.";
  const agentBlocked =
    declaredValue(frontmatter, INVOCATION_MODE_PATTERN) === "true";
  if (agentBlocked && userInvocable === "false")
    return "is unreachable: manual (disable-model-invocation: true) needs user-invocable: true.";
  return undefined;
}

function validateAllSkills(targetPath) {
  if (!targetPath) {
    console.error(
      "Usage: node validate_skill.js <path_to_skill_folder_or_parent>",
    );
    process.exit(1);
  }

  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Error: Path ${resolved} does not exist.`);
    process.exit(1);
  }

  const isDirectSkill = fs.existsSync(path.join(resolved, "SKILL.md"));
  let success = true;

  if (isDirectSkill) {
    success = validateSingleSkill(resolved);
  } else {
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const skillDirs = entries.filter(
      (e) =>
        e.isDirectory() &&
        fs.existsSync(path.join(resolved, e.name, "SKILL.md")),
    );

    if (skillDirs.length === 0) {
      console.error(
        `❌ Error: No valid skill directories found in ${resolved}.`,
      );
      process.exit(1);
    }

    console.log(`🔍 Validating ${skillDirs.length} skills in ${targetPath}...`);
    for (const dir of skillDirs) {
      const isValid = validateSingleSkill(path.join(resolved, dir.name));
      if (!isValid) success = false;
    }
  }

  if (!success) {
    process.exit(1);
  }
}

const targetPaths = process.argv.slice(2);
(targetPaths.length > 0 ? targetPaths : [".agents/skills"]).forEach(
  validateAllSkills,
);
