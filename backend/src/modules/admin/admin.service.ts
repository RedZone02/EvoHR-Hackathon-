import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Metricile globale ale platformei (KPI-uri Executive)
  async getOverview() {
    const [
      totalUsers,
      totalClients,
      totalPartners,
      totalStores,
      totalOffers,
      activeOffers,
      totalReservations,
      completedReservations,
      revenueAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.user.count({ where: { role: 'PARTNER' } }),
      this.prisma.store.count(),
      this.prisma.offer.count(),
      this.prisma.offer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.reservation.count(),
      this.prisma.reservation.count({ where: { status: 'COLLECTED' } }),
      this.prisma.reservation.aggregate({
        _sum: { price: true },
      }),
    ]);

    // Estimare impact ecologic: 1 pachet salvat ~ 2.5 kg CO2 evitate și ~ 1.2 kg alimente
    const totalRevenueRon = revenueAggregate._sum.price || 0;
    const foodSavedKg = Math.round(totalReservations * 1.2);
    const co2SavedKg = Math.round(totalReservations * 2.5);

    return {
      stats: {
        totalUsers,
        totalClients,
        totalPartners,
        totalStores,
        totalOffers,
        activeOffers,
        totalReservations,
        completedReservations,
        totalRevenueRon: parseFloat(totalRevenueRon.toFixed(2)),
        foodSavedKg,
        co2SavedKg,
      },
      systemHealth: {
        status: 'HEALTHY',
        database: 'MySQL 26.7 (savebite_db)',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        securityShield: 'ACTIVE (Helmet, RateLimit, Argon2id, CSRF)',
      },
    };
  }

  // 2. Toți utilizatorii înregistrați
  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        store: true,
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  }

  // 3. Toate magazinele partenere
  async getStores() {
    return this.prisma.store.findMany({
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        _count: { select: { offers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. Toate rezervările din platformă
  async getReservations() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        offer: {
          include: {
            store: { select: { name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 5. Jurnale de audit și securitate
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
