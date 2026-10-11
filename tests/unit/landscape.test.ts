import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../src/game/config';
import {
  copyLandscape, defaultLandscapePreferences, LANDSCAPE_PRESETS, landscapeVisualSeed,
  mixLandscapeColors,
  resolveLandscape, sanitizeLandscapePreferences, PRESET_ORDER, landscapeForWave, allLandscapeChoices,
} from '../../src/landscape/LandscapeConfig';
import { landscapeSilhouette, parallaxFactor, parallaxOffset } from '../../src/landscape/LandscapeMath';
import { ParallaxLandscape } from '../../src/render/ParallaxLandscape';

describe('paisajes procedurales', () => {
  it('incluye 13 mundos y conserva colores extremos de las tres referencias', () => {
    expect(PRESET_ORDER).toHaveLength(13);
    for (const id of PRESET_ORDER) {
      const preset = LANDSCAPE_PRESETS[id];
      expect(preset).toBeDefined();
      const p = defaultLandscapePreferences();
      p.selection = id;
      const first = resolveLandscape(p, 1).style;
      expect(first.layers).toHaveLength(6);
      expect(first.layers.at(-1)!.color).toBe(first.automatic!.frontColor);
    }
    const p = defaultLandscapePreferences();
    for (const [id, sky, foreground] of [
      ['martian_dusk', '#ef4d25', '#482a0f'],
      ['polar_overcast', '#fafafa', '#46527c'],
      ['strange_planet', '#f92fc3', '#481043'],
    ]) {
      p.selection = id as typeof p.selection;
      const style = resolveLandscape(p, 3).style;
      expect(style.skyTop).toBe(sky);
      expect(style.layers.at(-1)!.color).toBe(foreground);
    }
  });

  it('rota cualquier subconjunto de presets y guardados, sin repetir dentro de cada ciclo', () => {
    const p = defaultLandscapePreferences();
    p.library.push({
      id: 'esmeralda-1', name: 'Planeta Esmeralda', mode: 'automatic',
      style: copyLandscape(p.custom),
    });
    p.cyclePool = ['night', 'martian_dusk', 'user:esmeralda-1', 'polar_overcast'];
    expect(allLandscapeChoices(p).at(-1)?.label).toBe('Planeta Esmeralda');
    expect([1, 2, 3, 4, 5].map(w => landscapeForWave(p, w, 8042)))
      .toEqual(['night', 'martian_dusk', 'user:esmeralda-1', 'polar_overcast', 'night']);
    p.rotation = 'shuffle';
    const first = Array.from({ length: 4 }, (_, i) => landscapeForWave(p, i + 1, 8042));
    const second = Array.from({ length: 4 }, (_, i) => landscapeForWave(p, i + 5, 8042));
    expect(new Set(first).size).toBe(4);
    expect(new Set(second).size).toBe(4);
    expect(first.at(-1)).not.toBe(second[0]);
    expect(first).toEqual(Array.from({ length: 4 }, (_, i) => landscapeForWave(p, i + 1, 8042)));
    p.selection = 'cycle';
    expect([1, 2, 3, 4].map(w => resolveLandscape(p, w, 8042).name))
      .toEqual(first.map(id => id.startsWith('user:') ? 'Planeta Esmeralda'
        : LANDSCAPE_PRESETS[id as keyof typeof LANDSCAPE_PRESETS].label));
  });

  it('migra preferencias anteriores y valida biblioteca y rotación malformadas', () => {
    const legacy = { selection: 'custom', mode: 'advanced', custom: {
      skyTop: '#456789', skyBottom: '#456789', seed: 55, stars: true,
      layers: LANDSCAPE_PRESETS.night.style.layers,
    }};
    const restored = sanitizeLandscapePreferences(legacy);
    expect(restored.selection).toBe('custom');
    expect(restored.custom.skyTop).toBe('#456789');
    expect(restored.library).toEqual([]);
    expect(restored.cyclePool).toHaveLength(13);
    const p = defaultLandscapePreferences();
    p.library.push({ id: 'abc', name: '    Mi paisaje  ', mode: 'advanced',
      style: { ...copyLandscape(p.custom), skyTop: '#aabbcc' } });
    p.selection = 'user:abc';
    p.cyclePool = ['night', 'user:abc', 'user:abc', 'invalid', '__proto__'];
    const clean = sanitizeLandscapePreferences(p);
    expect(clean.cyclePool).toEqual(['night', 'user:abc']);
    expect(clean.library[0]!.name).toBe('Mi paisaje');
    expect(resolveLandscape(clean, 6).style.skyTop).toBe('#aabbcc');
    clean.library[0]!.style.skyTop = '#112233';
    expect(p.library[0]!.style.skyTop).toBe('#aabbcc');
    const invalid = sanitizeLandscapePreferences({ selection: 'user:missing',
      library: [{ id: '../evil', name: '<script>alert(1)</script>' }],
      cyclePool: ['user:missing'] });
    expect(invalid.selection).toBe('cycle');
    expect(invalid.library).toHaveLength(0);
    expect(landscapeForWave(invalid, 2)).toBe('night');
  });


  it('interpola RGB como el generador original, dejando la última capa idéntica al color frontal', () => {
    const sky = '#96dbef', front = '#164c78';
    expect(mixLandscapeColors(sky, front, 0)).toBe(sky);
    expect(mixLandscapeColors(sky, front, 1)).toBe(front);
    const prefs = defaultLandscapePreferences();
    prefs.selection = 'ice';
    const style = resolveLandscape(prefs, 1).style;
    expect(style.skyTop).toBe(sky);
    expect(style.skyBottom).toBe(sky);
    expect(style.layers).toHaveLength(6);
    expect(style.layers[0]!.color).toBe(mixLandscapeColors(sky, front, 1 / 6));
    expect(style.layers[5]!.color).toBe(front);
    expect(style.layers.every((layer, i) => layer.color === mixLandscapeColors(sky, front, (i + 1) / 6))).toBe(true);
    expect(style.layers[0]!.detail).toBeLessThan(style.layers.at(-1)!.detail);
    expect(style.layers[0]!.amplitude).toBeLessThan(style.layers.at(-1)!.amplitude);
  });

  it('preserva las capas avanzadas independientemente del gradiente automático', () => {
    const prefs = defaultLandscapePreferences();
    prefs.selection = 'custom';
    prefs.custom = {
      ...prefs.custom,
      automatic: { skyColor: '#96dbef', frontColor: '#164c78', layerCount: 5, composition: 'mixed' },
      layers: [{ type: 'buildings', color: '#ff0033', amplitude: 22, detail: 75 },
        ...prefs.custom.layers.slice(1)],
      advancedEdited: true,
    };
    const automatic = resolveLandscape(prefs, 2).style;
    expect(automatic.layers).toHaveLength(5);
    expect(automatic.layers[0]!.color).not.toBe('#ff0033');
    prefs.mode = 'advanced';
    expect(resolveLandscape(prefs, 2).style.layers[0]!.color).toBe('#ff0033');
    expect(sanitizeLandscapePreferences(JSON.parse(JSON.stringify(prefs)))).toEqual(prefs);
  });

  it('migra preferencias antiguas personalizadas sin eliminar capas manuales', () => {
    const prior = { selection: 'custom', custom: {
      skyTop: '#102030', skyBottom: '#123456', stars: true, seed: 72,
      layers: Array.from({ length: 3 }, (_, i) => ({ type: 'mountains', color: '#12345' + i, amplitude: 10, detail: 20 })),
    } };
    const migrated = sanitizeLandscapePreferences(prior);
    expect(migrated.mode).toBe('advanced');
    expect(migrated.custom.layers).toHaveLength(3);
    expect(migrated.custom.automatic?.skyColor).toBe('#102030');
    expect(migrated.custom.automatic?.frontColor).toBe('#123452');
    expect(migrated.custom.advancedEdited).toBe(true);
  });

  it('alterna ambientes por oleada sin cambiar la paleta configurada', () => {
    const preferences = defaultLandscapePreferences();
    expect([1, 2, 3, 4, 5].map(wave => resolveLandscape(preferences, wave).name))
      .toEqual(['Noche estelar', 'Ciudad abandonada', 'Ocaso alienígena', 'Mundo glacial', 'Mundo volcánico']);
    expect(resolveLandscape(preferences, 1).style.stars).toBe(true);
    expect(resolveLandscape(preferences, 1).style.moon).toBe(true);
    expect(resolveLandscape(preferences, 3).style.moon).toBe(false);
    expect(defaultLandscapePreferences().mode).toBe('automatic');
    expect(resolveLandscape(preferences, 3).style.stars).toBe(false);
    preferences.selection = 'city';
    expect(resolveLandscape(preferences, 99).name).toBe('Ciudad abandonada');
  });

  it('permite ocultar la luna en ambos editores y migra configuraciones anteriores', () => {
    const preferences = defaultLandscapePreferences();
    preferences.selection = 'custom';
    preferences.custom.moon = false;
    expect(resolveLandscape(preferences, 1).style.moon).toBe(false);
    preferences.mode = 'advanced';
    expect(resolveLandscape(preferences, 2).style.moon).toBe(false);
    expect(sanitizeLandscapePreferences(JSON.parse(JSON.stringify(preferences))).custom.moon).toBe(false);
    const old = sanitizeLandscapePreferences({
      selection: 'custom',
      custom: {
        skyTop: '#020509', skyBottom: '#142b3c', stars: false, seed: 1,
        layers: LANDSCAPE_PRESETS.night.style.layers,
      },
    });
    expect(old.custom.moon).toBe(false);
  });

  it('persiste una paleta independiente y nunca muta un preset', () => {
    const preferences = defaultLandscapePreferences();
    preferences.selection = 'custom';
    preferences.custom.skyTop = '#abcdef';
    preferences.custom.layers[0]!.type = 'buildings';
    const parsed = sanitizeLandscapePreferences(JSON.parse(JSON.stringify(preferences)));
    expect(parsed).toEqual(preferences);
    expect(LANDSCAPE_PRESETS.night.style.skyTop).toBe('#020509');
    const resolved = resolveLandscape(parsed, 2).style;
    resolved.layers[0]!.color = '#ffffff';
    expect(parsed.custom.layers[0]!.color).not.toBe('#ffffff');
  });

  it('valida colores, cantidad de capas y valores inesperados del almacenamiento', () => {
    expect(sanitizeLandscapePreferences(null)).toEqual(defaultLandscapePreferences());
    expect(sanitizeLandscapePreferences({ selection: '__proto__' }).selection).toBe('cycle');
    const p = sanitizeLandscapePreferences({
      selection: 'custom',
      custom: {
        skyTop: '<script>', skyBottom: '#123abc', stars: 'false', seed: Infinity,
        layers: Array.from({ length: 11 }, () => ({ type: 'unknown', color: '#xxx', amplitude: -50, detail: 200 })),
      },
    });
    expect(p.custom.skyTop).toBe(LANDSCAPE_PRESETS.night.style.skyTop);
    expect(p.custom.skyBottom).toBe('#123abc');
    expect(p.custom.stars).toBe(true);
    expect(p.custom.layers).toHaveLength(4);
    expect(copyLandscape(p.custom)).toEqual(p.custom);
  });

  it('genera montañas y edificios deterministas con extremos exactamente unidos', () => {
    for (const type of ['mountains', 'buildings'] as const) {
      const layer = { type, color: '#192d40', amplitude: 25, detail: 56 };
      const seed = landscapeVisualSeed(8042, 42, 3, 1);
      const points = landscapeSilhouette(layer, 1, 4, seed, CONFIG.worldWidth);
      expect(points).toEqual(landscapeSilhouette(layer, 1, 4, seed, CONFIG.worldWidth));
      expect(points).not.toEqual(landscapeSilhouette(layer, 1, 4, seed + 1, CONFIG.worldWidth));
      expect(points[0]!.x).toBe(0);
      expect(points.at(-1)!.x).toBe(CONFIG.worldWidth);
      expect(points.at(-1)!.y).toBeCloseTo(points[0]!.y, 12);
      expect(points.every(point => Number.isFinite(point.y))).toBe(true);
    }
  });

  it('detiene el desplazamiento de fondo con la opción de reducir movimiento', () => {
    const visual = new ParallaxLandscape();
    visual.rebuild(LANDSCAPE_PRESETS.city.style, 8042, 1);
    visual.update(1600, true);
    const fixed = visual.group.children.map(group => group.children[1]!.position.x);
    expect(fixed.every(x => x === 0)).toBe(true);
    visual.update(1600, false);
    const moving = visual.group.children.map(group => group.children[1]!.position.x);
    expect(moving.every(x => x < 0)).toBe(true);
    visual.dispose();
  });

  it('mantiene movimiento relativo suave con cámara continua incluso al cruzar 2400', () => {
    const factor = parallaxFactor(2, 6);
    expect(factor).toBeGreaterThan(0); expect(factor).toBeLessThan(1);
    const before = parallaxOffset(CONFIG.worldWidth - 1, factor, CONFIG.worldWidth);
    const after = parallaxOffset(CONFIG.worldWidth + 1, factor, CONFIG.worldWidth);
    expect(after - before).toBeCloseTo(2 * factor, 9);
  });
});
