import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { ProductCategory } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: ProductCategory) {
    return this.prisma.store.findMany({
      where: category ? { category } : undefined,
      include: {
        _count: {
          select: { offers: { where: { status: 'ACTIVE' } } },
        },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        offers: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Magazinul cu ID-ul ${id} nu a fost găsit.`);
    }

    return store;
  }

  async updateStore(storeId: string, userId: string, updateData: Partial<CreateStoreDto>) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Magazinul nu există.');
    }

    // Ownership check strict
    if (store.ownerId !== userId) {
      throw new ForbiddenException('Nu ai permisiunea de a modifica datele acestui magazin.');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });
  }
}
