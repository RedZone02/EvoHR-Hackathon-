import React, { useState } from 'react';
import { MapPin, Navigation, Store as StoreIcon } from 'lucide-react';
import type { OfferProduct } from '../../types';
import { OfferCard } from '../../components/cards/OfferCard';
import { Button } from '../../components/ui/Button';

export interface MapViewProps {
  offers: OfferProduct[];
  onReserve: (offer: OfferProduct) => void;
  onToggleFavorite: (offerId: string) => void;
  favorites: string[];
}

export const MapView: React.FC<MapViewProps> = ({
  offers,
  onReserve,
  onToggleFavorite,
  favorites,
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offers[0]?.id || '');

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  // Coordonate aerisite pe canvasul hărții stilizate din Iași (evită suprapunerea pe orice ecran)
  const pinPositions: Record<string, { top: string; left: string; neighborhood: string }> = {
    'offer-1': { top: '24%', left: '30%', neighborhood: 'Copou · Bd. Carol I' },
    'offer-2': { top: '46%', left: '22%', neighborhood: 'Centru · Str. Lăpușneanu' },
    'offer-3': { top: '64%', left: '72%', neighborhood: 'Palas Mall · Zona Food' },
    'offer-4': { top: '26%', left: '74%', neighborhood: 'Independenței · Piața Unirii' },
  };

  return (
    <div
      id="map-view-container"
      className="relative w-full rounded-[20px] overflow-hidden border border-[#E4E7E5] bg-[#EBF2EE] shadow-inner flex flex-col md:flex-row h-[480px] sm:h-[540px] md:h-[620px] text-left animate-fadeIn"
    >
      {/* 1. Container Canvas Hartă Interactivă */}
      <div className="relative w-full h-full flex-1 overflow-hidden select-none">
        {/* Grilă și străzi proporționale stilizate cu viewBox SVG fluid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-45"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 500"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#30634E" strokeWidth="0.5" strokeOpacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {/* Străzi principale din Iași (Bd. Carol I, Ștefan cel Mare, Independenței) */}
          <path d="M -50 180 C 180 150, 320 280, 650 240" fill="none" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
          <path d="M 220 -50 C 260 200, 340 320, 380 550" fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" />
          <path d="M 50 360 C 220 320, 420 400, 620 380" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />

          {/* Parcuri / Zone verzi (Copou, Grădina Botanică) */}
          <rect x="18%" y="12%" width="110" height="85" rx="16" fill="#DAF2EC" fillOpacity="0.8" />
          <text x="20%" y="19%" fill="#30634E" fontSize="10" fontWeight="bold">Parcul Copou</text>

          {/* Ansamblul Palas */}
          <rect x="64%" y="54%" width="110" height="80" rx="16" fill="#DAF2EC" fillOpacity="0.8" />
          <text x="66%" y="62%" fill="#30634E" fontSize="10" fontWeight="bold">Palas Iași</text>
        </svg>

        {/* Indicator locație utilizator (Punct verde/auriu pulsant în centru) */}
        <div
          className="absolute z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ top: '50%', left: '50%' }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#30634E]/20 animate-ping absolute" />
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#30634E] text-white flex items-center justify-center shadow-md border-2 border-white">
            <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current rotate-45" />
          </div>
          <span className="absolute top-6 sm:top-7 bg-white/95 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-[#30634E] shadow-xs whitespace-nowrap border border-[#E4E7E5]">
            Locația ta (Iași)
          </span>
        </div>

        {/* Pin-uri oferte pe hartă */}
        {offers.map((offer) => {
          const pos = pinPositions[offer.id] || { top: '50%', left: '50%', neighborhood: 'Iași' };
          const isSelected = offer.id === selectedOffer?.id;

          return (
            <div
              key={offer.id}
              onClick={() => setSelectedOfferId(offer.id)}
              className="absolute z-25 cursor-pointer -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 active:scale-95"
              style={{ top: pos.top, left: pos.left }}
            >
              <div
                className={`
                  flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full shadow-md font-bold text-[10px] sm:text-xs transition-all duration-200
                  ${isSelected
                    ? 'bg-[#30634E] text-white scale-105 ring-3 ring-[#DAF2EC]'
                    : 'bg-white text-[#232A27] hover:bg-[#F5F6F4] border border-[#E4E7E5]'
                  }
                `}
              >
                <StoreIcon className="w-3 h-3 shrink-0" />
                <span className="whitespace-nowrap font-black">{offer.discountedPrice.toFixed(0)} lei</span>
                <span className={`text-[9px] px-1 rounded-sm ${isSelected ? 'bg-white/20' : 'bg-[#FDE5E0] text-[#B94330]'}`}>
                  -{offer.discountPercentage}%
                </span>
              </div>
              <div
                className={`w-2 h-2 mx-auto rotate-45 -mt-1 ${
                  isSelected ? 'bg-[#30634E]' : 'bg-white border-r border-b border-[#E4E7E5]'
                }`}
              />
            </div>
          );
        })}

        {/* Legenda hărții compactă în colțul stânga-sus */}
        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-[10px] border border-[#E4E7E5] shadow-xs text-left max-w-[170px] sm:max-w-[220px]">
          <span className="text-[11px] sm:text-xs font-bold text-[#232A27] flex items-center gap-1.5">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#30634E]" /> Hartă magazine Iași
          </span>
          <p className="text-[10px] text-[#636965] hidden sm:block mt-0.5">
            Apasă pe un pin pentru a vedea oferta.
          </p>
        </div>

        {/* 2. Card Flotant pe Mobil (< 768px): Lasă harta 100% vizibilă și accesibilă */}
        {selectedOffer && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 block md:hidden bg-white/98 backdrop-blur-md p-2.5 sm:p-3 rounded-[16px] border border-[#E4E7E5] shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[#F5F6F4]">
                <img
                  src={selectedOffer.imageUrl}
                  alt={selectedOffer.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-[#B94330] text-white text-[9px] font-black px-1 rounded">
                  -{selectedOffer.discountPercentage}%
                </span>
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase text-[#30634E] truncate">
                    {selectedOffer.storeName}
                  </span>
                  <span className="text-[10px] text-[#636965] shrink-0">
                    {selectedOffer.distanceText}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#232A27] truncate">
                  {selectedOffer.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-[#232A27]">
                      RON {selectedOffer.discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-[#636965] line-through">
                      RON {selectedOffer.originalPrice.toFixed(0)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserve(selectedOffer);
                    }}
                    className="!h-7 !px-3 !text-[11px] font-bold"
                  >
                    Rezervă
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Panou Lateral Desktop (>= 768px): Card complet dedicat */}
      <div className="hidden md:flex md:w-[360px] bg-white border-l border-[#E4E7E5] p-4 flex-col justify-center items-center overflow-y-auto">
        <div className="w-full">
          <div className="text-left mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#636965]">
              Ofertă selectată pe hartă
            </span>
            <div className="text-xs text-[#30634E] font-medium">
              {pinPositions[selectedOffer?.id]?.neighborhood || 'Iași, România'}
            </div>
          </div>

          {selectedOffer && (
            <div className="flex justify-center">
              <OfferCard
                offer={selectedOffer}
                onReserve={onReserve}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.includes(selectedOffer.id)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
