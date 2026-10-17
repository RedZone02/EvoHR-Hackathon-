export type ProductCategory = 'all' | 'bakery' | 'restaurant' | 'grocery' | 'cafe' | 'pastry';

export interface Store {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  address: string;
  city: string;
  distanceMeters: number;
  rating: number;
  latitude: number;
  longitude: number;
  phone?: string;
}

export interface OfferProduct {
  id: string;
  storeId: string;
  storeName: string;
  category: ProductCategory;
  categoryLabel: string;
  distanceText: string;
  distanceMeters: number;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  itemsLeft: number;
  expiresInMinutes: number;
  pickupWindow: string; // e.g. "16:30 - 19:00"
  isFavorite?: boolean;
}

export interface Reservation {
  id: string;
  offerId: string;
  offerTitle: string;
  storeName: string;
  price: number;
  pickupWindow: string;
  status: 'reserved' | 'collected' | 'cancelled';
  createdAt: string;
}

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
