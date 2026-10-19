// Lints a hand-authored SVG: accessible name, viewBox only, safe markup,
// 12px minimum text, measured palette colors, every text on a filled chip.
// Node.js only, no dependencies.
//
//   node lint-svg.mjs <file.svg> [...]
//
// Prints SVG VALID, or one line per problem and exits 1.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MIN_FONT_SIZE = 12;
const EXIT_CODE_INVALID = 1;
const MEASURED_PALETTE = new Set([
  "#F3E8FF",
  "#9333EA",
  "#3B0764",
  "#E0F2FE",
  "#0284C7",
  "#0C4A6E",
  "#FEF3C7",
  "#D97706",
  "#78350F",
  "#DCFCE7",
  "#16A34A",
  "#14532D",
  "#FEE2E2",
  "#DC2626",
  "#7F1D1D",
  "#F1F5F9",
  "#64748B",
  "#334155",
]);
const FORBIDDEN_MARKUP = [
  "<script",
  "<foreignObject",
  "<image",
  'href="http',
  "@import",
  "@font-face",
];
const NO_FILL_VALUES = new Set(["none", "transparent"]);
const ROOT_PATTERN = /<svg\b[^>]*>/;
const ROOT_SIZE_PATTERN = /\s(width|height)=/;
const TITLE_ID_PATTERN = /<title\s+id="([^"]+)"/;
const LABELLED_BY_PATTERN = /aria-labelledby="([^"]*)"/;
const FONT_SIZE_PATTERN = /font-size[=:]\s*"?(\d+(?:\.\d+)?)/g;
const HEX_COLOR_PATTERN = /#[0-9A-Fa-f]{6}\b/g;
const RECT_PATTERN = /<rect\b[^>]*>/g;
const CIRCLE_PATTERN = /<circle\b[^>]*>/g;
const TEXT_PATTERN = /<text\b([^>]*)>([^<]*)<\/text>/g;

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

function numberAttribute(tag, name) {
  return Number(attribute(tag, name) ?? 0);
}

function isFilled(tag) {
  const fill = attribute(tag, "fill");
  return fill !== undefined && !NO_FILL_VALUES.has(fill);
}

function rectChips(svg) {
  return [...svg.matchAll(RECT_PATTERN)]
    .map(([tag]) => tag)
    .filter(isFilled)
    .map((tag) => ({
      left: numberAttribute(tag, "x"),
      top: numberAttribute(tag, "y"),
      right: numberAttribute(tag, "x") + numberAttribute(tag, "width"),
      bottom: numberAttribute(tag, "y") + numberAttribute(tag, "height"),
    }));
}

function circleChips(svg) {
  return [...svg.matchAll(CIRCLE_PATTERN)]
    .map(([tag]) => tag)
    .filter(isFilled)
    .map((tag) => {
      const radius = numberAttribute(tag, "r");
      return {
        left: numberAttribute(tag, "cx") - radius,
        top: numberAttribute(tag, "cy") - radius,
        right: numberAttribute(tag, "cx") + radius,
        bottom: numberAttribute(tag, "cy") + radius,
      };
    });
}

function isOnChip(point, chips) {
  return chips.some(
    (chip) =>
      point.x >= chip.left &&
      point.x <= chip.right &&
      point.y >= chip.top &&
      point.y <= chip.bottom,
  );
}

function rootProblems(svg) {
  const root = svg.match(ROOT_PATTERN)?.[0] ?? "";
  const problems = [];
  if (!root.includes("viewBox=")) problems.push("missing viewBox");
  if (ROOT_SIZE_PATTERN.test(root))
    problems.push("root width or height blocks scaling, keep only viewBox");
  if (!root.includes('role="img"')) problems.push('missing role="img"');
  return problems;
}

function nameProblems(svg) {
  const titleId = svg.match(TITLE_ID_PATTERN)?.[1];
  if (!titleId) return ['missing <title id="…">'];
  const labelledBy = svg.match(LABELLED_BY_PATTERN)?.[1]?.split(/\s+/) ?? [];
  const problems = labelledBy.includes(titleId)
    ? []
    : [`aria-labelledby must name the title id ${titleId}`];
  if (!svg.includes("<desc")) problems.push("missing <desc> with the takeaway");
  return problems;
}

function markupProblems(svg) {
  return FORBIDDEN_MARKUP.filter((markup) => svg.includes(markup)).map(
    (markup) => `forbidden ${markup}`,
  );
}

function fontProblems(svg) {
  return [...svg.matchAll(FONT_SIZE_PATTERN)]
    .map(([, size]) => Number(size))
    .filter((size) => size < MIN_FONT_SIZE)
    .map((size) => `font-size ${size} under ${MIN_FONT_SIZE}px`);
}

function colorProblems(svg) {
  const colors = [...new Set(svg.match(HEX_COLOR_PATTERN) ?? [])];
  return colors
    .filter((color) => !MEASURED_PALETTE.has(color.toUpperCase()))
    .map((color) => `color ${color} is off the measured palette`);
}

function textProblems(svg) {
  const chips = [...rectChips(svg), ...circleChips(svg)];
  return [...svg.matchAll(TEXT_PATTERN)]
    .filter(
      ([, attributes]) =>
        !isOnChip(
          {
            x: numberAttribute(attributes, "x"),
            y: numberAttribute(attributes, "y"),
          },
          chips,
        ),
    )
    .map(
      ([, , content]) =>
        `text "${content.trim()}" sits on the page, put it on a filled chip`,
    );
}

export function lintSvg(svg) {
  return [
    ...rootProblems(svg),
    ...nameProblems(svg),
    ...markupProblems(svg),
    ...fontProblems(svg),
    ...colorProblems(svg),
    ...textProblems(svg),
  ];
}

function runFromCommandLine(paths) {
  const problems = paths.flatMap((path) =>
    lintSvg(readFileSync(path, "utf8")).map(
      (problem) => `${path} — ${problem}`,
    ),
  );
  if (problems.length === 0) {
    console.log(`SVG VALID (${paths.length} files)`);
    return;
  }
  problems.forEach((problem) => console.error(`✗ ${problem}`));
  process.exitCode = EXIT_CODE_INVALID;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFromCommandLine(process.argv.slice(2));
}
