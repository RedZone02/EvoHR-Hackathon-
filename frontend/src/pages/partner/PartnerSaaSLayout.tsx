import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Sparkles,
  Plus,
  LogOut,
  CheckCircle2,
  Building2,
  Search,
  AlertCircle,
  Loader2,
  Clock,
  User,
  ShoppingBag,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import type { PartnerUser } from '../../types/auth';
import type { OfferProduct } from '../../types';
import { DashboardProducts } from '../dashboard/DashboardProducts/DashboardProducts';
import { AddProduct } from '../dashboard/AddProduct/AddProduct';
import { AIRestaurantStockParser } from '../../components/ai/AIRestaurantStockParser';
import { Button } from '../../components/ui/Button';
import { collectReservation, fetchStoreReservations, type StoreReservation } from '../../lib/api';

export interface PartnerSaaSLayoutProps {
  products: OfferProduct[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveNewProduct: (product: OfferProduct) => void;
}

export const PartnerSaaSLayout: React.FC<PartnerSaaSLayoutProps> = ({
  products,
  onUpdateStock,
  onDeleteProduct,
  onSaveNewProduct,
}) => {
  const { user, logout } = useAuth();
  const partner = user as PartnerUser;

  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'ai-staff' | 'pickups'>('products');
  const [isOpenForPickup, setIsOpenForPickup] = useState(partner?.isOpenForPickup ?? true);

  // Stare pentru validare cod ridicare
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Rezervări primite de magazin
  const [storeReservations, setStoreReservations] = useState<StoreReservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  const loadReservations = async () => {
    setIsLoadingReservations(true);
    try {
      const data = await fetchStoreReservations();
      setStoreReservations(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pickups') {
      loadReservations();
    }
  }, [activeTab]);

  const handleValidatePickup = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const raw = directCode || pickupCodeInput;
    if (!raw.trim()) return;

    setValidationError(null);
    setValidationMessage(null);
    setIsValidating(true);
    const code = raw.trim();

    try {
      const res = await collectReservation(code);
      setValidatedCode(code.toUpperCase());
      setValidationMessage(res.message || 'Comanda a fost validată cu succes în baza de date!');
      setPickupCodeInput('');
      loadReservations();
    } catch (err: any) {
      setValidationError(err?.message || 'Cod invalid sau comanda nu aparține acestui magazin.');
    } finally {
      setIsValidating(false);
    }
  };

  const pendingCount = storeReservations.filter((r) => r.status === 'RESERVED').length;

