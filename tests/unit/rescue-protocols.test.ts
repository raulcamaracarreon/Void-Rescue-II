import { describe, expect, it } from 'vitest';
import { Simulation, IDLE_INPUT } from '../../src/game/Simulation';
import { hitPlayer, updateLife } from '../../src/game/combat/CombatSystem';
import { COMBAT } from '../../src/game/combat/types';
import type { RescueProtocol } from '../../src/game/RescueProtocol';
import { rescueProtocol } from '../../src/game/RescueProtocol';
import { Records } from '../../src/game/Records';

function scenario(protocol: RescueProtocol) {
  const sim = new Simulation(8042, 'rescue-pickup', 'normal', 'rescue', 'classic', protocol);
  sim.state.schedule = [{ at: 9999, kind: 'harvester', x: 1300, y: 70 }];
  sim.state.enemies = [];
  return sim;
}
function dropPassenger(sim: Simulation, height = 20) {
  const p = sim.state.player, c = sim.state.colonists[0]!;
  const x = 780;
  p.x = p.previousX = x;
  p.y = p.previousY = sim.context.terrain.height(x) + height + 2;
  p.invulnerable = 0; p.vy = p.vx = 0;
  c.status = 'carried'; c.onboard = true; c.x = x; c.y = p.y;
  hitPlayer(sim.context);
  expect(c.status).toBe('falling');
  expect(c.onboard).toBe(false);
  return c;
}
function letPassengerLand(sim: Simulation) {
  // Move the replacement ship away so the falling passenger is not caught accidentally.
  sim.state.player.x = sim.state.player.previousX = 1350;
  for (let i = 0; i < 300 && sim.state.colonists[0]!.status === 'falling'; i++)
    sim.update(1 / 60, IDLE_INPUT);
}

describe('protocolos independientes de rescate', () => {
  it('mantiene la regla Realista como predeterminada y valida preferencias desconocidas', () => {
    expect(new Simulation(8042, 'rescue-pickup').state.rescueProtocol).toBe('realistic');
    expect(rescueProtocol('no-existe')).toBe('realistic');
  });

  it('Realista conserva la caída letal de pasajeros desde gran altura', () => {
    const sim = scenario('realistic'), c = dropPassenger(sim);
    expect(c.crashSafeLanding).toBe(false);
    expect(sim.state.respawnTimer).toBe(COMBAT.respawnSeconds);
    letPassengerLand(sim);
    expect(c.status).toBe('lost');
  });

  it('Protegido salva del impacto solo a pasajeros expulsados', () => {
    const sim = scenario('protected'), c = dropPassenger(sim);
    expect(c.crashSafeLanding).toBe(true);
    letPassengerLand(sim);
    expect(c.status).toBe('ground');
    expect(c.crashSafeLanding).toBe(false);

    const ordinary = sim.state.colonists[1]!;
    ordinary.status = 'falling';
    ordinary.x = 980;
    ordinary.y = sim.context.terrain.height(980) + 20;
    ordinary.vy = 0;
    ordinary.crashSafeLanding = false;
    for (let i = 0; i < 300 && ordinary.status === 'falling'; i++) sim.update(1 / 60, IDLE_INPUT);
    expect(ordinary.status).toBe('lost');
  });

  it('Segunda oportunidad reaparece en el accidente pese a enemigos cercanos y conserva escudo', () => {
    const sim = scenario('local'), c = dropPassenger(sim);
    const crashX = sim.state.player.x, crashY = sim.state.player.y;
    expect(c.crashSafeLanding).toBe(false);
    expect(sim.state.respawnTimer).toBeCloseTo(0.5);
    // Even with a nearby threat, the crash sector must not be abandoned.
    sim.state.enemies.push({
      id: 9099, kind: 'interceptor', x: crashX + 5, y: crashY, vx: 0, vy: 0,
      hp: 2, hitsRemaining: 2, target: null, phase: 'hunt', cooldown: 99, age: 0, telegraph: 0,
    });
    updateLife(sim.context, 0.51);
    expect(sim.state.player.alive).toBe(true);
    expect(sim.state.player.x).toBe(crashX);
    expect(sim.state.player.y).toBeCloseTo(crashY);
    expect(sim.state.player.invulnerable).toBe(COMBAT.invulnerability);
    expect(c.status).toBe('falling');
  });

  it('ningún protocolo concede una vida extra tras la última derrota', () => {
    for (const protocol of ['realistic', 'protected', 'local'] as const) {
      const sim = scenario(protocol);
      sim.state.lives = 1;
      dropPassenger(sim);
      expect(sim.state.lives).toBe(0);
      expect(sim.state.outcome).toBe('defeat');
      updateLife(sim.context, 10);
      expect(sim.state.player.alive).toBe(false);
    }
  });

  it('clasifica por protocolo y conserva los récords anteriores en Realista', () => {
    const data = new Map<string, string>();
    const store = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
    const records = new Records(store);
    const base = { pilot: 'VR1', score: 500, wave: 1, difficulty: 'normal' as const,
      missionMode: 'rescue' as const, spawnMode: 'classic' as const, date: '2026-10-11T12:00:00Z' };
    records.save({ ...base, id: 'old' }); // v1.0.1 has no rescueProtocol field
    records.save({ ...base, id: 'protected', rescueProtocol: 'protected' });
    records.save({ ...base, id: 'local', rescueProtocol: 'local' });
    expect(records.list('classic', 'rescue', 'realistic').map(v => v.id)).toEqual(['old']);
    expect(records.list('classic', 'rescue', 'protected').map(v => v.id)).toEqual(['protected']);
    expect(records.list('classic', 'rescue', 'local').map(v => v.id)).toEqual(['local']);
    expect(new Records(store).list('classic', 'rescue', 'realistic')).toHaveLength(1);
  });
});
