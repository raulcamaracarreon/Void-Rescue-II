import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/game/Simulation';
import { COMBAT } from '../../src/game/combat/types';
import { hitPlayer } from '../../src/game/combat/CombatSystem';
import { spawnEnemy } from '../../src/game/combat/EnemySystem';

const hold = { x: 0, y: 0, fire: false, portal: true };
const release = { x: 0, y: 0, fire: false };
function step(s: Simulation, frames: number, input = release) {
  for (let i = 0; i < frames; i++) s.update(1 / 60, input);
}
function rescue(scenario: 'rescue-pickup' | 'dynamic-basic' = 'rescue-pickup') {
  const sim = new Simulation(8042, scenario, 'normal', 'rescue', scenario === 'dynamic-basic' ? 'dynamic' : 'classic');
  sim.state.schedule = [{ at: 999, kind: 'harvester', x: 1200, y: 60 }];
  if (sim.state.director) sim.state.director.timer = 999;
  return sim;
}
function assemble(s: Simulation, amount = 8): void {
  const p = s.state.player;
  const center = 400;
  p.x = p.previousX = center;
  p.y = p.previousY = s.context.terrain.height(center) + 10.5;
  p.vx = p.vy = 0;
  for (const [i, c] of s.state.colonists.entries()) {
    if (i >= amount) continue;
    c.x = c.homeX = center + (i - (amount - 1) / 2) * 0.7;
    c.y = s.context.terrain.height(c.x) + 1.5;
    c.status = 'ground'; c.walkDirection = 0; c.owner = null; c.onboard = false;
  }
}

describe('haz de rescate mantenido y capacidad múltiple', () => {
  it('asciende gradualmente; soltar E antes de tiempo interrumpe el haz', () => {
    const s = rescue(), c = s.state.colonists[0]!;
    const y0 = c.y;
    step(s, 1, hold);
    expect(c.status).toBe('extracting');
    step(s, 20, hold);
    expect(c.status).toBe('extracting');
    expect(c.y).toBeGreaterThan(y0);
    expect(c.y - y0).toBeLessThanOrEqual(COMBAT.extractionSpeed * 21 / 60 + 0.01);
    expect(c.onboard).toBe(false);
    step(s, 1, release);
    expect(c.status).toBe('falling');
    expect(s.state.colonists.filter(v => v.onboard)).toHaveLength(0);
  });
  it('mantener E permite recoger a los ocho sin soltar los pasajeros anteriores', () => {
    const s = rescue();
    assemble(s);
    step(s, 780, hold);
    expect(s.state.colonists.filter(c => c.onboard)).toHaveLength(8);
    expect(s.state.colonists.every(c => c.status === 'carried')).toBe(true);
    expect(s.state.score).toBe(COMBAT.catchPoints * 8);
    step(s, 1, release);
    expect(s.state.colonists.every(c => c.onboard)).toBe(true);
    s.state.player.x = s.state.player.previousX = 700;
    s.state.player.y = s.state.player.previousY = s.context.terrain.height(700) + 4;
    step(s, 1, release);
    expect(s.state.delivered).toBe(0);
    s.state.player.x = s.state.player.previousX = 330;
    s.state.player.y = s.state.player.previousY = s.context.terrain.height(330) + 4;
    step(s, 1, release);
    expect(s.state.delivered).toBe(8);
    expect(s.state.colonists.every(c => c.status === 'safe' && !c.onboard)).toBe(true);
  });
  it('la nave pierde los pasajeros si es destruida, sin perder el derecho a rescatarlos', () => {
    const s = rescue();
    assemble(s, 2);
    step(s, 180, hold);
    expect(s.state.colonists.filter(c => c.onboard)).toHaveLength(2);
    s.state.player.invulnerable = 0;
    hitPlayer(s.context);
    expect(s.state.colonists.filter(c => c.onboard)).toHaveLength(0);
    expect(s.state.colonists.slice(0, 2).every(c => c.status === 'falling')).toBe(true);
  });
  it('el modo dinámico Rescatista gana con todos entregados aunque sigan vivos enemigos', () => {
    const s = rescue('dynamic-basic');
    assemble(s);
    step(s, 780, hold);
    expect(s.state.colonists.filter(c => c.onboard)).toHaveLength(8);
    spawnEnemy(s.context, 'interceptor', 1000, 65, 0);
    s.state.player.x = s.state.player.previousX = 330;
    s.state.player.y = s.state.player.previousY = s.context.terrain.height(330) + 4;
    step(s, 1, release);
    expect(s.state.outcome).toBe('victory');
    expect(s.state.summary?.rescued).toBe(8);
    expect(s.state.enemies.length).toBeGreaterThan(0);
  });
  it('en Defensivo se conservan las entregas y pasajeros colgantes habituales', () => {
    const s = new Simulation(8042, 'falling-colonist', 'normal', 'defense');
    for (let i = 0; i < 40; i++) s.update(1/60, { x: 1, y: 0, fire: false });
    expect(s.state.colonists[0]!.status).toBe('carried');
    expect(s.state.colonists[0]!.onboard).not.toBe(true);
  });
});
