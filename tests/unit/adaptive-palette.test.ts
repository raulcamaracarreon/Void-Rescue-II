import { describe, expect, it } from 'vitest';
import { adaptivePalette, contrastRatio, relativeLuminance } from '../../src/landscape/AdaptivePalette';
import { copyLandscape, defaultLandscapePreferences, LANDSCAPE_PRESETS, resolveLandscape } from '../../src/landscape/LandscapeConfig';

describe('contraste adaptativo HUD y láser', () => {
  it('preserva luminancia y contraste W3C en los extremos', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1);
    expect(relativeLuminance('#000000')).toBeCloseTo(0);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
  });
  it('garantiza contraste WCAG AA >= 4.5:1 sin placas en todos los presets', () => {
    const prefs = defaultLandscapePreferences();
    for (const preset of ['night','city','sunset','ice'] as const) {
      prefs.selection = preset;
      for (const mode of ['automatic','advanced'] as const) {
        prefs.mode = mode;
        const theme = adaptivePalette(resolveLandscape(prefs, 2).style);
        // No solid HUD background: validate the contrast against the actual
        // top-of-screen sky rather than an artificial white/black plate.
        const sky = resolveLandscape(prefs, 2).style;
        const mix = (a: string, b: string) => {
          const channels = [1, 3, 5].map(i => Math.round(
            parseInt(a.slice(i, i + 2), 16) * 0.82
            + parseInt(b.slice(i, i + 2), 16) * 0.18));
          return '#' + channels.map(v => v.toString(16).padStart(2, '0')).join('');
        };
        const backdrop = mix(sky.skyTop, sky.skyBottom);
        expect(contrastRatio(theme.primary, backdrop)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(theme.secondary, backdrop)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(theme.accent, backdrop)).toBeGreaterThanOrEqual(4.5);
      }
    }
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
    expect(relativeLuminance(dark.primary)).toBeGreaterThan(relativeLuminance(light.primary));
    expect(light.outline).not.toBe(dark.outline);
  });
});
