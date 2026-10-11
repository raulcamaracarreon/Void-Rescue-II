import { describe, expect, it } from 'vitest';
import { adaptivePalette, chooseHudInk, contrastRatio, relativeLuminance } from '../../src/landscape/AdaptivePalette';
import { copyLandscape, defaultLandscapePreferences, LANDSCAPE_PRESETS, resolveLandscape } from '../../src/landscape/LandscapeConfig';

function blendedSky(top: string, bottom: string): string {
  const channels = [1, 3, 5].map(i => Math.round(
    parseInt(top.slice(i, i + 2), 16) * 0.82
    + parseInt(bottom.slice(i, i + 2), 16) * 0.18));
  return '#' + channels.map(v => v.toString(16).padStart(2, '0')).join('');
}

describe('contraste adaptativo HUD y láser', () => {
  it('preserva luminancia y contraste W3C en los extremos', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1);
    expect(relativeLuminance('#000000')).toBeCloseTo(0);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
  });
  it('elige UNA tinta legible contra el cielo para los cuatro paisajes y ambos editores', () => {
    const prefs = defaultLandscapePreferences();
    for (const preset of ['night','city','sunset','ice'] as const) {
      prefs.selection = preset;
      for (const mode of ['automatic','advanced'] as const) {
        prefs.mode = mode;
        const sky = resolveLandscape(prefs, 2).style;
        const theme = adaptivePalette(sky);
        const backdrop = blendedSky(sky.skyTop, sky.skyBottom);
        expect(theme.hudInk).toBe(chooseHudInk(sky));
        expect(contrastRatio(theme.hudInk, backdrop)).toBeGreaterThanOrEqual(4.5);
        expect(theme).not.toHaveProperty('primary');
        expect(theme).not.toHaveProperty('secondary');
        expect(theme).not.toHaveProperty('accent');
      }
    }
  });
  it.each(['#ff6154','#f9f2ea','#969696','#202b48','#0a1016','#91d892'])(
    'conserva al menos AA 4.5:1 para un cielo personalizado %s', color => {
      const sky = copyLandscape(LANDSCAPE_PRESETS.night.style);
      sky.skyTop = color; sky.skyBottom = color;
      const { hudInk, hudOutline } = adaptivePalette(sky);
      expect(contrastRatio(hudInk, color)).toBeGreaterThanOrEqual(4.5);
      expect(hudOutline).toMatch(/^#[0-9a-f]{8}$/i);
    });
  it('usa verde fosforescente sobre montañas distintas, pero complementario si son verdes', () => {
    const landscape = copyLandscape(LANDSCAPE_PRESETS.night.style);
    const original = adaptivePalette(landscape);
    expect(original.laser).toBe('#39ff14');
    landscape.layers[2]!.color = '#39ff14';
    const contrasting = adaptivePalette(landscape);
    expect(contrasting.laser).not.toBe('#39ff14');
    expect(contrastRatio(contrasting.laser, '#39ff14')).toBeGreaterThanOrEqual(4.5);
    expect(['#060d17', '#fffdf1']).toContain(contrasting.laserOutline);
  });
  it('adapta tonos de HUD según un cielo claro u oscuro', () => {
    const landscape = copyLandscape(LANDSCAPE_PRESETS.night.style);
    const dark = adaptivePalette(landscape);
    landscape.skyTop = '#e6effb'; landscape.skyBottom = '#e6effb';
    const light = adaptivePalette(landscape);
    expect(relativeLuminance(dark.hudInk)).toBeGreaterThan(relativeLuminance(light.hudInk));
    expect(light.hudOutline).not.toBe(dark.hudOutline);
  });
});
