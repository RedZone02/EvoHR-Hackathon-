import { Injectable } from '@nestjs/common';
import type { OfferRecord, UserContext } from '../contracts';
import type { OffersRepository, UserContextStore } from './ports';

const inMinutes = (minutes: number): string => new Date(Date.now() + minutes * 60_000).toISOString();

/** Date demo în Suceava, până există baza de date reală. */
export const seedOffers = (): OfferRecord[] => [
  {
    id: 'sv-1',
    storeId: 'store-cuptorul',
    shopName: 'Brutăria Cuptorul Bucovinei',
    product: 'Croissant cu vanilie (4 buc.)',
    category: 'bakery',
    priceOriginal: 24,
    priceDiscounted: 10,
    lat: 47.6517,
    lng: 26.2551,
    expiresAt: inMinutes(75),
  },
  {
    id: 'sv-2',
    storeId: 'store-delice',
    shopName: 'Cofetăria Delice',
    product: 'Tartă cu fructe de pădure',
    category: 'pastry',
    priceOriginal: 30,
    priceDiscounted: 15,
    lat: 47.6545,
    lng: 26.2588,
    expiresAt: inMinutes(120),
  },
  {
    id: 'sv-3',
    storeId: 'store-bistro',
    shopName: 'Bistro Areni',
    product: 'Meniul zilei: ciorbă + fel principal',
    category: 'restaurant',
    priceOriginal: 35,
    priceDiscounted: 16,
    lat: 47.6478,
    lng: 26.2612,
    expiresAt: inMinutes(50),
  },
  {
    id: 'sv-4',
    storeId: 'store-market',
    shopName: 'Market Burdujeni',
    product: 'Coș cu legume și fructe',
    category: 'grocery',
    priceOriginal: 40,
    priceDiscounted: 18,
    lat: 47.6702,
    lng: 26.2785,
    expiresAt: inMinutes(180),
  },
  {
    id: 'sv-5',
    storeId: 'store-cafe',
    shopName: 'Cafeneaua Centrală',
    product: 'Sandvișuri și brioșe',
    category: 'cafe',
    priceOriginal: 28,
    priceDiscounted: 12,
    lat: 47.6531,
    lng: 26.2539,
    expiresAt: inMinutes(40),
  },
];

@Injectable()
export class InMemoryOffersRepository implements OffersRepository {
  private readonly offers: OfferRecord[] = seedOffers();

  async findActive(): Promise<OfferRecord[]> {
    return this.offers;
  }

  /** Doar pentru demo: adaugă o ofertă nouă. */
  add(offer: OfferRecord): void {
    this.offers.push(offer);
  }
}

@Injectable()
export class InMemoryUserContextStore implements UserContextStore {
  private readonly users = new Map<string, UserContext>();

  async upsert(context: UserContext): Promise<void> {
    this.users.set(context.userId, context);
  }

  async get(userId: string): Promise<UserContext | undefined> {
    return this.users.get(userId);
  }

  async all(): Promise<UserContext[]> {
    return [...this.users.values()];
  }
}
