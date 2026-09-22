import React, { useState } from 'react';
import { Clock, Zap, AlertCircle, Info, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TimeProcessingBadgeProps {
  estimatedMinutes?: number | string;
  type?: 'alivio-imediato' | 'curto-prazo' | 'medio-prazo' | 'avaliacao-medica' | 'custom';
  customLabel?: string;
  customDescription?: string;
  className?: string;
  interactive?: boolean;
}

export const TimeProcessingBadge: React.FC<TimeProcessingBadgeProps> = ({
  estimatedMinutes,
  type = 'curto-prazo',
  customLabel,
  customDescription,
  className = '',
  interactive = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determinar rótulo, cor e descrição padrão baseado no tipo ou minutos
  let label = customLabel || '';
  let description = customDescription || '';
  let colorTheme = 'amber';
  let Icon = Clock;

  if (type === 'alivio-imediato') {
    label = label || 'Alívio Imediato (~5-15 min)';
    description = description || 'Ações de primeiro impacto (como postura, respiração ou compressa) costumam trazer os primeiros sinais de alívio nesta janela.';
    colorTheme = 'emerald';
    Icon = Zap;
  } else if (type === 'curto-prazo') {
    label = label || (estimatedMinutes ? `Tempo estimado: ~${estimatedMinutes} min` : 'Resolução Rápida (15-45 min)');
    description = description || 'Tempo médio para aplicar o passo a passo sugerido e começar a notar alívio ou estabilização da situação.';
    colorTheme = 'amber';
    Icon = Clock;
  } else if (type === 'medio-prazo') {
    label = label || 'Resolução Gradual (2-24h)';
    description = description || 'Exige observação contínua, repouso ou intervenção técnica moderada antes de normalizar.';
    colorTheme = 'blue';
    Icon = Clock;
  } else if (type === 'avaliacao-medica') {
    label = label || 'Prioridade Médica (Imediato)';
    description = description || 'Devido à intensidade ou sinais de alerta, a avaliação presencial deve ser feita sem atrasos desnecessários.';
    colorTheme = 'rose';
    Icon = AlertCircle;
  } else {
    label = label || (estimatedMinutes ? `~${estimatedMinutes} min` : 'Estimativa Ativa');
    description = description || 'Tempo estimado calculado com base no histórico do caso e nas melhores práticas.';
  }

  // Classes de cores
  const colorStyles: Record<string, { badge: string; text: string; bgBox: string; border: string }> = {
    emerald: {
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      bgBox: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
    },
    amber: {
      badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      bgBox: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
    },
    blue: {
      badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
      text: 'text-sky-600 dark:text-sky-400',
      bgBox: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-200 dark:border-sky-800/60',
    },
    rose: {
      badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      bgBox: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
    },
  };

  const style = colorStyles[colorTheme] || colorStyles.amber;

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Botão Pill do Selo */}
      <button
        type="button"
        onClick={() => interactive && setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all shadow-2xs select-none ${style.badge} ${
          interactive ? 'hover:scale-[1.02] active:scale-95 cursor-pointer' : 'cursor-default'
        }`}
        title={interactive ? 'Clique para entender o tempo estimado' : label}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
        {interactive && (
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 opacity-70 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Popover Explicativo Interativo */}
      <AnimatePresence>
        {isOpen && interactive && (
          <>
            {/* Backdrop invisível para fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className={`absolute left-0 mt-2 w-72 sm:w-80 p-3.5 rounded-2xl border shadow-xl z-50 ${style.bgBox} ${style.border}`}
            >
              <div className="flex items-start gap-2.5">
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${style.text}`} />
                <div className="space-y-1.5">
                  <div className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1">
                    <span>O que significa este tempo?</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    {description}
                  </p>
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Cada corpo e situação reage no seu ritmo.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
