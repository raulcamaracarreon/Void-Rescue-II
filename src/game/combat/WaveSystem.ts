import { wrapX } from '../../core/WorldWrap';
import { CONFIG } from '../config';
import { COMBAT } from './types';
import type { CombatContext, CombatState } from './types';
import { distance } from './spatial';
import { spawnEnemy } from './EnemySystem';
import type { DifficultyProfile } from '../Difficulty';
import { defenseGoal, updateDynamicSpawns } from './DynamicDirector';

export function emptyCombat(enabled: boolean, profile: Pick<DifficultyProfile, 'startingLives' | 'startingBombs'>): CombatState {
  return { wave: 1, waveStartedAt: 0, enabled, outcome: 'active', spawnMode: 'classic', director: null,
    colonists: [], enemies: [], events: [], schedule: [], spawnIndex: 0,
    score: 0, kills: 0, delivered: 0, lives: profile.startingLives, bombs: profile.startingBombs, respawnTimer: 0,
    portal: { x: 330, y: 46, ready: false, used: false, cooldown: 0 }, bomb: null, summary: null, colonyLost: false };
}

export function updateWave(ctx: CombatContext, dt: number, portalPressed: boolean): void {
  const s = ctx.state, p = s.player;
  if (s.spawnMode === 'dynamic') updateDynamicSpawns(ctx, dt);
  else {
    while (s.spawnIndex < s.schedule.length && s.schedule[s.spawnIndex]!.at <= s.time - s.waveStartedAt) {
      const entry = s.schedule[s.spawnIndex++]!;
      let x = entry.x;
      if (distance({ x, y: entry.y }, p) < 55) x = wrapX(p.x + 90 * p.facing, CONFIG.worldWidth);
      spawnEnemy(ctx, entry.kind, x, entry.y);
    }
  }
  s.portal.cooldown = Math.max(0, s.portal.cooldown - dt);
  if (portalPressed && p.alive && s.portal.ready && s.portal.cooldown === 0 && distance(s.portal, p) < 12) {
    if (!s.portal.used) s.score += COMBAT.portalBonus;
    s.portal.used = true; s.portal.cooldown = 5;
    ctx.emit('portal', p.x, p.y);
    p.x = p.previousX = wrapX(p.x + CONFIG.worldWidth / 2, CONFIG.worldWidth);
    p.y = p.previousY = CONFIG.startY; p.vx = p.vy = 0; p.invulnerable = COMBAT.invulnerability;
  }
}

export function resolveWave(ctx: CombatContext): void {
  const s = ctx.state;
  if (s.outcome === 'active') {
    if (s.spawnMode === 'classic') {
      // Historical finite-wave rules are intentionally untouched.
      const pending = s.colonists.some(c => c.status === 'captured' || c.status === 'extracting' || c.status === 'falling' || c.status === 'carried');
      const rescuePending = s.missionMode === 'rescue' && s.colonists.some(c => c.status !== 'safe' && c.status !== 'lost');
      if (s.player.alive && s.spawnIndex === s.schedule.length && s.enemies.length === 0 && !pending && !rescuePending)
        s.outcome = 'victory';
    } else if (s.missionMode === 'rescue') {
      // Every colonist must end either safe or lost. Alive enemies do not block victory.
      const resolved = s.colonists.length > 0 && s.colonists.every(c => c.status === 'safe' || c.status === 'lost');
      if (resolved) s.outcome = s.colonists.some(c => c.status === 'safe') ? 'victory' : 'defeat';
    } else {
      const goal = defenseGoal(s.wave, s.difficulty, s.colonists.length);
      // A captured colonist is still alive until abduction completes; only lost is terminal.
      const living = s.colonists.filter(c => c.status !== 'lost').length;
      if (living < goal.minimum) s.outcome = 'defeat';
      else if (s.time - s.waveStartedAt >= goal.seconds) s.outcome = 'victory';
    }
    if (s.outcome !== 'active') ctx.emit(s.outcome, s.player.x, s.player.y);
  }
  if (s.outcome !== 'active' && !s.summary) {
    const survivors = s.colonists.filter(c => c.status !== 'lost').length;
    const time = s.time - s.waveStartedAt;
    const bonus = s.outcome === 'victory' ? survivors * COMBAT.survivorBonus + Math.max(0, 180 - Math.floor(time)) * 10 : 0;
    s.score += bonus;
    s.summary = { survivors, lost: s.colonists.length - survivors, rescued: s.delivered, score: s.score, time, bonus };
  }
}
