import React from 'react';
import { Sparkles, MapPin, Bell, ArrowRight, X } from 'lucide-react';
import type { AINotification } from '../../types';
import { Button } from '../ui/Button';

export interface AIRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AINotification[];
  onSelectOffer: (offerId?: string) => void;
}

export const AIRecommendationsModal: React.FC<AIRecommendationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectOffer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-xl border border-[#E4E7E5] text-left relative overflow-hidden">
        {/* Glow fundal */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#DAF2EC] rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#30634E] text-[#DAF2EC] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#232A27]">
                Recomandări AI Inteligente
              </h3>
              <p className="text-xs text-[#636965]">
                Alerte în timp real bazate pe proximitate și gusturile tale
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#636965] hover:bg-[#F5F6F4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zona de notificări AI */}
        <div className="flex flex-col gap-3 my-4 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 rounded-[14px] bg-[#F5F6F4] hover:bg-[#DAF2EC]/40 border border-[#E4E7E5] transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#30634E] flex items-center gap-1">
                  {notif.type === 'proximity' ? (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      Proximitate ({notif.distance})
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      Preferință potrivită
                    </>
                  )}
                </span>
                <span className="text-[#636965]">{notif.timestamp}</span>
              </div>

              <h4 className="font-semibold text-sm text-[#232A27] mb-1">
                {notif.title}
              </h4>

              <p className="text-xs text-[#636965] leading-relaxed mb-3">
                "{notif.message}"
              </p>

              <div className="flex items-center justify-between">
                {notif.discountedPrice && (
                  <span className="text-xs font-bold text-[#30634E]">
                    Doar RON {notif.discountedPrice.toFixed(2)}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onSelectOffer(notif.offerId);
                    onClose();
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Vezi oferta
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#E4E7E5] flex justify-between items-center text-xs text-[#636965]">
          <span>Radar AI activ pentru zona Iași</span>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Închide
          </Button>
        </div>
      </div>
    </div>
  );
};
