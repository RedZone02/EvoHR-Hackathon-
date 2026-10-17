// Doar pentru dezvoltare locală: în proiectul final, modulul se importă în AppModule-ul colegului.
import { Body, Controller, Inject, Module, Post } from '@nestjs/common';
import { AiMapNotificationsModule } from '../ai-map-notifications.module';
import type { OfferRecord, ProductCategory } from '../contracts';
import { InMemoryOffersRepository } from '../data/in-memory.repositories';
import { OFFERS_REPOSITORY } from '../data/ports';
import { ProximityWatcherService } from '../notifications/proximity-watcher.service';

interface DemoOfferBody {
  lat?: number;
  lng?: number;
  category?: ProductCategory;
  shopName?: string;
  product?: string;
}

/** POST /dev/offers simulează un partener care publică o reducere nouă. */
@Controller('dev')
class DevOffersController {
  constructor(
    @Inject(OFFERS_REPOSITORY) private readonly offers: InMemoryOffersRepository,
    private readonly watcher: ProximityWatcherService,
  ) {}

  @Post('offers')
  async publish(@Body() body: DemoOfferBody): Promise<{ offer: OfferRecord; notified: number }> {
    const offer: OfferRecord = {
      id: `dev-${Date.now().toString(36)}`,
      storeId: 'store-dev',
      shopName: body.shopName ?? 'Brutăria de la colț',
      product: body.product ?? 'Croissant cu vanilie',
      category: body.category ?? 'bakery',
      priceOriginal: 8,
      priceDiscounted: 4,
      lat: body.lat ?? 47.6516,
      lng: body.lng ?? 26.2558,
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    };
    this.offers.add(offer);
    return { offer, notified: await this.watcher.onOfferPublished(offer) };
  }
}

@Module({
  imports: [AiMapNotificationsModule.forRoot()],
  controllers: [DevOffersController],
})
export class DevAppModule {}
