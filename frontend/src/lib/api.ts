import type { AINotification, OfferProduct, Reservation, Store } from '../types';
import type { Offer } from '../types/offer';

const API_URL = import.meta.env.VITE_API_URL;

/** False cand VITE_API_URL lipseste: functiile live stau inactive. */
export const isApiConfigured = Boolean(API_URL);

export const apiUrl = (path: string): string => {
  if (!API_URL) {
    throw new Error('VITE_API_URL nu este setat. Adauga-l in frontend/.env.local.');
  }
  return `${API_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

const TOKEN_KEY = 'savebite_access_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage restrictions
  }
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/** Backend-ul raspunde cu { success, statusCode, data, timestamp }; intoarcem doar `data`. */
async function readData<T>(res: Response): Promise<T> {
  const body = (await res.json()) as { success?: boolean; data?: T; message?: string | string[] } | T;
  if (!res.ok) {
    let msg = `Request-ul a esuat (${res.status})`;
    if (body && typeof body === 'object' && 'message' in body && body.message) {
      msg = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    }
    throw new Error(msg);
  }
  return body !== null && typeof body === 'object' && 'success' in body && 'data' in body
    ? (body.data as T)
    : (body as T);
}

/* ==========================================================================
   1. AUTENTIFICARE
   ========================================================================== */

export interface LoginResponse {
  user: any;
  accessToken: string;
}

export async function apiLogin(credentials: { email: string; password: string }): Promise<LoginResponse> {
  const res = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await readData<LoginResponse>(res);
  if (data?.accessToken) {
    setToken(data.accessToken);
  }
  return data;
}

export async function apiRegister(payload: any): Promise<LoginResponse> {
  const res = await fetch(apiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readData<LoginResponse>(res);
  if (data?.accessToken) {
    setToken(data.accessToken);
  }
  return data;
}

export async function apiGetMe(): Promise<any> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(apiUrl('/auth/me'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    setToken(null);
    return null;
  }
  return readData<any>(res);
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch(apiUrl('/auth/logout'), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // ignore network errors on logout
  } finally {
    setToken(null);
  }
}

/* ==========================================================================
   2. OFERTE & MAGAZINE
   ========================================================================== */

export async function fetchOffers(params?: {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<OfferProduct[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params?.lat !== undefined) query.set('lat', String(params.lat));
  if (params?.lng !== undefined) query.set('lng', String(params.lng));
  if (params?.radius !== undefined) query.set('radius', String(params.radius));

  const qs = query.toString();
  const url = qs ? `${apiUrl('/offers')}?${qs}` : apiUrl('/offers');
  const res = await fetch(url);
  return readData<OfferProduct[]>(res);
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
  return readData<Offer[]>(res);
}

export async function createOffer(dto: any): Promise<OfferProduct> {
  const res = await fetch(apiUrl('/offers'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  return readData<OfferProduct>(res);
}

export async function updateOffer(id: string, dto: any): Promise<OfferProduct> {
  const res = await fetch(apiUrl(`/offers/${id}`), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  return readData<OfferProduct>(res);
}

export async function deleteOffer(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/offers/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await readData<any>(res);
}

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(apiUrl('/stores'));
  return readData<Store[]>(res);
}

/* ==========================================================================
   3. REZERVARI
   ========================================================================== */

export async function createReservation(offerId: string): Promise<Reservation> {
  const res = await fetch(apiUrl('/reservations'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ offerId }),
  });
  return readData<Reservation>(res);
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  const res = await fetch(apiUrl('/reservations/my'), {
    headers: getAuthHeaders(),
  });
  return readData<Reservation[]>(res);
}

export interface StoreReservation {
  id: string;
  pickupCode: string;
  offerTitle: string;
  price: number;
  pickupWindow: string;
  status: 'RESERVED' | 'COLLECTED' | 'CANCELLED';
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  createdAt: string;
}

export async function fetchStoreReservations(): Promise<StoreReservation[]> {
  const res = await fetch(apiUrl('/reservations/store'), {
    headers: getAuthHeaders(),
  });
  return readData<StoreReservation[]>(res);
}

export async function collectReservation(pickupCode: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(apiUrl(`/reservations/${encodeURIComponent(pickupCode)}/collect`), {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return readData<{ success: boolean; message: string }>(res);
}

/* ==========================================================================
   4. NOTIFICARI & LOCATIE (AI-MAP-NOTIFICATION)
   ========================================================================== */

export interface LocationUpdate {
  userId: string;
  lat: number;
  lng: number;
  preferences: string[];
}

export async function postLocation(update: LocationUpdate): Promise<void> {
  const res = await fetch(apiUrl('/notifications/location'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    throw new Error(`POST /notifications/location a esuat (${res.status})`);
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
  return readData<AINotification[]>(res);
}
