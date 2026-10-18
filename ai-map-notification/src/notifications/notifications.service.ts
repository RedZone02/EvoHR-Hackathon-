import { Injectable, Logger, type MessageEvent } from '@nestjs/common';
import { Observable, Subject, finalize, interval, map, merge } from 'rxjs';
import type { AINotification } from '../contracts';

const HEARTBEAT_MS = 25_000;
const DEDUPE_TTL_MS = 6 * 60 * 60_000;

/** Un Subject per client conectat la /notifications/stream. */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly channels = new Map<string, { subject: Subject<AINotification>; subscribers: number }>();
  private readonly notified = new Map<string, number>(); // `${userId}:${offerId}` -> timestamp
  private readonly lastPushAt = new Map<string, number>();

  /** Stream SSE pentru un client. Heartbeat-ul are tipul "ping", ignorat de onmessage din browser. */
  stream(userId: string): Observable<MessageEvent> {
    const channel = this.channel(userId);
    channel.subscribers += 1;
    this.logger.log(`SSE conectat: ${userId}`);

    const notifications = channel.subject.pipe(
      map((n): MessageEvent => ({ id: n.id, type: 'message', data: n })),
    );
    const heartbeat = interval(HEARTBEAT_MS).pipe(map((): MessageEvent => ({ type: 'ping', data: '' })));

    return merge(notifications, heartbeat).pipe(
      finalize(() => {
        this.logger.log(`SSE deconectat: ${userId}`);
        channel.subscribers -= 1;
        if (channel.subscribers <= 0) this.channels.delete(userId);
      }),
    );
  }

  isConnected(userId: string): boolean {
    return (this.channels.get(userId)?.subscribers ?? 0) > 0;
  }

  push(userId: string, notification: AINotification): void {
    const channel = this.channels.get(userId);
    if (!channel) return;
    channel.subject.next(notification);
    this.logger.log(`→ ${userId}: ${notification.title} | ${notification.message}`);
    this.lastPushAt.set(userId, Date.now());
    if (notification.offerId) this.notified.set(`${userId}:${notification.offerId}`, Date.now());
  }

  wasNotified(userId: string, offerId: string): boolean {
    const at = this.notified.get(`${userId}:${offerId}`);
    return at !== undefined && Date.now() - at < DEDUPE_TTL_MS;
  }

  inCooldown(userId: string, cooldownMs: number): boolean {
    const at = this.lastPushAt.get(userId);
    return at !== undefined && Date.now() - at < cooldownMs;
  }

  private channel(userId: string) {
    let channel = this.channels.get(userId);
    if (!channel) {
      channel = { subject: new Subject<AINotification>(), subscribers: 0 };
      this.channels.set(userId, channel);
    }
    return channel;
  }
}
