/** Enemy appearance model, independent of the mission's victory objective. */
export const SPAWN_MODES = {
  classic: { label: 'Clásico · oleadas finitas', short: 'Clásico' },
  dynamic: { label: 'Dinámico · enemigos por zona', short: 'Zonas' },
} as const;
export type SpawnMode = keyof typeof SPAWN_MODES;
export function spawnMode(value: unknown): SpawnMode {
  return typeof value === 'string' && Object.hasOwn(SPAWN_MODES, value) ? value as SpawnMode : 'classic';
}
