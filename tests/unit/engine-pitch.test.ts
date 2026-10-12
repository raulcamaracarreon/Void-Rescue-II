import { describe, expect, it } from 'vitest';
import { engineWhineFrequency } from '../../src/audio/AudioEngine';

describe('tono continuo del motor de la nave', () => {
  it('reduce el silbido de máxima velocidad desde ~D5 hasta ~D3', () => {
    // Former whine at full speed: 145 + 70 * 4.2 + 165 = 604 Hz.
    expect(engineWhineFrequency(70, 1)).toBe(151);
    expect(engineWhineFrequency(70, 1)).toBeCloseTo(604 / 4);
  });

  it('mantiene una frecuencia audible en reposo y aumenta suavemente al acelerar', () => {
    expect(engineWhineFrequency(0, 0)).toBe(75);
    expect(engineWhineFrequency(30, 0.5)).toBe(110);
    expect(engineWhineFrequency(70, 1)).toBeGreaterThan(engineWhineFrequency(30, 0.5));
  });

  it('evita frecuencias negativas si llegan valores de entrada anómalos', () => {
    expect(engineWhineFrequency(-1, -1)).toBe(75);
    expect(engineWhineFrequency(0, 5)).toBe(109);
  });
});
