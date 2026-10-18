// Test rapid end-to-end: pornește modulul cu date demo și verifică toate endpoint-urile.
// Implicit folosește șabloanele (fără cost). SMOKE_REAL_AI=1 apelează Claude cu ANTHROPIC_API_KEY.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { NestFactory } from '@nestjs/core';
import type { AINotification, Offer } from '../contracts';
import { DevAppModule } from './app.module';

if (process.env.SMOKE_REAL_AI !== '1') process.env.AI_DISABLED = '1';
process.env.NOTIFY_COOLDOWN_MS = '1';

const SUCEAVA = { lat: 47.6514, lng: 26.2556 };

/** Citește evenimente SSE până la `count` mesaje de tip "message". */
async function readSse(url: string, count: number, signal: AbortSignal): Promise<AINotification[]> {
  const res = await fetch(url, { signal, headers: { Accept: 'text/event-stream' } });
  assert.equal(res.status, 200, 'SSE status');
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

const withTimeout = <T>(p: Promise<T>, ms: number, what: string): Promise<T> =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`timeout: ${what}`)), ms))]);

async function main(): Promise<void> {
  const app = await NestFactory.create(DevAppModule, { logger: ['error', 'warn'] });
  await app.listen(0);
  const { port } = app.getHttpServer().address() as AddressInfo;
  const base = `http://localhost:${port}`;
  const aborter = new AbortController();

  try {
    // 1. Proximitate
    const nearby = (await (await fetch(`${base}/offers/nearby?lat=${SUCEAVA.lat}&lng=${SUCEAVA.lng}&radius=2000`)).json()) as Offer[];
    assert.ok(nearby.length >= 3, 'ar trebui să existe oferte demo în 2 km');
    assert.ok(nearby.every((o, i) => i === 0 || nearby[i - 1].distanceM <= o.distanceM), 'sortate după distanță');
    assert.ok(!nearby.some((o) => o.id === 'sv-4'), 'Burdujeni (~3 km) e în afara razei');
    console.log(`✓ /offers/nearby: ${nearby.map((o) => `${o.shopName} ${o.distanceM}m`).join(', ')}`);

    const bad = await fetch(`${base}/offers/nearby?lat=abc&lng=1`);
    assert.equal(bad.status, 400, 'lat invalid → 400');
    console.log('✓ /offers/nearby validează parametrii (400)');

    // 2. Recomandări la cerere
    const recs = (await (
      await fetch(`${base}/recommendations?userId=u1&lat=${SUCEAVA.lat}&lng=${SUCEAVA.lng}&preferences=pastry`)
    ).json()) as AINotification[];
    assert.ok(recs.length > 0, 'recomandări');
    assert.equal(recs[0].type, 'preference', 'preferința (patiserie) e prima');
    assert.ok(recs.every((r) => nearby.some((o) => o.id === r.offerId)), 'doar oferte reale');
    console.log('✓ /recommendations:');
    for (const r of recs) console.log(`    [${r.type}] ${r.title} — ${r.message}`);

    // 3. SSE: locație → notificare, apoi ofertă nouă → notificare
    const received = readSse(`${base}/notifications/stream?userId=u1`, 2, aborter.signal);
    await new Promise((r) => setTimeout(r, 200)); // lasă stream-ul să se conecteze

    const loc = await fetch(`${base}/notifications/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', ...SUCEAVA, preferences: ['bakery'] }),
    });
    assert.equal(loc.status, 202);
    await new Promise((r) => setTimeout(r, process.env.SMOKE_REAL_AI === '1' ? 15_000 : 300));

    const published = (await (
      await fetch(`${base}/dev/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'Croissant cu vanilie', category: 'bakery' }),
      })
    ).json()) as { notified: number };
    assert.equal(published.notified, 1, 'clientul conectat, în rază, primește oferta nouă');

    const events = await withTimeout(received, 60_000, 'SSE');
    assert.equal(events.length, 2);
    assert.notEqual(events[0].offerId, events[1].offerId, 'fără duplicate');
    console.log('✓ /notifications/stream:');
    for (const e of events) console.log(`    [${e.type}] ${e.title} — ${e.message}`);

    console.log('\nSMOKE OK');
  } finally {
    aborter.abort();
    await app.close();
  }
}

main().catch((err: unknown) => {
  console.error('SMOKE FAILED:', err);
  process.exit(1);
});
