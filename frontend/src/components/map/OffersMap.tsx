import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../lib/leafletIcon';
import type { Offer } from '../../types/offer';
import { fetchNearbyOffers } from '../../lib/api';

// Fallback: Suceava, România
const SUCEAVA: LatLngTuple = [47.6514, 26.2556];

export interface OffersMapProps {
  radius?: number; // metri
}

const minutesUntil = (iso: string): number =>
  Math.max(0, Math.round((Date.parse(iso) - Date.now()) / 60000));

// `center` din MapContainer e imutabil după montare, deci re-centrăm manual.
const Recenter: React.FC<{ center: LatLngTuple }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [map, center]);
  return null;
};

export const OffersMap: React.FC<OffersMapProps> = ({ radius = 2000 }) => {
  const [center, setCenter] = useState<LatLngTuple>(SUCEAVA);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => setCenter(SUCEAVA),
      { enableHighAccuracy: true, timeout: 10000 },
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
        setError(err instanceof Error ? err.message : 'Nu am putut încărca ofertele.');
      });
    return () => controller.abort();
  }, [center, radius]);

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden border border-[#E4E7E5] h-[480px] sm:h-[540px] md:h-[620px]">
      <MapContainer center={center} zoom={14} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {offers.map((offer) => (
          <Marker key={offer.id} position={[offer.lat, offer.lng]}>
            <Popup>
              <div className="text-left">
                <div className="font-bold">{offer.shopName}</div>
                <div>{offer.product}</div>
                <div>
                  <span className="font-black">RON {offer.priceDiscounted.toFixed(2)}</span>{' '}
                  <span className="line-through text-[#636965]">RON {offer.priceOriginal.toFixed(2)}</span>
                </div>
                <div className="text-[#B94330]">Expiră în {minutesUntil(offer.expiresAt)} min</div>
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
    </div>
  );
};
