import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import type { OfferProduct } from '../../types';

export interface AIRestaurantStockParserProps {
  onProductGenerated: (product: Partial<OfferProduct>) => void;
}

export const AIRestaurantStockParser: React.FC<AIRestaurantStockParserProps> = ({
  onProductGenerated,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Partial<OfferProduct> | null>(null);

  const quickPrompts = [
    '🥖 Am 5 baghete artizanale și 4 croissante rămase la ora 18:00, preț întreg 25 lei, redus la 10 lei, 3 pungi.',
    '🥗 Avem 4 salate mediteraneene și 2 supe cremă de la prânz, expiră în 90 min, reduse la 14 lei de la 32 lei.',
    '🍰 Au rămas 6 felii de tartă cu fructe și 2 eclere, preț 15 lei redus de la 30 lei, ridicare până la 20:30.',
  ];

  const handleSimulateAI = (textToProcess: string) => {
    setIsProcessing(true);
    setParsedPreview(null);

    setTimeout(() => {
      // Logică AI inteligentă de extracție pe baza textului
      const lower = textToProcess.toLowerCase();
      let title = 'Pachet Surpriză Surplus Delicios';
      let category: 'bakery' | 'restaurant' | 'grocery' | 'pastry' = 'bakery';
      let categoryLabel = 'Brutărie';
      let originalPrice = 25.00;
      let discountedPrice = 10.00;
      let itemsLeft = 3;
      let expiresInMinutes = 60;
      let pickupWindow = 'azi: 17:30 - 19:30';
      let imageUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=80';

      if (lower.includes('croissant') || lower.includes('tartă') || lower.includes('ecler') || lower.includes('ciocolată')) {
        title = 'Selecție Patiserie & Deserturi Dulci';
        category = 'pastry';
        categoryLabel = 'Patiserie';
        imageUrl = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=640&q=80';
      } else if (lower.includes('salat') || lower.includes('supă') || lower.includes('prânz') || lower.includes('paste')) {
        title = 'Meniu Salvat Mâncare Caldă';
        category = 'restaurant';
        categoryLabel = 'Restaurant';
        imageUrl = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=640&q=80';
      }

      // Extragere prețuri din text dacă există
      const priceMatches = textToProcess.match(/\d+([.,]\d+)?\s*(lei|ron)/gi);
      if (priceMatches && priceMatches.length >= 2) {
        const p1 = parseFloat(priceMatches[0]);
        const p2 = parseFloat(priceMatches[1]);
        originalPrice = Math.max(p1, p2);
        discountedPrice = Math.min(p1, p2);
      } else if (lower.includes('15') && lower.includes('30')) {
        originalPrice = 30;
        discountedPrice = 15;
      } else if (lower.includes('14') && lower.includes('32')) {
        originalPrice = 32;
        discountedPrice = 14;
      }

      const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

      const generated: Partial<OfferProduct> = {
        title,
        description: textToProcess,
        category,
        categoryLabel,
        originalPrice,
        discountedPrice,
        discountPercentage,
        itemsLeft,
        expiresInMinutes,
        pickupWindow,
        imageUrl,
      };

      setParsedPreview(generated);
      setIsProcessing(false);
    }, 700);
  };

  const handleApply = () => {
    if (parsedPreview) {
      onProductGenerated(parsedPreview);
      setParsedPreview(null);
      setInputText('');
    }
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#DAF2EC] p-3.5 sm:p-5 shadow-sm text-left relative overflow-hidden">
      {/* Glow ambiental verde */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#DAF2EC]/40 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#30634E] text-white flex items-center justify-center shadow-xs shrink-0">
          <Sparkles className="w-4 h-4 text-[#DAF2EC]" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#232A27]">
            Asistent AI: Actualizare Stoc din Mesajul Angajatului
          </h3>
          <p className="text-xs text-[#636965]">
            Scrie liber ce produse au rămas în magazin. AI-ul generează oferta automat!
          </p>
        </div>
      </div>

      {/* Sugestii rapide */}
      <div className="my-3">
        <span className="text-[11px] font-semibold text-[#636965] uppercase tracking-wider block mb-1.5">
          Exemple rapide (Apasă pentru testare):
        </span>
        <div className="flex flex-col gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(prompt);
                handleSimulateAI(prompt);
              }}
              className="text-left text-xs bg-[#F5F6F4] hover:bg-[#DAF2EC]/50 hover:text-[#30634E] text-[#232A27] px-3 py-2 rounded-[8px] transition-colors border border-transparent hover:border-[#30634E]/30 cursor-pointer break-words"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input text angajat */}
      <div className="mt-3">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ex: Am 4 croissante cu ciocolată și 2 tarte. Le dăm la 10 lei în loc de 25..."
          className="w-full p-3 rounded-[12px] border border-[#E4E7E5] text-xs sm:text-sm text-[#232A27] focus:outline-none focus:border-[#30634E] focus:ring-2 focus:ring-[#30634E]/20 placeholder:text-[#636965]"
        />

        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSimulateAI(inputText)}
            disabled={!inputText.trim() || isProcessing}
            leftIcon={<Wand2 className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'AI analizează surplusul...' : 'Procesează cu AI'}
          </Button>
        </div>
      </div>

      {/* Previzualizare card structurat generat de AI */}
      {parsedPreview && (
        <div className="mt-4 p-3.5 sm:p-4 rounded-[12px] bg-[#DAF2EC]/60 border border-[#30634E]/20 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#30634E] flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#30634E]" /> Oferta extrasă de AI:
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#B94330] text-white shrink-0">
              -{parsedPreview.discountPercentage}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#232A27] mb-3">
            <div>
              <span className="text-[#636965] block">Titlu:</span>
              <strong className="text-sm font-semibold">{parsedPreview.title}</strong>
            </div>
            <div>
              <span className="text-[#636965] block">Categorie:</span>
              <span className="font-medium">{parsedPreview.categoryLabel}</span>
            </div>
            <div>
              <span className="text-[#636965] block">Preț nou:</span>
              <strong className="text-[#30634E] text-sm font-bold">RON {parsedPreview.discountedPrice?.toFixed(2)}</strong>{' '}
              <span className="line-through text-[#636965]">RON {parsedPreview.originalPrice?.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#636965] block">Interval ridicare:</span>
              <span className="font-medium">{parsedPreview.pickupWindow}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            fullWidth
            onClick={handleApply}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Publică oferta în aplicație
          </Button>
        </div>
      )}
    </div>
  );
};
