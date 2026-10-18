import React, { useState } from 'react';
import { MapPin, Search, Map as MapIcon, Grid, Sparkles, X } from 'lucide-react';
import type { OfferProduct } from '../../types';
import { OfferCard } from '../../components/cards/OfferCard';
import { FilterChip } from '../../components/ui/FilterChip';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { OffersMap } from '../../components/map/OffersMap';

import { LandingHero } from '../../components/client/LandingHero';

export interface ExplorePageProps {
  offers: OfferProduct[];
  onReserve: (offer: OfferProduct) => void;
  onToggleFavorite: (offerId: string) => void;
  favorites: string[];
  onOpenAIModal: () => void;
  unreadAiAlertsCount?: number;
  isGuest?: boolean;
  onOpenClientAuth?: () => void;
  onOpenPartnerAuth?: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  offers,
  onReserve,
  onToggleFavorite,
  favorites,
  onOpenAIModal,
  unreadAiAlertsCount = 0,
  isGuest = false,
  onOpenClientAuth = () => {},
  onOpenPartnerAuth = () => {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const categories = [
    { id: 'all', label: 'Toate' },
    { id: 'bakery', label: 'Brutării' },
    { id: 'restaurant', label: 'Restaurante' },
    { id: 'pastry', label: 'Patiserii' },
    { id: 'grocery', label: 'Alimente' },
  ];

  const filteredOffers = offers.filter((offer) => {
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const query = searchLocation.trim().toLowerCase();
    const matchesSearch =
      !query ||
      offer.title.toLowerCase().includes(query) ||
      offer.storeName.toLowerCase().includes(query) ||
      offer.categoryLabel.toLowerCase().includes(query) ||
      offer.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 text-left">
      {/* 1. Hero Diferențiat: Landing Page pentru Vizitatori vs. Dashboard Personalizat pentru Clienți Conectați */}
      {isGuest ? (
        <LandingHero
          onOpenClientAuth={onOpenClientAuth}
          onOpenPartnerAuth={onOpenPartnerAuth}
          onExploreClick={() => {
            const el = document.getElementById('explore-catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      ) : (
        <section className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E4E7E5] shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DAF2EC] text-[#30634E] text-[11px] font-bold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30634E] animate-pulse" />
                Surplus alimentar salvat astăzi în Iași
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#232A27] tracking-tight">
                Mâncare bună, aproape.
              </h1>
              <p className="text-xs sm:text-sm text-[#636965] mt-1 leading-normal">
                Brutării și restaurante locale pun la reducere produse proaspete rămase nevândute.
              </p>
            </div>

            {/* Butoane Acțiuni Header */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenAIModal}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#DAF2EC]" />}
                className="flex-1 sm:flex-initial relative"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>Alerte AI</span>
                  {unreadAiAlertsCount > 0 && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DAF2EC] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DAF2EC]" />
                    </span>
                  )}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const nextMode = viewMode === 'grid' ? 'map' : 'grid';
                  setViewMode(nextMode);
                  if (nextMode === 'map') {
                    setTimeout(() => {
                      document.getElementById('map-view-container')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }
                }}
                leftIcon={viewMode === 'grid' ? <MapIcon className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
                className="flex-1 sm:flex-initial"
              >
                {viewMode === 'grid' ? 'Hartă' : 'Listă'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Bară Căutare & Filtre Integrată */}
      <section id="explore-catalog" className="bg-white rounded-[16px] p-3.5 sm:p-4 border border-[#E4E7E5] shadow-xs space-y-3">
        {/* Input căutare + Switch alertă proximitate */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#30634E] pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Caută magazin sau zonă în Iași..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-[12px] border border-[#E4E7E5] text-xs sm:text-sm text-[#232A27] placeholder:text-[#636965] placeholder:truncate focus:outline-none focus:border-[#30634E] focus:ring-2 focus:ring-[#30634E]/20"
            />
            {searchLocation ? (
              <button
                type="button"
                onClick={() => setSearchLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636965] hover:text-[#232A27] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#636965] pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2.5">
            <ToggleSwitch
              checked={alertsEnabled}
              onChange={setAlertsEnabled}
              label="Alerte proximitate"
            />

            
          </div>
        </div>

        {/* Chips categorii scrollabile orizontal */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F5F6F4] min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full min-w-0">
            {categories.map((cat) => (
              <FilterChip
                key={cat.id}
                label={cat.label}
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>

          <div className="hidden lg:block text-xs font-semibold text-[#636965] shrink-0 whitespace-nowrap pl-2">
            {filteredOffers.length} {filteredOffers.length === 1 ? 'ofertă' : 'oferte'}
          </div>
        </div>
      </section>

      {/* 3. Conținut: Hartă sau Grilă Carduri (Fiecare card se adaptează automat la lățimea celulei) */}
      {viewMode === 'map' ? (
        <OffersMap />
      ) : filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onReserve={onReserve}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(offer.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nu sunt oferte disponibile pentru această căutare"
          description="Încearcă să resetezi căutarea sau alege o altă categorie pentru a vedea surplusul disponibil în Iași."
          actionText="Resetează filtrele"
          onAction={() => {
            setSelectedCategory('all');
            setSearchLocation('');
          }}
        />
      )}
    </div>
  );
};
