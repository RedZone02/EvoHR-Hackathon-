import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../lib/leafletIcon';
import type { Offer } from '../../types/offer';
import { fetchNearbyOffers } from '../../lib/api';

// Coordonate implicite: Iași, România (Palatul Culturii / Centru)
const IASI: LatLngTuple = [47.1654, 27.5765];

export interface OffersMapProps {
  radius?: number; // metri
  searchQuery?: string;
  selectedCategory?: string;
}

const categoryLabels: Record<string, string> = {
  bakery: 'Brutărie',
  restaurant: 'Restaurant',
  pastry: 'Patiserie',
  grocery: 'Alimente & Băcănie',
  cafe: 'Cafenea',
};

const minutesUntil = (iso: string): number =>
  Math.max(0, Math.round((Date.parse(iso) - Date.now()) / 60000));

const formatTimeRemaining = (iso: string): string => {
  const mins = minutesUntil(iso);
  if (mins >= 1440) {
    const days = Math.floor(mins / 1440);
    return days === 1 ? '1 zi' : `${days} zile`;
  }
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours} ore`;
  }
  return `${mins} min`;
};

// `center` din MapContainer e imutabil după montare, deci re-centrăm manual.
const Recenter: React.FC<{ center: LatLngTuple }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [map, center]);
  return null;
};

interface PartnerPin {
  shopName: string;
  category?: string;
  lat: number;
  lng: number;
  distanceM: number;
  offers: Offer[];
}

export const OffersMap: React.FC<OffersMapProps> = ({
  radius = 20000,
  searchQuery = '',
  selectedCategory = 'all',
}) => {
  const [center, setCenter] = useState<LatLngTuple>(IASI);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => setCenter(IASI),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchNearbyOffers(center[0], center[1], radius, controller.signal)
      .then((data) => {
        setOffers(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Nu am putut încărca ofertele de pe hartă.');
      });
    return () => controller.abort();
  }, [center, radius]);

  // Filtrare oferte pe hartă după categorie selectată și text căutare
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // 1. Filtrare categorie (brutării, restaurante, patiserii, alimente)
      if (selectedCategory && selectedCategory !== 'all') {
        if (offer.category && offer.category !== selectedCategory) {
          return false;
        }
      }

      // 2. Filtrare text căutare (nume partener, produs)
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const normalize = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const normQ = normalize(q);
      return (
        normalize(offer.shopName).includes(normQ) ||
        normalize(offer.product).includes(normQ)
      );
    });
  }, [offers, selectedCategory, searchQuery]);

  // Grupăm ofertele pe parteneri / locații fizice unice pe hartă
  // Astfel prevenim suprapunerea pin-urilor pentru același magazin ce are mai multe oferte active
  const partnerPins = useMemo<PartnerPin[]>(() => {
    const map = new Map<string, PartnerPin>();
    for (const offer of filteredOffers) {
      const key = `${offer.shopName}_${offer.lat}_${offer.lng}`;
      if (!map.has(key)) {
        map.set(key, {
          shopName: offer.shopName,
          category: offer.category,
          lat: offer.lat,
          lng: offer.lng,
          distanceM: offer.distanceM,
          offers: [],
        });
      }
      map.get(key)!.offers.push(offer);
    }
    return Array.from(map.values());
  }, [filteredOffers]);

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden border border-[#E4E7E5] h-[480px] sm:h-[540px] md:h-[620px] shadow-xs">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {partnerPins.map((pin) => (
          <Marker key={`${pin.shopName}_${pin.lat}_${pin.lng}`} position={[pin.lat, pin.lng]}>
            <Popup>
              <div className="text-left p-1 space-y-2 text-xs min-w-[220px] max-w-[280px]">
                {/* Header Partener */}
                <div className="flex items-center justify-between gap-2 border-b border-[#E4E7E5] pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#30634E] bg-[#DAF2EC] px-1.5 py-0.5 rounded">
                    {categoryLabels[pin.category || ''] || 'Partener'}
                  </span>
                  <span className="text-[10px] text-[#636965] font-medium">
                    {pin.distanceM} m
                  </span>
                </div>

                <div className="font-bold text-sm text-[#232A27]">
                  🏪 {pin.shopName}
                </div>

                {/* Subtitlu oferte disponibile */}
                <div className="text-[11px] font-semibold text-[#636965]">
                  {pin.offers.length} {pin.offers.length === 1 ? 'ofertă disponibilă' : 'oferte disponibile'}:
                </div>

                {/* Lista pachete/oferte la acest partener */}
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-0.5">
                  {pin.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-2 rounded-lg bg-[#F8FAF9] border border-[#E4E7E5] space-y-1"
                    >
                      <div className="font-semibold text-xs text-[#232A27]">{offer.product}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm text-[#30634E]">
                          RON {offer.priceDiscounted.toFixed(2)}
                        </span>
                        <span className="line-through text-[#636965] text-[11px]">
                          RON {offer.priceOriginal.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[#636965] text-[10px]">
                        Valabil încă:{' '}
                        <span className="font-medium text-[#232A27]">
                          {formatTimeRemaining(offer.expiresAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {error && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] text-xs text-[#B94330] bg-white/95 px-3 py-2 rounded-[10px] border border-[#E4E7E5]">
          {error}
        </div>
      )}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-[#30634E] border border-[#E4E7E5] shadow-xs">
        {partnerPins.length} {partnerPins.length === 1 ? 'partener pe hartă' : 'parteneri pe hartă'}
        {filteredOffers.length > 0 && ` (${filteredOffers.length} ${filteredOffers.length === 1 ? 'ofertă' : 'oferte'})`}
      </div>
    </div>
  );
};