import type { OfferRecord, UserContext } from '../contracts';

/**
 * Porturi de date. Implicit sunt implementate peste MySQL (Prisma);
 * testele le înlocuiesc cu variante în memorie.
 */
export const OFFERS_REPOSITORY = Symbol('OFFERS_REPOSITORY');
export const USER_CONTEXT_STORE = Symbol('USER_CONTEXT_STORE');

export interface OffersRepository {
  /** Oferte ACTIVE, cu stoc, neexpirate. */
  findActive(): Promise<OfferRecord[]>;
  /** O ofertă după id, doar dacă e ACTIVĂ, cu stoc și neexpirată (altfel null). */
  findActiveById(offerId: string): Promise<OfferRecord | null>;
}

export interface UserContextStore {
  upsert(context: UserContext): Promise<void>;
  get(userId: string): Promise<UserContext | undefined>;
  /** Clienții cu o locație recentă (folosit când apare o ofertă nouă). */
  recent(): Promise<UserContext[]>;
}
