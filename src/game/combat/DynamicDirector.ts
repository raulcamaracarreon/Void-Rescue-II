import { wrapX } from '../../core/WorldWrap';
import { CONFIG } from '../config';
import { difficultyProfile } from '../Difficulty';
import { COMBAT } from './types';
import type { CombatContext, DynamicDirector, EnemyKind } from './types';
import { spawnEnemy } from './EnemySystem';
import { releaseTarget } from './ColonistSystem';
import { deltaX } from './spatial';
import { activeEnemyCap, wavePressure } from './Progression';
export { activeEnemyCap } from './Progression';

const SECTORS = 12;
const SECTOR_WIDTH = CONFIG.worldWidth / SECTORS;
const MIN_DISTANCE = 82;
const MAX_DISTANCE = 170;

/** Adjustable defensive goal, separate from enemy population and kill count. */
export function defenseGoal(wave: number, difficulty: string, colonists: number = COMBAT.colonistX.length): {
  seconds: number; minimum: number;
} {
  const rank = difficultyProfile(difficulty).rank;
  return {
    seconds: Math.min(180, 120 + Math.max(0, wave - 1) * 10),
    minimum: Math.min(colonists, Math.max(1, Math.ceil(colonists / 2) + (rank >= 3 ? 1 : rank <= 1 ? -1 : 0))),
  };
}

export function initializeDirector(): DynamicDirector {
  return { timer: 2, sectorCooldown: Array(SECTORS).fill(0) as number[], spawned: 0 };
}

function sector(x: number): number {
  return Math.floor(wrapX(x, CONFIG.worldWidth) / SECTOR_WIDTH);
}
function enemyKind(ctx: CombatContext): EnemyKind {
  const available = ctx.state.colonists.some(c => c.status === 'ground' && c.owner === null);
  const kinds: EnemyKind[] = available
    ? ['harvester', 'interceptor', 'crossfire', 'harvester', 'interceptor', 'flux', 'wraith']
    : ['interceptor', 'crossfire', 'wraith', 'interceptor', 'flux'];
  return kinds[Math.floor(ctx.random.next() * kinds.length)]!;
}

/** Called each fixed simulation frame for dynamic matches only. */
export function updateDynamicSpawns(ctx: CombatContext, dt: number): void {
  const s = ctx.state, director = s.director;
  if (!director || s.outcome !== 'active') return;
  for (let i = 0; i < director.sectorCooldown.length; i++)
    director.sectorCooldown[i] = Math.max(0, director.sectorCooldown[i]! - dt);

  // Recycle remote idle enemies so visiting a different region stays dangerous.
  // Never silently delete an enemy carrying/targeting a colonist.
  for (const enemy of [...s.enemies]) {
    if (enemy.age > 10 && enemy.target === null && Math.abs(deltaX(s.player.x, enemy.x)) > 510) {
      releaseTarget(ctx, enemy);
      s.enemies = s.enemies.filter(e => e.id !== enemy.id);
    }
  }

  director.timer = Math.max(0, director.timer - dt);
  if (director.timer > 0 || !s.player.alive) return;
  const profile = difficultyProfile(s.difficulty);
  const period = Math.max(2, 5.2 / (wavePressure(s.wave) * profile.enemyCount));
  director.timer = period * (0.8 + ctx.random.next() * 0.4);

  if (s.enemies.length >= activeEnemyCap(s.wave, s.difficulty)) return;

  const p = s.player;
  // Spawn just outside immediate engagement distance, with left/right variants.
  // Using wrapX and deltaX keeps every region—including the 0/2400 seam—valid.
  const firstSide = ctx.random.next() < 0.5 ? -1 : 1;
  for (const side of [firstSide, -firstSide]) {
    const x = wrapX(p.x + side * (MIN_DISTANCE + ctx.random.next() * (MAX_DISTANCE - MIN_DISTANCE)), CONFIG.worldWidth);
    const area = sector(x);
    if (director.sectorCooldown[area]! > 0) continue;
    if (s.enemies.filter(e => sector(e.x) === area).length >= 3) continue;
    if (Math.abs(deltaX(p.x, x)) < MIN_DISTANCE) continue;
    const y = Math.max(ctx.terrain.height(x) + 10, 57 + ctx.random.next() * 21);
    spawnEnemy(ctx, enemyKind(ctx), x, Math.min(CONFIG.maxAltitude - 2, y));
    director.sectorCooldown[area] = Math.max(3, period * 0.8);
    director.spawned++;
    return;
  }
  // Blocked sectors retry shortly rather than consuming a new global schedule.
  director.timer = Math.min(director.timer, 1);
}
