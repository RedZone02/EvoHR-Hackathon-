import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { INITIAL_OFFERS, INITIAL_NOTIFICATIONS } from './data/mockData';
import type { OfferProduct, AINotification, Reservation } from './types';
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

function AppContent() {
  const { role, user, openAuthModal } = useAuth();
  const [currentClientTab, setCurrentClientTab] = useState<NavigationTab>('explore');
  const [offers, setOffers] = useState<OfferProduct[]>(INITIAL_OFFERS);
  const [favorites, setFavorites] = useState<string[]>(['offer-2']);
  const [notifications] = useState<AINotification[]>(INITIAL_NOTIFICATIONS);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Rezervări active ale clientului
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'res-894120',
      offerId: 'offer-2',
      offerTitle: 'Cutie Surpriză Croissante & Pain au Chocolat',
      storeName: 'Café & Pâtisserie Délice',
      price: 14.00,
      pickupWindow: 'azi: 17:00 - 19:30',
      status: 'reserved',
      createdAt: 'Astăzi, 14:20',
    },
  ]);

  // Stare pentru Toast-uri active
  const [activeToast, setActiveToast] = useState<{
    id: string;
    type: 'success' | 'offline' | 'alert';
    title: string;
    description: string;
  } | null>(null);

  // Rezervare pachet (scade stocul, adaugă în comenzile mele și declanșează Toast)
  const handleReserve = (offerToReserve: OfferProduct) => {
    // DACĂ UTILIZATORUL ESTE VIZITATOR NEAUTENTIFICAT (GUEST):
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

    // Scădere stoc
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerToReserve.id
          ? { ...o, itemsLeft: Math.max(0, o.itemsLeft - 1) }
          : o
      )
    );

    // Creare rezervare nouă
    const newReservation: Reservation = {
      id: `res-${Math.floor(100000 + Math.random() * 900000)}`,
      offerId: offerToReserve.id,
      offerTitle: offerToReserve.title,
      storeName: offerToReserve.storeName,
      price: offerToReserve.discountedPrice,
      pickupWindow: offerToReserve.pickupWindow,
      status: 'reserved',
      createdAt: 'Chiar acum',
    };
    setReservations((prev) => [newReservation, ...prev]);

    // Notificare Toast
    setActiveToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      title: 'Punga ta este rezervată',
      description: `Deschide detaliile pentru instrucțiuni de ridicare la ${offerToReserve.storeName}. Interval: ${offerToReserve.pickupWindow}.`,
    });
  };

  // Toggle favorite
  const handleToggleFavorite = (offerId: string) => {
    // DACĂ UTILIZATORUL ESTE VIZITATOR NEAUTENTIFICAT (GUEST):
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

  // Partener: Actualizare stoc de către magazin
  const handleUpdateStock = (productId: string, newStock: number) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === productId ? { ...o, itemsLeft: newStock } : o))
    );
  };

  // Partener: Ștergere produs din catalog
  const handleDeleteProduct = (productId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== productId));
    setActiveToast({
      id: `toast-${Date.now()}`,
      type: 'alert',
      title: 'Ofertă eliminată din catalog',
      description: 'Pachetul a fost retras din feed-ul public.',
    });
  };

  // Partener: Salvare produs nou creat de magazin (manual sau AI)
  const handleSaveNewProduct = (newProduct: OfferProduct) => {
    setOffers((prev) => [newProduct, ...prev]);
    setActiveToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      title: 'Pachet publicat cu succes!',
      description: `${newProduct.title} este acum vizibil pentru clienții din proximitate.`,
    });
  };

  // ==========================================
  // DACĂ UTILIZATORUL ESTE PARTENER (MAGAZIN/RESTAURANT):
  // ==========================================
  if (role === 'PARTNER') {
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
          products={offers}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          onSaveNewProduct={handleSaveNewProduct}
        />

        <AuthModal />
      </>
    );
  }

  // ==========================================
  // DACĂ UTILIZATORUL ESTE CLIENT SAU GUEST:
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

      {/* Bară de navigare exclusiv Client */}
      <Navbar
        currentTab={currentClientTab}
        onSelectTab={setCurrentClientTab}
        favoritesCount={role === 'GUEST' ? 0 : favorites.length}
        ordersCount={role === 'GUEST' ? 0 : reservations.length}
      />

      {/* Conținut Aplicație Client / Vizitator */}
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

      {/* Modal Recomandări & Notificări AI */}
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
              Ai o brutărie sau un restaurant? Intră în SaveBite Partners
            </button>
            <span className="hidden sm:inline">·</span>
            <span className="whitespace-nowrap">© 2026 SaveBite România • EvoHR</span>
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
