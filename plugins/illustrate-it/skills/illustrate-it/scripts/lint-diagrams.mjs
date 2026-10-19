// Lints the Mermaid blocks of Markdown files: accessible name, measured palette
// contrast on white and dark pages, frames, sequence fills, chart colors, ids,
// size and label length. Node.js only, no dependencies.
//
//   node lint-diagrams.mjs <file.md> [...]
//
// Prints DIAGRAMS VALID, or one line per problem and exits 1.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  contrastRatio,
  DARK_PAGE,
  LIGHT_PAGE,
  MIN_GRAPHIC_CONTRAST,
  MIN_TEXT_CONTRAST,
} from "./contrast.mjs";

const REQUIRED_COLOR_PROPERTIES = ["fill", "stroke", "color"];
const EMPHASIS_PROPERTIES = new Set(["stroke-width", "stroke-dasharray"]);
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const MAX_LINE_LENGTH = 80;
const MAX_NODES = 15;
const MAX_LABEL_LINE_LENGTH = 30;
const MAX_EDGE_LABEL_LENGTH = 24;
const NODE_LABEL_PATTERN = /[([{>]+"([^"]*)"/g;
const EDGE_LABEL_PATTERN = /(?:==|--|-\.)\s*"([^"]*)"|\|([^|]*)\|/g;
const LINE_BREAK_PATTERN = /<br\s*\/?>/;
const WORD_GAP_PATTERN = /\s/;
const SURROUNDING_QUOTES_PATTERN = /^"|"$/g;
const MIN_ID_LENGTH = 3;
const EXIT_CODE_INVALID = 1;
const MERMAID_BLOCK_PATTERN = /```mermaid\r?\n([\s\S]*?)```/g;
const STYLED_DIAGRAM_PATTERN = /^(flowchart|graph|stateDiagram)/;
const FLOWCHART_PATTERN = /^(flowchart|graph)/;
const QUOTED_TEXT_PATTERN = /"[^"]*"/g;
const NODE_DECLARATION_PATTERN = /\b([A-Za-z_][\w]*)\s*(?=\(|\[|\{|>)/g;
const SEQUENCE_PATTERN = /^sequenceDiagram/;
const CHART_PATTERN = /^xychart/;
const DIRECTIVE_PATTERN = /^\s*%%/;
const SEQUENCE_FILL_PATTERN = /^\s*(box|rect)\s+(rgba?\([^)]*\))/;
const OPACITY_PATTERN = /^rgba\((?:[^,]*,){3}\s*([\d.]+)\s*\)$/;
const MAX_SEQUENCE_FILL_OPACITY = 0.25;
const PLOT_COLORS_PATTERN = /"plotColorPalette"\s*:\s*"([^"]+)"/;
const WHITESPACE_PATTERN = /\s/g;
const DARK_CHART_PANEL = "#333333";
const NON_NODE_LINE_PATTERN =
  /^\s*(classDef|class|style|linkStyle|subgraph|accTitle|accDescr|direction|end\b|%%)/;

function diagramsOf(markdown) {
  return [...markdown.matchAll(MERMAID_BLOCK_PATTERN)].map(([, body]) =>
    body.replace(/\r/g, "").split("\n"),
  );
}

function diagramKind(lines) {
  return lines.find((line) => !DIRECTIVE_PATTERN.test(line))?.trim() ?? "";
}

