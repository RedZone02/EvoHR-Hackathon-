import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, ClientUser, PartnerUser, UserRole } from '../types/auth';
import { apiLogin, apiRegister, apiGetMe, apiLogout, getToken } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | 'GUEST';
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemoClient: () => Promise<void>;
  loginAsDemoPartner: () => Promise<void>;
  loginAsClient: (custom?: Partial<ClientUser>) => void;
  loginAsPartner: (custom?: Partial<PartnerUser>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (tab?: 'client' | 'partner') => void;
  closeAuthModal: () => void;
  authModalDefaultTab: 'client' | 'partner';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(rawUser: any): AuthUser {
  if (rawUser.role === 'PARTNER') {
    const store = rawUser.store || {};
    return {
      ...rawUser,
      id: rawUser.id,
      email: rawUser.email,
      role: 'PARTNER',
      name: rawUser.name,
      representativeName: rawUser.name,
      businessName: store.businessName || store.name || rawUser.businessName || 'Magazin Partener',
      category: store.category || 'bakery',
      categoryLabel: store.categoryLabel || 'Brutarie locala',
      cui: store.cui || rawUser.cui || '',
      storeId: store.id || rawUser.storeId || '',
      store,
      address: store.address || '',
      city: store.city || 'Iasi',
      isOpenForPickup: store.isOpenForPickup ?? true,
      activeRevenueRon: store.activeRevenueRon ?? 0,
      phone: rawUser.phone || store.phone || '',
    } as PartnerUser;
  }

  return {
    ...rawUser,
    id: rawUser.id,
    email: rawUser.email,
    role: 'CLIENT',
    name: rawUser.name,
    phone: rawUser.phone || '',
    neighborhood: rawUser.neighborhood || 'Centru, Iasi',
    savedBagsCount: rawUser.savedBags ?? rawUser.savedBagsCount ?? 0,
    savedBags: rawUser.savedBags ?? 0,
  } as ClientUser;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('savebite_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'client' | 'partner'>('client');

  const role = user ? user.role : 'GUEST';

  // Verifica sesiunea live din backend daca exista token
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const liveUser = await apiGetMe();
        if (isMounted) {
          if (liveUser) {
            const normalized = normalizeUser(liveUser);
            setUser(normalized);
            localStorage.setItem('savebite_user', JSON.stringify(normalized));
          } else {
            setUser(null);
            localStorage.removeItem('savebite_user');
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('savebite_user');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    try {
      localStorage.setItem('savebite_user', JSON.stringify(normalized));
    } catch {}
    setIsAuthModalOpen(false);
  };

  const register = async (payload: any) => {
    const res = await apiRegister(payload);
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    try {
      localStorage.setItem('savebite_user', JSON.stringify(normalized));
    } catch {}
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    try {
      localStorage.removeItem('savebite_user');
    } catch {}
  };

  // 1-Click login cu conturile reale din baza de date
  const loginAsDemoClient = async () => {
    await login('client@savebite.ro', 'Password2026!');
  };

  const loginAsDemoPartner = async () => {
    await login('partner@cuptorulfermecat.ro', 'Password2026!');
  };

  // Compatibilitate cu apelurile existente
  const loginAsClient = () => {
    loginAsDemoClient().catch(console.error);
  };

  const loginAsPartner = () => {
    loginAsDemoPartner().catch(console.error);
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
        isLoading,
        login,
        register,
        logout,
        loginAsDemoClient,
        loginAsDemoPartner,
        loginAsClient,
        loginAsPartner,
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
