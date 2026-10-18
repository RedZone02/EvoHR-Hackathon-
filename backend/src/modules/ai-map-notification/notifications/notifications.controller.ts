import { Body, Controller, Get, HttpCode, Inject, Logger, Post, Query, Sse, type MessageEvent } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { AiRecommenderService } from '../ai/ai-recommender.service';
import type { AINotification, UserContext } from '../contracts';
import { USER_CONTEXT_STORE, type UserContextStore } from '../data/ports';
import { LocationDto } from '../dto/location.dto';
import { ProximityService } from '../proximity/proximity.service';
import { parseCoordinate, parsePreferences, parseRadius, requireUserId } from '../proximity/query';
import { NotificationsService } from './notifications.service';
import { ProximityWatcherService } from './proximity-watcher.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    @Inject(USER_CONTEXT_STORE) private readonly users: UserContextStore,
    private readonly notifications: NotificationsService,
    private readonly watcher: ProximityWatcherService,
    private readonly proximity: ProximityService,
    private readonly ai: AiRecommenderService,
  ) {}

  /** GET /api/notifications/stream?userId=  (Server-Sent Events, fără wrapper-ul { success, data }) */
  @Sse('notifications/stream')
  stream(@Query('userId') userId?: string): Observable<MessageEvent> {
    return this.notifications.stream(requireUserId(userId));
  }

  /** POST /api/notifications/location  { userId, lat, lng, preferences? } */
  @Post('notifications/location')
  @HttpCode(202)
  location(@Body() body: LocationDto): { accepted: true } {
    const user: UserContext = {
      userId: body.userId.trim(),
      lat: body.lat,
      lng: body.lng,
      preferences: [...new Set(body.preferences ?? [])],
      updatedAt: new Date().toISOString(),
    };
    // Nu ținem request-ul deschis cât lucrează AI-ul; rezultatul pleacă pe SSE.
    this.watcher.onLocationUpdate(user).catch((err: unknown) => {
      this.logger.warn(`onLocationUpdate a eșuat: ${err instanceof Error ? err.message : String(err)}`);
    });
    return { accepted: true };
  }

  /** GET /api/recommendations?userId=&lat=&lng=&preferences=bakery,pastry&radius= */
  @Get('recommendations')
  async recommendations(
    @Query('userId') userId?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('preferences') preferences?: string,
    @Query('radius') radius?: string,
  ): Promise<AINotification[]> {
    const user: UserContext = {
      userId: requireUserId(userId),
      lat: parseCoordinate(lat, 'lat'),
      lng: parseCoordinate(lng, 'lng'),
      preferences: parsePreferences(preferences),
      updatedAt: new Date().toISOString(),
    };
    await this.users.upsert(user);
    const nearby = await this.proximity.nearby(user.lat, user.lng, parseRadius(radius, 2000));
    return this.ai.recommend(user, nearby, { max: 4, trigger: 'on_demand' });
  }
}
