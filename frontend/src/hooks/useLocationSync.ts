import { useEffect, useRef, useState } from 'react';
import { isApiConfigured, postLocation } from '../lib/api';

export interface SyncedPosition {
  lat: number;
  lng: number;
}

const MIN_MOVE_M = 100;
const MIN_INTERVAL_MS = 60_000;

const distanceM = (a: SyncedPosition, b: SyncedPosition): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(toRad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
};

/**
 * Urmărește locația browserului și o trimite la backend (POST /notifications/location),
 * doar la o deplasare de cel puțin 100 m sau o dată pe minut.
 * Returnează ultima poziție trimisă (null până la prima).
 */
export function useLocationSync(userId: string | null, preferences: string[]): SyncedPosition | null {
  const [synced, setSynced] = useState<SyncedPosition | null>(null);
  const lastSent = useRef<{ pos: SyncedPosition; at: number } | null>(null);
  const preferencesRef = useRef(preferences);
  const preferencesKey = preferences.join(',');

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    if (!userId || !isApiConfigured || !('geolocation' in navigator)) return;

    const send = (pos: SyncedPosition) => {
      lastSent.current = { pos, at: Date.now() };
      setSynced(pos);
      postLocation({ userId, ...pos, preferences: preferencesRef.current }).catch(() => {
        // Backend indisponibil: reîncercăm la următoarea actualizare de poziție.
        lastSent.current = null;
      });
    };

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        const last = lastSent.current;
        if (!last || distanceM(last.pos, pos) >= MIN_MOVE_M || Date.now() - last.at >= MIN_INTERVAL_MS) {
          send(pos);
        }
      },
      () => {
        // Fără permisiune de locație: nu avem notificări de proximitate.
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [userId]);

  // Preferințele s-au schimbat (ex. un favorit nou): retrimitem ultima poziție.
  useEffect(() => {
    const last = lastSent.current;
    if (!userId || !isApiConfigured || !last) return;
    postLocation({ userId, ...last.pos, preferences: preferencesRef.current }).catch(() => {});
  }, [userId, preferencesKey]);

  return synced;
}
