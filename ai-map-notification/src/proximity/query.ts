import { BadRequestException } from '@nestjs/common';
import { PRODUCT_CATEGORIES, type ProductCategory } from '../contracts';

export function parseCoordinate(value: unknown, name: 'lat' | 'lng'): number {
  const n = typeof value === 'number' ? value : Number(value);
  const limit = name === 'lat' ? 90 : 180;
  if (value === undefined || value === null || value === '' || !Number.isFinite(n) || Math.abs(n) > limit) {
    throw new BadRequestException(`Parametrul "${name}" lipsește sau este invalid.`);
  }
  return n;
}

export function parseRadius(value: unknown, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new BadRequestException('Parametrul "radius" trebuie să fie un număr pozitiv (metri).');
  }
  return n;
}

/** Acceptă "bakery,pastry" sau ["bakery","pastry"]; ignoră valorile necunoscute. */
export function parsePreferences(value: unknown): ProductCategory[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const known = new Set<string>(PRODUCT_CATEGORIES);
  const picked = raw.map((v) => String(v).trim()).filter((v) => known.has(v));
  return [...new Set(picked)] as ProductCategory[];
}

export function requireUserId(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '' || value.length > 128) {
    throw new BadRequestException('Parametrul "userId" lipsește sau este invalid.');
  }
  return value.trim();
}
