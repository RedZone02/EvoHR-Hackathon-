import type { AINotification } from '../types';
import type { Offer } from '../types/offer';

const API_URL = import.meta.env.VITE_API_URL;

/** False când VITE_API_URL lipsește: funcțiile live (SSE, locație, AI) stau inactive. */
export const isApiConfigured = Boolean(API_URL);

export const apiUrl = (path: string): string => {
  if (!API_URL) {
    throw new Error('VITE_API_URL nu este setat. Adaugă-l în frontend/.env.local.');
  }
  // Concatenare, nu new URL(): păstrează un prefix din VITE_API_URL (ex. http://localhost:3000/api).
  return `${API_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

/** Backend-ul răspunde cu { success, statusCode, data, timestamp }; întoarcem doar `data`. */
async function readData<T>(res: Response): Promise<T> {
  const body = (await res.json()) as { success?: boolean; data?: T } | T;
  return body !== null && typeof body === 'object' && 'success' in body && 'data' in body
    ? (body.data as T)
    : (body as T);
}

export async function fetchNearbyOffers(
  lat: number,
  lng: number,
  radius: number,
  signal?: AbortSignal,
): Promise<Offer[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });
  const res = await fetch(`${apiUrl('/offers/nearby')}?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`GET /offers/nearby a eșuat (${res.status})`);
  }
  return readData<Offer[]>(res);
}

export interface LocationUpdate {
  userId: string;
  lat: number;
  lng: number;
  preferences: string[];
}

/** Trimite locația + preferințele; backend-ul răspunde cu notificări pe SSE. */
export async function postLocation(update: LocationUpdate): Promise<void> {
  const res = await fetch(apiUrl('/notifications/location'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    throw new Error(`POST /notifications/location a eșuat (${res.status})`);
  }
}

export async function fetchRecommendations(
  { userId, lat, lng, preferences }: LocationUpdate,
  signal?: AbortSignal,
): Promise<AINotification[]> {
  const params = new URLSearchParams({
    userId,
    lat: String(lat),
    lng: String(lng),
    preferences: preferences.join(','),
  });
  const res = await fetch(`${apiUrl('/recommendations')}?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`GET /recommendations a eșuat (${res.status})`);
  }
  return readData<AINotification[]>(res);
}
