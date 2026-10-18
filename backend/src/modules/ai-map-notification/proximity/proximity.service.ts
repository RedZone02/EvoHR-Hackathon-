import { Inject, Injectable } from '@nestjs/common';
import type { NearbyOffer, NearbyOfferDto, OfferRecord } from '../contracts';
import { OFFERS_REPOSITORY, type OffersRepository } from '../data/ports';
import { distanceMeters, withinBoundingBox } from './geo';

export const MAX_RADIUS_M = 20_000;

@Injectable()
export class ProximityService {
  constructor(@Inject(OFFERS_REPOSITORY) private readonly offers: OffersRepository) {}

  /** Oferte active, neexpirate, în raza dată, sortate după distanță. */
  async nearby(lat: number, lng: number, radiusM: number): Promise<NearbyOffer[]> {
    const radius = Math.min(Math.max(radiusM, 1), MAX_RADIUS_M);
    const now = Date.now();
    const active = await this.offers.findActive();

    return active
      .filter((o) => Date.parse(o.expiresAt) > now)
      .filter((o) => withinBoundingBox(lat, lng, o.lat, o.lng, radius))
      .map((o) => this.withDistance(o, lat, lng))
      .filter((o) => o.distanceM <= radius)
      .sort((a, b) => a.distanceM - b.distanceM);
  }

  withDistance(offer: OfferRecord, lat: number, lng: number): NearbyOffer {
    return { ...offer, distanceM: distanceMeters(lat, lng, offer.lat, offer.lng) };
  }

  static toDto(o: NearbyOffer): NearbyOfferDto {
    return {
      id: o.id,
      shopName: o.shopName,
      product: o.product,
      priceOriginal: o.priceOriginal,
      priceDiscounted: o.priceDiscounted,
      lat: o.lat,
      lng: o.lng,
      distanceM: o.distanceM,
      expiresAt: o.expiresAt,
    };
  }
}
