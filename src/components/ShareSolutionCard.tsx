import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ShareSolutionCardProps {
  title: string;
  category: 'dor-fisica' | 'dor-problema';
  urgencyLabel?: string;
  summaryText: string;
  immediateAction?: string;
  keySteps?: string[];
  bestOptionLabel?: string;
  className?: string;
}

export const ShareSolutionCard: React.FC<ShareSolutionCardProps> = ({
  title,
  category,
  urgencyLabel,
  summaryText,
  immediateAction,
  keySteps = [],
  bestOptionLabel,
  className = '',
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isPhysical = category === 'dor-fisica';
  const categoryBadge = isPhysical ? 'Corpo & Saúde' : 'Vida Prática';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qualasuador.app';

  // Montagem da mensagem formatada para WhatsApp e Redes Sociais
  const buildShareMessage = () => {
    let msg = `*Qual é a sua dor?* 💡\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📌 *${title.trim()}*\n`;
    if (urgencyLabel) {
      msg += `🚨 *Prioridade:* ${urgencyLabel}\n`;
    }
    msg += `📂 *Categoria:* ${categoryBadge}\n\n`;

    if (immediateAction) {
      msg += `⚡ *O QUE FAZER AGORA:*\n${immediateAction.trim()}\n\n`;
    } else if (summaryText) {
      msg += `📋 *RESUMO:*\n${summaryText.trim()}\n\n`;
    }

    if (keySteps.length > 0) {
      msg += `👣 *PASSO A PASSO:*\n`;
      keySteps.slice(0, 4).forEach((step, idx) => {
        msg += `${idx + 1}. ${step.trim()}\n`;
      });
      msg += `\n`;
    }

    if (bestOptionLabel) {
      msg += `⭐ *Melhor Alternativa:* ${bestOptionLabel}\n\n`;
    }

    msg += `🛡️ *Consulte sempre um profissional quando necessário.*\n`;
    msg += `👉 Resolva o seu perrengue ou sintoma em: ${appUrl}`;

    return msg;
  };

  const formattedShareMessage = buildShareMessage();

  // Compartilhamento direto no WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(formattedShareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Compartilhamento nativo Web Share API (mobile/desktop moderno)
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Qual é a sua dor? - ${title}`,
          text: formattedShareMessage,
          url: appUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  // Copiar o texto completo formatado
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // Copiar apenas o link do site
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      id="share-solution-card"
      className={`w-full rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 shadow-md p-4 sm:p-5 transition-all ${className}`}
    >
      {/* Header do Card */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>Compartilhar Solução</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                1 Clique
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              Envie este plano para alguém que precisa ou salve para consulta rápida.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title={isExpanded ? 'Recolher prévia' : 'Ver mensagem formatada'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Botões de Ação Imediata de Compartilhamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* 1. Botão WhatsApp com destaque verde oficial */}
        <button
          id="btn-share-whatsapp"
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Enviar no WhatsApp</span>
        </button>

        {/* 2. Botão Nativo / Outras Redes */}
        <button
          id="btn-share-native"
          type="button"
          onClick={handleNativeShare}
          className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-stone-700/80 transition-all cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Outras Redes</span>
        </button>

        {/* 3. Botão Copiar Texto Completo */}
        <button
          id="btn-copy-solution-text"
          type="button"
          onClick={handleCopyText}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border active:scale-95 ${
            copiedText
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900'
          }`}
        >
          {copiedText ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-stone-400" />
              <span>Copiar Texto</span>
            </>
          )}
        </button>
      </div>

      {/* Prévia Expansível do Texto de Compartilhamento */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 pt-3 border-t border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1.5 font-bold">
              <span>Prévia da mensagem que será enviada:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                <span>{copiedLink ? 'Link copiado!' : 'Copiar apenas link'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 font-mono text-[11px] text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all">
              {formattedShareMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
