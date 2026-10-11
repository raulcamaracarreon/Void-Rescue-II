import { Random } from '../core/Random';

export type LandscapeLayerKind = 'mountains' | 'buildings';
export type LandscapePreset = 'night' | 'city' | 'sunset' | 'ice';
export type LandscapeSelection = 'cycle' | LandscapePreset | 'custom';

export interface LandscapeLayer {
  type: LandscapeLayerKind;
  color: string;
  amplitude: number;
  detail: number;
}

export interface LandscapeStyle {
  skyTop: string;
  skyBottom: string;
  stars: boolean;
  seed: number;
  layers: LandscapeLayer[];
}

export interface LandscapePreferences {
  selection: LandscapeSelection;
  custom: LandscapeStyle;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const PRESET_ORDER: LandscapePreset[] = ['night', 'city', 'sunset', 'ice'];

export const LANDSCAPE_PRESETS: Record<LandscapePreset, { label: string; style: LandscapeStyle }> = {
  night: { label: 'Noche estelar', style: {
    skyTop: '#020509', skyBottom: '#142b3c', stars: true, seed: 11,
    layers: [
      { type: 'mountains', color: '#20354d', amplitude: 17, detail: 28 },
      { type: 'mountains', color: '#1a3551', amplitude: 20, detail: 41 },
      { type: 'mountains', color: '#163849', amplitude: 13, detail: 56 },
      { type: 'mountains', color: '#102632', amplitude: 9, detail: 66 },
    ],
  } },
  city: { label: 'Ciudad abandonada', style: {
    skyTop: '#060817', skyBottom: '#3c305c', stars: true, seed: 27,
    layers: [
      { type: 'mountains', color: '#2d2d58', amplitude: 12, detail: 29 },
      { type: 'buildings', color: '#282645', amplitude: 20, detail: 39 },
      { type: 'mountains', color: '#20253c', amplitude: 9, detail: 53 },
      { type: 'buildings', color: '#141c33', amplitude: 14, detail: 70 },
    ],
  } },
  sunset: { label: 'Ocaso alienígena', style: {
    skyTop: '#301938', skyBottom: '#b96a63', stars: false, seed: 43,
    layers: [
      { type: 'mountains', color: '#80546e', amplitude: 14, detail: 28 },
      { type: 'mountains', color: '#69445e', amplitude: 19, detail: 40 },
      { type: 'mountains', color: '#4a3552', amplitude: 12, detail: 58 },
      { type: 'buildings', color: '#28263f', amplitude: 13, detail: 39 },
    ],
  } },
  ice: { label: 'Mundo glacial', style: {
    skyTop: '#1e4a68', skyBottom: '#77b7c6', stars: false, seed: 59,
    layers: [
      { type: 'mountains', color: '#74a8b9', amplitude: 22, detail: 33 },
      { type: 'mountains', color: '#4e879e', amplitude: 17, detail: 49 },
      { type: 'mountains', color: '#32647d', amplitude: 13, detail: 60 },
      { type: 'mountains', color: '#1c425c', amplitude: 10, detail: 76 },
    ],
  } },
};

export function copyLandscape(style: LandscapeStyle): LandscapeStyle {
  return { ...style, layers: style.layers.map(layer => ({ ...layer })) };
}

export function defaultLandscapePreferences(): LandscapePreferences {
  return { selection: 'cycle', custom: copyLandscape(LANDSCAPE_PRESETS.night.style) };
}

export function resolveLandscape(preferences: LandscapePreferences, wave: number): { name: string; style: LandscapeStyle } {
  if (preferences.selection === 'custom') return { name: 'Personalizado', style: copyLandscape(preferences.custom) };
  const preset = preferences.selection === 'cycle'
    ? PRESET_ORDER[((Math.max(1, Math.floor(wave)) - 1) % PRESET_ORDER.length + PRESET_ORDER.length) % PRESET_ORDER.length]!
    : preferences.selection;
  return { name: LANDSCAPE_PRESETS[preset].label, style: copyLandscape(LANDSCAPE_PRESETS[preset].style) };
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value.toLowerCase() : fallback;
}
function int(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
}

export function sanitizeLandscapeStyle(value: unknown, fallback = LANDSCAPE_PRESETS.night.style): LandscapeStyle {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return copyLandscape(fallback);
  const v = value as Record<string, unknown>;
  const source = Array.isArray(v.layers) && v.layers.length >= 2 && v.layers.length <= 10
    ? v.layers : fallback.layers;
  const layers = source.map((item, i): LandscapeLayer => {
    const old = fallback.layers[i % fallback.layers.length]!;
    const layer = item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : {};
    return {
      type: layer.type === 'mountains' || layer.type === 'buildings' ? layer.type : old.type,
      color: color(layer.color, old.color),
      amplitude: int(layer.amplitude, 2, 35, old.amplitude),
      detail: int(layer.detail, 1, 100, old.detail),
    };
  });
  return {
    skyTop: color(v.skyTop, fallback.skyTop),
    skyBottom: color(v.skyBottom, fallback.skyBottom),
    stars: typeof v.stars === 'boolean' ? v.stars : fallback.stars,
    seed: int(v.seed, 0, 999999999, fallback.seed),
    layers,
  };
}

export function sanitizeLandscapePreferences(value: unknown): LandscapePreferences {
  const defaults = defaultLandscapePreferences();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  const v = value as Record<string, unknown>;
  const selection = v.selection;
  return {
    selection: selection === 'cycle' || selection === 'custom' ||
      (typeof selection === 'string' && Object.hasOwn(LANDSCAPE_PRESETS, selection))
        ? selection as LandscapeSelection : defaults.selection,
    custom: sanitizeLandscapeStyle(v.custom),
  };
}

// Stable per-wave visual seed; never mutate the simulation's Random instance.
export function landscapeVisualSeed(gameSeed: number, styleSeed: number, wave: number, index: number): number {
  const random = new Random((gameSeed ^ styleSeed ^ Math.imul(wave, 0x9e3779b9) ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0);
  return Math.floor(random.next() * 0xffffffff) >>> 0;
}
