const DEFAULT_PRIMARY = "#2563eb";

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const hexToRgb = (hex) => {
  if (typeof hex !== "string") return null;
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
  }
  if (cleaned.length !== 6) return null;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((value) => clampChannel(value).toString(16).padStart(2, "0"))
    .join("")}`;

const mix = (from, to, amount) => ({
  r: clampChannel(from.r + (to.r - from.r) * amount),
  g: clampChannel(from.g + (to.g - from.g) * amount),
  b: clampChannel(from.b + (to.b - from.b) * amount),
});

export const buildThemeStyle = (primaryColor) => {
  const base = hexToRgb(primaryColor) || hexToRgb(DEFAULT_PRIMARY);
  const light = (amount) => mix(base, { r: 255, g: 255, b: 255 }, amount);
  const dark = (amount) => mix(base, { r: 0, g: 0, b: 0 }, amount);
  const shades = {
    50: light(0.92),
    100: light(0.84),
    200: light(0.7),
    300: light(0.55),
    400: light(0.35),
    500: light(0.18),
    600: base,
    700: dark(0.18),
    800: dark(0.32),
  };
  const style = {
    "--theme-primary": rgbToHex(base),
    "--theme-primary-rgb": `${base.r} ${base.g} ${base.b}`,
  };
  Object.entries(shades).forEach(([key, rgb]) => {
    style[`--theme-primary-${key}`] = rgbToHex(rgb);
    style[`--theme-primary-${key}-rgb`] = `${rgb.r} ${rgb.g} ${rgb.b}`;
  });
  return style;
};

export const DEFAULT_THEME_STYLE = buildThemeStyle(DEFAULT_PRIMARY);
