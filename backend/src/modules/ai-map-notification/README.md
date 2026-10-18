# ai-map-notification

Modul NestJS pentru **hartă, proximitate, notificări și recomandări AI**. Se importă în backend-ul principal; nu e un server separat.

## Ce expune

| Endpoint | Ce face |
|---|---|
| `GET /offers/nearby?lat&lng&radius` | Oferte active în rază (metri, implicit 2000, maxim 20000), sortate după distanță. |
| `GET /notifications/stream?userId` | Stream SSE cu notificări pentru un client (`AINotification` JSON). |
| `POST /notifications/location` | `{ userId, lat, lng, preferences }`: salvează locația; dacă e o ofertă nouă în apropiere, trimite o notificare pe SSE. |
| `GET /recommendations?userId&lat&lng&preferences` | Până la 4 recomandări AI (pentru modalul „Recomandări AI” din frontend). |

`preferences` = categorii: `bakery`, `restaurant`, `grocery`, `cafe`, `pastry`.

## Integrare în backend

```ts
import { AiMapNotificationsModule } from '../ai-map-notification/src';

@Module({
  imports: [
    AiMapNotificationsModule.forRoot({
      offersRepository: DbOffersRepository,      // implementează OffersRepository
      userContextStore: DbUserContextStore,      // opțional, implicit în memorie
      imports: [TypeOrmModule.forFeature([...])], // ce le trebuie repository-urilor
    }),
  ],
})
export class AppModule {}
```

Fără `offersRepository`, modulul folosește date demo din Suceava.

**Ce trebuie implementat** (în [src/data/ports.ts](src/data/ports.ts)):

- `OffersRepository.findActive(): Promise<OfferRecord[]>`: produsele publicate, cu stoc. Câmpurile sunt `id, storeId, shopName, product, category, priceOriginal, priceDiscounted, lat, lng, expiresAt`.
- `UserContextStore` (opțional): `upsert / get / all` pentru locația și preferințele clienților.

**Când un partener publică sau reduce un produs**, apelează:

```ts
constructor(private readonly watcher: ProximityWatcherService) {}
await this.watcher.onOfferPublished(offerRecord); // notifică clienții din apropiere
```

**Configurare:** `ANTHROPIC_API_KEY` în `.env` (vezi [.env.example](.env.example)) și CORS pentru originea frontend-ului: `app.enableCors({ origin: 'http://localhost:5173' })`.

## Cum funcționează AI-ul

- [src/ai/ai-recommender.service.ts](src/ai/ai-recommender.service.ts) trimite la Claude (`claude-opus-5-5`, efort `low`) preferințele clientului și cele mai potrivite 8 oferte din apropiere.
- Primește înapoi JSON validat cu zod: `offerId, type, title, message`, în română.
- Ofertele inventate de model sunt eliminate. Rezultatele stau în cache 5 minute.
- Dacă nu există cheie, API-ul dă eroare sau modelul refuză, se folosesc mesaje-șablon. Notificările merg oricum.
- Fallback-ul server-side pentru refuzuri este activat (`fallbacks: 'default'`).
- Anti-spam: maxim o notificare per ofertă per client (6 h) și o pauză între notificări (`NOTIFY_COOLDOWN_MS`). AI-ul e apelat doar pentru clienții conectați la SSE.

## Dezvoltare

```bash
npm install
npm run smoke   # pornește modulul cu date demo și testează toate endpoint-urile (fără AI)
SMOKE_REAL_AI=1 ANTHROPIC_API_KEY=... npm run smoke   # același test, cu Claude
npm run dev     # server local pe :3000; POST /dev/offers simulează o ofertă nouă
```
