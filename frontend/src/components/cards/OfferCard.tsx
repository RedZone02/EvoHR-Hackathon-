import React from 'react';
import { MapPin, Clock, Heart } from 'lucide-react';
import type { OfferProduct } from '../../types';
import { Button } from '../ui/Button';
import { DiscountBadge, ExpireBadge } from '../ui/Badge';

export interface OfferCardProps {
  offer: OfferProduct;
  onReserve: (offer: OfferProduct) => void;
  onToggleFavorite?: (offerId: string) => void;
  isFavorite?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onReserve,
  onToggleFavorite,
  isFavorite = false,
}) => {
  return (
    <article className="group bg-white rounded-[16px] border border-[#E4E7E5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col w-full h-full text-left">
      {/* Imagine produs + Badges */}
      <div className="relative h-44 w-full bg-[#F5F6F4] overflow-hidden">
        <img
          src={offer.imageUrl}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badge reducere (-40%) */}
        <div className="absolute top-3 left-3 z-10">
          <DiscountBadge percentage={offer.discountPercentage} />
        </div>

        {/* Buton favorite */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(offer.id);
            }}
            aria-label={isFavorite ? 'Șterge din favorite' : 'Adaugă la favorite'}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#232A27] hover:text-[#B94330] transition-colors shadow-xs cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isFavorite ? 'fill-[#B94330] text-[#B94330]' : 'text-[#636965]'
              }`}
            />
          </button>
        )}
      </div>

      {/* Corp Card */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        {/* Metadate: Categorie & Distanță */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#636965] uppercase tracking-wider text-[11px]">
            {offer.categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-[#30634E] font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {offer.distanceText}
          </span>
        </div>

        {/* Titlu și descriere */}
        <div>
          <h3 className="font-semibold text-lg text-[#232A27] leading-snug line-clamp-1 group-hover:text-[#30634E] transition-colors">
            {offer.title}
          </h3>
          <p className="text-xs text-[#636965] leading-relaxed mt-1 line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Badge expirare */}
        <div className="pt-1">
          <ExpireBadge minutesLeft={offer.expiresInMinutes} />
        </div>

        {/* Interval ridicare */}
        <div className="flex items-center gap-1.5 text-xs text-[#636965] pt-0.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>ridicare {offer.pickupWindow}</span>
        </div>

        {/* Preț & Stoc */}
        <div className="pt-2 border-t border-[#F5F6F4] flex items-baseline justify-between flex-wrap gap-1.5">
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-lg sm:text-xl font-bold text-[#232A27]">
              RON {offer.discountedPrice.toFixed(2)}
            </span>
            <span className="text-xs text-[#636965] line-through">
              RON {offer.originalPrice.toFixed(2)}
            </span>
          </div>

          <span className="text-xs font-medium text-[#636965] shrink-0">
            {offer.itemsLeft} {offer.itemsLeft === 1 ? 'pungă rămasă' : 'pungi rămase'}
          </span>
        </div>

        {/* CTA Buton Rezervă */}
        <div className="pt-1">
          <Button
            variant="primary"
            fullWidth
            onClick={() => onReserve(offer)}
            disabled={offer.itemsLeft === 0}
          >
            {offer.itemsLeft > 0 ? 'Rezervă punga' : 'Stoc epuizat'}
          </Button>
        </div>
      </div>
    </article>
  );
};