function accessibilityProblems(lines) {
  const problems = [];
  if (!lines.some((line) => /^\s*accTitle\s*:/.test(line))) {
    problems.push("missing accTitle");
  }
  if (!lines.some((line) => /^\s*accDescr\s*(:|\{)/.test(line))) {
    problems.push("missing accDescr");
  }
  return problems;
}

function parseClassDef(line) {
  const [, name, declarations = ""] = line.trim().split(/\s+/);
  const properties = Object.fromEntries(
    declarations.split(",").map((declaration) => declaration.split(":")),
  );
  return { name, properties };
}

function isEmphasisOnly({ properties }) {
  return Object.keys(properties).every((key) => EMPHASIS_PROPERTIES.has(key));
}

function contrastProblems({ name, properties }) {
  const checks = [
    {
      measured: contrastRatio(properties.color, properties.fill),
      minimum: MIN_TEXT_CONTRAST,
      label: "text contrast",
      against: "on its fill",
    },
    {
      measured: contrastRatio(properties.stroke, LIGHT_PAGE),
      minimum: MIN_GRAPHIC_CONTRAST,
      label: "border contrast",
      against: "on white",
    },
    {
      measured: contrastRatio(properties.stroke, DARK_PAGE),
      minimum: MIN_GRAPHIC_CONTRAST,
      label: "border contrast",
      against: "on dark",
    },
  ];
  return checks
    .filter(({ measured, minimum }) => measured < minimum)
    .map(
      ({ measured, minimum, label, against }) =>
        `classDef ${name} ${label} ${measured.toFixed(2)}:1 ${against} (min ${minimum})`,
    );
}

function classDefProblems(classDef) {
  if (isEmphasisOnly(classDef)) return [];
  const missing = REQUIRED_COLOR_PROPERTIES.filter(
    (key) => !HEX_COLOR_PATTERN.test(classDef.properties[key] ?? ""),
  );
  if (missing.length > 0)
    return [`classDef ${classDef.name} must set fill, stroke and color`];
  return contrastProblems(classDef);
}

function paletteProblems(lines) {
  if (!STYLED_DIAGRAM_PATTERN.test(diagramKind(lines))) return [];
  const classDefs = lines
    .filter((line) => /^\s*classDef\s/.test(line))
    .map(parseClassDef);
  if (classDefs.length === 0)
    return ["default style, add the palette classDef"];
  return classDefs.flatMap(classDefProblems);
}

function isTranslucent(fill) {
  const opacity = fill.match(OPACITY_PATTERN)?.[1];
  return opacity !== undefined && Number(opacity) <= MAX_SEQUENCE_FILL_OPACITY;
}

function sequenceFillProblems(lines) {
  if (!SEQUENCE_PATTERN.test(diagramKind(lines))) return [];
  return lines
    .map((line) => line.match(SEQUENCE_FILL_PATTERN))
    .filter(
      (match) =>
        match && !isTranslucent(match[2].replace(WHITESPACE_PATTERN, "")),
    )
    .map(
      ([, block, fill]) =>
        `${block} ${fill} hides dark-mode text, use rgba with alpha at most ${MAX_SEQUENCE_FILL_OPACITY}`,
    );
}

function plotColorProblems(color) {
  const checks = [
    { background: LIGHT_PAGE, against: "on white" },
    { background: DARK_CHART_PANEL, against: "on the dark chart panel" },
    { background: DARK_PAGE, against: "on dark" },
  ];
  return checks
    .map(({ background, against }) => ({
      measured: contrastRatio(color, background),
      against,
    }))
    .filter(({ measured }) => measured < MIN_GRAPHIC_CONTRAST)
    .map(
      ({ measured, against }) =>
        `plot color ${color} contrast ${measured.toFixed(2)}:1 ${against} (min ${MIN_GRAPHIC_CONTRAST})`,
    );
}

function chartProblems(lines) {
  if (!CHART_PATTERN.test(diagramKind(lines))) return [];
  const plotColors = lines
    .map((line) => line.match(PLOT_COLORS_PATTERN)?.[1])
    .find(Boolean);
  if (!plotColors)
    return [
      "xychart default series color is invisible on white, set plotColorPalette",
    ];
  return plotColors
    .split(",")
    .map((color) => color.trim())
    .flatMap(plotColorProblems);
}

function frameProblems(lines) {
  return lines
    .filter((line) => /^\s*style\s/.test(line) && !line.includes("fill:none"))
    .map((line) => `style ${line.trim().split(/\s+/)[1]} must use fill:none`);
}

function nodeIds(lines) {
  if (!FLOWCHART_PATTERN.test(diagramKind(lines))) return [];
  const ids = lines
    .slice(1)
    .filter((line) => !NON_NODE_LINE_PATTERN.test(line))
    .flatMap((line) => [
      ...line
        .replace(QUOTED_TEXT_PATTERN, "")
        .matchAll(NODE_DECLARATION_PATTERN),
    ])
    .map(([, id]) => id);
  return [...new Set(ids)];
}

function nodeProblems(lines) {
  const ids = nodeIds(lines);
  const shortIds = ids
    .filter((id) => id.length < MIN_ID_LENGTH)
    .map((id) => `node id ${id} is not a domain name`);
  if (ids.length <= MAX_NODES) return shortIds;
  return [...shortIds, `${ids.length} nodes, split it (max ${MAX_NODES})`];
}

function flowchartLines(lines) {
  if (!FLOWCHART_PATTERN.test(diagramKind(lines))) return [];
  return lines.filter((line) => !NON_NODE_LINE_PATTERN.test(line));
}

function textLength(text) {
  return [...text].length;
}

function isBreakableOverflow(labelLine) {
  const isTooLong = textLength(labelLine) > MAX_LABEL_LINE_LENGTH;
  return isTooLong && WORD_GAP_PATTERN.test(labelLine.trim());
}

function nodeLabelProblems(lines) {
  return flowchartLines(lines)
    .flatMap((line) => [...line.matchAll(NODE_LABEL_PATTERN)])
    .flatMap(([, label]) => label.split(LINE_BREAK_PATTERN))
    .filter(isBreakableOverflow)
    .map(
      (labelLine) =>
        `label line "${labelLine}" over ${MAX_LABEL_LINE_LENGTH} characters, break it with <br/>`,
    );
}

function edgeLabelProblems(lines) {
  return flowchartLines(lines)
    .flatMap((line) => [...line.matchAll(EDGE_LABEL_PATTERN)])
    .map(
      ([, quoted, piped]) =>
        quoted ?? piped.replace(SURROUNDING_QUOTES_PATTERN, ""),
    )
    .filter((label) => textLength(label) > MAX_EDGE_LABEL_LENGTH)
    .map(
      (label) =>
        `edge label "${label}" over ${MAX_EDGE_LABEL_LENGTH} characters, move the detail to a node`,
    );
}

function lengthProblems(lines) {
  return lines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => line.length > MAX_LINE_LENGTH)
    .map(
      ({ number }) =>
        `line ${number} is longer than ${MAX_LINE_LENGTH} characters`,
    );
}

export function lintDiagrams(markdown) {
  return diagramsOf(markdown).flatMap((lines, index) =>
    [
      ...accessibilityProblems(lines),
      ...paletteProblems(lines),
      ...frameProblems(lines),
      ...sequenceFillProblems(lines),
      ...chartProblems(lines),
      ...nodeProblems(lines),
      ...nodeLabelProblems(lines),
      ...edgeLabelProblems(lines),
      ...lengthProblems(lines),
    ].map((problem) => `Diagram ${index + 1}: ${problem}`),
  );
}

function runFromCommandLine(paths) {
  const problems = paths.flatMap((path) =>
    lintDiagrams(readFileSync(path, "utf8")).map(
      (problem) => `${path} — ${problem}`,
    ),
  );
  if (problems.length === 0) {
    console.log(`DIAGRAMS VALID (${paths.length} files)`);
    return;
  }
  problems.forEach((problem) => console.error(`✗ ${problem}`));
  process.exitCode = EXIT_CODE_INVALID;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFromCommandLine(process.argv.slice(2));
}
