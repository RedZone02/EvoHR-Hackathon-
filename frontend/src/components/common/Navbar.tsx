import React from 'react';
import { Heart, Compass, ShoppingBag, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { ClientUser } from '../../types/auth';

export type NavigationTab = 'explore' | 'favorites' | 'orders' | 'profile';

export interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  favoritesCount: number;
  ordersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
  ordersCount,
}) => {
  const { user, role, logout, openAuthModal } = useAuth();
  const client = role === 'CLIENT' ? (user as ClientUser) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E7E5] shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Rândul principal de sus */}
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
          {/* Logo & Brand Name */}
          <div
            onClick={() => onSelectTab('explore')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group text-left shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[12px] bg-[#30634E] text-[#DAF2EC] flex items-center justify-center font-extrabold text-base sm:text-lg shadow-xs group-hover:bg-[#275240] transition-colors shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#232A27]">
                  SaveBite
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#DAF2EC] text-[#30634E] shrink-0">
                  Iași
                </span>
              </div>
              <p className="text-[11px] text-[#636965] font-medium hidden md:block truncate">
                Mai puțină risipă. Mai mult bine.
              </p>
            </div>
          </div>

          {/* Navigare Desktop (apare doar pe ecrane largi lg: 1024px+, unde este spațiu amplu) */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-semibold transition-colors cursor-pointer
                ${currentTab === 'explore'
                  ? 'bg-[#DAF2EC] text-[#30634E]'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-[#F5F6F4]'
                }
              `}
            >
              <Compass className="w-4 h-4" />
              <span>Explorează</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('favorites')}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-semibold transition-colors cursor-pointer relative
                ${currentTab === 'favorites'
                  ? 'bg-[#DAF2EC] text-[#30634E]'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-[#F5F6F4]'
                }
              `}
            >
              <Heart className="w-4 h-4" />
              <span>Favorite</span>
              {favoritesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#B94330] text-white text-[11px] flex items-center justify-center font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('orders')}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-semibold transition-colors cursor-pointer relative
                ${currentTab === 'orders'
                  ? 'bg-[#DAF2EC] text-[#30634E]'
                  : 'text-[#636965] hover:text-[#232A27] hover:bg-[#F5F6F4]'
                }
              `}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Comenzile mele</span>
              {ordersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#30634E] text-white text-[11px] flex items-center justify-center font-bold">
                  {ordersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zona Dreapta: Avatar Profil / Deconectare sau Buton Autentificare */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Utilizator conectat */}
            {client ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Buton cerc profil */}
                <button
                  type="button"
                  onClick={() => onSelectTab('profile')}
                  title={`Profil: ${client.name}`}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs shrink-0
                    ${currentTab === 'profile'
                      ? 'bg-[#30634E] text-white ring-2 ring-[#DAF2EC]'
                      : 'bg-[#DAF2EC] text-[#30634E] hover:bg-[#c3ecdf]'
                    }
                  `}
                >
                  {client.name.charAt(0).toUpperCase()}
                </button>

                {/* Buton Sign Out */}
                <button
                  type="button"
                  onClick={logout}
                  title="Ieșire din cont"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-[#636965] hover:text-[#B94330] hover:bg-[#FDE5E0]/50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('client')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[12px] bg-[#30634E] text-white hover:bg-[#275240] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DAF2EC]" />
                <span>Autentificare</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-navigare integrată pentru ecrane < 1024px (Mobile & Tablete) */}
        {/* Folosește un grid cu 3 coloane egale - nu există posibilitatea ca un element să iasă în afara ecranului! */}
        <div className="grid grid-cols-3 lg:hidden border-t border-[#F5F6F4] py-1 gap-0.5 sm:gap-1 w-full">
          <button
            type="button"
            onClick={() => onSelectTab('explore')}
            className={`
              flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-0.5 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-colors cursor-pointer min-w-0
              ${currentTab === 'explore' ? 'bg-[#DAF2EC] text-[#30634E] font-bold' : 'text-[#636965] hover:bg-[#F5F6F4]'}
            `}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Explorează</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('favorites')}
            className={`
              flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-0.5 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-colors cursor-pointer relative min-w-0
              ${currentTab === 'favorites' ? 'bg-[#DAF2EC] text-[#30634E] font-bold' : 'text-[#636965] hover:bg-[#F5F6F4]'}
            `}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Favorite</span>
            {favoritesCount > 0 && (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#B94330] text-white text-[8px] sm:text-[9px] flex items-center justify-center font-bold shrink-0">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className={`
              flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-0.5 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-colors cursor-pointer relative min-w-0
              ${currentTab === 'orders' ? 'bg-[#DAF2EC] text-[#30634E] font-bold' : 'text-[#636965] hover:bg-[#F5F6F4]'}
            `}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Comenzi</span>
            {ordersCount > 0 && (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#30634E] text-white text-[8px] sm:text-[9px] flex items-center justify-center font-bold shrink-0">
                {ordersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
