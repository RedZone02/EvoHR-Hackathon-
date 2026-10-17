import React from 'react';
import { ShoppingBag, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import type { Reservation } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';


export interface OrdersPageProps {
  reservations: Reservation[];
  onExplore: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  reservations,
  onExplore,
}) => {
  return (
    <div className="space-y-6 pb-12 text-left">
      <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-8 border border-[#E4E7E5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#232A27]">
              Comenzile și Rezervările Tale
            </h1>
            <p className="text-xs sm:text-sm text-[#636965]">
              Arată codul de rezervare la casa magazinului în intervalul orar menționat.
            </p>
          </div>
        </div>
      </div>

      {reservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[16px] p-5 border border-[#E4E7E5] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#30634E] bg-[#DAF2EC] px-2 py-0.5 rounded-full">
                    Gata de ridicare
                  </span>
                  <h3 className="font-bold text-lg text-[#232A27] mt-1.5">
                    {item.offerTitle}
                  </h3>
                  <p className="text-xs text-[#636965] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#30634E]" /> {item.storeName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-[#232A27]">
                    RON {item.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#636965] block">Plată la ridicare</span>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[#F5F6F4] flex items-center justify-between text-xs">
                <span className="text-[#636965] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#30634E]" />
                  Interval ridicare:
                </span>
                <strong className="text-[#232A27] font-semibold">{item.pickupWindow}</strong>
              </div>

              <div className="pt-2 border-t border-[#F5F6F4] flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-[#636965] block">Cod rezervare:</span>
                  <strong className="font-mono text-sm tracking-wider text-[#30634E]">
                    #{item.id.slice(-6).toUpperCase()}
                  </strong>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#30634E]">
                  <CheckCircle2 className="w-4 h-4 text-[#30634E]" /> Rezervare confirmată
                </span>
              </div>
            </div>
          ))}
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
