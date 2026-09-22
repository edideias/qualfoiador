import React, { useState, useEffect } from 'react';
import { useTheme } from '../../modules/theme/ThemeContext';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, Loader2, CheckCircle2, Mail, Key } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginViewProps {
  onNavigateHome: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onNavigateHome }) => {
  const { loginWithGoogleCredential, loginWithEmail } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

  // Initialize Google Identity Services if available in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          const clientId = (window as any).__GOOGLE_CLIENT_ID__ || '548239023401-sample.apps.googleusercontent.com';
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                setLoading(true);
                setErrorMessage(null);
                setSuccessMessage(null);
                const res = await loginWithGoogleCredential(response.credential);
                setLoading(false);
                if (!res.success) {
                  setErrorMessage(res.error || 'Autenticação Google recusada. Esta conta não possui privilégios de administrador.');
                } else {
                  setSuccessMessage('Conta Google autenticada e autorizada com sucesso!');
                }
              }
            },
          });

          const buttonParent = document.getElementById('google-signin-btn-container');
          if (buttonParent) {
            buttonParent.innerHTML = '';
            window.google.accounts.id.renderButton(buttonParent, {
              theme: 'filled_black',
              size: 'large',
              shape: 'pill',
              text: 'signin_with',
              locale: 'pt-BR',
              width: 320,
            });
          }
        } catch (err) {
          console.warn('GSI init note:', err);
        }
      }
    };

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    } else {
      initGsi();
    }
  }, [loginWithGoogleCredential]);

  const handleEmailAuthorizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim();
    if (!clean) {
      setErrorMessage('Por favor, informe o e-mail da sua conta Google.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await loginWithEmail(clean);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Acesso negado. O e-mail informado não possui privilégios de administrador.');
    } else {
      setSuccessMessage('Administrador verificado e autorizado com sucesso!');
    }
  };

  return (
    <main
      id="admin-login-screen"
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        {/* Top return button */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-800">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao aplicativo</span>
          </button>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
            Acesso Restrito
          </span>
        </div>

        {/* Lock icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            Autenticação do Administrador
          </h1>
          <p className="text-xs text-stone-400 font-medium">
            Painel de Controle e Gestão de Temas & Personalização
          </p>
        </div>

        {/* Security Rule Card */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Regra de Segurança Obrigatória</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            O acesso a este painel exige <strong>obrigatoriamente</strong> a validação do e-mail da Conta Google e a confirmação prévia de autorização de administrador.
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 mb-6 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 mb-6 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {/* Google Identity Services Container if supported */}
        <div className="mb-6 flex flex-col items-center">
          <div id="google-signin-btn-container" className="flex justify-center w-full min-h-[44px]" />
        </div>

        {/* Google Account Email & Authorization Form */}
        <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-5 text-left mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-200 mb-3">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Verificação da Conta Google Administradora</span>
          </div>

          <form onSubmit={handleEmailAuthorizationSubmit} className="space-y-3">
            <div>
              <label htmlFor="admin-email-input" className="text-[11px] font-bold text-stone-400 block mb-1.5">
                Informe o e-mail da sua Conta Google:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              id="btn-verify-admin-auth"
              type="submit"
              disabled={loading || !emailInput.trim()}
              className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
              ) : (
                <Key className="w-4 h-4 text-stone-950" />
              )}
              <span>Validar E-mail e Autorização</span>
            </button>
          </form>
        </div>

        {/* Informative Security Guarantee */}
        <div className="text-center text-[11px] text-stone-500 leading-relaxed">
          <p>
            Somente e-mails cadastrados e com chave criptográfica válida recebem o token de acesso. Tentativas com outros e-mails serão estritamente bloqueadas.
          </p>
        </div>
      </motion.div>
    </main>
  );
};
