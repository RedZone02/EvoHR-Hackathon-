import type { ModuleMetadata, Type } from '@nestjs/common';
import type { OffersRepository, UserContextStore } from './data/ports';

export const AI_MAP_OPTIONS = Symbol('AI_MAP_OPTIONS');

export interface AiMapNotificationsOptions {
  /** Implementarea peste baza de date. Implicit: date demo în memorie (Suceava). */
  offersRepository?: Type<OffersRepository>;
  /** Unde se țin locația + preferințele clienților. Implicit: în memorie. */
  userContextStore?: Type<UserContextStore>;
  /** Module de care au nevoie repository-urile (ex. TypeOrmModule.forFeature([...])). */
  imports?: ModuleMetadata['imports'];
  /** Raza pentru notificări de proximitate, în metri (env NOTIFY_RADIUS_M, implicit 1000). */
  notifyRadiusM?: number;
  /** Pauza minimă între două notificări pentru același client (env NOTIFY_COOLDOWN_MS, implicit 2 min). */
  notifyCooldownMs?: number;
}

export interface ResolvedAiMapOptions {
  notifyRadiusM: number;
  notifyCooldownMs: number;
}

const envNumber = (name: string): number | undefined => {
  const n = Number(process.env[name]);
  return process.env[name] && Number.isFinite(n) && n > 0 ? n : undefined;
};

export const resolveOptions = (options: AiMapNotificationsOptions): ResolvedAiMapOptions => ({
  notifyRadiusM: options.notifyRadiusM ?? envNumber('NOTIFY_RADIUS_M') ?? 1000,
  notifyCooldownMs: options.notifyCooldownMs ?? envNumber('NOTIFY_COOLDOWN_MS') ?? 120_000,
});
