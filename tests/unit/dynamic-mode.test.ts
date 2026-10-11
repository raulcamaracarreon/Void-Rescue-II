import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/game/Simulation';
import { activeEnemyCap, defenseGoal, updateDynamicSpawns } from '../../src/game/combat/DynamicDirector';
import { resolveWave } from '../../src/game/combat/WaveSystem';
import { spawnEnemy } from '../../src/game/combat/EnemySystem';
import { deltaX } from '../../src/game/combat/spatial';
import { Records } from '../../src/game/Records';

const dynamic = (mission: 'rescue' | 'defense' = 'defense') =>
  new Simulation(8042, 'dynamic-basic', 'normal', mission, 'dynamic');

describe('sistemas de aparición seleccionables', () => {
  it('la modalidad clásica conserva su calendario y no instala el director', () => {
    const classic = new Simulation(8042, 'combat-basic');
    expect(classic.state.spawnMode).toBe('classic');
    expect(classic.state.director).toBeNull();
    expect(classic.state.schedule).toHaveLength(11);
    const next = dynamic();
    expect(next.state.spawnMode).toBe('dynamic');
    expect(next.state.schedule).toHaveLength(0);
    expect(next.state.director?.spawned).toBe(0);
  });

  it('genera amenazas recurrentes junto al sector explorado con distancia y cupo limitados', () => {
    const a = dynamic(), b = dynamic();
    for (let frame = 0; frame < 720; frame++) {
      updateDynamicSpawns(a.context, 1 / 60);
      updateDynamicSpawns(b.context, 1 / 60);
    }
    expect(a.state.director!.spawned).toBeGreaterThan(1);
    expect(a.state.enemies.length).toBeLessThanOrEqual(activeEnemyCap(1, 'normal'));
    expect(a.state.enemies).toEqual(b.state.enemies);
    expect(a.state.director).toEqual(b.state.director);
    expect(a.state.enemies.every(e => Math.abs(deltaX(a.state.player.x, e.x)) >= 82)).toBe(true);
    const oldCount = a.state.director!.spawned;
    a.state.player.x = 2380; a.state.player.previousX = 2380;
    // Free slots to test the seam and a different sector.
    a.state.enemies = [];
    a.state.director!.sectorCooldown.fill(0);
    a.state.director!.timer = 0;
    updateDynamicSpawns(a.context, 1 / 60);
    expect(a.state.director!.spawned).toBe(oldCount + 1);
    expect(a.state.enemies[0]!.x).toBeGreaterThanOrEqual(0);
    expect(a.state.enemies[0]!.x).toBeLessThan(2400);
    expect(Math.abs(deltaX(2380, a.state.enemies[0]!.x))).toBeGreaterThanOrEqual(82);
  });

  it('recicla enemigos remotos inactivos, pero no los que tienen colonos', () => {
    const s = dynamic();
    const remote = spawnEnemy(s.context, 'interceptor', 1000, 65, 0);
    const captor = spawnEnemy(s.context, 'harvester', 1400, 65, 0);
    captor.target = s.state.colonists[0]!.id;
    captor.age = remote.age = 50;
    updateDynamicSpawns(s.context, 1 / 60);
    expect(s.state.enemies.some(e => e.id === remote.id)).toBe(false);
    expect(s.state.enemies.some(e => e.id === captor.id)).toBe(true);
  });
});

describe('victoria dinámica independiente del exterminio', () => {
  it('Rescatista gana con 6 entregados, 2 perdidos y enemigos todavía vivos', () => {
    const s = dynamic('rescue');
    for (const [i, c] of s.state.colonists.entries()) c.status = i < 6 ? 'safe' : 'lost';
    s.state.delivered = 6;
    spawnEnemy(s.context, 'interceptor', 600, 70, 0);
    resolveWave(s.context);
    expect(s.state.outcome).toBe('victory');
    expect(s.state.enemies).toHaveLength(1);
    expect(s.state.summary).toMatchObject({ survivors: 6, lost: 2, rescued: 6 });
    expect(s.nextWave()).toBe(true);
    expect(s.state.director?.spawned).toBe(0);
    expect(s.state.outcome).toBe('active');
  });
  it('Rescatista pierde si todos mueren y espera si queda un colono recuperable', () => {
    const s = dynamic('rescue');
    for (const c of s.state.colonists) c.status = 'lost';
    s.state.colonists[0]!.status = 'captured';
    resolveWave(s.context);
    expect(s.state.outcome).toBe('active');
    s.state.colonists[0]!.status = 'lost';
    resolveWave(s.context);
    expect(s.state.outcome).toBe('defeat');
    expect(s.nextWave()).toBe(false);
  });
  it('Defensivo termina tras 120s si quedan al menos 4 vivos; enemigos pueden permanecer', () => {
    const s = dynamic('defense');
    const goal = defenseGoal(1, 'normal');
    expect(goal).toEqual({ seconds: 120, minimum: 4 });
    for (const [i, c] of s.state.colonists.entries()) if (i >= 4) c.status = 'lost';
    spawnEnemy(s.context, 'flux', 800, 60, 0);
    s.state.time = 119.9;
    resolveWave(s.context); expect(s.state.outcome).toBe('active');
    s.state.time = 120.01;
    resolveWave(s.context);
    expect(s.state.outcome).toBe('victory');
    expect(s.state.enemies).toHaveLength(1);
  });
  it('Defensivo pierde inmediatamente si el número de vivos baja del mínimo', () => {
    const s = dynamic('defense');
    for (const [i, c] of s.state.colonists.entries()) if (i >= 3) c.status = 'lost';
    resolveWave(s.context);
    expect(s.state.outcome).toBe('defeat');
    expect(s.state.summary?.survivors).toBe(3);
  });
});

describe('clasificaciones independientes y compatibilidad', () => {
  it('conserva récords clásicos preexistentes y separa sistemas/misiones', () => {
    const data = new Map<string, string>();
    const store = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
    const records = new Records(store);
    const old = { id: 'classic1', pilot: 'VR1', score: 500, wave: 1, difficulty: 'normal' as const,
      date: '2026-10-11T00:00:00Z' };
    records.save(old);
    records.save({ ...old, id: 'dynamic1', score: 2000, spawnMode: 'dynamic', missionMode: 'defense' });
    records.save({ ...old, id: 'dynamic2', score: 1500, spawnMode: 'dynamic', missionMode: 'rescue' });
    expect(records.list('classic', 'defense').map(r => r.id)).toEqual(['classic1']);
    expect(records.list('dynamic', 'defense').map(r => r.id)).toEqual(['dynamic1']);
    expect(records.list('dynamic', 'rescue').map(r => r.id)).toEqual(['dynamic2']);
    const reread = new Records(store);
    expect(reread.list('classic', 'defense')).toHaveLength(1);
    expect(reread.list('dynamic')).toHaveLength(2);
  });
});
