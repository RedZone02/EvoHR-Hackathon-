import { Module } from '@nestjs/common';
import { AiRecommenderService } from './ai/ai-recommender.service';
import { PrismaOffersRepository } from './data/prisma-offers.repository';
import { PrismaUserContextStore } from './data/prisma-user-context.store';
import { OFFERS_REPOSITORY, USER_CONTEXT_STORE } from './data/ports';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { ProximityWatcherService } from './notifications/proximity-watcher.service';
import { AI_MAP_OPTIONS, optionsFromEnv } from './options';
import { ProximityService } from './proximity/proximity.service';

/**
 * Hartă, proximitate, notificări SSE și recomandări AI (Claude).
 *
 * Rute: GET /api/notifications/stream, POST /api/notifications/location, GET /api/recommendations.
 * GET /api/offers/nearby stă în OffersController (înainte de /offers/:id) și folosește ProximityService.
 * OffersService apelează ProximityWatcherService.onOfferSaved() după create/update.
 */
@Module({
  controllers: [NotificationsController],
  providers: [
    { provide: AI_MAP_OPTIONS, useFactory: optionsFromEnv },
    { provide: OFFERS_REPOSITORY, useClass: PrismaOffersRepository },
    { provide: USER_CONTEXT_STORE, useClass: PrismaUserContextStore },
    ProximityService,
    AiRecommenderService,
    NotificationsService,
    ProximityWatcherService,
  ],
  exports: [ProximityService, ProximityWatcherService],
})
export class AiMapNotificationModule {}
