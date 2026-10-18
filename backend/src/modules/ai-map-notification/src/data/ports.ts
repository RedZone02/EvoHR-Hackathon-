import type { OfferRecord, UserContext } from '../contracts';

/**
 * Porturi de date. Colegul de backend le implementează peste baza de date
 * și le dă la AiMapNotificationsModule.forRoot({ offersRepository, userContextStore }).
 */
export const OFFERS_REPOSITORY = Symbol('OFFERS_REPOSITORY');
export const USER_CONTEXT_STORE = Symbol('USER_CONTEXT_STORE');

export interface OffersRepository {
  /** Oferte publicate, cu stoc, încă neexpirate (expirarea e re-verificată și în ProximityService). */
  findActive(): Promise<OfferRecord[]>;
}

export interface UserContextStore {
  upsert(context: UserContext): Promise<void>;
  get(userId: string): Promise<UserContext | undefined>;
  /** Toți clienții cu o locație cunoscută (folosit când apare o ofertă nouă). */
  all(): Promise<UserContext[]>;
}
