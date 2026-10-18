import { Inject, Injectable, Logger } from '@nestjs/common';
import { AiRecommenderService } from '../ai/ai-recommender.service';
import type { AINotification, OfferRecord, UserContext } from '../contracts';
import { USER_CONTEXT_STORE, type UserContextStore } from '../data/ports';
import { AI_MAP_OPTIONS, type ResolvedAiMapOptions } from '../options';
import { ProximityService } from '../proximity/proximity.service';
import { NotificationsService } from './notifications.service';

const MAX_USERS_PER_OFFER = 50;

/**
 * Leagă locația clienților de oferte: decide cine primește notificare, cere mesajul de la AI
 * și îl trimite pe stream-ul SSE al clientului.
 */
@Injectable()
export class ProximityWatcherService {
  private readonly logger = new Logger(ProximityWatcherService.name);

  constructor(
    @Inject(USER_CONTEXT_STORE) private readonly users: UserContextStore,
    @Inject(AI_MAP_OPTIONS) private readonly options: ResolvedAiMapOptions,
    private readonly proximity: ProximityService,
    private readonly ai: AiRecommenderService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Clientul și-a trimis locația: notificăm cea mai bună ofertă nouă din apropiere. */
  async onLocationUpdate(user: UserContext): Promise<AINotification[]> {
    await this.users.upsert(user);
    const who = `Locație ${user.userId} (${user.lat.toFixed(4)}, ${user.lng.toFixed(4)}, preferințe: ${user.preferences.join(',') || '-'})`;
    if (!this.notifications.isConnected(user.userId)) {
      this.logger.log(`${who}: nu e conectat la SSE, nu trimit notificare`);
      return [];
    }
    if (this.notifications.inCooldown(user.userId, this.options.notifyCooldownMs)) {
      this.logger.log(`${who}: în pauză între notificări (NOTIFY_COOLDOWN_MS)`);
      return [];
    }

    const inRange = await this.proximity.nearby(user.lat, user.lng, this.options.notifyRadiusM);
    const fresh = inRange.filter((o) => !this.notifications.wasNotified(user.userId, o.id));
    if (fresh.length === 0) {
      this.logger.log(
        `${who}: ${inRange.length} oferte în ${this.options.notifyRadiusM} m, ${fresh.length} nenotificate încă`,
      );
      return [];
    }

    const [best] = await this.ai.recommend(user, fresh, { max: 1, trigger: 'location' });
    if (!best) return [];
    this.notifications.push(user.userId, best);
    return [best];
  }

  /**
   * De apelat din backend când un partener publică sau reduce un produs.
   * Notifică clienții conectați, aflați în rază, cărora li se potrivește categoria.
   */
  async onOfferPublished(offer: OfferRecord): Promise<number> {
    const all = await this.users.all();
    const targets = all
      .filter((u) => this.notifications.isConnected(u.userId))
      .filter((u) => u.preferences.length === 0 || u.preferences.includes(offer.category))
      .filter((u) => !this.notifications.wasNotified(u.userId, offer.id))
      .map((u) => ({ user: u, offer: this.proximity.withDistance(offer, u.lat, u.lng) }))
      .filter(({ offer: o }) => o.distanceM <= this.options.notifyRadiusM)
      .sort((a, b) => a.offer.distanceM - b.offer.distanceM)
      .slice(0, MAX_USERS_PER_OFFER);

    const results = await Promise.allSettled(
      targets.map(async ({ user, offer: o }) => {
        const [notification] = await this.ai.recommend(user, [o], { max: 1, trigger: 'new_offer' });
        if (notification) this.notifications.push(user.userId, notification);
        return Boolean(notification);
      }),
    );

    for (const r of results) {
      if (r.status === 'rejected') this.logger.warn(`Notificare eșuată: ${String(r.reason)}`);
    }
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    this.logger.log(
      `Ofertă nouă „${offer.product}” (${offer.category}): ${all.length} clienți cunoscuți, ` +
        `${targets.length} conectați/în rază/cu preferința potrivită, ${sent} notificați`,
    );
    return sent;
  }
}
