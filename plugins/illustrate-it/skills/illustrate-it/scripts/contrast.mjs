// WCAG 2.x relative-luminance contrast ratio, used by both linters.
export const LIGHT_PAGE = "#FFFFFF";
export const DARK_PAGE = "#0D1117";
export const MIN_TEXT_CONTRAST = 4.5;
export const MIN_GRAPHIC_CONTRAST = 3;

const HEX_CHANNEL_STARTS = [1, 3, 5];
const HEX_CHANNEL_LENGTH = 2;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const LINEAR_THRESHOLD = 0.03928;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const FLARE = 0.05;
const RATIO_DECIMALS = 2;

function linearChannel(value) {
  if (value <= LINEAR_THRESHOLD) return value / LINEAR_DIVISOR;
  return ((value + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
}

function relativeLuminance(hex) {
  const [red, green, blue] = HEX_CHANNEL_STARTS.map((start) =>
    linearChannel(
      parseInt(hex.slice(start, start + HEX_CHANNEL_LENGTH), HEX_RADIX) /
        CHANNEL_MAX,
    ),
  );
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
}

export function contrastRatio(firstHex, secondHex) {
  const [lighter, darker] = [
    relativeLuminance(firstHex),
    relativeLuminance(secondHex),
  ].sort((first, second) => second - first);
  return Number(((lighter + FLARE) / (darker + FLARE)).toFixed(RATIO_DECIMALS));
}
