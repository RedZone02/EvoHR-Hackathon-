import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus, OfferStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Creare Rezervare Atomică (Prevenire Race Condition / Over-selling)
  async createReservation(userId: string, dto: CreateReservationDto) {
    return this.prisma.$transaction(async (tx) => {
      // Găsește oferta
      const offer = await tx.offer.findUnique({
        where: { id: dto.offerId },
        include: { store: true },
      });

      if (!offer) {
        throw new NotFoundException('Oferta specificată nu există.');
      }

      if (offer.status !== OfferStatus.ACTIVE || offer.itemsLeft <= 0) {
        throw new BadRequestException('Ne pare rău, stocul pentru acest produs tocmai s-a epuizat!');
      }

      // Decrementare atomică
      const updatedOffer = await tx.offer.update({
        where: { id: offer.id },
        data: {
          itemsLeft: { decrement: 1 },
          status: offer.itemsLeft - 1 === 0 ? OfferStatus.SOLD_OUT : OfferStatus.ACTIVE,
        },
      });

      // Generare cod de ridicare criptografic unic (ex: SB-8492)
      const randomCode = crypto.randomInt(1000, 9999);
      const pickupCode = `SB-${randomCode}`;

      // Creare rezervare
      const reservation = await tx.reservation.create({
        data: {
          offerId: offer.id,
          userId,
          price: offer.discountedPrice,
          pickupWindow: offer.pickupWindow,
          pickupCode,
          status: ReservationStatus.RESERVED,
        },
        include: {
          offer: {
            include: { store: true },
          },
        },
      });

      // Actualizare număr pachete salvate pentru client
      await tx.user.update({
        where: { id: userId },
        data: { savedBags: { increment: 1 } },
      });

      // Actualizare venit partener
      await tx.store.update({
        where: { id: offer.storeId },
        data: { activeRevenueRon: { increment: offer.discountedPrice } },
      });

      return {
        id: reservation.id,
        offerId: offer.id,
        offerTitle: offer.title,
        storeName: offer.store.name,
        price: reservation.price,
        pickupWindow: reservation.pickupWindow,
        pickupCode: reservation.pickupCode,
        status: reservation.status,
        createdAt: reservation.createdAt,
      };
    });
  }

  // 2. Rezervările clientului conectat
  async findMyReservations(userId: string) {
    const list = await this.prisma.reservation.findMany({
      where: { userId },
      include: {
        offer: {
          include: { store: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((r) => ({
      id: r.id,
      offerId: r.offerId,
      offerTitle: r.offer.title,
      storeName: r.offer.store.name,
      price: r.price,
      pickupWindow: r.pickupWindow,
      pickupCode: r.pickupCode,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  // 3. Validare la Tejghea de către Partener (Marchează ca ridicat)
  async collectReservation(partnerUserId: string, pickupCode: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: partnerUserId },
    });

    if (!store) {
      throw new ForbiddenException('Doar partenerii înregistrați pot valida ridicarea comenzilor.');
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { pickupCode: pickupCode.trim().toUpperCase() },
      include: {
        offer: true,
        user: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Nicio rezervare activă găsită pentru codul ${pickupCode}.`);
    }

    if (reservation.offer.storeId !== store.id) {
      throw new ForbiddenException('Această comandă aparține altui magazin.');
    }

    if (reservation.status === ReservationStatus.COLLECTED) {
      throw new BadRequestException('Această comandă a fost deja ridicată anterior!');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Această rezervare a fost anulată.');
    }

    const updated = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: ReservationStatus.COLLECTED },
    });

    return {
      success: true,
      message: `Comanda pentru ${reservation.user.name} a fost validată cu succes!`,
      reservationId: updated.id,
      status: updated.status,
    };
  }
}
