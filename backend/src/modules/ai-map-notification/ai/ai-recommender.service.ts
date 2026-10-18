import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import type { AINotification, NearbyOffer, ProductCategory, UserContext } from '../contracts';
import { discountPercent, formatDistance, minutesUntil } from '../proximity/geo';

const MODEL = 'claude-opus-5-5';
const MAX_CANDIDATES = 8;
const FLASH_SALE_MINUTES = 45;
const CACHE_TTL_MS = 5 * 60_000;

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bakery: 'brutărie',
  restaurant: 'restaurant',
  grocery: 'băcănie',
  cafe: 'cafenea',
  pastry: 'patiserie',
};

const PREFERENCE_HOOKS: Record<ProductCategory, string> = {
  bakery: 'Îți plac produsele de brutărie?',
  restaurant: 'Poftă de mâncare gătită?',
  grocery: 'Ai nevoie de produse proaspete?',
  cafe: 'Chef de o gustare la cafenea?',
  pastry: 'Îți plac deserturile?',
};

const RecommendationsSchema = z.object({
  recommendations: z.array(
    z.object({
      offerId: z.string(),
      type: z.enum(['proximity', 'preference', 'flash_sale']),
      title: z.string(),
      message: z.string(),
    }),
  ),
});

const SYSTEM_PROMPT = `Ești asistentul unei aplicații din România care salvează mâncarea de la risipă: magazine, brutării și restaurante locale pun la reducere produse aproape de expirare sau rămase nevândute.

Primești un client (preferințele lui de categorii) și o listă de oferte reale din apropiere, cu distanța, prețurile și minutele rămase până la expirare. Alegi cele mai potrivite oferte și scrii pentru fiecare o notificare scurtă, în limba română, cu diacritice.

Reguli:
- Folosește doar ofertele primite, cu offerId-ul exact. Nu inventa produse, prețuri sau magazine.
- Ordinea: întâi potrivirea cu preferințele, apoi distanța mică, apoi urgența (expiră curând).
- type: "preference" dacă oferta e dintr-o categorie preferată, "flash_sale" dacă expiră în cel mult ${FLASH_SALE_MINUTES} de minute, altfel "proximity".
- title: maxim 50 de caractere. message: maxim 140 de caractere, ton prietenos, numește magazinul, produsul și prețul redus în lei; poți menționa distanța sau reducerea.
- Exemplu de message: „La brutăria de lângă tine, croissantul cu vanilie e acum redus la 10 lei.”
- Returnează cel mult numărul de recomandări cerut.`;

export interface RecommendOptions {
  /** Câte notificări să întoarcă (cel mult). */
  max: number;
  /** Contextul care a declanșat cererea; ajustează tonul. */
  trigger: 'location' | 'new_offer' | 'on_demand';
}

@Injectable()
export class AiRecommenderService {
  private readonly logger = new Logger(AiRecommenderService.name);
  private readonly cache = new Map<string, { expires: number; value: AINotification[] }>();
  private client: Anthropic | null = null;

