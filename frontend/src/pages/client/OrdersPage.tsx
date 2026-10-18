import React from 'react';
import { ShoppingBag, Clock, MapPin, CheckCircle2, RotateCw } from 'lucide-react';
import type { Reservation } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';

export interface OrdersPageProps {
  reservations: Reservation[];
  onExplore: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  reservations,
  onExplore,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="space-y-6 pb-12 text-left">
      <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-8 border border-[#E4E7E5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#232A27]">
              Comenzile și Rezervările Tale
            </h1>
            <p className="text-xs sm:text-sm text-[#636965]">
              Arată codul de ridicare la casa magazinului în intervalul orar menționat.
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold text-[#30634E] bg-[#DAF2EC] hover:bg-[#c6ecdf] transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-60"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizează status</span>
          </button>
        )}
      </div>

      {reservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((item) => {
            const statusUpper = (item.status || '').toUpperCase();
            const isCollected = statusUpper === 'COLLECTED';
            const isCancelled = statusUpper === 'CANCELLED';

            return (
              <div
                key={item.id}
                className={`rounded-[16px] p-5 border shadow-xs space-y-3 transition-all ${
                  isCollected
                    ? 'bg-[#F9FAF9] border-[#E4E7E5] opacity-80'
                    : 'bg-white border-[#A2DEC7] ring-1 ring-[#30634E]/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
                        isCollected
                          ? 'bg-[#E4E7E5] text-[#636965]'
                          : isCancelled
                          ? 'bg-[#FDE5E0] text-[#B94330]'
                          : 'bg-[#DAF2EC] text-[#30634E]'
                      }`}
                    >
                      {isCollected
                        ? 'Predat clientului · Finalizat'
                        : isCancelled
                        ? 'Rezervare anulată'
                        : 'Gata de ridicare la casă'}
                    </span>
                    <h3 className="font-bold text-lg text-[#232A27] mt-1.5 truncate">
                      {item.offerTitle}
                    </h3>
                    <p className="text-xs text-[#636965] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#30634E] shrink-0" /> {item.storeName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-[#232A27]">
                      RON {item.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#636965] block">
                      {isCollected ? 'Achitat la casă' : 'Plată la ridicare'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-[12px] bg-[#F5F6F4] flex items-center justify-between text-xs">
                  <span className="text-[#636965] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#30634E]" />
                    Interval ridicare:
                  </span>
                  <strong className="text-[#232A27] font-semibold">{item.pickupWindow}</strong>
                </div>

                <div className="pt-2 border-t border-[#F5F6F4] flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-[#636965] block text-[11px]">Cod ridicare:</span>
                    <strong className="font-mono text-base font-extrabold tracking-wider text-[#30634E] bg-[#DAF2EC] px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                      {item.pickupCode || `#${item.id.slice(-6).toUpperCase()}`}
                    </strong>
                  </div>

                  {isCollected ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#30634E] bg-[#DAF2EC]/60 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-[#30634E]" /> Ridicat & Predat
                    </span>
                  ) : isCancelled ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B94330] bg-[#FDE5E0] px-2.5 py-1 rounded-full">
                      Anulat
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B94330] bg-[#FDE5E0] px-2.5 py-1 rounded-full animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-[#B94330]" /> În așteptare la casă
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nu ai nicio rezervare activă"
          description="Când rezervi o pungă cu bunătăți de la brutării sau restaurante, detaliile și codul de ridicare vor apărea aici."
          actionText="Găsește oferte aproape"
          onAction={onExplore}
        />
      )}
    </div>
  );
};