import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { ProductCategory, OfferStatus } from '@prisma/client';
import {
  OfferSnapshot,
  ProximityWatcherService,
} from '../ai-map-notification/notifications/proximity-watcher.service';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly proximityWatcher: ProximityWatcherService,
  ) {}

  // Notifică clienții din apropiere fără să întârzie răspunsul către partener.
  private notifyNearbyClients(offerId: string, previous?: OfferSnapshot, current?: OfferSnapshot) {
    this.proximityWatcher.onOfferSaved(offerId, previous, current).catch((err: unknown) => {
      this.logger.warn(`Notificarea clienților a eșuat: ${err instanceof Error ? err.message : String(err)}`);
    });
  }

  // 1. Toate ofertele active cu calcul de distanță opțional
  async findAll(params: {
    category?: ProductCategory;
    lat?: number;
    lng?: number;
    maxDistanceMeters?: number;
  }) {
    const { category, lat, lng, maxDistanceMeters = 20000 } = params;

    const offers = await this.prisma.offer.findMany({
      where: {
        status: OfferStatus.ACTIVE,
        itemsLeft: { gt: 0 },
        ...(category && category !== ('all' as any) ? { category } : {}),
      },
      include: {
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const userLat = lat ?? 47.1654;
    const userLng = lng ?? 27.5765;

    // Mapare și calcul distanță geodezică
    const formattedOffers = offers.map((offer) => {
      const distanceMeters = this.calculateDistance(
        userLat,
        userLng,
        offer.store.latitude,
        offer.store.longitude,
      );

      const distanceText =
        distanceMeters >= 1000
          ? `${(distanceMeters / 1000).toFixed(1)} km`
          : `${Math.round(distanceMeters)} m`;

      return {
        id: offer.id,
        storeId: offer.storeId,
        storeName: offer.store.name,
        category: offer.category,
        categoryLabel: offer.categoryLabel,
        distanceText,
        distanceMeters: Math.round(distanceMeters),
        title: offer.title,
        description: offer.description,
        imageUrl: offer.imageUrl,
        originalPrice: offer.originalPrice,
        discountedPrice: offer.discountedPrice,
        discountPercentage: offer.discountPercentage,
        itemsLeft: offer.itemsLeft,
        expiresInMinutes: offer.expiresInMinutes,
        pickupWindow: offer.pickupWindow,
        status: offer.status,
        createdAt: offer.createdAt,
      };
    });

    // Filtrare după distanță și sortare după proximitate
    return formattedOffers
      .filter((o) => o.distanceMeters <= maxDistanceMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // 2. Ofertă după ID
  async findById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!offer) {
      throw new NotFoundException(`Oferta cu ID-ul ${id} nu a fost găsită.`);
    }

    return offer;
  }

  // 3. Creare Ofertă (Exclusiv Partener pentru magazinul propriu)
  async createOffer(userId: string, dto: CreateOfferDto) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      throw new ForbiddenException('Nu ai un profil de magazin înregistrat pentru a publica oferte.');
    }

    if (dto.discountedPrice >= dto.originalPrice) {
      throw new BadRequestException('Prețul redus trebuie să fie mai mic decât prețul original.');
    }

    const discountPercentage = Math.round(
      ((dto.originalPrice - dto.discountedPrice) / dto.originalPrice) * 100,
    );

    const created = await this.prisma.offer.create({
      data: {
        storeId: store.id,
        title: dto.title.trim(),
        description: dto.description.trim(),
        category: dto.category,
        categoryLabel: dto.categoryLabel,
        imageUrl: dto.imageUrl,
        originalPrice: dto.originalPrice,
        discountedPrice: dto.discountedPrice,
        discountPercentage,
        itemsLeft: dto.itemsLeft,
        expiresInMinutes: dto.expiresInMinutes,
        pickupWindow: dto.pickupWindow,
        status: dto.status || OfferStatus.ACTIVE,
      },
    });

    this.notifyNearbyClients(created.id);
    return created;
  }

  // 4. Actualizare Ofertă cu verificare de proprietate strictă
  async updateOffer(offerId: string, userId: string, dto: UpdateOfferDto) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { store: true },
    });

    if (!offer) {
      throw new NotFoundException('Oferta nu a fost găsită.');
    }

    if (offer.store.ownerId !== userId) {
      throw new ForbiddenException('Nu ai dreptul de a modifica această ofertă.');
    }

    let discountPercentage = offer.discountPercentage;
    const origPrice = dto.originalPrice ?? offer.originalPrice;
    const discPrice = dto.discountedPrice ?? offer.discountedPrice;

    if (discPrice >= origPrice) {
      throw new BadRequestException('Prețul redus trebuie să fie mai mic decât prețul inițial.');
    }

    discountPercentage = Math.round(((origPrice - discPrice) / origPrice) * 100);

    const updated = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        ...dto,
        discountPercentage,
        status: dto.itemsLeft === 0 ? OfferStatus.SOLD_OUT : (dto.status || offer.status),
      },
    });

    // Doar reducere de preț, revenire în stoc sau reactivare declanșează notificări.
    this.notifyNearbyClients(updated.id, offer, updated);
    return updated;
  }

  // 5. Ștergere Ofertă cu verificare de proprietate strictă
  async deleteOffer(offerId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { store: true },
    });

    if (!offer) {
      throw new NotFoundException('Oferta nu a fost găsită.');
    }

    if (offer.store.ownerId !== userId) {
      throw new ForbiddenException('Nu ai dreptul de a șterge această ofertă.');
    }

    return this.prisma.offer.delete({
      where: { id: offerId },
    });
  }

  // Haversine formula (calcul distanță în metri pe sferoid)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raza Pământului în metri
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
