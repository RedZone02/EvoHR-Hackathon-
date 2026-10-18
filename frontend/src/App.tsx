import { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { INITIAL_OFFERS, INITIAL_NOTIFICATIONS } from './data/mockData';
import type { OfferProduct, AINotification, Reservation } from './types';
import type { PartnerUser } from './types/auth';
import { Navbar, type NavigationTab } from './components/common/Navbar';
import { ExplorePage } from './pages/client/ExplorePage';
import { FavoritesPage } from './pages/client/FavoritesPage/FavoritesPage';
import { OrdersPage } from './pages/client/OrdersPage';
import { ProfilePage } from './pages/client/ProfilePage/ProfilePage';
import { PartnerSaaSLayout } from './pages/partner/PartnerSaaSLayout';
import { AuthModal } from './components/auth/AuthModal';
import { AuthGate } from './components/auth/AuthGate';
import { AIRecommendationsModal } from './components/ai/AIRecommendationsModal';
import { Toast } from './components/ui/Toast';
import { useNotifications } from './hooks/useNotifications';
import { useLocationSync } from './hooks/useLocationSync';
import {
  fetchOffers,
  createReservation,
  fetchMyReservations,
  createOffer,
  updateOffer,
  deleteOffer,
  fetchRecommendations,
} from './lib/api';

// Id stabil pe sesiune pentru vizitatori, ca sa primeasca si ei notificari de proximitate.
const getGuestId = (): string => {
  const fresh = `guest-${Math.random().toString(36).slice(2, 10)}`;
  try {
    const saved = sessionStorage.getItem('savebite-guest-id');
    if (saved) return saved;
    sessionStorage.setItem('savebite-guest-id', fresh);
  } catch {
    // Storage blocat (mod privat): id nou la fiecare incarcare.
  }
  return fresh;
};

function AppContent() {
  const { role, user, openAuthModal } = useAuth();
  const [currentClientTab, setCurrentClientTab] = useState<NavigationTab>('explore');
  const [offers, setOffers] = useState<OfferProduct[]>(INITIAL_OFFERS);
  const [favorites, setFavorites] = useState<string[]>(['offer-2']);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Rezervari ale clientului (din backend SQL cand este autentificat)
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Stare pentru Toast-uri active
  const [activeToast, setActiveToast] = useState<{
    id: string;
    type: 'success' | 'offline' | 'alert';
    title: string;
    description: string;
  } | null>(null);

  // Incarca ofertele din baza de date la pornire
  useEffect(() => {
    let isMounted = true;
    fetchOffers()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setOffers(data);
        }
      })
      .catch((err) => {
        console.warn('Oferte backend indisponibile, fallback pe date demo:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  const reloadReservations = async () => {
    if (role !== 'CLIENT' || !user) return;
    setIsRefreshingOrders(true);
    try {
      const data = await fetchMyReservations();
      if (Array.isArray(data)) setReservations(data);
    } catch (err) {
      console.warn('Nu s-au putut prelua rezervarile:', err);
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  // Incarca rezervarile reale ale clientului cand este conectat sau cand acceseaza tab-ul orders
  useEffect(() => {
    if (role === 'CLIENT' && user) {
      reloadReservations();
    } else if (role === 'GUEST') {
      setReservations([]);
    }
  }, [role, user, currentClientTab]);

  // Proximitate + recomandari AI (doar clienti si vizitatori; partenerii nu primesc oferte)
  const [guestId] = useState(getGuestId);
  const liveUserId = role === 'PARTNER' ? null : user?.id ?? guestId;

  // Preferinte = categoriile ofertelor favorite
  const preferencesKey = [...new Set(
    offers.filter((o) => favorites.includes(o.id) && o.category !== 'all').map((o) => o.category),
  )].sort().join(',');
  const preferences = useMemo(() => (preferencesKey ? preferencesKey.split(',') : []), [preferencesKey]);

  const position = useLocationSync(liveUserId, preferences);
  const [apiRecommendations, setApiRecommendations] = useState<AINotification[] | null>(null);
  const [streamedNotifications, setStreamedNotifications] = useState<AINotification[]>([]);

  useEffect(() => {
    if (!liveUserId || !position) return;
    const controller = new AbortController();
    fetchRecommendations({ userId: liveUserId, ...position, preferences }, controller.signal)
      .then(setApiRecommendations)
      .catch(() => {
        if (!controller.signal.aborted) setApiRecommendations(null);
      });
    return () => controller.abort();
  }, [liveUserId, position, preferences]);

  // Notificari live din backend (SSE) -> Toast-ul existent + lista din modalul AI
  useNotifications(liveUserId, (message) => {
    setActiveToast({
      id: message.id,
      type: 'success',
      title: message.title,
      description: message.description ?? '',
    });
    const incoming = message.notification;
    if (incoming) setStreamedNotifications((prev) => [incoming, ...prev].slice(0, 20));
  });

  // Notificari
  const notifications = useMemo(() => {
    const seen = new Set<string>();
    return [...streamedNotifications, ...(apiRecommendations ?? INITIAL_NOTIFICATIONS)].filter((n) => {
      const key = n.offerId ?? n.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [streamedNotifications, apiRecommendations]);

  // Rezervare pachet conectata la baza de date MySQL prin backend
  const handleReserve = async (offerToReserve: OfferProduct) => {
    if (!user || role === 'GUEST') {
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'alert',
        title: 'Autentificare necesară pentru rezervare',
        description: `Pentru a rezerva „${offerToReserve.title}” și a primi codul de ridicare la casă, conectează-te sau creează un cont gratuit.`,
      });
      openAuthModal('client');
      return;
    }

    if (offerToReserve.itemsLeft <= 0) return;

    try {
      const createdRes = await createReservation(offerToReserve.id);

      // Scadere stoc local
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offerToReserve.id
            ? { ...o, itemsLeft: Math.max(0, o.itemsLeft - 1) }
            : o
        )
      );

      // Adaugare la rezervari active
      setReservations((prev) => [createdRes, ...prev]);

      // Notificare Toast cu codul real din baza de date
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        title: `Punga ta este rezervată! Cod: ${createdRes.pickupCode}`,
        description: `Arată codul "${createdRes.pickupCode}" la casa ${offerToReserve.storeName}. Interval: ${offerToReserve.pickupWindow}.`,
      });
    } catch (err: any) {
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'alert',
        title: 'Eroare la rezervare',
        description: err?.message || 'Ne pare rău, nu s-a putut salva rezervarea în baza de date.',
      });
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (offerId: string) => {
    if (!user || role === 'GUEST') {
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'alert',
        title: 'Autentificare necesară',
        description: 'Conectează-te într-un cont gratuit pentru a salva localurile și ofertele tale preferate!',
      });
      openAuthModal('client');
      return;
    }

    setFavorites((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    );
  };

  // Partener: Actualizare stoc in baza de date
  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await updateOffer(productId, { itemsLeft: newStock });
      setOffers((prev) =>
        prev.map((o) => (o.id === productId ? { ...o, itemsLeft: newStock } : o))
      );
    } catch {
      setOffers((prev) =>
        prev.map((o) => (o.id === productId ? { ...o, itemsLeft: newStock } : o))
      );
    }
  };

  // Partener: Stergere produs din baza de date
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteOffer(productId);
      setOffers((prev) => prev.filter((o) => o.id !== productId));
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'alert',
        title: 'Ofertă eliminată din baza de date',
        description: 'Pachetul a fost retras din catalogul public.',
      });
    } catch (err: any) {
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'alert',
        title: 'Eroare la ștergere',
        description: err?.message || 'Nu s-a putut șterge oferta.',
      });
    }
  };

  // Partener: Salvare produs nou in baza de date
  const handleSaveNewProduct = async (newProduct: OfferProduct) => {
    try {
      const created = await createOffer({
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category === 'all' ? 'bakery' : newProduct.category,
        categoryLabel: newProduct.categoryLabel,
        imageUrl: newProduct.imageUrl,
        originalPrice: newProduct.originalPrice,
        discountedPrice: newProduct.discountedPrice,
        itemsLeft: newProduct.itemsLeft,
        expiresInMinutes: newProduct.expiresInMinutes,
        pickupWindow: newProduct.pickupWindow,
      });

      // Mapare oferta returnata
      setOffers((prev) => [created, ...prev]);

      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        title: 'Pachet salvat în baza de date SQL!',
        description: `${newProduct.title} este acum vizibil pentru toți clienții.`,
      });
    } catch (err: any) {
      setOffers((prev) => [newProduct, ...prev]);
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        title: 'Pachet publicat!',
        description: `${newProduct.title} a fost adăugat în listă.`,
      });
    }
  };

  // ==========================================
  // DACA UTILIZATORUL ESTE PARTENER (MAGAZIN/RESTAURANT):
  // FILTRARE STRICTA: PARTENERUL ISI GESTIONEAZA DOAR PRODUSELE PROPRII
  // ==========================================
  if (role === 'PARTNER') {
    const partnerStoreId = (user as PartnerUser)?.storeId || (user as any)?.store?.id;
    const partnerProducts = partnerStoreId
      ? offers.filter((o) => o.storeId === partnerStoreId)
      : offers;

    return (
      <>
        {activeToast && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-fadeIn shadow-lg">
            <Toast
              type={activeToast.type}
              title={activeToast.title}
              description={activeToast.description}
              onClose={() => setActiveToast(null)}
            />
          </div>
        )}

        <PartnerSaaSLayout
          products={partnerProducts}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          onSaveNewProduct={handleSaveNewProduct}
        />

        <AuthModal />
      </>
    );
  }

  // ==========================================
  // DACA UTILIZATORUL ESTE CLIENT SAU GUEST:
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F4] text-[#232A27]">
      {/* Toast Notification plutitor */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-fadeIn shadow-lg">
          <Toast
            type={activeToast.type}
            title={activeToast.title}
            description={activeToast.description}
            onClose={() => setActiveToast(null)}
          />
        </div>
      )}

      {/* Bara de navigare exclusiv Client */}
      <Navbar
        currentTab={currentClientTab}
        onSelectTab={setCurrentClientTab}
        favoritesCount={role === 'GUEST' ? 0 : favorites.length}
        ordersCount={role === 'GUEST' ? 0 : reservations.length}
      />

      {/* Continut Aplicatie Client / Vizitator */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentClientTab === 'explore' && (
          <ExplorePage
            offers={offers}
            onReserve={handleReserve}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onOpenAIModal={() => setIsAiModalOpen(true)}
            unreadAiAlertsCount={notifications.length}
            isGuest={role === 'GUEST'}
            onOpenClientAuth={() => openAuthModal('client')}
            onOpenPartnerAuth={() => openAuthModal('partner')}
          />
        )}

        {currentClientTab === 'favorites' && (
          role === 'GUEST' ? (
            <AuthGate
              title="Salvează localurile și ofertele favorite"
              description="Conectează-te într-un cont gratuit pentru a adăuga brutăriile și restaurantele tale preferate din Iași și a primi notificări instant când au surplus alimentar."
              onLogin={() => openAuthModal('client')}
              onExplore={() => setCurrentClientTab('explore')}
            />
          ) : (
            <FavoritesPage
              offers={offers}
              favorites={favorites}
              onReserve={handleReserve}
              onToggleFavorite={handleToggleFavorite}
              onExplore={() => setCurrentClientTab('explore')}
            />
          )
        )}

        {currentClientTab === 'orders' && (
          role === 'GUEST' ? (
            <AuthGate
              title="Rezervările și comenzile tale active"
              description="Ca vizitator neautentificat nu ai comenzi active. Creează un cont gratuit sau conectează-te pentru a rezerva pachete delicioase și a primi codul de ridicare la casă."
              onLogin={() => openAuthModal('client')}
              onExplore={() => setCurrentClientTab('explore')}
            />
          ) : (
            <OrdersPage
              reservations={reservations}
              onExplore={() => setCurrentClientTab('explore')}
              onRefresh={reloadReservations}
              isRefreshing={isRefreshingOrders}
            />
          )
        )}

        {currentClientTab === 'profile' && (
          role === 'GUEST' ? (
            <AuthGate
              title="Profil utilizator SaveBite"
              description="Conectează-te pentru a-ți gestiona datele contului, cartierul preferat din Iași și istoricul de pungi salvate."
              onLogin={() => openAuthModal('client')}
              onExplore={() => setCurrentClientTab('explore')}
            />
          ) : (
            <ProfilePage />
          )
        )}
      </main>

      {/* Modal Recomandari & Notificari AI */}
      <AIRecommendationsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        notifications={notifications}
        onSelectOffer={(_offerId) => {
          setCurrentClientTab('explore');
        }}
      />

      {/* Modal Autentificare (Client vs Partener) */}
      <AuthModal />

      {/* Footer Consumator */}
      <footer className="mt-auto border-t border-[#E4E7E5] bg-white py-5 sm:py-6 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[#636965] text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-[#30634E] text-sm">SaveBite</span>
            <span>·</span>
            <span className="font-medium text-[#232A27]">Mai puțină risipă. Mai mult bine.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={() => openAuthModal('partner')}
              className="font-semibold text-[#30634E] hover:underline cursor-pointer"
            >
              Ai o brutărie sau un restaurant? Intră în SaveBite Partners!
            </button>
            <span className="hidden sm:inline">·</span>
            <span className="whitespace-nowrap">© 2026 SaveBite România — EvoHR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;