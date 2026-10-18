// Test end-to-end pentru modulul ai-map-notification, fără MySQL și fără cheie AI:
// repository-urile Prisma sunt înlocuite cu date în memorie, iar AI-ul folosește mesajele-șablon.
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AddressInfo } from 'net';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AiMapNotificationModule } from '../src/modules/ai-map-notification/ai-map-notification.module';
import type { AINotification, NearbyOfferDto, OfferRecord, UserContext } from '../src/modules/ai-map-notification/contracts';
import {
  OFFERS_REPOSITORY,
  USER_CONTEXT_STORE,
  type OffersRepository,
  type UserContextStore,
} from '../src/modules/ai-map-notification/data/ports';
import { ProximityWatcherService } from '../src/modules/ai-map-notification/notifications/proximity-watcher.service';
import { OffersController } from '../src/modules/offers/offers.controller';
import { OffersService } from '../src/modules/offers/offers.service';

process.env.AI_DISABLED = '1';
process.env.NOTIFY_COOLDOWN_MS = '1';

const SUCEAVA = { lat: 47.6514, lng: 26.2556 };
const inMinutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

const offer = (o: Partial<OfferRecord> & Pick<OfferRecord, 'id' | 'lat' | 'lng'>): OfferRecord => ({
  storeId: `store-${o.id}`,
  shopName: `Magazin ${o.id}`,
  product: 'Croissant cu vanilie',
  category: 'bakery',
  priceOriginal: 20,
  priceDiscounted: 10,
  expiresAt: inMinutes(90),
  ...o,
});

class MemoryOffers implements OffersRepository {
  offers: OfferRecord[] = [
    offer({ id: 'brutarie', lat: 47.6517, lng: 26.2551, shopName: 'Brutăria Cuptorul Bucovinei' }),
    offer({ id: 'cofetarie', lat: 47.6545, lng: 26.2588, shopName: 'Cofetăria Delice', product: 'Tartă cu fructe', category: 'pastry' }),
    offer({ id: 'departe', lat: 47.6702, lng: 26.2785, shopName: 'Market Burdujeni', category: 'grocery' }),
    offer({ id: 'expirata', lat: 47.6515, lng: 26.2557, expiresAt: inMinutes(-5) }),
  ];
  async findActive() {
    return this.offers.filter((o) => Date.parse(o.expiresAt) > Date.now());
  }
  async findActiveById(id: string) {
    return (await this.findActive()).find((o) => o.id === id) ?? null;
  }
}

class MemoryUsers implements UserContextStore {
  users = new Map<string, UserContext>();
  async upsert(c: UserContext) {
    this.users.set(c.userId, c);
  }
  async get(id: string) {
    return this.users.get(id);
  }
  async recent() {
    return [...this.users.values()];
  }
}

/** Citește evenimente SSE până la `count` mesaje de tip "message". */
async function readSse(url: string, count: number, signal: AbortSignal): Promise<AINotification[]> {
  const res = await fetch(url, { signal, headers: { Accept: 'text/event-stream' } });
  expect(res.status).toBe(200);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const out: AINotification[] = [];
  let buffer = '';
  while (out.length < count) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const event = /^event: (.*)$/m.exec(block)?.[1] ?? 'message';
      const data = /^data: (.*)$/m.exec(block)?.[1];
      if (event === 'message' && data) out.push(JSON.parse(data) as AINotification);
    }
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('ai-map-notification (e2e)', () => {
  let app: INestApplication;
  let base: string;
  let offers: MemoryOffers;

  beforeAll(async () => {
    offers = new MemoryOffers();
    const moduleRef = await Test.createTestingModule({
      imports: [AiMapNotificationModule],
      controllers: [OffersController],
      providers: [{ provide: OffersService, useValue: {} }],
    })
      .overrideProvider(OFFERS_REPOSITORY)
      .useValue(offers)
      .overrideProvider(USER_CONTEXT_STORE)
      .useValue(new MemoryUsers())
      .compile();

    app = moduleRef.createNestApplication({ logger: ['error'] });
    // La fel ca în src/main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.setGlobalPrefix('api');
    await app.listen(0);
    base = `http://localhost:${(app.getHttpServer().address() as AddressInfo).port}/api`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /offers/nearby: oferte active în rază, sortate, în wrapper-ul { success, data }', async () => {
    const res = await fetch(`${base}/offers/nearby?lat=${SUCEAVA.lat}&lng=${SUCEAVA.lng}&radius=2000`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: NearbyOfferDto[] };
    expect(body.success).toBe(true);
    expect(body.data.map((o) => o.id)).toEqual(['brutarie', 'cofetarie']); // fără „departe” (~3 km) și „expirata”
    expect(body.data[0]).toMatchObject({ shopName: 'Brutăria Cuptorul Bucovinei', lat: 47.6517, lng: 26.2551 });
  });

  it('GET /offers/nearby nu e prins de /offers/:id și validează parametrii', async () => {
    const res = await fetch(`${base}/offers/nearby?lat=abc&lng=1`);
    expect(res.status).toBe(400);
  });

  it('GET /recommendations: preferința e prima, doar oferte reale', async () => {
    const res = await fetch(`${base}/recommendations?userId=u-rec&lat=${SUCEAVA.lat}&lng=${SUCEAVA.lng}&preferences=pastry`);
    const { data } = (await res.json()) as { data: AINotification[] };
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toMatchObject({ type: 'preference', offerId: 'cofetarie' });
    expect(data.every((r) => ['brutarie', 'cofetarie'].includes(r.offerId!))).toBe(true);
  });

  it('POST /notifications/location respinge corpuri invalide', async () => {
    const res = await fetch(`${base}/notifications/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', lat: 200, lng: 26, preferences: ['pizza'] }),
    });
    expect(res.status).toBe(400);
  });

  it('SSE: locație → notificare; reducere de preț → notificare nouă; fără duplicate', async () => {
    const aborter = new AbortController();
    const received = readSse(`${base}/notifications/stream?userId=u1`, 3, aborter.signal);
    await sleep(200);

    const loc = await fetch(`${base}/notifications/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', ...SUCEAVA, preferences: ['bakery'] }),
    });
    expect(loc.status).toBe(202);
    await sleep(200);

    const watcher = app.get(ProximityWatcherService);

    // O ofertă nouă în apropiere (ca după POST /offers)
    offers.offers.push(offer({ id: 'noua', lat: 47.6516, lng: 26.2558, shopName: 'Brutăria de la colț' }));
    expect(await watcher.onOfferSaved('noua')).toBe(1);
    await sleep(20);

    // Aceeași ofertă, editată fără reducere: nu se notifică
    const same = { discountedPrice: 10, itemsLeft: 5, status: 'ACTIVE' };
    expect(await watcher.onOfferSaved('noua', same, { ...same, itemsLeft: 4 })).toBe(0);

    // Prețul scade: se notifică din nou
    offers.offers.find((o) => o.id === 'noua')!.priceDiscounted = 6;
    expect(await watcher.onOfferSaved('noua', same, { ...same, discountedPrice: 6 })).toBe(1);

    const events = await received;
    aborter.abort();

    expect(events.map((e) => e.offerId)).toEqual(['brutarie', 'noua', 'noua']);
    expect(events[2].discountedPrice).toBe(6);
    // SSE-ul nu trece prin wrapper: datele sunt notificarea, nu { success, data }
    expect(events[0]).not.toHaveProperty('success');
  });
});