  /** Recomandări personalizate pentru un client, generate de Claude (cu fallback pe șabloane). */
  async recommend(
    user: UserContext,
    offers: NearbyOffer[],
    options: RecommendOptions,
  ): Promise<AINotification[]> {
    const candidates = this.rankCandidates(user, offers).slice(0, MAX_CANDIDATES);
    if (candidates.length === 0 || options.max <= 0) return [];

    const cacheKey = this.cacheKey(user, candidates, options);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.value;

    const fromAi = await this.fromClaude(user, candidates, options);
    const value = fromAi ?? this.fromTemplates(user, candidates, options.max);
    this.logger.log(`${value.length} recomandări pentru ${user.userId} (${fromAi ? 'Claude' : 'șablon'})`);
    this.cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, value });
    this.pruneCache();
    return value;
  }

  /** Mesaje deterministe, folosite când AI-ul nu e disponibil. */
  fromTemplates(user: UserContext, candidates: NearbyOffer[], max: number): AINotification[] {
    return candidates.slice(0, max).map((offer) => {
      const type = this.classify(user, offer);
      const minutes = minutesUntil(offer.expiresAt);
      const pct = discountPercent(offer.priceOriginal, offer.priceDiscounted);
      const price = this.formatLei(offer.priceDiscounted);
      const distance = formatDistance(offer.distanceM);

      // Formulări de tip „X: produs la Y lei”, ca să evităm acordul gramatical cu numele produsului.
      const byType = {
        preference: {
          title: 'Recomandare pe gustul tău',
          message: `${PREFERENCE_HOOKS[offer.category]} La ${offer.shopName} (${distance}): ${offer.product}, acum ${price} (-${pct}%).`,
        },
        flash_sale: {
          title: 'Ultima șansă!',
          message: `La ${offer.shopName} (${distance}): ${offer.product} la doar ${price}. Mai ai ${minutes} min.`,
        },
        proximity: {
          title: 'Ofertă lângă tine!',
          message: `La ${offer.shopName}, la ${distance} de tine: ${offer.product} redus la ${price}.`,
        },
      } as const;

      return this.toNotification(offer, type, byType[type].title, byType[type].message);
    });
  }

  private async fromClaude(
    user: UserContext,
    candidates: NearbyOffer[],
    options: RecommendOptions,
  ): Promise<AINotification[] | null> {
    if (process.env.AI_DISABLED === '1') return null;

    const now = Date.now();
    const payload = {
      cerere: {
        numarMaximRecomandari: options.max,
        declansator: options.trigger,
      },
      client: {
        categoriiPreferate: user.preferences.map((c) => CATEGORY_LABELS[c]),
      },
      oferte: candidates.map((o) => ({
        offerId: o.id,
        magazin: o.shopName,
        produs: o.product,
        categorie: CATEGORY_LABELS[o.category],
        pretInitialLei: o.priceOriginal,
        pretRedusLei: o.priceDiscounted,
        reducereProcent: discountPercent(o.priceOriginal, o.priceDiscounted),
        distantaMetri: o.distanceM,
        minuteRamase: minutesUntil(o.expiresAt, now),
      })),
    };

    try {
      const response = await this.getClient().beta.messages.parse({
        model: MODEL,
        max_tokens: 4000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {
          effort: 'low',
          format: betaZodOutputFormat(RecommendationsSchema),
        },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: JSON.stringify(payload) }],
      });

      if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
        this.logger.warn(`Claude stop_reason=${response.stop_reason}; folosesc șabloane.`);
        return null;
      }
      const parsed = response.parsed_output;
      if (!parsed) return null;

      const byId = new Map(candidates.map((o) => [o.id, o]));
      const seen = new Set<string>();
      const result: AINotification[] = [];
      for (const rec of parsed.recommendations) {
        const offer = byId.get(rec.offerId);
        if (!offer || seen.has(offer.id)) continue; // ignoră oferte inventate sau duplicate
        seen.add(offer.id);
        result.push(this.toNotification(offer, rec.type, rec.title.trim(), rec.message.trim()));
        if (result.length >= options.max) break;
      }
      return result.length > 0 ? result : null;
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        this.logger.warn('ANTHROPIC_API_KEY lipsește sau e invalid; folosesc șabloane.');
      } else if (error instanceof Anthropic.RateLimitError) {
        this.logger.warn('Limită de rată Claude atinsă; folosesc șabloane.');
      } else if (error instanceof Anthropic.APIError) {
        this.logger.warn(`Eroare Claude API ${error.status}: ${error.message}`);
      } else {
        this.logger.warn(`Recomandarea AI a eșuat: ${error instanceof Error ? error.message : String(error)}`);
      }
      return null;
    }
  }

  private getClient(): Anthropic {
    // Creat la prima folosire, ca modulul să pornească și fără cheie (atunci merg șabloanele).
    this.client ??= new Anthropic({ timeout: 30_000, maxRetries: 1 });
    return this.client;
  }

  /** Preferințele întâi, apoi cele mai apropiate. */
  private rankCandidates(user: UserContext, offers: NearbyOffer[]): NearbyOffer[] {
    const prefs = new Set(user.preferences);
    return [...offers].sort((a, b) => {
      const pa = prefs.has(a.category) ? 0 : 1;
      const pb = prefs.has(b.category) ? 0 : 1;
      return pa - pb || a.distanceM - b.distanceM;
    });
  }

  private classify(user: UserContext, offer: NearbyOffer): AINotification['type'] {
    if (user.preferences.includes(offer.category)) return 'preference';
    if (minutesUntil(offer.expiresAt) <= FLASH_SALE_MINUTES) return 'flash_sale';
    return 'proximity';
  }

  private toNotification(
    offer: NearbyOffer,
    type: AINotification['type'],
    title: string,
    message: string,
  ): AINotification {
    return {
      id: `notif-${offer.id}-${Date.now().toString(36)}`,
      type,
      title,
      message,
      storeName: offer.shopName,
      distance: formatDistance(offer.distanceM),
      timestamp: 'acum',
      offerId: offer.id,
      discountedPrice: offer.priceDiscounted,
    };
  }

  private formatLei(value: number): string {
    return `${Number.isInteger(value) ? value : value.toFixed(2)} lei`;
  }

  private cacheKey(user: UserContext, candidates: NearbyOffer[], options: RecommendOptions): string {
    // Distanța rotunjită la 100 m: mișcările mici nu golesc cache-ul. Prețul intră în cheie: o reducere nouă = mesaj nou.
    const offers = candidates
      .map((o) => `${o.id}@${Math.round(o.distanceM / 100)}:${o.priceDiscounted}`)
      .join(',');
    return `${user.userId}|${[...user.preferences].sort().join(',')}|${options.max}|${options.trigger}|${offers}`;
  }

  private pruneCache(): void {
    if (this.cache.size < 500) return;
    const now = Date.now();
    for (const [key, entry] of this.cache) if (entry.expires <= now) this.cache.delete(key);
  }
}
