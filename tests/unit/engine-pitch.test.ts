import { describe, expect, it } from 'vitest';
import { engineWhineFrequency } from '../../src/audio/AudioEngine';

describe('tono continuo del motor de la nave', () => {
  it('sitúa el motor a ~300 Hz con velocidad y empuje máximos, frente a los 604 Hz iniciales', () => {
    // Original: 145 + 70 * 4.2 + 165 = 604 Hz; v1.0.3: 151 Hz.
    expect(engineWhineFrequency(70, 1)).toBe(300);
    expect(engineWhineFrequency(70, 1)).toBeCloseTo(604 / 2, -1);
  });

  it('permanece audible a baja velocidad y aumenta suavemente al acelerar', () => {
    expect(engineWhineFrequency(0, 0)).toBe(155);
    expect(engineWhineFrequency(30, 0.5)).toBe(220);
    expect(engineWhineFrequency(70, 1)).toBeGreaterThan(engineWhineFrequency(30, 0.5));
  });

  it('acota entradas anómalas al rango real del motor', () => {
    expect(engineWhineFrequency(-1, -1)).toBe(155);
    expect(engineWhineFrequency(0, 5)).toBe(195);
    expect(engineWhineFrequency(900, 9)).toBe(300);
  });
});
