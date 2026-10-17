import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FilterChip } from '../../components/ui/FilterChip';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { DiscountBadge, ExpireBadge } from '../../components/ui/Badge';
import { Toast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui/EmptyState';
import { OfferCard } from '../../components/cards/OfferCard';
import { INITIAL_OFFERS } from '../../data/mockData';
import { MapPin } from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'brutarii' | 'restaurante' | 'alimente'>('brutarii');
  const [toggleState, setToggleState] = useState(true);
  const [inputValue, setInputValue] = useState('Cartierul de Nord');
  const [toastVisible, setToastVisible] = useState(true);

  const sampleOffer = INITIAL_OFFERS[0];

  return (
    <div className="space-y-10 pb-16 text-left">
      {/* 1. Header Banner Verde din Figma */}
      <div className="bg-[#30634E] text-white rounded-[20px] p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <span className="text-xl font-black tracking-wider uppercase">nume</span>
          <span className="text-xs uppercase tracking-widest text-[#DAF2EC] font-semibold">
            NUME APP / CONCEPT VIZUAL | V1.0
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          Logo sau doar numele scris.
        </h1>
        <p className="text-sm sm:text-base text-[#DAF2EC] max-w-xl">
          Un motto/descriere ex: <strong>Mai puțină risipă. Mai mult bine.</strong>
        </p>
      </div>

      {/* 2. Paletă de Culori */}
      <section className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E4E7E5] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#232A27] tracking-tight">
          Paleta Cromatică & Roluri de Culoare
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="space-y-1.5">
            <div className="h-20 rounded-[12px] bg-[#30634E] shadow-inner" />
            <div className="flex justify-between text-xs font-bold text-[#232A27]">
              <span>Verde cald</span>
              <span className="text-[#636965]">#30634E</span>
            </div>
            <span className="text-[11px] text-[#636965] block leading-tight">
              Primar - acțiuni și stări de bază
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-20 rounded-[12px] bg-[#B94330] shadow-inner" />
            <div className="flex justify-between text-xs font-bold text-[#232A27]">
              <span>Coral</span>
              <span className="text-[#636965]">#B94330</span>
            </div>
            <span className="text-[11px] text-[#636965] block leading-tight">
              Doar reduceri, intensitate/alertă
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-20 rounded-[12px] bg-[#232A27] shadow-inner" />
            <div className="flex justify-between text-xs font-bold text-[#232A27]">
              <span>Cărbune</span>
              <span className="text-[#636965]">#232A27</span>
            </div>
            <span className="text-[11px] text-[#636965] block leading-tight">
              Titluri și text corp
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-20 rounded-[12px] bg-[#636965] shadow-inner" />
            <div className="flex justify-between text-xs font-bold text-[#232A27]">
              <span>Piatră</span>
              <span className="text-[#636965]">#636965</span>
            </div>
            <span className="text-[11px] text-[#636965] block leading-tight">
              Text secundar și metadate
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-20 rounded-[12px] bg-[#F5F6F4] border border-[#E4E7E5]" />
            <div className="flex justify-between text-xs font-bold text-[#232A27]">
              <span>Pânză</span>
              <span className="text-[#636965]">#F5F6F4</span>
            </div>
            <span className="text-[11px] text-[#636965] block leading-tight">
              Fundal pagină
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-20 rounded-[12px] bg-white border border-[#E4E7E5] shadow-xs" />
            <div className="flex justify-between text-xs font-bold text-[#232A27]">
              <span>Alb</span>
              <span className="text-[#636965]">#FFFFFF</span>
            </div>
            <span className="text-[11px] text-[#636965] block leading-tight">
              Carduri și suprafețe de interes
            </span>
          </div>
        </div>

        {/* Combinații de contrast validate */}
        <div className="pt-4 border-t border-[#F5F6F4]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#232A27] uppercase tracking-wider">
              Combinații de contrast validate
            </span>
            <span className="text-[11px] font-semibold text-[#30634E] bg-[#DAF2EC] px-2 py-0.5 rounded-full">
              WCAG AA - Text normal &ge; 4.5:1
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-[#30634E] text-white p-3 rounded-[12px]">
              <span className="font-bold block">Aproape</span>
              <span className="text-[10px] opacity-80">6.95:1 · AA</span>
            </div>
            <div className="bg-[#DAF2EC] text-[#30634E] p-3 rounded-[12px] font-bold border border-[#30634E]/20">
              <span className="block">Filtru selectat</span>
              <span className="text-[10px] opacity-80">6.09:1 · AA</span>
            </div>
            <div className="bg-[#FDE5E0] text-[#B94330] p-3 rounded-[12px] font-bold">
              <span className="block">-40%</span>
              <span className="text-[10px] opacity-80">4.70:1 · AA</span>
            </div>
            <div className="bg-[#B94330] text-white p-3 rounded-[12px] font-bold">
              <span className="block">-40% Solid</span>
              <span className="text-[10px] opacity-80">5.38:1 · AA</span>
            </div>
            <div className="bg-white text-[#232A27] p-3 rounded-[12px] font-bold border border-[#E4E7E5]">
              <span className="block">Brutărie locală</span>
              <span className="text-[10px] opacity-80">14.59:1 · AA</span>
            </div>
            <div className="bg-[#F5F6F4] text-[#30634E] p-3 rounded-[12px] font-bold border border-[#E4E7E5]">
              <span className="block">350 m</span>
              <span className="text-[10px] opacity-80">5.21:1 · AA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tipografie și Reguli Spațiere */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white rounded-[20px] p-6 sm:p-8 border border-[#E4E7E5] shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#232A27]">Ierarhie Tipografică</h2>
          
          <div className="space-y-4">
            <div className="border-b border-[#F5F6F4] pb-3">
              <span className="text-xs text-[#636965] block mb-1">Titlu · 32 / 40 · Semibold 600</span>
              <h1 className="text-3xl font-semibold text-[#232A27]">
                Mâncare bună, aproape.
              </h1>
            </div>

            <div className="border-b border-[#F5F6F4] pb-3">
              <span className="text-xs text-[#636965] block mb-1">Antet · 24 / 32 · Semibold 600</span>
              <h2 className="text-2xl font-semibold text-[#232A27]">
                Descoperi proaspete în jur
              </h2>
            </div>

            <div className="border-b border-[#F5F6F4] pb-3">
              <span className="text-xs text-[#636965] block mb-1">Corp · 16 / 24 · Regular 400</span>
              <p className="text-base text-[#232A27]">
                Salvează ceva bun de la o brutărie locală.
              </p>
            </div>

            <div>
              <span className="text-xs text-[#636965] block mb-1">Subtitlu · 12 / 16 · Medium 500</span>
              <p className="text-xs font-medium text-[#636965]">
                350 m · ridicare azi, 17:00-18:00
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-[#DAF2EC]/30 rounded-[20px] p-6 border border-[#30634E]/15 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white rounded-[12px] border border-[#30634E]/20 shadow-xs flex items-center justify-center font-bold text-[#30634E] mb-4">
              12px
            </div>
            <h3 className="font-bold text-base text-[#232A27] mb-1">Colțuri de 12 px</h3>
            <p className="text-xs text-[#636965] leading-relaxed mb-4">
              Cardurile, câmpurile, butoanele și badge-urile folosesc raza de 12px pentru consistență vizuală.
            </p>
          </div>

          <div className="bg-white p-4 rounded-[12px] border border-[#E4E7E5] text-xs text-[#232A27] space-y-1">
            <span className="font-bold block text-[#30634E]">Ritm de 8 px</span>
            <p className="text-[#636965]">Spațiere mobilă: 16 px</p>
            <p className="text-[#636965]">Controale interactive: 48 px</p>
            <p className="text-[#636965]">Target minim de atingere: 44 px</p>
          </div>
        </div>
      </section>

      {/* 4. Butoane & Câmpuri Text */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Butoane */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#232A27]">Butoane (48 px înălțime, 12 px colțuri)</h3>
            <p className="text-xs text-[#636965]">O singură acțiune principală per context</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Găsește oferte</Button>
              <Button variant="outline">Vezi harta</Button>
              <Button variant="primary" disabled>Dezactivat</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="secondary">Buton secundar</Button>
              <Button variant="coral">Acțiune Coral</Button>
            </div>
          </div>
        </div>

        {/* Intrare text */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#232A27]">Intrare text (48 px înălțime)</h3>
            <p className="text-xs text-[#636965]">12 px rază, etichetă și suport pentru icon</p>
          </div>

          <div className="space-y-3">
            <Input
              label="Locație (Stare activă / completată)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              leftIcon={<MapPin className="w-5 h-5 text-[#30634E]" />}
            />

            <Input
              label="Locație (Stare eroare)"
              value="Cod invalid"
              error="Introdu o zonă sau un cod poștal valid."
              leftIcon={<MapPin className="w-5 h-5 text-[#B94330]" />}
            />
          </div>
        </div>
      </section>

      {/* 5. Filtru etichetă & Buton de comutare */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#232A27]">Filtru etichetă (44 px înălțime)</h3>
            <p className="text-xs text-[#636965]">Selectat (cu checkmark), inactiv și dezactivat</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <FilterChip
              label="Brutării"
              selected={activeFilter === 'brutarii'}
              onClick={() => setActiveFilter('brutarii')}
            />
            <FilterChip
              label="Restaurante"
              selected={activeFilter === 'restaurante'}
              onClick={() => setActiveFilter('restaurante')}
            />
            <FilterChip
              label="Alimente"
              selected={activeFilter === 'alimente'}
              onClick={() => setActiveFilter('alimente')}
            />
            <FilterChip
              label="Dezactivat"
              disabled
            />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#232A27]">Buton de comutare (52 x 28 px)</h3>
            <p className="text-xs text-[#636965]">Touch target minim de 44 px</p>
          </div>

          <div className="space-y-2">
            <ToggleSwitch
              checked={toggleState}
              onChange={setToggleState}
              label="Alertă oferte aproape"
              sublabel="Modificările se aplică imediat"
            />
            <ToggleSwitch
              checked={false}
              onChange={() => {}}
              disabled
              label="Opțiune dezactivată"
              sublabel="Indisponibilă în modul offline"
            />
          </div>
        </div>
      </section>

      {/* 6. Card Ofertă 320 px (Figma spec 1:1) & Badges */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs flex flex-col items-center">
          <div className="w-full text-left mb-4">
            <span className="text-[11px] font-bold text-[#636965] uppercase tracking-wider block">
              CARD OFERTĂ / 320 PX - DISPONIBIL
            </span>
            <p className="text-xs text-[#636965]">
              Cardul oficial generat pe baza layout-ului exact din Figma
            </p>
          </div>

          <OfferCard
            offer={sampleOffer}
            onReserve={() => alert('Rezervare confirmată!')}
            onToggleFavorite={() => {}}
            isFavorite={false}
          />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {/* Badges */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#232A27]">Badges de stare și economie</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[12px] bg-[#F5F6F4] space-y-2">
                <span className="text-xs font-bold text-[#636965] block">Badge reducere</span>
                <div className="flex gap-2">
                  <DiscountBadge percentage={40} />
                  <DiscountBadge percentage={50} variant="solid" />
                </div>
                <p className="text-[11px] text-[#636965]">
                  "Coral este un semnal de economie, nu o decorațiune. Arată semnul minus și procentul."
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F5F6F4] space-y-2">
                <span className="text-xs font-bold text-[#636965] block">Badge expirare</span>
                <div className="flex gap-2">
                  <ExpireBadge minutesLeft={45} />
                </div>
                <p className="text-[11px] text-[#636965]">
                  "Fii util, nu alarmant. Arată timpul rămas în cuvinte, împreună cu un ceas."
                </p>
              </div>
            </div>
          </div>

          {/* Toast-uri */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs space-y-3">
            <h3 className="font-bold text-base text-[#232A27]">Toast (16 px spațiu interior, 12 px colțuri)</h3>
            
            {toastVisible && (
              <Toast
                type="success"
                title="Punga ta este rezervată"
                description="Deschide detaliile pentru instrucțiuni de ridicare."
                onClose={() => setToastVisible(false)}
              />
            )}

            <Toast
              type="offline"
              title="Ești offline"
              description="Verifică conexiunea și încearcă din nou."
              onClose={() => {}}
            />
          </div>
        </div>
      </section>

      {/* 7. Stare Goală */}
      <section className="bg-white rounded-[20px] p-6 border border-[#E4E7E5] shadow-xs">
        <h3 className="font-bold text-base text-[#232A27] mb-2">Stare Goală (Empty State)</h3>
        <EmptyState
          title="Nu sunt pungi aproape. Deocamdată."
          description="Magazinele locale adaugă oferte proaspete pe parcursul zilei. Încearcă o zonă mai largă."
          actionText="Extinde zona de căutare"
          onAction={() => alert('Căutare extinsă')}
        />
      </section>
    </div>
  );
};
