import React from 'react';
import { Lock, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AuthGateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onLogin: () => void;
  onExplore: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  title,
  description,
  icon,
  onLogin,
  onExplore,
}) => {
  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
      {/* Icon Card */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-[#DAF2EC] text-[#30634E] flex items-center justify-center shadow-sm relative">
        {icon || <Lock className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#30634E] text-[#DAF2EC] flex items-center justify-center text-xs shadow-xs">
          🔒
        </span>
      </div>

      {/* Titlu & Descriere */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#232A27] tracking-tight">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-[#636965] leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {/* Card Info Beneficii */}
      <div className="bg-white rounded-[20px] p-5 border border-[#E4E7E5] shadow-xs text-left space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#30634E] block">
          Ce primești cu un cont gratuit SaveBite:
        </span>
        <ul className="text-xs sm:text-sm text-[#232A27] space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#DAF2EC] text-[#30634E] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
            <span>Rezervi orice pachet surpriză cu 1 click</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#DAF2EC] text-[#30634E] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
            <span>Primești codul secret de ridicare la casă</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#DAF2EC] text-[#30634E] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
            <span>Salvezi brutăriile favorite și primești alerte prioritare</span>
          </li>
        </ul>
      </div>

      {/* Butoane Acțiuni */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={onLogin}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto font-bold shadow-sm"
        >
          Autentifică-te / Creează cont
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onExplore}
          leftIcon={<Compass className="w-4 h-4" />}
          className="w-full sm:w-auto font-semibold"
        >
          Explorează ofertele
        </Button>
      </div>

      {/* Notă demo */}
      <div className="inline-flex items-center gap-1.5 text-xs text-[#636965] bg-[#F5F6F4] px-3 py-1.5 rounded-full border border-[#E4E7E5]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#30634E]" />
        <span>Testare demo: poți folosi butonul <strong>Demo Client</strong> din fereastra de conectare.</span>
      </div>
    </div>
  );
};
