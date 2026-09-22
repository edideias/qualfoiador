import React, { useState } from 'react';
import {
  Flame,
  Snowflake,
  ShieldCheck,
  AlertTriangle,
  Clock,
  HeartPulse,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getVisualAdviceForLocation, VisualAdviceData } from '../../services/visualAdvice';

export interface VisualAdviceCardProps {
  location: string;
  className?: string;
}

export const VisualAdviceCard: React.FC<VisualAdviceCardProps> = ({
  location,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'thermal' | 'posture' | 'dosAndDonts'>('thermal');
  const [isExpanded, setIsExpanded] = useState(true);

  const advice: VisualAdviceData = getVisualAdviceForLocation(location);
  const isCold = advice.thermal.type === 'gelo';
  const isHot = advice.thermal.type === 'calor';

  return (
    <div
      id="visual-advice-card"
      className={`w-full rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-sm p-4 sm:p-5 transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <HeartPulse className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300">
                Guia Visual & Ergonômico
              </span>
              <span className="text-xs text-stone-400">• {advice.regionName}</span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white mt-0.5">
              {advice.headline}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title={isExpanded ? 'Recolher guia' : 'Expandir guia'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Tabs de Seleção */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('thermal')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'thermal'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {isCold ? (
                  <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Compressa: {isCold ? 'Gelo' : 'Calor'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('posture')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'posture'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Posturas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dosAndDonts')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'dosAndDonts'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>O que Fazer / Evitar</span>
              </button>
            </div>

            {/* Conteúdo da Tab 1: Compressa Térmica */}
            {activeTab === 'thermal' && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCold
                          ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      }`}
                    >
                      {isCold ? <Snowflake className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white">
                        {advice.thermal.title}
                      </h4>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        {advice.thermal.reason}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {advice.thermal.durationMinutes} min
                  </span>
                </div>

                <div className="text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 leading-relaxed">
                  <strong className="block text-[11px] text-stone-900 dark:text-white uppercase font-bold mb-1">
                    Como Aplicar com Segurança:
                  </strong>
                  {advice.thermal.howToApply}
                </div>

                {advice.thermal.caution && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{advice.thermal.caution}</span>
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo da Tab 2: Posturas Recomendadas */}
            {activeTab === 'posture' && (
              <div className="space-y-2.5">
                {advice.postures.map((posture, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-white">
                        {posture.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                        {posture.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Conteúdo da Tab 3: O que Fazer vs O que Evitar */}
            {activeTab === 'dosAndDonts' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {advice.dosAndDonts.map((item, index) => {
                  const isDo = item.action === 'do';
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        isDo
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-rose-500/5 border-rose-500/20'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isDo ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isDo ? (
                          <ThumbsUp className="w-3.5 h-3.5" />
                        ) : (
                          <ThumbsDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider block ${
                            isDo
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isDo ? 'Recomendado' : 'Evite Fazer'}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white mt-0.5">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Alerta de Red Flag / Alerta Clínico */}
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>{advice.redFlagReminder}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
