import type { LandscapeStyle } from './LandscapeConfig';

interface RGB { r: number; g: number; b: number }
export interface AdaptivePalette {
  /** One solid color for all telemetry, selected to contrast with the visible sky. */
  hudInk: string;
  laser: string;
  laserOutline: string;
}
const LASER_NEON_GREEN = '#39ff14';
const validHex = /^#[\da-f]{6}$/i;

function rgb(hex: string): RGB {
  if (!validHex.test(hex)) return { r: 8, g: 15, b: 25 };
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}
function toHex(channels: RGB): string {
  return '#' + [channels.r, channels.g, channels.b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function luminanceChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
export function relativeLuminance(hex: string): number {
  const value = rgb(hex);
  return 0.2126 * luminanceChannel(value.r) + 0.7152 * luminanceChannel(value.g) + 0.0722 * luminanceChannel(value.b);
}
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first), b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function hueOf(hex: string): number {
  const { r, g, b } = rgb(hex);
  const a = r / 255, c = g / 255, d = b / 255;
  const hi = Math.max(a, c, d), lo = Math.min(a, c, d), diff = hi - lo;
  if (!diff) return 200;
  const h = hi === a ? ((c - d) / diff) % 6 : hi === c ? (d - a) / diff + 2 : (a - c) / diff + 4;
  return (h * 60 + 360) % 360;
}
function hsl(hue: number, saturation: number, lightness: number): string {
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness - c / 2;
  const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0]
    : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c]
    : hue < 300 ? [x, 0, c] : [c, 0, x];
  return toHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}
function suitableHue(hue: number, backdrop: string, target: number, lighter: boolean): string {
  const options = lighter ? [0.88, 0.95, 0.78, 0.71, 0.62] : [0.16, 0.11, 0.23, 0.28, 0.34];
  const colors = options.map(l => hsl(hue, 0.82, l));
  return colors.find(v => contrastRatio(v, backdrop) >= target) ??
    colors.sort((a, b) => contrastRatio(b, backdrop) - contrastRatio(a, backdrop))[0]!;
}
function pickLaserColor(style: LandscapeStyle): string {
  // Bright neon green is the regular shot. If the landscape becomes similarly green,
  // generate a complementary shot with an accessible brightness for that mountain.
  const clash = style.layers
    .map(layer => layer.color)
    .filter(backdrop => contrastRatio(backdrop, LASER_NEON_GREEN) < 2.5)
    .sort((a, b) => contrastRatio(a, LASER_NEON_GREEN) - contrastRatio(b, LASER_NEON_GREEN))[0];
  if (!clash) return LASER_NEON_GREEN;
  return suitableHue((hueOf(clash) + 180) % 360, clash, 4.5, relativeLuminance(clash) < 0.2);
}

/** Choose a single complementary ink (not separate label/accent colors).
 *  Prefer the least extreme complementary tint passing 7:1, then 4.5:1.
 *  Neutral black/white are safety fallbacks for midtone or custom skies.
 */
export function chooseHudInk(style: LandscapeStyle): string {
  // The mission/stats HUD occupies the upper portion of the sky; using
  // its actual gradient color avoids the inaccurate old white-panel baseline.
  const top = rgb(style.skyTop), bottom = rgb(style.skyBottom);
  const backdrop = toHex({
    r: top.r * 0.82 + bottom.r * 0.18,
    g: top.g * 0.82 + bottom.g * 0.18,
    b: top.b * 0.82 + bottom.b * 0.18,
  });
  const hue = (hueOf(backdrop) + 180) % 360;
  const preferDark = relativeLuminance(backdrop) >= 0.18;
  const lightness = preferDark
    ? [0.18, 0.14, 0.10, 0.06, 0.82, 0.90, 0.96]
    : [0.82, 0.90, 0.96, 0.18, 0.14, 0.10, 0.06];
  const candidates = lightness.map(l => hsl(hue, 0.85, l));
  const neutrals = ['#000000', '#ffffff'];
  for (const required of [7, 4.5]) {
    const complementary = candidates.find(ink => contrastRatio(ink, backdrop) >= required);
    if (complementary) return complementary;
  }
  return [...candidates, ...neutrals].sort((a,b) => contrastRatio(b, backdrop) - contrastRatio(a, backdrop))[0]!;
}

/** Palette is recalculated only when a landscape/wave changes. */
export function adaptivePalette(style: LandscapeStyle): AdaptivePalette {
  const hudInk = chooseHudInk(style);
  const laser = pickLaserColor(style);
  const laserOutline = relativeLuminance(laser) > 0.3 ? '#060d17' : '#fffdf1';
  return {
    hudInk,
    laser,
    laserOutline,
  };
}
