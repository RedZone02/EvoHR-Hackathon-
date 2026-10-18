/** Categorii identice cu frontend/src/types/index.ts (ProductCategory fără 'all'). */
export type ProductCategory = 'bakery' | 'restaurant' | 'grocery' | 'cafe' | 'pastry';

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'bakery',
  'restaurant',
  'grocery',
  'cafe',
  'pastry',
];

/** Contractul expus prin GET /offers/nearby (identic cu frontend/src/types/offer.ts). */
export interface Offer {
  id: string;
  shopName: string;
  product: string;
  priceOriginal: number;
  priceDiscounted: number;
  lat: number;
  lng: number;
  distanceM: number;
  expiresAt: string; // ISO 8601
}

/** Ce trebuie să furnizeze baza de date pentru o ofertă activă. */
export interface OfferRecord {
  id: string;
  storeId: string;
  shopName: string;
  product: string;
  category: ProductCategory;
  priceOriginal: number;
  priceDiscounted: number;
  lat: number;
  lng: number;
  expiresAt: string; // ISO 8601
}

/** Ultima locație + preferințele cunoscute ale unui client. */
export interface UserContext {
  userId: string;
  lat: number;
  lng: number;
  preferences: ProductCategory[];
  updatedAt: string; // ISO 8601
}

/** Identic cu AINotification din frontend/src/types/index.ts. */
export interface AINotification {
  id: string;
  type: 'proximity' | 'preference' | 'flash_sale';
  title: string;
  message: string;
  storeName: string;
  distance: string;
  timestamp: string;
  offerId?: string;
  discountedPrice?: number;
}

/** O ofertă candidată pentru recomandare, cu distanța față de client. */
export interface NearbyOffer extends OfferRecord {
  distanceM: number;
}
