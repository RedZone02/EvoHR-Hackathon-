import { Module, type DynamicModule } from '@nestjs/common';
import { AiRecommenderService } from './ai/ai-recommender.service';
import { InMemoryOffersRepository, InMemoryUserContextStore } from './data/in-memory.repositories';
import { OFFERS_REPOSITORY, USER_CONTEXT_STORE } from './data/ports';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { ProximityWatcherService } from './notifications/proximity-watcher.service';
import { AI_MAP_OPTIONS, resolveOptions, type AiMapNotificationsOptions } from './options';
import { OffersController } from './proximity/offers.controller';
import { ProximityService } from './proximity/proximity.service';

/**
 * Hartă, proximitate, notificări SSE și recomandări AI.
 *
 *   @Module({ imports: [AiMapNotificationsModule.forRoot({ offersRepository: DbOffersRepository })] })
 *
 * Endpoint-uri: GET /offers/nearby, GET /notifications/stream, POST /notifications/location,
 * GET /recommendations. Pentru oferte noi: ProximityWatcherService.onOfferPublished(offer).
 */
@Module({})
export class AiMapNotificationsModule {
  static forRoot(options: AiMapNotificationsOptions = {}): DynamicModule {
    return {
      module: AiMapNotificationsModule,
      imports: options.imports ?? [],
      controllers: [OffersController, NotificationsController],
      providers: [
        { provide: AI_MAP_OPTIONS, useValue: resolveOptions(options) },
        { provide: OFFERS_REPOSITORY, useClass: options.offersRepository ?? InMemoryOffersRepository },
        { provide: USER_CONTEXT_STORE, useClass: options.userContextStore ?? InMemoryUserContextStore },
        ProximityService,
        AiRecommenderService,
        NotificationsService,
        ProximityWatcherService,
      ],
      exports: [ProximityService, AiRecommenderService, NotificationsService, ProximityWatcherService, OFFERS_REPOSITORY],
    };
  }
}
