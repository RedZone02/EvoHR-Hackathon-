import React from 'react';
import { Heart } from 'lucide-react';
import type { OfferProduct } from '../../../types';
import { OfferCard } from '../../../components/cards/OfferCard';
import { EmptyState } from '../../../components/ui/EmptyState';

export interface FavoritesPageProps {
  offers: OfferProduct[];
  favorites: string[];
  onReserve: (offer: OfferProduct) => void;
  onToggleFavorite: (offerId: string) => void;
  onExplore: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  offers,
  favorites,
  onReserve,
  onToggleFavorite,
  onExplore,
}) => {
  const favoriteOffers = offers.filter((o) => favorites.includes(o.id));

  return (
    <div className="space-y-6 pb-12 text-left">
      <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E4E7E5] shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#FDE5E0] text-[#B94330] flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#232A27]">
              Magazine & Oferte Favorite
            </h1>
            <p className="text-sm text-[#636965]">
              Primești notificări prioritare când localurile tale preferate adaugă pachete noi.
            </p>
          </div>
        </div>
      </div>

      {favoriteOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-stretch">
          {favoriteOffers.map((offer) => (
            <div key={offer.id} className="flex justify-center">
              <OfferCard
                offer={offer}
                onReserve={onReserve}
                onToggleFavorite={onToggleFavorite}
                isFavorite={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nu ai salvat încă nicio ofertă favorită"
          description="Apasă pe inimioara de pe cardurile din lista de explorare pentru a urmări brutăriile și restaurantele tale favorite."
          actionText="Descoperă oferte acum"
          onAction={onExplore}
        />
      )}
    </div>
  );
};
