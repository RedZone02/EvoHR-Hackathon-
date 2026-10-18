import React from 'react';
import { User, Bell, MapPin, ShieldCheck, Award, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import type { ClientUser } from '../../../types/auth';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const client = user as ClientUser | null;

  const bags = client?.savedBagsCount ?? client?.savedBags ?? 0;
  const co2Avoided = (bags * 0.78).toFixed(1);
  const levelTitle =
    bags >= 10
      ? 'Erou Salvator de Mâncare · Nivel 3'
      : bags >= 4
      ? 'Prieten al Naturii · Nivel 2'
      : 'Începător Entuziast · Nivel 1';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 text-left profile-page-container">
      <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-8 border border-[#E4E7E5] shadow-xs">
        {/* Antet Profil Utilizator */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#DAF2EC] text-[#30634E] flex items-center justify-center font-bold text-xl sm:text-2xl border-2 border-[#30634E] shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#232A27]">
              {user?.name || 'Client SaveBite'}
            </h1>
            <p className="text-xs text-[#636965] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#30634E]" /> {client?.neighborhood || 'Iași, România'}
            </p>
          </div>
        </div>

        {/* Date de contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-3.5 rounded-[12px] bg-[#F5F6F4] text-xs text-[#636965]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#30634E] shrink-0" />
            <span className="truncate"><strong>Email:</strong> {user?.email || 'nedefinit'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#30634E] shrink-0" />
            <span><strong>Telefon:</strong> {client?.phone || 'Nu este setat'}</span>
          </div>
        </div>

        {/* Badge Erou Salvator */}
        <div className="p-4 rounded-[14px] bg-[#DAF2EC]/50 border border-[#30634E]/20 flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-[#30634E] shrink-0" />
          <div>
            <span className="text-xs font-bold text-[#30634E] block">{levelTitle}</span>
            <p className="text-xs text-[#636965]">
              Ai salvat <strong>{bags}</strong> pachete de surplus alimentar și ai evitat aproximativ <strong>{co2Avoided} kg CO₂</strong>.
            </p>
          </div>
        </div>

        {/* Preferințe AI & Notificări */}
        <div className="space-y-4 border-t border-[#F5F6F4] pt-5">
          <h2 className="text-base font-bold text-[#232A27]">Preferințe Alerte AI</h2>

          <div className="space-y-2 text-xs text-[#636965]">
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F6F4]">
              <span className="font-semibold text-[#232A27] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#30634E]" /> Alerte instant pentru brutării & patiserii
              </span>
              <span className="font-bold text-[#30634E]">Activ</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F6F4]">
              <span className="font-semibold text-[#232A27] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#30634E]" /> Filtru produse vegetariene
              </span>
              <span className="text-[#636965]">Inactiv</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};