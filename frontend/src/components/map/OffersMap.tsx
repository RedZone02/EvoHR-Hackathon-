import React, { useEffect, useState } from 'react';
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

export const OffersMap: React.FC<OffersMapProps> = ({
  radius = 20000,
  searchQuery = '',
  
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

  // Filtrare oferte pe hartă după căutare (nume partener, produs)
  const filteredOffers = offers.filter((offer) => {
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

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden border border-[#E4E7E5] h-[480px] sm:h-[540px] md:h-[620px] shadow-xs">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {filteredOffers.map((offer) => (
          <Marker key={offer.id} position={[offer.lat, offer.lng]}>
            <Popup>
              <div className="text-left p-1 space-y-1 text-xs">
                <div className="font-bold text-sm text-[#30634E] flex items-center gap-1">
                  🏪 {offer.shopName}
                </div>
                <div className="font-semibold text-[#232A27]">{offer.product}</div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="font-bold text-sm text-[#232A27]">
                    RON {offer.priceDiscounted.toFixed(2)}
                  </span>
                  <span className="line-through text-[#636965] text-[11px]">
                    RON {offer.priceOriginal.toFixed(2)}
                  </span>
                </div>
                <div className="text-[#30634E] font-medium text-[11px] bg-[#DAF2EC] px-2 py-0.5 rounded-md inline-block mt-1">
                  Valabil încă: {formatTimeRemaining(offer.expiresAt)}
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
        {filteredOffers.length} {filteredOffers.length === 1 ? 'partener pe hartă' : 'parteneri pe hartă'}
      </div>
    </div>
  );
};