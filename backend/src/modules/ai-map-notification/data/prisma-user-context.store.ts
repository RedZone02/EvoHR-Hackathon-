import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PRODUCT_CATEGORIES, type ProductCategory, type UserContext } from '../contracts';
import type { UserContextStore } from './ports';

/** Locațiile mai vechi de atât nu mai primesc notificări și sunt șterse periodic. */
const STALE_AFTER_MS = 24 * 60 * 60_000;
const CLEANUP_EVERY_MS = 60 * 60_000;

const toPreferences = (value: unknown): ProductCategory[] =>
  Array.isArray(value) ? (value.filter((v) => PRODUCT_CATEGORIES.includes(v)) as ProductCategory[]) : [];

@Injectable()
export class PrismaUserContextStore implements UserContextStore {
  private readonly logger = new Logger(PrismaUserContextStore.name);
  private lastCleanup = 0;

  constructor(private readonly prisma: PrismaService) {}

  async upsert(context: UserContext): Promise<void> {
    const data = {
      latitude: context.lat,
      longitude: context.lng,
      preferences: context.preferences,
    };
    await this.prisma.userLocation.upsert({
      where: { userId: context.userId },
      create: { userId: context.userId, ...data },
      update: data,
    });
    void this.cleanup();
  }

  async get(userId: string): Promise<UserContext | undefined> {
    const row = await this.prisma.userLocation.findUnique({ where: { userId } });
    return row ? this.toContext(row) : undefined;
  }

  async recent(): Promise<UserContext[]> {
    const rows = await this.prisma.userLocation.findMany({
      where: { updatedAt: { gt: new Date(Date.now() - STALE_AFTER_MS) } },
    });
    return rows.map((row) => this.toContext(row));
  }

  private toContext(row: {
    userId: string;
    latitude: number;
    longitude: number;
    preferences: unknown;
    updatedAt: Date;
  }): UserContext {
    return {
      userId: row.userId,
      lat: row.latitude,
      lng: row.longitude,
      preferences: toPreferences(row.preferences),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /** Șterge locațiile vechi (mai ales vizitatori), cel mult o dată pe oră. */
  private async cleanup(): Promise<void> {
    if (Date.now() - this.lastCleanup < CLEANUP_EVERY_MS) return;
    this.lastCleanup = Date.now();
    try {
      const { count } = await this.prisma.userLocation.deleteMany({
        where: { updatedAt: { lt: new Date(Date.now() - STALE_AFTER_MS) } },
      });
      if (count > 0) this.logger.log(`Șterse ${count} locații mai vechi de 24 h`);
    } catch (error) {
      this.logger.warn(`Curățarea locațiilor a eșuat: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
