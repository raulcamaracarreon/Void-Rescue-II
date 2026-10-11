import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../src/game/config';
import {
  copyLandscape, defaultLandscapePreferences, LANDSCAPE_PRESETS, landscapeVisualSeed,
  resolveLandscape, sanitizeLandscapePreferences,
} from '../../src/landscape/LandscapeConfig';
import { landscapeSilhouette, parallaxFactor, parallaxOffset } from '../../src/landscape/LandscapeMath';

describe('paisajes procedurales', () => {
  it('alterna ambientes por oleada sin cambiar la paleta configurada', () => {
    const preferences = defaultLandscapePreferences();
    expect([1, 2, 3, 4, 5].map(wave => resolveLandscape(preferences, wave).name))
      .toEqual(['Noche estelar', 'Ciudad abandonada', 'Ocaso alienígena', 'Mundo glacial', 'Noche estelar']);
    expect(resolveLandscape(preferences, 1).style.stars).toBe(true);
    expect(resolveLandscape(preferences, 3).style.stars).toBe(false);
    preferences.selection = 'city';
    expect(resolveLandscape(preferences, 99).name).toBe('Ciudad abandonada');
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

  it('mantiene movimiento relativo suave con cámara continua incluso al cruzar 2400', () => {
    const factor = parallaxFactor(2, 6);
    expect(factor).toBeGreaterThan(0); expect(factor).toBeLessThan(1);
    const before = parallaxOffset(CONFIG.worldWidth - 1, factor, CONFIG.worldWidth);
    const after = parallaxOffset(CONFIG.worldWidth + 1, factor, CONFIG.worldWidth);
    expect(after - before).toBeCloseTo(2 * factor, 9);
  });
});
