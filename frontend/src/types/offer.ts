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
