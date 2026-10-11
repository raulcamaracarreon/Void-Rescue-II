import { DIFFICULTIES } from './Difficulty';
import type { Difficulty } from './Difficulty';
import { MISSION_MODES } from './MissionMode';
import type { MissionMode } from './MissionMode';
import { SPAWN_MODES } from './SpawnMode';
import type { SpawnMode } from './SpawnMode';

export interface PlayerRecord {
  id: string; pilot: string; score: number; wave: number; difficulty: Difficulty; missionMode?: MissionMode; spawnMode?: SpawnMode; date: string;
}
export const RECORDS_KEY = 'void-rescue-ii.records.v1';
export const PILOT_KEY = 'void-rescue.pilot';
export const INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export function pilotName(value: unknown): string {
  return typeof value === 'string' && /^[A-Z0-9]{3}$/.test(value) ? value : 'VR1';
}

function valid(value: unknown): value is PlayerRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return typeof r.id === 'string' && r.id.length > 0 && r.id.length <= 80
    && typeof r.pilot === 'string' && /^[A-Z0-9]{3}$/.test(r.pilot)
    && Number.isSafeInteger(r.score) && Number(r.score) > 0
    && Number.isSafeInteger(r.wave) && Number(r.wave) >= 1
    && typeof r.difficulty === 'string' && Object.hasOwn(DIFFICULTIES, r.difficulty)
    && (r.missionMode === undefined || (typeof r.missionMode === 'string' && Object.hasOwn(MISSION_MODES, r.missionMode)))
    && (r.spawnMode === undefined || (typeof r.spawnMode === 'string' && Object.hasOwn(SPAWN_MODES, r.spawnMode)))
    && typeof r.date === 'string' && r.date.length <= 30 && Number.isFinite(Date.parse(r.date));
}

export class Records {
  private entries: PlayerRecord[] = [];
  private storage: Pick<Storage, 'getItem' | 'setItem'> | undefined;
  persistent = true;
  pilot = 'VR1';

  constructor(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    try {
      this.storage = storage ?? localStorage;
      this.pilot = pilotName(this.storage.getItem(PILOT_KEY));
      const data: unknown = JSON.parse(this.storage.getItem(RECORDS_KEY) ?? '[]');
      if (Array.isArray(data)) this.entries = data.filter(valid);
      this.sort();
    } catch { this.persistent = false; }
  }

  list(spawning?: SpawnMode, mission?: MissionMode): PlayerRecord[] {
    this.refresh();
    return this.entries.filter(r => (!spawning || (r.spawnMode ?? 'classic') === spawning)
      && (!mission || (r.missionMode ?? 'defense') === mission)).map(r => ({ ...r }));
  }

  setPilot(value: string): void {
    this.pilot = pilotName(value);
    this.write(PILOT_KEY, this.pilot);
  }

  save(record: PlayerRecord): void {
    if (!valid(record)) return;
    this.refresh();
    const previous = this.entries.find(r => r.id === record.id);
    if (previous && previous.score > record.score) return;
    this.entries = this.entries.filter(r => r.id !== record.id);
    this.entries.push({ ...record }); this.sort();
    this.write(RECORDS_KEY, JSON.stringify(this.entries));
  }

  private sort(): void {
    this.entries.sort((a, b) => b.score - a.score || b.wave - a.wave || a.date.localeCompare(b.date));
    const seen = new Set<string>(), count = new Map<string, number>();
    this.entries = this.entries.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      const group = `${r.spawnMode ?? 'classic'}:${r.missionMode ?? 'defense'}`;
      const size = count.get(group) ?? 0;
      if (size >= 10) return false;
      count.set(group, size + 1);
      return true;
    });
  }

  private refresh(): void {
    // Merge other open tabs before showing or writing the board.
    try {
      const data: unknown = JSON.parse(this.storage?.getItem(RECORDS_KEY) ?? '[]');
      if (Array.isArray(data)) this.entries = [...data.filter(valid), ...this.entries];
      this.sort();
    } catch { this.persistent = false; }
  }

  private write(key: string, value: string): void {
    try {
      if (!this.storage) throw new Error('Almacenamiento no disponible');
      this.storage.setItem(key, value); this.persistent = true;
    } catch { this.persistent = false; }
  }
}
