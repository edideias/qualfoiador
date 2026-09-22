import React, { useState, useEffect } from 'react';
import { AppRoute, ProblemAssessment, ProblemPainAnalysisResult } from '../../types';
import { problemPainService } from '../../modules/problem_pain/problemPainStore';
import { problemSolverService } from '../../services/problemSolverService';
import { AudioInputModal } from '../AudioInputModal';
import { detectQuintaSerie } from '../../services/quintaSerieService';
import { QuintaSerieCard } from '../QuintaSerieCard';
import {
  ArrowLeft,
  Zap,
  Mic,
  Sparkles,
  AlertCircle,
  MapPin,
  Flame,
  KeyRound,
  Car,
  Droplets,
  Lightbulb,
  Utensils,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export interface ProblemPainViewProps {
  onNavigate: (route: AppRoute) => void;
  onComplete?: (assessment: ProblemAssessment, analysis: ProblemPainAnalysisResult) => void;
  initialDescription?: string;
  initialAssessment?: Partial<ProblemAssessment>;
}

const ACTION_SUGGESTIONS = [
  { label: '🚨 Pneu furado', query: 'pneu furado' },
  { label: '⚡ Carro não liga', query: 'carro não liga' },
  { label: '🔑 Perdi minha chave', query: 'perdi minha chave' },
  { label: '🔥 Acabou o gás', query: 'acabou o gás' },
  { label: '💧 Cano estourou', query: 'cano estourou' },
  { label: '💡 Preciso de eletricista', query: 'preciso de um eletricista' },
  { label: '🍔 Estou com fome', query: 'estou com fome' },
  { label: '📄 Imprimir documento', query: 'preciso imprimir um documento' },
  { label: '💊 Farmácia urgente', query: 'farmácia aberta agora' },
];

export const ProblemPainView: React.FC<ProblemPainViewProps> = ({
  onNavigate,
  onComplete,
  initialDescription,
  initialAssessment,
}) => {
  const [draft] = useState(() => problemPainService.getDraft());
  const [description, setDescription] = useState(
    initialDescription ?? draft.description ?? ''
  );
  const [voiceUsed, setVoiceUsed] = useState(draft.voiceUsed || false);
  const [validationError, setValidationError] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [quintaSerieState, setQuintaSerieState] = useState<{
    isOpen: boolean;
    text: string;
    jokeResponse?: string;
  }>({
    isOpen: false,
    text: '',
  });

  // Sync draft
  useEffect(() => {
    problemPainService.saveDraft({
      description,
      voiceUsed,
      status: 'draft',
    });
  }, [description, voiceUsed]);

  const handleExecuteSolve = async (problemText: string) => {
    const cleanText = problemText.trim();
    if (!cleanText || cleanText.length < 2) {
      setValidationError('Por favor, informe o problema que precisa resolver.');
      return;
    }

    // Intercept Quinta Série
    const qsCheck = detectQuintaSerie(cleanText);
    if (qsCheck.isQuintaSerie) {
      setQuintaSerieState({
        isOpen: true,
        text: cleanText,
        jokeResponse: qsCheck.suggestedJokeResponse,
      });
      return;
    }

    setValidationError('');
    setIsSolving(true);

    const assessment: ProblemAssessment = {
      initialDescription: cleanText,
      frequency: 'Agora',
      timeSpent: 'Imediato',
      area: 'Vida Real & Urgência',
      priorityGoal: 'Resolver agora',
      voiceUsed,
      completedAt: new Date().toISOString(),
    };

    try {
      // 1. Solve via problemSolverService (fast catalog or AI backend)
      const analysisResult = await problemSolverService.solve(assessment);

      // 2. Persist
      problemPainService.saveCurrentAssessment(assessment);
      problemPainService.saveCurrentAnalysis(analysisResult);

      if (onComplete) {
        onComplete(assessment, analysisResult);
      }

      onNavigate('/dor-problema/resultado');
    } catch (err) {
      console.error('Erro ao resolver, usando contingência imediata:', err);
      const fallbackRecord = problemPainService.completeAssessment(assessment);
      if (onComplete) {
        onComplete(assessment, fallbackRecord.analysisResult);
      }
      onNavigate('/dor-problema/resultado');
    } finally {
      setIsSolving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSolve(description);
  };

  return (
    <main id="problem-pain-view" className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-16">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="btn-return-home-from-problem"
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 py-1.5 px-3 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Início
        </button>

        <span className="text-xs font-mono text-neutral-400">
          Resolvedor da Vida Real
        </span>
      </div>

      {/* Header Orientado à Ação */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5" />
          Ação Imediata • Menos Texto • Mais Solução
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
          Qual é o seu problema agora?
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Diga em poucas palavras ou grave um áudio. Nós indicamos o que fazer agora e onde resolver.
        </p>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            id="input-problem-description"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Ex: pneu furado, perdi minha chave, carro não liga, acabou o gás, cano estourou..."
            className="w-full p-4 pr-14 text-base sm:text-lg rounded-xl border-2 border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-neutral-900 placeholder:text-neutral-400 resize-none transition-all"
            autoFocus
          />

          <div className="absolute right-2.5 bottom-2.5">
            <button
              id="btn-trigger-mic-problem-pain"
              type="button"
              onClick={() => setIsAudioModalOpen(true)}
              title="Gravar áudio ou falar o problema"
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Voice Bar */}
        <div className="w-full">
          <button
            id="btn-open-audio-modal-problem"
            type="button"
            onClick={() => setIsAudioModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Mic className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>Prefere falar? Gravar áudio ou enviar mensagem de voz</span>
          </button>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Botão Principal de Resolução */}
        <button
          id="btn-submit-problem-action"
          type="submit"
          disabled={isSolving || !description.trim()}
          className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-neutral-950 font-extrabold text-base sm:text-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5 text-neutral-950" />
          <span>{isSolving ? 'ENCONTRANDO A SOLUÇÃO MAIS RÁPIDA...' : 'RESOLVER AGORA ⚡'}</span>
        </button>
      </form>

      {/* Atalhos de Emergência de 1 Toque */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <p className="text-xs uppercase tracking-wider font-bold text-neutral-500 mb-3">
          Problemas Frequentes (Toque para resolver direto):
        </p>

        <div className="flex flex-wrap gap-2">
          {ACTION_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDescription(item.query);
                handleExecuteSolve(item.query);
              }}
              className="px-3 py-2 rounded-lg bg-white border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-800 transition-all shadow-2xs text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Input Modal */}
      <AudioInputModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        title="Descrever seu problema por voz"
        subtitle="Diga o que aconteceu e o que você precisa agora. Nós transcrevemos tudo automaticamente."
        initialText={description}
        onApplyText={(text) => {
          const clean = text.trim();
          setDescription(clean);
          setVoiceUsed(true);
          if (validationError) setValidationError('');
        }}
      />

      {/* Cartão de Aviso: Modo 5ª Série */}
      <QuintaSerieCard
        isOpen={quintaSerieState.isOpen}
        onClose={() => setQuintaSerieState((prev) => ({ ...prev, isOpen: false }))}
        detectedText={quintaSerieState.text}
        jokeResponse={quintaSerieState.jokeResponse}
        onChooseSerious={() => {
          setQuintaSerieState((prev) => ({ ...prev, isOpen: false }));
          setDescription('');
        }}
        onChooseJoke={() => {
          // Continua na zoeira descontraída
        }}
      />
    </main>
  );
};
