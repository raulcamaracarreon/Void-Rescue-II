/** Civilian survival and player recovery are independent from combat difficulty. */
export const RESCUE_PROTOCOLS = {
  realistic: {
    label: 'Realista', short: 'Realista',
    description: 'Pasajeros vulnerables al impacto; la nave reaparece en un sector seguro.',
  },
  protected: {
    label: 'Protegido', short: 'Protegido',
    description: 'Los pasajeros expulsados sobreviven al aterrizaje, pero siguen expuestos al fuego enemigo.',
  },
  local: {
    label: 'Segunda oportunidad', short: 'Segunda oportunidad',
    description: 'La nave reaparece pronto en el lugar de la derrota, con su escudo temporal, para intentar recuperarlos.',
  },
} as const;

export type RescueProtocol = keyof typeof RESCUE_PROTOCOLS;

export function rescueProtocol(value: unknown): RescueProtocol {
  return typeof value === 'string' && Object.hasOwn(RESCUE_PROTOCOLS, value)
    ? value as RescueProtocol : 'realistic';
}
