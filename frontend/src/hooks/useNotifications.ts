import { useEffect, useRef, useState } from 'react';
import { apiUrl, isApiConfigured } from '../lib/api';
import type { AINotification } from '../types';

export interface NotificationMessage {
  id: string;
  title: string;
  description?: string;
  /** Prezent când backend-ul trimite o notificare AI completă (cu offerId, distanță etc.). */
  notification?: AINotification;
  raw: unknown;
}

const isAINotification = (data: unknown): data is AINotification =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as AINotification).title === 'string' &&
  typeof (data as AINotification).message === 'string' &&
  typeof (data as AINotification).storeName === 'string';

const parseMessage = (event: MessageEvent<string>): NotificationMessage => {
  const id = event.lastEventId || `notif-${Date.now()}`;
  try {
    const data = JSON.parse(event.data) as { title?: string; message?: string; description?: string };
    return {
      id,
      title: data.title ?? data.message ?? 'Notificare nouă',
      description: data.title ? data.message ?? data.description : data.description,
      notification: isAINotification(data) ? data : undefined,
      raw: data,
    };
  } catch {
    return { id, title: event.data, raw: event.data };
  }
};

/**
 * Ascultă stream-ul SSE /notifications/stream?userId= și returnează ultimul mesaj.
 * `onMessage` (opțional) e apelat pentru fiecare mesaj nou, direct din evenimentul SSE.
 * Cu `userId` null (ex. partener) sau fără VITE_API_URL, hook-ul nu se conectează.
 */
export function useNotifications(
  userId: string | null,
  onMessage?: (message: NotificationMessage) => void,
): NotificationMessage | null {
  const [latest, setLatest] = useState<NotificationMessage | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId || !isApiConfigured) return;
    // EventSource se reconectează automat dacă stream-ul cade.
    const url = `${apiUrl('/notifications/stream')}?${new URLSearchParams({ userId })}`;
    const source = new EventSource(url);
    source.onmessage = (event: MessageEvent<string>) => {
      const message = parseMessage(event);
      setLatest(message);
      onMessageRef.current?.(message);
    };
    return () => source.close();
  }, [userId]);

  return latest;
}
