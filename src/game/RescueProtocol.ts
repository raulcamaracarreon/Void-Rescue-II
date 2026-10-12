/** Civilian survival and player recovery are independent from combat difficulty. */
export const RESCUE_PROTOCOLS = {
  realistic: {
    label: 'Realista', short: 'Realista',
    description: 'Cuando tu nave es derrotada y pierdes una vida, los colonos que llevabas caen y pueden morir al llegar al suelo. Si aún tienes vidas, tu nave reaparece en una zona segura, que podría quedar lejos del accidente.',
  },
  protected: {
    label: 'Protegido', short: 'Protegido',
    description: 'Cuando tu nave es derrotada y pierdes una vida, los colonos que llevabas caen, pero sobreviven al aterrizar y puedes volver a rescatarlos. Si aún tienes vidas, tu nave reaparece en una zona segura; los colonos siguen expuestos a los enemigos.',
  },
  local: {
    label: 'Segunda oportunidad', short: 'Segunda oportunidad',
    description: 'Cuando tu nave es derrotada y pierdes una vida, los colonos que llevabas caen y pueden morir. Si aún tienes vidas, tu nave reaparece pronto (tras 0.5 s) en el mismo lugar del accidente, con 3 s de escudo temporal para intentar rescatarlos.',
  },
} as const;

export type RescueProtocol = keyof typeof RESCUE_PROTOCOLS;

export function rescueProtocol(value: unknown): RescueProtocol {
  return typeof value === 'string' && Object.hasOwn(RESCUE_PROTOCOLS, value)
    ? value as RescueProtocol : 'realistic';
}
