import { Injectable } from '@nestjs/common';
import { OfferStatus, type Offer, type Store } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { OfferRecord } from '../contracts';
import type { OffersRepository } from './ports';

/** Expirarea se calculează din momentul publicării: createdAt + expiresInMinutes. */
export const offerExpiresAt = (offer: Pick<Offer, 'createdAt' | 'expiresInMinutes'>): Date =>
  new Date(offer.createdAt.getTime() + offer.expiresInMinutes * 60_000);

export const toOfferRecord = (offer: Offer & { store: Store }): OfferRecord => ({
  id: offer.id,
  storeId: offer.storeId,
  shopName: offer.store.name,
  product: offer.title,
  category: offer.category,
  priceOriginal: offer.originalPrice,
  priceDiscounted: offer.discountedPrice,
  lat: offer.store.latitude,
  lng: offer.store.longitude,
  expiresAt: offerExpiresAt(offer).toISOString(),
});

@Injectable()
export class PrismaOffersRepository implements OffersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<OfferRecord[]> {
    const offers = await this.prisma.offer.findMany({
      where: { status: OfferStatus.ACTIVE, itemsLeft: { gt: 0 } },
      include: { store: true },
    });
    const now = Date.now();
    return offers.filter((o) => offerExpiresAt(o).getTime() > now).map(toOfferRecord);
  }

  async findActiveById(offerId: string): Promise<OfferRecord | null> {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, status: OfferStatus.ACTIVE, itemsLeft: { gt: 0 } },
      include: { store: true },
    });
    if (!offer || offerExpiresAt(offer).getTime() <= Date.now()) return null;
    return toOfferRecord(offer);
  }
}
