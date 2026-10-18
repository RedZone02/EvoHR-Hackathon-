import React, { createContext, useContext, useState } from 'react';
import type { AuthUser, ClientUser, PartnerUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | 'GUEST';
  loginAsClient: (custom?: Partial<ClientUser>) => void;
  loginAsPartner: (custom?: Partial<PartnerUser>) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (tab?: 'client' | 'partner') => void;
  closeAuthModal: () => void;
  authModalDefaultTab: 'client' | 'partner';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CLIENT: ClientUser = {
  id: 'usr-client-1',
  name: 'Alexandru Popa',
  email: 'alexandru.popa@gmail.com',
  role: 'CLIENT',
  phone: '0740 123 456',
  neighborhood: 'Copou, Iași',
  savedBagsCount: 12,
};

const DEMO_PARTNER: PartnerUser = {
  id: 'usr-partner-1',
  representativeName: 'Mihai Dumitrescu',
  businessName: 'Brutăria Cuptorul Fermecat SRL',
  category: 'bakery',
  categoryLabel: 'Brutărie Artizanală',
  email: 'parteneri@cuptorulfermecat.ro',
  role: 'PARTNER',
  cui: 'RO39281740',
  storeId: 'store-1',
  address: 'Bulevardul Carol I, Nr. 14, Copou',
  city: 'Iași',
  isOpenForPickup: true,
  activeRevenueRon: 246.00,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implicit vizitatorii noi încep neautentificați (GUEST) pentru a vedea Landing Page-ul și ofertele
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('savebite_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'client' | 'partner'>('client');

  const role = user ? user.role : 'GUEST';

  const loginAsClient = (custom?: Partial<ClientUser>) => {
    const fullUser: ClientUser = { ...DEMO_CLIENT, ...custom };
    setUser(fullUser);
    try {
      sessionStorage.setItem('savebite_user', JSON.stringify(fullUser));
    } catch {}
    setIsAuthModalOpen(false);
  };

  const loginAsPartner = (custom?: Partial<PartnerUser>) => {
    const fullUser: PartnerUser = { ...DEMO_PARTNER, ...custom };
    setUser(fullUser);
    try {
      sessionStorage.setItem('savebite_user', JSON.stringify(fullUser));
    } catch {}
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('savebite_user');
    } catch {}
  };

  const openAuthModal = (tab: 'client' | 'partner' = 'client') => {
    setAuthModalDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loginAsClient,
        loginAsPartner,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalDefaultTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
