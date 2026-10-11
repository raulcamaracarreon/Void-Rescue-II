import { Random } from '../core/Random';

export type LandscapeLayerKind = 'mountains' | 'buildings';
export type LandscapePreset = 'night' | 'city' | 'sunset' | 'ice';
export type LandscapeSelection = 'cycle' | LandscapePreset | 'custom';
export type LandscapeEditorMode = 'automatic' | 'advanced';
export type LandscapeComposition = 'mountains' | 'buildings' | 'mixed';

export interface AutomaticLandscape {
  skyColor: string;
  frontColor: string;
  layerCount: number;
  composition: LandscapeComposition;
}

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
  moon: boolean;
  seed: number;
  layers: LandscapeLayer[];
  automatic?: AutomaticLandscape;
  advancedEdited?: boolean;
}

export interface LandscapePreferences {
  selection: LandscapeSelection;
  mode: LandscapeEditorMode;
  custom: LandscapeStyle;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const PRESET_ORDER: LandscapePreset[] = ['night', 'city', 'sunset', 'ice'];

export const LANDSCAPE_PRESETS: Record<LandscapePreset, { label: string; style: LandscapeStyle }> = {
  night: { label: 'Noche estelar', style: {
    skyTop: '#020509', skyBottom: '#142b3c', stars: true, moon: true, seed: 11,
    layers: [
      { type: 'mountains', color: '#20354d', amplitude: 17, detail: 28 },
      { type: 'mountains', color: '#1a3551', amplitude: 20, detail: 41 },
      { type: 'mountains', color: '#163849', amplitude: 13, detail: 56 },
      { type: 'mountains', color: '#102632', amplitude: 9, detail: 66 },
    ],
  } },
  city: { label: 'Ciudad abandonada', style: {
    skyTop: '#060817', skyBottom: '#3c305c', stars: true, moon: true, seed: 27,
    layers: [
      { type: 'mountains', color: '#2d2d58', amplitude: 12, detail: 29 },
      { type: 'buildings', color: '#282645', amplitude: 20, detail: 39 },
      { type: 'mountains', color: '#20253c', amplitude: 9, detail: 53 },
      { type: 'buildings', color: '#141c33', amplitude: 14, detail: 70 },
    ],
  } },
  sunset: { label: 'Ocaso alienígena', style: {
    skyTop: '#301938', skyBottom: '#b96a63', stars: false, moon: false, seed: 43,
    layers: [
      { type: 'mountains', color: '#80546e', amplitude: 14, detail: 28 },
      { type: 'mountains', color: '#69445e', amplitude: 19, detail: 40 },
      { type: 'mountains', color: '#4a3552', amplitude: 12, detail: 58 },
      { type: 'buildings', color: '#28263f', amplitude: 13, detail: 39 },
    ],
  } },
  ice: { label: 'Mundo glacial', style: {
    skyTop: '#1e4a68', skyBottom: '#77b7c6', stars: false, moon: false, seed: 59,
    layers: [
      { type: 'mountains', color: '#74a8b9', amplitude: 22, detail: 33 },
      { type: 'mountains', color: '#4e879e', amplitude: 17, detail: 49 },
      { type: 'mountains', color: '#32647d', amplitude: 13, detail: 60 },
      { type: 'mountains', color: '#1c425c', amplitude: 10, detail: 76 },
    ],
  } },
};

/** RGB interpolation matches the original Landscape Generator's mix(a,b,t) exactly. */
export function mixLandscapeColors(sky: string, front: string, t: number): string {
  const amount = Math.max(0, Math.min(1, t));
  const components = [1, 3, 5].map(index => {
    const a = Number.parseInt(sky.slice(index, index + 2), 16);
    const b = Number.parseInt(front.slice(index, index + 2), 16);
    return Math.round(a * (1 - amount) + b * amount).toString(16).padStart(2, '0');
  });
  return '#' + components.join('');
}

const AUTO_PRESETS: Record<LandscapePreset, AutomaticLandscape> = {
  night: { skyColor: '#020509', frontColor: '#17465a', layerCount: 6, composition: 'mountains' },
  city: { skyColor: '#1d2947', frontColor: '#0a142c', layerCount: 6, composition: 'mixed' },
  sunset: { skyColor: '#e6a0a0', frontColor: '#422b56', layerCount: 6, composition: 'mixed' },
  ice: { skyColor: '#96dbef', frontColor: '#164c78', layerCount: 6, composition: 'mountains' },
};

export function copyLandscape(style: LandscapeStyle): LandscapeStyle {
  return {
    ...style,
    layers: style.layers.map(layer => ({ ...layer })),
    ...(style.automatic ? { automatic: { ...style.automatic } } : {}),
  };
}

function copyAutomatic(config: AutomaticLandscape): AutomaticLandscape { return { ...config }; }

export function buildAutomaticLandscape(base: LandscapeStyle, config: AutomaticLandscape): LandscapeStyle {
  const count = config.layerCount;
  const layers: LandscapeLayer[] = Array.from({ length: count }, (_, index) => {
    const depth = count === 1 ? 1 : index / (count - 1);
    const type: LandscapeLayerKind = config.composition === 'mixed'
      ? (index % 3 === 2 ? 'buildings' : 'mountains') : config.composition;
    return {
      type,
      // The sky is the unpainted layer zero; (i + 1) / count follows the original generator.
      color: mixLandscapeColors(config.skyColor, config.frontColor, (index + 1) / count),
      amplitude: Math.round(6 + 20 * depth),
      detail: Math.round(12 + 73 * depth),
    };
  });
  return {
    ...copyLandscape(base),
    skyTop: config.skyColor,
    skyBottom: config.skyColor,
    automatic: copyAutomatic(config),
    layers,
  };
}

export function defaultLandscapePreferences(): LandscapePreferences {
  return {
    selection: 'cycle',
    mode: 'automatic',
    custom: { ...copyLandscape(LANDSCAPE_PRESETS.night.style), automatic: copyAutomatic(AUTO_PRESETS.night), advancedEdited: false },
  };
}

export function resolveLandscape(preferences: LandscapePreferences, wave: number): { name: string; style: LandscapeStyle } {
  const selection = preferences.selection;
  const preset = selection === 'cycle'
    ? PRESET_ORDER[((Math.max(1, Math.floor(wave)) - 1) % PRESET_ORDER.length + PRESET_ORDER.length) % PRESET_ORDER.length]!
    : selection;
  if (preset === 'custom') {
    const custom = copyLandscape(preferences.custom);
    return { name: 'Personalizado', style: preferences.mode === 'automatic'
      ? buildAutomaticLandscape(custom, custom.automatic ?? AUTO_PRESETS.night) : custom };
  }
  const source = { ...copyLandscape(LANDSCAPE_PRESETS[preset].style), automatic: copyAutomatic(AUTO_PRESETS[preset]) };
  return { name: LANDSCAPE_PRESETS[preset].label, style: preferences.mode === 'automatic'
    ? buildAutomaticLandscape(source, AUTO_PRESETS[preset]) : source };
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value.toLowerCase() : fallback;
}
function int(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
}

function sanitizeAutomatic(value: unknown, fallback: AutomaticLandscape): AutomaticLandscape {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return copyAutomatic(fallback);
  const v = value as Record<string, unknown>;
  return {
    skyColor: color(v.skyColor, fallback.skyColor),
    frontColor: color(v.frontColor, fallback.frontColor),
    layerCount: int(v.layerCount, 2, 10, fallback.layerCount),
    composition: v.composition === 'mountains' || v.composition === 'buildings' || v.composition === 'mixed'
      ? v.composition : fallback.composition,
  };
}

export function sanitizeLandscapeStyle(value: unknown, fallback = defaultLandscapePreferences().custom): LandscapeStyle {
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
  // Migrate existing v1 custom landscapes without discarding hand-edited layers.
  const legacy = !('automatic' in v);
  const autoFallback: AutomaticLandscape = fallback.automatic ?? AUTO_PRESETS.night;
  return {
    skyTop: color(v.skyTop, fallback.skyTop),
    skyBottom: color(v.skyBottom, fallback.skyBottom),
    stars: typeof v.stars === 'boolean' ? v.stars : fallback.stars,
    // Migrate older custom landscapes without a moon flag based on their stars preference.
    moon: typeof v.moon === 'boolean' ? v.moon : typeof v.stars === 'boolean' ? v.stars : fallback.moon,
    seed: int(v.seed, 0, 999999999, fallback.seed),
    layers,
    automatic: sanitizeAutomatic(v.automatic, legacy
      ? {
          skyColor: color(v.skyTop, autoFallback.skyColor),
          frontColor: layers[layers.length - 1]!.color,
          layerCount: layers.length,
          composition: layers.every(l => l.type === 'mountains') ? 'mountains'
            : layers.every(l => l.type === 'buildings') ? 'buildings' : 'mixed',
        }
      : autoFallback),
    advancedEdited: typeof v.advancedEdited === 'boolean' ? v.advancedEdited : legacy,
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
    // Old custom palettes stay in advanced mode so user work is preserved.
    mode: v.mode === 'automatic' || v.mode === 'advanced' ? v.mode
      : v.selection === 'custom' ? 'advanced' : defaults.mode,
    custom: sanitizeLandscapeStyle(v.custom),
  };
}

// Stable per-wave visual seed; never mutate the simulation's Random instance.
export function landscapeVisualSeed(gameSeed: number, styleSeed: number, wave: number, index: number): number {
  const random = new Random((gameSeed ^ styleSeed ^ Math.imul(wave, 0x9e3779b9) ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0);
  return Math.floor(random.next() * 0xffffffff) >>> 0;
}