  return (
    <div className="min-h-screen bg-[#F0F2EE] text-[#232A27] flex flex-col text-left">
      {/* 1. Header Partener Magazin */}
      <header className="bg-white border-b border-[#E4E7E5] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo Panou Partener */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#30634E] text-white flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-xs shrink-0">
                S
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#232A27]">
                    SaveBite
                  </span>
                  <span className="hidden sm:inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[#232A27] text-white">
                    Partners
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#636965] truncate">
                  <span className="font-semibold text-[#232A27] truncate">
                    {partner?.businessName || 'Magazin Partener'}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">{partner?.city || 'Iași'}</span>
                </div>
              </div>
            </div>

            {/* Status deschis / închis ridicări & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Pill status compact pe ecrane mici */}
              <span className="inline-flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 bg-[#DAF2EC] text-[#30634E] border-[#A2DEC7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30634E] animate-pulse" />
                <span>Deschis</span>
              </span>

              {/* Buton status complet pe ecrane md+ */}
              <button
                type="button"
                onClick={() => setIsOpenForPickup(!isOpenForPickup)}
                className={`
                  hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border shrink-0
                  ${isOpenForPickup
                    ? 'bg-[#DAF2EC] text-[#30634E] border-[#A2DEC7]'
                    : 'bg-[#FDE5E0] text-[#B94330] border-[#F9C9C0]'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${isOpenForPickup ? 'bg-[#30634E] animate-pulse' : 'bg-[#B94330]'}`} />
                <span>{isOpenForPickup ? 'Deschis pentru ridicări' : 'Închis temporar'}</span>
              </button>

              <div className="h-6 w-px bg-[#E4E7E5] hidden md:block" />

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-[12px] text-xs font-semibold text-[#636965] hover:text-[#B94330] hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#E4E7E5] shrink-0"
                title="Deconectare din contul partener"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Deconectare</span>
              </button>
            </div>
          </div>

          {/* Cele 4 Opțiuni Centrate în Panoul de Partener */}
          <div className="grid grid-cols-2 lg:flex lg:justify-center lg:items-center gap-1.5 sm:gap-2 py-2 border-t border-[#F5F6F4] w-full max-w-2xl lg:max-w-none mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`
                flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer text-center min-w-0
                ${activeTab === 'products'
                  ? 'bg-[#30634E] text-white shadow-xs'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-white bg-[#F5F6F4]/60 lg:bg-transparent'
                }
              `}
            >
              <span className="truncate">
                <span className="inline sm:hidden">📦 Stocuri ({products.length})</span>
                <span className="hidden sm:inline">📦 Gestiune Stocuri ({products.length})</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-staff')}
              className={`
                flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer text-center min-w-0
                ${activeTab === 'ai-staff'
                  ? 'bg-[#30634E] text-white shadow-xs'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-white bg-[#F5F6F4]/60 lg:bg-transparent'
                }
              `}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DAF2EC] shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">AI Angajați</span>
                <span className="hidden sm:inline">Asistent AI Angajați</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pickups')}
              className={`
                flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer text-center min-w-0 relative
                ${activeTab === 'pickups'
                  ? 'bg-[#30634E] text-white shadow-xs'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-white bg-[#F5F6F4]/60 lg:bg-transparent'
                }
              `}
            >
              <PackageCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">Ridicări {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
                <span className="hidden sm:inline">Validare Ridicări {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
              </span>
              {pendingCount > 0 && activeTab !== 'pickups' && (
                <span className="w-2 h-2 rounded-full bg-[#B94330] absolute top-1.5 right-1.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`
                flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer text-center min-w-0
                ${activeTab === 'add'
                  ? 'bg-[#30634E] text-white shadow-xs'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-white bg-[#F5F6F4]/60 lg:bg-transparent'
                }
              `}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">Pachet manual</span>
                <span className="hidden sm:inline">Adaugă pachet manual</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Conținut B2B SaaS */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Banner Informații B2B */}
        <div className="bg-white rounded-[16px] p-3.5 sm:p-4 border border-[#E4E7E5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[#232A27] block text-xs sm:text-sm truncate">
                Panou Comerciant Autorizat · CUI: {partner?.cui || 'RO39281740'}
              </span>
              <span className="text-[#636965] block truncate">
                Punct de lucru activ: {partner?.address || 'Bd. Carol I, Nr. 14, Copou, Iași'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#636965]">Comision platformă: <strong>15%</strong></span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">SaaS Activ</span>
          </div>
        </div>

        {/* Tab 1: Catalog Stocuri */}
        {activeTab === 'products' && (
          <DashboardProducts
            products={products}
            onAddProductClick={() => setActiveTab('add')}
            onUpdateStock={onUpdateStock}
            onDeleteProduct={onDeleteProduct}
            onOpenAIStockUpdate={() => setActiveTab('ai-staff')}
          />
        )}

        {/* Tab 2: Asistent AI Angajați la încheierea turei */}
        {activeTab === 'ai-staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs max-w-4xl mx-auto space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#30634E] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Asistent AI dedicat personalului din bucătărie & vânzări</span>
              </div>
              <p className="text-[#636965] text-xs sm:text-sm">
                Scrie rapid sau rostește în limbaj liber surplusul rămas la sfârșitul zilei. Modelul AI va parsa ingredientele și va actualiza stocul magazinului tău în timp real.
              </p>
            </div>

            <AIRestaurantStockParser
              onProductGenerated={(parsed) => {
                const fullProduct: OfferProduct = {
                  id: `ai-off-${Date.now()}`,
                  storeId: partner?.storeId || 'store-1',
                  storeName: partner?.businessName || 'Magazin Partener',
                  category: (parsed.category as any) || partner?.category || 'bakery',
                  categoryLabel: parsed.categoryLabel || partner?.categoryLabel || 'Surplus Salvat',
                  distanceText: 'La sediu',
                  distanceMeters: 0,
                  title: parsed.title || 'Pachet Surplus AI',
                  description: parsed.description || 'Pachet proaspăt salvat.',
                  imageUrl: parsed.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=80',
                  originalPrice: parsed.originalPrice || 25,
                  discountedPrice: parsed.discountedPrice || 10,
                  discountPercentage: parsed.discountPercentage || 60,
                  itemsLeft: parsed.itemsLeft || 2,
                  expiresInMinutes: parsed.expiresInMinutes || 90,
                  pickupWindow: parsed.pickupWindow || 'azi: 19:30 - 21:00',
                };
                onSaveNewProduct(fullProduct);
                setActiveTab('products');
              }}
            />
          </div>
        )}

        {/* Tab 3: Validare Ridicări la Tejghea */}
        {activeTab === 'pickups' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Formular Validare Cod */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center font-bold shrink-0">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#232A27]">Validare Pachet la Tejghea</h2>
                  <p className="text-xs text-[#636965]">Introdu codul sau numărul prezentat de client la casă</p>
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#F5F6F4] border border-[#E4E7E5] space-y-3">
                <p className="text-xs text-[#636965]">
                  Acceptă atât formatul complet (ex: <strong>SB-7366</strong>), cât și doar cifrele (ex: <strong>7366</strong>).
                </p>

                <form onSubmit={handleValidatePickup} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <input
                      type="text"
                      value={pickupCodeInput}
                      onChange={(e) => setPickupCodeInput(e.target.value)}
                      placeholder="Ex: SB-7366 sau 7366"
                      className="flex-1 h-12 px-4 rounded-[12px] border border-[#E4E7E5] text-base sm:text-lg font-mono uppercase tracking-wider focus:outline-none focus:border-[#30634E] focus:ring-2 focus:ring-[#30634E]/20"
                      required
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isValidating}
                      leftIcon={isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      {isValidating ? 'Se verifică...' : 'Validează'}
                    </Button>
                  </div>
                </form>

                {validationError && (
                  <div className="mt-4 p-3 rounded-[12px] bg-[#FDE5E0] border border-[#B94330]/30 text-[#B94330] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="leading-relaxed">{validationError}</span>
                  </div>
                )}

                {validatedCode && (
                  <div className="mt-6 p-4 rounded-[14px] bg-[#DAF2EC] border border-[#30634E]/20 animate-fadeIn">
                    <div className="flex items-center gap-2 text-[#30634E] font-bold text-sm mb-2">
                      <CheckCircle2 className="w-5 h-5 text-[#30634E]" />
                      <span>Cod Validat în Baza de Date: {validatedCode}</span>
                    </div>
                    <div className="text-xs text-[#232A27] space-y-1">
                      <p>{validationMessage}</p>
                      <p className="text-[#636965]">Comanda a fost marcată ca RIDICATĂ în sistem.</p>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setValidatedCode(null);
                          setValidationMessage(null);
                        }}
                      >
                        Închide confirmarea
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listă Comenzi Live în Așteptare pentru Magazinul Tău */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#232A27]">
                    Comenzi primite pentru {partner?.businessName || 'Magazin'}
                  </h3>
                  <p className="text-xs text-[#636965]">
                    {isLoadingReservations
                      ? 'Se încarcă rezervările...'
                      : `${storeReservations.length} rezervări înregistrate în sistem`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadReservations}
                  className="text-xs font-semibold text-[#30634E] hover:underline cursor-pointer"
                >
                  Reîmprospătează
                </button>
              </div>

              {storeReservations.length === 0 ? (
                <div className="p-8 text-center rounded-[14px] bg-[#F5F6F4] text-[#636965] text-xs">
                  Nu există încă comenzi plasate pentru acest magazin.
                </div>
              ) : (
                <div className="space-y-3">
                  {storeReservations.map((res) => {
                    const isPending = res.status === 'RESERVED';
                    return (
                      <div
                        key={res.id}
                        className={`p-4 rounded-[14px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isPending
                            ? 'bg-white border-[#E4E7E5] hover:border-[#30634E]/40'
                            : 'bg-[#F5F6F4]/70 border-[#E4E7E5] opacity-75'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#30634E] bg-[#DAF2EC] px-2 py-0.5 rounded-md">
                              {res.pickupCode}
                            </span>
                            <span
                              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                                isPending
                                  ? 'bg-[#FDE5E0] text-[#B94330]'
                                  : 'bg-[#E4E7E5] text-[#636965]'
                              }`}
                            >
                              {isPending ? 'În așteptare la casă' : 'Predat clientului'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#232A27] truncate flex items-center gap-1.5 pt-0.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#30634E] shrink-0" />
                            <span>{res.offerTitle}</span>
                          </div>
                          <div className="text-[11px] text-[#636965] flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#30634E]" />
                              <strong>{res.clientName}</strong> ({res.clientPhone})
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#30634E]" />
                              {res.pickupWindow}
                            </span>
                            <span className="font-bold text-[#232A27]">
                              RON {res.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {isPending && (
                          <div className="shrink-0 pt-2 sm:pt-0">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isValidating}
                              onClick={() => handleValidatePickup(undefined, res.pickupCode)}
                              leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            >
                              Validează codul
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Formular Adăugare Manuală */}
        {activeTab === 'add' && (
          <AddProduct
            onBack={() => setActiveTab('products')}
            onSaveProduct={(prod) => {
              onSaveNewProduct(prod);
              setActiveTab('products');
            }}
          />
        )}
      </main>

      {/* Subsol B2B SaaS */}
      <footer className="mt-auto border-t border-[#E4E7E5] bg-white py-4 text-xs text-[#636965]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <span>SaveBite Partners · Portal Comercianți · Iași, România</span>
          <span>Versiune Magazin: 2.4.0-prod</span>
        </div>
      </footer>
    </div>
  );
};