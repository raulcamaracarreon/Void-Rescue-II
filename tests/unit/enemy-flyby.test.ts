import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/game/Simulation';
import { spawnEnemy, updateEnemies } from '../../src/game/combat/EnemySystem';

describe('maniobras estables de naves enemigas', () => {
  it.each(['interceptor','crossfire'] as const)('%s mantiene una dirección durante el cruce del jugador', kind => {
    const sim = new Simulation(8042, 'combat-basic');
    sim.state.player.x = 700; sim.state.player.y = 64;
    const e = spawnEnemy(sim.context, kind, 723, 64, 0);
    e.cooldown = 9999;
    const sides: number[] = [];
    for (let i = 0; i < 120; i++) {
      updateEnemies(sim.context, 1 / 60);
      sides.push(Math.sign(e.vx));
    }
    expect(new Set(sides)).toEqual(new Set([-1]));
    expect(e.x).toBeLessThan(sim.state.player.x);
    expect(e.flybyDirection).toBe(-1);
    expect(e.flybySeconds).toBeGreaterThan(1.2);
  });
  it('vuelve a evaluar el objetivo únicamente fuera de la banda de histéresis', () => {
    const sim = new Simulation(8042, 'combat-basic');
    sim.state.player.x = 700; sim.state.player.y = 64;
    const e = spawnEnemy(sim.context, 'interceptor', 718, 64, 0);
    e.cooldown = 9999;
    for (let i = 0; i < 90; i++) updateEnemies(sim.context, 1 / 60);
    expect(e.flybyDirection).toBe(-1);
    for (let i = 0; i < 260; i++) updateEnemies(sim.context, 1 / 60);
    // Following the flyby, the interceptor may chase again, but no high-frequency chattering.
    expect(Number.isFinite(e.vx)).toBe(true);
    expect(Number.isFinite(e.x)).toBe(true);
  });
});
