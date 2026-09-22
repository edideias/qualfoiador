import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Check,
  ExternalLink,
  ThumbsUp,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GuidedSolveStep {
  id?: string | number;
  title: string;
  description: string;
  waitDurationSeconds?: number; // ex: 600 = 10 minutos
  tipOrWarning?: string;
}

export interface GuidedSolveProps {
  problemTitle: string;
  steps: (GuidedSolveStep | string)[];
  immediateWarning?: string;
  emergencyQuery?: string;
  onEmergencyClick?: () => void;
  onFinishFeedback?: (resolved: boolean) => void;
  className?: string;
}

export const GuidedSolve: React.FC<GuidedSolveProps> = ({
  problemTitle,
  steps,
  immediateWarning,
  emergencyQuery,
  onEmergencyClick,
  onFinishFeedback,
  className = '',
}) => {
  // Padronizar steps caso venham como array de strings ou objetos
  const normalizedSteps: GuidedSolveStep[] = steps.map((s, index) => {
    if (typeof s === 'string') {
      // Tentar inferir se há tempo mencionado no texto (ex: "15 minutos", "10 min")
      const timeMatch = s.match(/(\d+)\s*(?:minutos?|mins?|min)\b/i);
      const minutes = timeMatch ? parseInt(timeMatch[1], 10) : undefined;
      return {
        id: index + 1,
        title: `Passo ${index + 1}`,
        description: s,
        waitDurationSeconds: minutes && minutes <= 60 ? minutes * 60 : undefined,
      };
    }
    return {
      id: s.id || index + 1,
      title: s.title || `Passo ${index + 1}`,
      description: s.description,
      waitDurationSeconds: s.waitDurationSeconds,
      tipOrWarning: s.tipOrWarning,
    };
  });

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);

  const currentStep = normalizedSteps[activeStepIndex] || normalizedSteps[0];
  const progressPercent = Math.round(
    (completedSteps.length / (normalizedSteps.length || 1)) * 100
  );

  // Inicializar temporizador se o passo atual sugerir tempo
  useEffect(() => {
    if (currentStep?.waitDurationSeconds) {
      setTimerSeconds(currentStep.waitDurationSeconds);
      setIsTimerRunning(false);
    } else {
      setTimerSeconds(null);
      setIsTimerRunning(false);
    }
  }, [activeStepIndex]);

  // Contagem regressiva do timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Tentar vibrar se o dispositivo suportar
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleStepCompleted = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      const nextCompleted = [...completedSteps, index];
      setCompletedSteps(nextCompleted);

      // Se concluiu o passo atual, avançar para o próximo automaticamente
      if (index === activeStepIndex && activeStepIndex < normalizedSteps.length - 1) {
        setTimeout(() => {
          setActiveStepIndex(activeStepIndex + 1);
        }, 300);
      }

      // Se concluiu todos os passos, exibir celebração
      if (nextCompleted.length === normalizedSteps.length) {
        setShowCelebration(true);
      }
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (normalizedSteps.length === 0) {
    return null;
  }

  return (
    <div
      id="guided-solve-container"
      className={`w-full rounded-2xl sm:rounded-3xl border border-amber-200 dark:border-amber-950/70 bg-gradient-to-b from-amber-500/5 to-transparent p-4 sm:p-6 shadow-sm ${className}`}
    >
      {/* Header com barra de progresso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950">
              Guia Prático Passo a Passo
            </span>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
              {completedSteps.length} de {normalizedSteps.length} etapas concluídas ({progressPercent}%)
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white mt-1">
            Como resolver agora: {problemTitle}
          </h3>
        </div>

        {/* Botão de Emergência / Ajuda Profissional */}
        {onEmergencyClick && (
          <button
            type="button"
            onClick={onEmergencyClick}
            className="self-start sm:self-auto text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Precisa de Ajuda Especializada?</span>
          </button>
        )}
      </div>

      {/* Barra de Progresso Visual */}
      <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden mb-5">
        <motion.div
          className="h-full bg-amber-500 rounded-full transition-all duration-300"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Alerta de Cuidado se houver */}
      {immediateWarning && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{immediateWarning}</span>
        </div>
      )}

      {/* Card da Etapa Atual em Destaque */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md mb-4 transition-all">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
              {activeStepIndex + 1}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Etapa Ativa ({activeStepIndex + 1} de {normalizedSteps.length})
            </span>
          </div>

          {/* Botão de Check rápido da etapa ativa */}
          <button
            type="button"
            onClick={() => toggleStepCompleted(activeStepIndex)}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              completedSteps.includes(activeStepIndex)
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{completedSteps.includes(activeStepIndex) ? 'Concluído!' : 'Marcar Feito'}</span>
          </button>
        </div>

        <h4 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white mb-2">
          {currentStep.title}
        </h4>

        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
          {currentStep.description}
        </p>

        {currentStep.tipOrWarning && (
          <div className="mt-3 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-[11px] text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{currentStep.tipOrWarning}</span>
          </div>
        )}

        {/* Temporizador Embutido (quando o passo pede tempo de espera) */}
        {timerSeconds !== null && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <div>
                <div className="text-[11px] font-bold text-stone-900 dark:text-white">
                  Tempo Recomendado nesta Ação
                </div>
                <div className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                  {formatTimer(timerSeconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(currentStep.waitDurationSeconds || 0);
                }}
                className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-white cursor-pointer"
                title="Reiniciar tempo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Navegação entre Etapas */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
            disabled={activeStepIndex === 0}
            className={`text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all ${
              activeStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStepIndex(Math.min(normalizedSteps.length - 1, activeStepIndex + 1))}
            disabled={activeStepIndex === normalizedSteps.length - 1}
            className={`text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all ${
              activeStepIndex === normalizedSteps.length - 1
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer'
            }`}
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de Checklist Compacta de Todos os Passos */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 block px-1">
          Visão Geral do Roteiro
        </span>
        {normalizedSteps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const isCurrent = idx === activeStepIndex;

          return (
            <div
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-amber-500/70 bg-amber-500/10'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-stone-200 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepCompleted(idx);
                  }}
                  className="text-stone-400 hover:text-emerald-500 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-stone-400" />
                  )}
                </button>
                <span
                  className={`text-xs truncate ${
                    isDone
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : isCurrent
                      ? 'font-bold text-stone-900 dark:text-white'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {idx + 1}. {step.title}
                </span>
              </div>

              {step.waitDurationSeconds && (
                <span className="text-[10px] font-mono text-stone-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(step.waitDurationSeconds / 60)} min
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal / Banner de Celebração quando completa todos os passos */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
          >
            <div className="flex items-center gap-2 font-black text-sm">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Excelente! Você concluiu todas as etapas recomendadas.</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 mb-3">
              Como está a situação agora? Conseguimos resolver a sua dor ou o perrengue?
            </p>

            {feedbackSent === null ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSent(true);
                    onFinishFeedback?.(true);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Sim, Resolvido!</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSent(false);
                    onFinishFeedback?.(false);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-300 cursor-pointer"
                >
                  Ainda preciso de mais ajuda
                </button>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Obrigado pelo seu retorno!</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
