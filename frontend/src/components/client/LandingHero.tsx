import React from 'react';
import { ArrowRight, ShieldCheck, Store, HeartHandshake, TrendingDown, Users, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface LandingHeroProps {
  onOpenClientAuth: () => void;
  onOpenPartnerAuth: () => void;
  onExploreClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenClientAuth,
  onOpenPartnerAuth,
  onExploreClick,
}) => {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* 1. Hero Principal Vizitatori */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#30634E] via-[#244E3D] to-[#18362A] text-white p-6 sm:p-8 md:p-10 shadow-lg">
        {/* Glow ambiental decorativ */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#DAF2EC]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#B94330]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#DAF2EC]">
            <span className="w-2 h-2 rounded-full bg-[#DAF2EC] animate-pulse" />
            <span>Platformă Comunitară Iași · Împreună oprim risipa</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Mâncare delicioasă salvată de la risipă, la o treime de preț.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
            Brutării artizanale, restaurante și patiserii din Copou, Palas, Păcurari și Centru pun la dispoziție pachete surpriză cu surplusul proaspăt de azi. Reduceri de <strong>50% - 70%</strong>.
          </p>

          {/* CTA-uri pentru vizitatori */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              variant="coral"
              size="md"
              onClick={onOpenClientAuth}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-md hover:shadow-lg font-bold"
            >
              Creează cont gratuit & rezervă
            </Button>

            <button
              type="button"
              onClick={onOpenPartnerAuth}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all cursor-pointer backdrop-blur-sm"
            >
              <Store className="w-4 h-4 text-[#DAF2EC]" />
              <span>Ești comerciant? Devino partener</span>
            </button>
          </div>

          {/* Notă explicativă pentru vizitatori */}
          <p className="text-xs text-emerald-200/70 pt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#DAF2EC] shrink-0" />
            <span>Contul este 100% gratuit. Poți răsfoi ofertele mai jos înainte de a rezerva.</span>
          </p>
        </div>
      </section>

      {/* 2. Cum funcționează SaveBite (3 pași simpli) */}
      <section className="bg-white rounded-[20px] p-5 sm:p-7 border border-[#E4E7E5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5F6F4] pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#30634E] block">
              Ghid rapid pentru vizitatori
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#232A27]">
              Cum funcționează SaveBite în 3 pași simpli
            </h2>
          </div>
          <span className="text-xs text-[#636965]">
            Simplu, rapid și prietenos cu planeta 🌍
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[16px] bg-[#F5F6F4] border border-transparent hover:border-[#DAF2EC] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center font-black text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#232A27] mb-1">
              Descoperi surplusul din Iași
            </h3>
            <p className="text-xs text-[#636965] leading-relaxed">
              Localurile partenere listează pachetele nevândute la final de zi (pâine caldă, meniuri de prânz, patiserie fină).
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#F5F6F4] border border-transparent hover:border-[#DAF2EC] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center font-black text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#232A27] mb-1">
              Rezervi din contul tău
            </h3>
            <p className="text-xs text-[#636965] leading-relaxed">
              Autentifică-te gratuit și rezervă pachetul favorit cu un singur click. Primești instant codul tău unic de ridicare.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#F5F6F4] border border-transparent hover:border-[#DAF2EC] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center font-black text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#232A27] mb-1">
              Ridici și te bucuri
            </h3>
            <p className="text-xs text-[#636965] leading-relaxed">
              Treci pe la magazin în intervalul orar afișat, arăți codul la casă și salvezi mâncare bună la super preț.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Statistici de Impact Comunitar în Iași */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <div className="flex items-center gap-2 text-[#30634E] mb-1 text-xs font-semibold">
            <HeartHandshake className="w-4 h-4" />
            <span>Pungi salvate</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#232A27] block">
            18.420+
          </span>
          <span className="text-[11px] text-[#636965] block mt-0.5">
            în cartierele din Iași
          </span>
        </div>

        <div className="bg-white p-4 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <div className="flex items-center gap-2 text-[#B94330] mb-1 text-xs font-semibold">
            <TrendingDown className="w-4 h-4" />
            <span>Reducere medie</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#B94330] block">
            -60%
          </span>
          <span className="text-[11px] text-[#636965] block mt-0.5">
            față de prețul de meniu
          </span>
        </div>

        <div className="bg-white p-4 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <div className="flex items-center gap-2 text-[#30634E] mb-1 text-xs font-semibold">
            <Store className="w-4 h-4" />
            <span>Parteneri locali</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#232A27] block">
            42 magazine
          </span>
          <span className="text-[11px] text-[#636965] block mt-0.5">
            brutării, bistrouri & cafenele
          </span>
        </div>

        <div className="bg-white p-4 rounded-[16px] border border-[#E4E7E5] shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1 text-xs font-semibold">
            <Users className="w-4 h-4" />
            <span>Comunitate activă</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#232A27] block">
            3.800+
          </span>
          <span className="text-[11px] text-[#636965] block mt-0.5">
            ieșeni anti-risipă
          </span>
        </div>
      </section>

      {/* 4. Banner Alertă Vizitator cu îndemn la Autentificare */}
      <div className="p-3.5 sm:p-4 rounded-[16px] bg-[#DAF2EC]/60 border border-[#A2DEC7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#30634E] text-[#DAF2EC] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[#232A27] block truncate">
              Navighezi în modul Vizitator
            </span>
            <span className="text-[#30634E] block truncate">
              Poți explora oferta zilei. Pentru a rezerva un pachet, conectează-te sau creează un cont gratuit.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenClientAuth}
            className="text-xs h-9 px-4 font-bold"
          >
            Intră în cont
          </Button>
          {onExploreClick && (
            <button
              type="button"
              onClick={onExploreClick}
              className="text-xs font-semibold text-[#30634E] hover:underline px-2 py-1 cursor-pointer"
            >
              Vezi ofertele ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
