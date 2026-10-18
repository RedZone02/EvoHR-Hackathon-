import React, { useState } from 'react';
import { User, Store, X, ArrowRight, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    loginAsDemoClient,
    loginAsDemoPartner,
    authModalDefaultTab,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'client' | 'partner'>(authModalDefaultTab);
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states Client
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('client@savebite.ro');
  const [clientPassword, setClientPassword] = useState('Password2026!');
  const [clientPhone, setClientPhone] = useState('');

  // Form states Partener
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('partner@cuptorulfermecat.ro');
  const [businessPassword, setBusinessPassword] = useState('Password2026!');
  const [businessCui, setBusinessCui] = useState('');
  const [representativeName, setRepresentativeName] = useState('');

  // Sincronizare cu tab-ul cerut la deschidere
  React.useEffect(() => {
    setActiveTab(authModalDefaultTab);
    setErrorMessage(null);
  }, [authModalDefaultTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register({
          email: clientEmail.trim(),
          password: clientPassword,
          name: clientName.trim() || 'Client SaveBite',
          role: 'CLIENT',
          phone: clientPhone.trim() || undefined,
        });
      } else {
        await login(clientEmail.trim(), clientPassword);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Eroare la autentificare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register({
          email: businessEmail.trim(),
          password: businessPassword,
          name: representativeName.trim() || businessName.trim(),
          role: 'PARTNER',
          businessName: businessName.trim(),
          cui: businessCui.trim().toUpperCase(),
          category: 'bakery',
          categoryLabel: 'Brutărie locală',
          address: 'Iași, România',
          city: 'Iași',
        });
      } else {
        await login(businessEmail.trim(), businessPassword);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Eroare la autentificare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClient = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginAsDemoClient();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Nu s-a putut efectua conectarea demo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoPartner = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginAsDemoPartner();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Nu s-a putut efectua conectarea demo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto no-scrollbar">
      <div className="auth-modal-card bg-white rounded-[20px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E4E7E5] text-left relative my-auto max-h-[96vh] overflow-y-auto no-scrollbar">
        {/* Header cu Titlu Sectiune si Buton Inchidere */}
        <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
          <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[#636965]">
            Alege tipul de cont
          </span>
          <button
            type="button"
            onClick={closeAuthModal}
            className="auth-modal-close-btn w-8 h-8 rounded-full text-[#636965] hover:text-[#B94330] hover:bg-[#FDE5E0] flex items-center justify-center transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
            title="Închide fereastra"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* Mesaj de eroare */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-[10px] bg-[#FDE5E0] border border-[#B94330]/30 text-[#B94330] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Selector Tip Cont: Client vs Partener */}
        <div className="auth-section-gap mb-3 sm:mb-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F6F4] rounded-[12px]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('client');
                setErrorMessage(null);
              }}
              className={`
                auth-tab-btn flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer
                ${activeTab === 'client'
                  ? 'bg-white text-[#30634E] shadow-xs'
                  : 'text-[#636965] hover:text-[#232A27]'
                }
              `}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Cont Client</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('partner');
                setErrorMessage(null);
              }}
              className={`
                auth-tab-btn flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer
                ${activeTab === 'partner'
                  ? 'bg-[#30634E] text-white shadow-xs'
                  : 'text-[#636965] hover:text-[#232A27]'
                }
              `}
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Cont Partener</span>
            </button>
          </div>
        </div>

        {/* Buton 1-Click Demo Conectat la Baza de Date */}
        <div className="auth-demo-box mb-3 p-2.5 rounded-[12px] bg-[#DAF2EC]/60 border border-[#30634E]/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-[#30634E] flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current shrink-0" /> Acces rapid cont seed SQL:
            </span>
          </div>
          {activeTab === 'client' ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDemoClient}
              className="w-full py-1.5 px-2.5 rounded-[8px] bg-white hover:bg-white/80 text-[11px] sm:text-xs font-bold text-[#30634E] border border-[#30634E]/30 text-left transition-colors shadow-2xs cursor-pointer flex items-center justify-between gap-1.5 disabled:opacity-60"
            >
              <span className="leading-snug truncate">
                {isSubmitting ? 'Se conectează...' : (
                  <>Intră ca <strong>Alexandru (Client Seed SQL)</strong></>
                )}
              </span>
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDemoPartner}
              className="w-full py-1.5 px-2.5 rounded-[8px] bg-[#30634E] hover:bg-[#275240] text-[11px] sm:text-xs font-bold text-white text-left transition-colors shadow-2xs cursor-pointer flex items-center justify-between gap-1.5 disabled:opacity-60"
            >
              <span className="leading-snug truncate">
                {isSubmitting ? 'Se conectează...' : (
                  <>Intră în <strong>SaveBite Partners (Brutărie SQL)</strong></>
                )}
              </span>
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              )}
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="auth-divider relative flex py-1 items-center mb-2.5">
          <div className="flex-grow border-t border-[#E4E7E5]"></div>
          <span className="flex-shrink mx-2.5 text-[10px] sm:text-[10.5px] text-[#636965] uppercase font-semibold">
            sau date manuale
          </span>
          <div className="flex-grow border-t border-[#E4E7E5]"></div>
        </div>

        {/* Formular Client */}
        {activeTab === 'client' ? (
          <form onSubmit={handleClientSubmit} className="auth-form space-y-3">
            <div>
              <h2 className="auth-title text-base sm:text-lg font-bold text-[#232A27] leading-tight">
                {isRegister ? 'Creează cont de Client' : 'Conectare Client'}
              </h2>
              <p className="auth-subtitle text-xs text-[#636965]">
                {isRegister ? 'Înregistrează-te pentru a avea propriul tău profil personalizat.' : 'Salvează mâncare proaspătă de la restaurantele locale.'}
              </p>
            </div>

            {isRegister && (
              <>
                <Input
                  label="Nume complet"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Elena Popescu"
                  className="auth-input !h-10 !text-xs sm:!text-sm"
                  required
                />
                <Input
                  label="Număr de telefon"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ex: 0740 123 456"
                  className="auth-input !h-10 !text-xs sm:!text-sm"
                />
              </>
            )}

            <Input
              type="email"
              label="Adresă email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="nume@exemplu.ro"
              className="auth-input !h-10 !text-xs sm:!text-sm"
              required
            />

            <Input
              type="password"
              label="Parolă"
              value={clientPassword}
              onChange={(e) => setClientPassword(e.target.value)}
              placeholder="Minim 8 caractere"
              className="auth-input !h-10 !text-xs sm:!text-sm"
              required
            />

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                className="auth-submit-btn !h-10 !text-xs sm:!text-sm font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRegister ? (
                  'Înregistrează-te în Baza de Date'
                ) : (
                  'Conectează-te'
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Formular Partener Magazin/Restaurant */
          <form onSubmit={handlePartnerSubmit} className="auth-form space-y-3">
            <div>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#30634E] text-white text-[9.5px] font-bold mb-0.5">
                Portal Parteneri
              </div>
              <h2 className="auth-title text-base sm:text-lg font-bold text-[#232A27] leading-tight">
                {isRegister ? 'Înregistrare Afacere / Magazin' : 'Autentificare SaveBite Partners'}
              </h2>
              <p className="auth-subtitle text-xs text-[#636965]">
                Monetizează surplusul alimentar al afacerii tale.
              </p>
            </div>

            {isRegister && (
              <>
                <Input
                  label="Denumire Companie / Magazin"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Pasticceria Bellini SRL"
                  className="auth-input !h-10 !text-xs sm:!text-sm"
                  required
                />
                <Input
                  label="Nume Reprezentant"
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  placeholder="Ex: Maria Bellini"
                  className="auth-input !h-10 !text-xs sm:!text-sm"
                  required
                />
                <Input
                  label="Cod Unic de Înregistrare (CUI)"
                  value={businessCui}
                  onChange={(e) => setBusinessCui(e.target.value)}
                  placeholder="Ex: RO4592011"
                  className="auth-input !h-10 !text-xs sm:!text-sm"
                  required
                />
              </>
            )}

            <Input
              type="email"
              label="Email afacere / contact"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="partener@afacere.ro"
              className="auth-input !h-10 !text-xs sm:!text-sm"
              required
            />

            <Input
              type="password"
              label="Parolă cont partener"
              value={businessPassword}
              onChange={(e) => setBusinessPassword(e.target.value)}
              placeholder="Minim 8 caractere"
              className="auth-input !h-10 !text-xs sm:!text-sm"
              required
            />

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                className="auth-submit-btn !h-10 !text-xs sm:!text-sm font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRegister ? (
                  'Creează Cont Partener în SQL'
                ) : (
                  'Intră în Panoul Magazinului'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Comutare între Conectare și Înregistrare */}
        <div className="auth-footer mt-3 pt-2 border-t border-[#F5F6F4] text-center text-xs text-[#636965]">
          {isRegister ? (
            <span>
              Ai deja un cont?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                  if (!clientEmail) {
                    setClientEmail('client@savebite.ro');
                    setClientPassword('Password2026!');
                  }
                  if (!businessEmail) {
                    setBusinessEmail('partner@cuptorulfermecat.ro');
                    setBusinessPassword('Password2026!');
                  }
                }}
                className="font-bold text-[#30634E] hover:underline cursor-pointer"
              >
                Conectează-te aici
              </button>
            </span>
          ) : (
            <span>
              Nu ai încă un cont?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage(null);
                  if (clientEmail === 'client@savebite.ro') {
                    setClientName('');
                    setClientEmail('');
                    setClientPhone('');
                    setClientPassword('');
                  }
                  if (businessEmail === 'partner@cuptorulfermecat.ro') {
                    setBusinessName('');
                    setBusinessEmail('');
                    setBusinessPassword('');
                    setBusinessCui('');
                    setRepresentativeName('');
                  }
                }}
                className="font-bold text-[#30634E] hover:underline cursor-pointer"
              >
                Înregistrează-te gratuit
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};