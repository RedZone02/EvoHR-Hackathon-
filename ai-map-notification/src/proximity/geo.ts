const EARTH_RADIUS_M = 6_371_000;
const METERS_PER_DEGREE_LAT = 111_320;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Distanța pe sferă (haversine), în metri. */
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a)));
}

/** Pre-filtru ieftin (dreptunghi) înainte de haversine. */
export function withinBoundingBox(
  lat: number,
  lng: number,
  targetLat: number,
  targetLng: number,
  radiusM: number,
): boolean {
  const dLat = radiusM / METERS_PER_DEGREE_LAT;
  const cosLat = Math.max(Math.cos(toRad(lat)), 0.01);
  const dLng = radiusM / (METERS_PER_DEGREE_LAT * cosLat);
  return Math.abs(targetLat - lat) <= dLat && Math.abs(targetLng - lng) <= dLng;
}

export const formatDistance = (meters: number): string =>
  meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;

export const minutesUntil = (iso: string, now = Date.now()): number =>
  Math.max(0, Math.round((Date.parse(iso) - now) / 60_000));

export const discountPercent = (original: number, discounted: number): number =>
  original > 0 ? Math.round((1 - discounted / original) * 100) : 0;
