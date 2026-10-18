export const AI_MAP_OPTIONS = Symbol('AI_MAP_OPTIONS');

export interface AiMapOptions {
  /** Raza pentru notificări de proximitate, în metri (NOTIFY_RADIUS_M, implicit 1000). */
  notifyRadiusM: number;
  /** Pauza minimă între două notificări pentru același client (NOTIFY_COOLDOWN_MS, implicit 2 min). */
  notifyCooldownMs: number;
}

const envNumber = (name: string): number | undefined => {
  const n = Number(process.env[name]);
  return process.env[name] && Number.isFinite(n) && n > 0 ? n : undefined;
};

export const optionsFromEnv = (): AiMapOptions => ({
  notifyRadiusM: envNumber('NOTIFY_RADIUS_M') ?? 1000,
  notifyCooldownMs: envNumber('NOTIFY_COOLDOWN_MS') ?? 120_000,
});
