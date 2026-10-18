import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { OfferProduct } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export interface AddProductProps {
  onBack: () => void;
  onSaveProduct: (product: OfferProduct) => void;
}

export const AddProduct: React.FC<AddProductProps> = ({
  onBack,
  onSaveProduct,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'bakery' | 'restaurant' | 'grocery' | 'pastry'>('bakery');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(20.00);
  const [discountedPrice, setDiscountedPrice] = useState<number>(10.00);
  const [itemsLeft, setItemsLeft] = useState<number>(3);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(60);
  const [pickupWindow, setPickupWindow] = useState('azi: 17:00 - 19:30');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=80');

  const discountPercentage = Math.round(((originalPrice - discountedPrice) / (originalPrice || 1)) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const categoryLabels: Record<string, string> = {
      bakery: 'Brutărie',
      restaurant: 'Restaurant',
      grocery: 'Alimente',
      pastry: 'Patiserie',
    };

    const newOffer: OfferProduct = {
      id: `offer-${Date.now()}`,
      storeId: 'store-1',
      storeName: 'Brutăria Cuptorul Fermecat',
      category,
      categoryLabel: categoryLabels[category] || 'Brutărie',
      distanceText: '350 m',
      distanceMeters: 350,
      title,
      description: description || 'Pachet proaspăt salvat de la risipă.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=80',
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      discountPercentage,
      itemsLeft: Number(itemsLeft),
      expiresInMinutes: Number(expiresInMinutes),
      pickupWindow,
      isFavorite: false,
    };

    onSaveProduct(newOffer);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 text-left">
      {/* Header navigare înapoi */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#30634E] hover:text-[#275240] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Înapoi la catalogul de produse
        </button>
      </div>

      {/* Formular adăugare manuală */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[20px] p-4 sm:p-6 md:p-8 border border-[#E4E7E5] shadow-xs space-y-4 sm:space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#232A27]">
            Detalii ofertă surplus alimentar
          </h2>
          <p className="text-xs text-[#636965] mt-0.5">
            Completează datele pachetului salvat pentru clienții din proximitate
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Nume pachet / Titlu ofertă *"
            placeholder="Ex: Punga brutarului cu produse asortate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-[#232A27]">
                Categorie magazin
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="h-12 px-4 rounded-[12px] border border-[#E4E7E5] bg-white text-base text-[#232A27] focus:outline-none focus:border-[#30634E] focus:ring-2 focus:ring-[#30634E]/20"
              >
                <option value="bakery">Brutărie</option>
                <option value="pastry">Patiserie / Cofetărie</option>
                <option value="restaurant">Restaurant / Mâncare caldă</option>
                <option value="grocery">Băcănie / Alimente proaspete</option>
              </select>
            </div>

            <Input
              label="Interval orar de ridicare"
              placeholder="Ex: azi: 17:00 - 19:30"
              value={pickupWindow}
              onChange={(e) => setPickupWindow(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="number"
              step="0.5"
              label="Preț inițial (RON) *"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
              required
            />

            <Input
              type="number"
              step="0.5"
              label="Preț redus (RON) *"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
              required
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-[#232A27]">
                Reducere calculată
              </label>
              <div className="h-12 px-4 rounded-[12px] bg-[#FDE5E0] text-[#B94330] font-bold flex items-center justify-center text-lg">
                -{discountPercentage}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              min="1"
              label="Număr pachete / stoc *"
              value={itemsLeft}
              onChange={(e) => setItemsLeft(parseInt(e.target.value) || 1)}
              required
            />

            <Input
              type="number"
              min="5"
              label="Expiră în (minute)"
              value={expiresInMinutes}
              onChange={(e) => setExpiresInMinutes(parseInt(e.target.value) || 60)}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-[#232A27]">
              Descriere conținut pachet
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Conține 2 pâini artizanale cu maia și 3 croissante coapte azi-dimineață..."
              className="w-full p-3 rounded-[12px] border border-[#E4E7E5] text-sm text-[#232A27] focus:outline-none focus:border-[#30634E] focus:ring-2 focus:ring-[#30634E]/20"
            />
          </div>

          <Input
            label="URL Poză de prezentare"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-[#E4E7E5] flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base"
          >
            Anulează
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Check className="w-4 h-4 shrink-0" />}
            className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-bold whitespace-nowrap"
          >
            Salvează și publică oferta
          </Button>
        </div>
      </form>
    </div>
  );
};
