import React from 'react';
import { Plus, Trash2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import type { OfferProduct } from '../../../types';
import type { PartnerUser } from '../../../types/auth';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';

export interface DashboardProductsProps {
  products: OfferProduct[];
  onAddProductClick: () => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenAIStockUpdate: () => void;
}

export const DashboardProducts: React.FC<DashboardProductsProps> = ({
  products,
  onAddProductClick,
  onUpdateStock,
  onDeleteProduct,
  onOpenAIStockUpdate,
}) => {
  const { user } = useAuth();
  const partner = user as PartnerUser | null;

  const totalStock = products.reduce((acc, curr) => acc + curr.itemsLeft, 0);
  const revenueDisplay = partner?.activeRevenueRon
    ? `${partner.activeRevenueRon.toFixed(2)} RON`
    : '246.00 RON';

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header Panou Partener */}
      <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-8 border border-[#E4E7E5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAF2EC] text-[#30634E] text-xs font-bold mb-2">
            Panou Partener Vânzător
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#232A27]">
            Management Stocuri & Surplus
          </h1>
          <p className="text-xs sm:text-sm text-[#636965]">
            {partner?.businessName || 'Magazin Partener'} · {partner?.address || partner?.city || 'Iași, România'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="secondary"
            onClick={onOpenAIStockUpdate}
            leftIcon={<Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#30634E] shrink-0" />}
            className="w-full sm:w-auto !h-10 sm:!h-11 md:!h-12 !px-3 sm:!px-4 md:!px-5 !gap-1.5 sm:!gap-2"
          >
            <span className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">
              <span className="inline sm:hidden">Actualizare AI</span>
              <span className="hidden sm:inline">Actualizare rapidă AI</span>
            </span>
          </Button>
          <Button
            variant="primary"
            onClick={onAddProductClick}
            leftIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
            className="w-full sm:w-auto !h-10 sm:!h-11 md:!h-12 !px-3 sm:!px-4 md:!px-5 !gap-1.5 sm:!gap-2"
          >
            <span className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">
              <span className="inline sm:hidden">Adaugă manual</span>
              <span className="hidden sm:inline">Adaugă produs manual</span>
            </span>
          </Button>
        </div>
      </div>

      {/* Statistici Impact Partener */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-5 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <span className="text-[11px] sm:text-xs font-medium text-[#636965] block truncate">Stoc total activ</span>
          <span className="text-lg sm:text-2xl font-bold text-[#30634E] mt-1 block">{totalStock} pachete</span>
          <span className="text-[10px] sm:text-[11px] text-[#30634E] flex items-center gap-1 mt-1 font-semibold truncate">
            <TrendingUp className="w-3 h-3 shrink-0" /> în {products.length} oferte
          </span>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <span className="text-[11px] sm:text-xs font-medium text-[#636965] block truncate">Bani recuperați</span>
          <span className="text-lg sm:text-2xl font-bold text-[#232A27] mt-1 block">{revenueDisplay}</span>
          <span className="text-[10px] sm:text-[11px] text-[#636965] mt-1 block truncate">Surplus monetizat</span>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <span className="text-[11px] sm:text-xs font-medium text-[#636965] block truncate">Mâncare salvată</span>
          <span className="text-lg sm:text-2xl font-bold text-[#232A27] mt-1 block">14.2 kg</span>
          <span className="text-[10px] sm:text-[11px] text-[#30634E] font-semibold mt-1 block truncate">Emisii CO₂ evitate</span>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <span className="text-[11px] sm:text-xs font-medium text-[#636965] block truncate">Rating clienți</span>
          <span className="text-lg sm:text-2xl font-bold text-[#232A27] mt-1 block">{partner?.store?.rating ? partner.store.rating.toFixed(1) : '4.9'} / 5.0</span>
          <span className="text-[10px] sm:text-[11px] text-[#636965] mt-1 block truncate">Scor partener</span>
        </div>
      </div>

      {/* Gestiune Produse Active */}
      <div className="bg-white rounded-[16px] border border-[#E4E7E5] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E4E7E5] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-base sm:text-lg font-bold text-[#232A27]">
            Oferte curente pe hartă ({products.length})
          </h2>
          <span className="text-xs text-[#636965]">
            Modificările de stoc se sincronizează instantaneu în baza de date
          </span>
        </div>

        {/* 1. Vizualizare Carduri pe Mobil (< 768px) */}
        <div className="block md:hidden divide-y divide-[#F5F6F4]">
          {products.map((item) => (
            <div key={item.id} className="p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-14 h-14 rounded-[12px] object-cover shrink-0 border border-[#E4E7E5]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-[#232A27] line-clamp-1">
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(item.id)}
                      className="p-1 text-[#636965] hover:text-[#B94330] rounded-md transition-colors cursor-pointer shrink-0"
                      title="Șterge ofertă"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#30634E] bg-[#DAF2EC] px-1.5 py-0.5 rounded">
                      {item.categoryLabel}
                    </span>
                    <span className="text-xs text-[#636965] truncate">
                      {item.pickupWindow}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-bold text-sm text-[#30634E]">
                      RON {item.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#636965] line-through">
                      RON {item.originalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control stoc pe mobil */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F5F6F4]">
                <span className="text-xs font-semibold text-[#636965]">
                  Stoc disponibil:
                </span>
                <div className="inline-flex items-center gap-2 bg-[#F5F6F4] rounded-[10px] p-1 border border-[#E4E7E5]">
                  <button
                    type="button"
                    onClick={() => onUpdateStock(item.id, Math.max(0, item.itemsLeft - 1))}
                    disabled={item.itemsLeft <= 0}
                    className="w-7 h-7 rounded-md bg-white text-[#232A27] font-bold text-sm flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 cursor-pointer shadow-2xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-[#232A27]">
                    {item.itemsLeft}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateStock(item.id, item.itemsLeft + 1)}
                    className="w-7 h-7 rounded-md bg-white text-[#232A27] font-bold text-sm flex items-center justify-center hover:bg-gray-100 cursor-pointer shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Vizualizare Tabel pe Desktop & Tabletă (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F5F6F4] bg-[#F5F6F4]/50 text-xs font-semibold text-[#636965] uppercase tracking-wider">
                <th className="py-3 px-4">Produs / Pachet</th>
                <th className="py-3 px-4">Categorie</th>
                <th className="py-3 px-4">Preț Întreg / Redus</th>
                <th className="py-3 px-4">Interval ridicare</th>
                <th className="py-3 px-4 text-center">Stoc disponibil</th>
                <th className="py-3 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F6F4] text-sm">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F6F4]/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 rounded-[10px] object-cover shrink-0 border border-[#E4E7E5]"
                      />
                      <div>
                        <span className="font-semibold text-[#232A27] block">
                          {item.title}
                        </span>
                        <span className="text-xs text-[#636965] line-clamp-1 max-w-xs">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-xs text-[#636965]">
                    {item.categoryLabel}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-[#30634E]">
                        RON {item.discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#636965] line-through">
                        RON {item.originalPrice.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#636965]">
                    {item.pickupWindow}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#F5F6F4] rounded-[10px] p-1 border border-[#E4E7E5]">
                      <button
                        type="button"
                        onClick={() => onUpdateStock(item.id, Math.max(0, item.itemsLeft - 1))}
                        disabled={item.itemsLeft <= 0}
                        className="w-7 h-7 rounded-md bg-white text-[#232A27] font-bold text-sm flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 cursor-pointer shadow-2xs"
                      >
                        -
                      </button>
                      <span className="w-8 font-bold text-sm text-[#232A27]">
                        {item.itemsLeft}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateStock(item.id, item.itemsLeft + 1)}
                        className="w-7 h-7 rounded-md bg-white text-[#232A27] font-bold text-sm flex items-center justify-center hover:bg-gray-100 cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(item.id)}
                      className="p-2 text-[#636965] hover:text-[#B94330] rounded-lg hover:bg-[#FDE5E0]/50 transition-colors cursor-pointer"
                      title="Șterge ofertă"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-8 text-center text-[#636965]">
            <AlertCircle className="w-8 h-8 mx-auto text-[#636965]/50 mb-2" />
            Nu ai nicio ofertă activă pentru magazinul tău. Folosește butonul de sus pentru a adăuga surplusul de azi!
          </div>
        )}
      </div>
    </div>
  );
};