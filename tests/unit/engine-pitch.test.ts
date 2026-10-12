import { describe, expect, it } from 'vitest';
import { AudioEngine, engineWhineFrequency, normalizeEnginePitch } from '../../src/audio/AudioEngine';

describe('tono personalizable del motor', () => {
  it('usa 300 Hz por defecto cuando la nave alcanza la máxima velocidad y empuje', () => {
    expect(engineWhineFrequency(70, 1)).toBe(300);
    expect(engineWhineFrequency(0, 0)).toBe(155);
    expect(engineWhineFrequency(30, 0.5)).toBe(220);
  });

  it('ajusta el máximo entre 250 y 1000 Hz manteniendo la respuesta a la velocidad', () => {
    for (const hz of [250, 300, 432, 600, 1000]) {
      expect(engineWhineFrequency(70, 1, hz)).toBe(hz);
      expect(engineWhineFrequency(30, 0.5, hz)).toBeLessThan(hz);
      expect(engineWhineFrequency(0, 0, hz)).toBeLessThan(engineWhineFrequency(30, 0.5, hz));
    }
  });

  it('valida y acota preferencias corruptas sin perder el valor 432', () => {
    expect(normalizeEnginePitch(432)).toBe(432);
    expect(normalizeEnginePitch(249)).toBe(250);
    expect(normalizeEnginePitch(1200)).toBe(1000);
    expect(normalizeEnginePitch(NaN)).toBe(300);
    expect(normalizeEnginePitch(Infinity)).toBe(300);
    expect(normalizeEnginePitch('432')).toBe(300);
    expect(normalizeEnginePitch(432.6)).toBe(433);
    expect(engineWhineFrequency(999, 9, 1000)).toBe(1000);
  });

  it('permite cambiar la afinación desde la configuración sin inicializar el dispositivo', () => {
    const engine = new AudioEngine();
    expect(engine.getState().initialized).toBe(false);
    expect(engine.getState().enginePitchHz).toBe(300);
    engine.setEnginePitch(432);
    expect(engine.getState().enginePitchHz).toBe(432);
    engine.setEnginePitch(0);
    expect(engine.getState().enginePitchHz).toBe(250);
  });
});
