import React, { useState, useEffect } from 'react';
import { AppRoute, PhysicalPainAssessment } from '../../types';
import { physicalPainService } from '../../modules/physical_pain/physicalPainStore';
import { PhysicalPainStepQuestions } from './PhysicalPainStepQuestions';
import { AudioInputModal } from '../AudioInputModal';
import { detectQuintaSerie } from '../../services/quintaSerieService';
import { QuintaSerieCard } from '../QuintaSerieCard';
import { ArrowLeft, ArrowRight, AlertCircle, Activity, Mic, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface PhysicalPainViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const PhysicalPainView: React.FC<PhysicalPainViewProps> = ({ onNavigate }) => {
  const [draft, setDraft] = useState(() => physicalPainService.getDraft());
  const [description, setDescription] = useState(draft.description || '');
  const [validationError, setValidationError] = useState('');
  const [stage, setStage] = useState<'input' | 'questions'>('input');
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [quintaSerieState, setQuintaSerieState] = useState<{
    isOpen: boolean;
    text: string;
    jokeResponse?: string;
  }>({
    isOpen: false,
    text: '',
  });

  useEffect(() => {
    if (stage === 'input') {
      physicalPainService.saveDraft({
        ...draft,
        description,
        status: 'draft',
      });
    }
  }, [description, stage]);

  const handleContinueToQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = description.trim();
    if (!clean) {
      setValidationError('Conta pra gente em algumas palavras o que você está sentindo.');
      return;
    }

    // Intercept Quinta Série
    const qsCheck = detectQuintaSerie(clean);
    if (qsCheck.isQuintaSerie) {
      setQuintaSerieState({
        isOpen: true,
        text: clean,
        jokeResponse: qsCheck.suggestedJokeResponse,
      });
      return;
    }

    setValidationError('');
    physicalPainService.saveDraft({
      description: clean,
      voiceUsed: false,
      status: 'answering',
    });
    setStage('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionsComplete = async (assessment: PhysicalPainAssessment) => {
    await physicalPainService.completeAssessment(assessment);
    onNavigate('/dor-fisica/resultado');
  };

  const handleBackToInitial = () => {
    setStage('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main id="physical-pain-view" className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-10 pb-16 flex flex-col items-center">
      {stage === 'input' ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          {/* Discreet Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <button
              id="btn-return-home-from-physical"
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-full bg-white border border-stone-200/80 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao início</span>
            </button>

            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
              Corpo & Saúde
            </span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-[28px] p-6 sm:p-10 shadow-xs">
            {/* Header */}
            <div className="mb-6 sm:mb-8 text-left">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center mb-4 shadow-2xs">
                <Activity className="w-6 h-6 stroke-[2.25]" />
              </div>
              <h1
                id="physical-pain-title"
                className="font-display text-2xl sm:text-4xl font-extrabold text-stone-950 tracking-tight mb-2"
              >
                QUAL É A SUA DOR?
              </h1>
              <p
                id="physical-pain-subtitle"
                className="text-stone-600 text-base sm:text-lg leading-relaxed font-medium"
              >
                Pode contar do seu jeito. Não precisa saber o nome técnico dela.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleContinueToQuestions} className="space-y-6">
              <div>
                <label htmlFor="input-physical-pain" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Descreva o que está sentindo
                </label>
                <div className="relative">
                  <textarea
                    id="input-physical-pain"
                    rows={5}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleContinueToQuestions(e);
                      }
                    }}
                    placeholder="Ex.: Estou sentindo uma fisgada chata no fundo das costas desde ontem que piora ao sentar…"
                    className="w-full p-4 sm:p-5 pr-14 rounded-2xl border border-stone-300/90 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 text-base sm:text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-stone-950 focus:bg-white transition-all resize-y min-h-[150px]"
                    aria-required="true"
                    autoFocus
                  />
                  <div className="absolute right-3 bottom-3 z-10">
                    <button
                      id="btn-trigger-mic-physical-pain"
                      type="button"
                      onClick={() => setIsAudioModalOpen(true)}
                      title="Gravar áudio ou falar o que sente"
                      className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {validationError && (
                  <div
                    id="error-physical-pain"
                    className="mt-2.5 flex items-center gap-2 text-sm font-semibold text-rose-600"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Botão Principal */}
              <button
                id="btn-continue-physical-pain"
                type="submit"
                className="group w-full min-h-[54px] inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-950 hover:bg-stone-850 active:scale-[0.99] text-white font-bold text-base rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>ORGANIZAR MINHA DOR</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
              </button>

              {/* Botão Secundário de Voz */}
              <div className="pt-2 text-center border-t border-stone-100 space-y-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    id="btn-open-audio-modal-physical"
                    type="button"
                    onClick={() => setIsAudioModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <Mic className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span>Prefere falar? Gravar áudio ou enviar voz</span>
                  </button>

                  <p className="text-xs text-stone-400 font-medium">
                    100% privado • Sem cadastro
                  </p>
                </div>
              </div>

              {/* Disclaimer discreto na parte inferior */}
              <div
                id="disclaimer-physical-pain"
                className="pt-4 text-center border-t border-stone-100 text-[11px] text-stone-400 leading-normal flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Informativo e de orientação. Não substitui avaliação médica profissional.</span>
              </div>
            </form>
          </div>
        </motion.div>
      ) : (
        /* STEP-BY-STEP CONVERSATIONAL QUESTIONS */
        <PhysicalPainStepQuestions
          initialDescription={description}
          onComplete={handleQuestionsComplete}
          onBackToInitial={handleBackToInitial}
        />
      )}

      {/* Audio Input Modal */}
      <AudioInputModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        title="Descrever sua dor por voz"
        subtitle="Fale livremente sobre onde dói, quando começou ou o que piora. Você pode revisar o texto antes de confirmar."
        initialText={description}
        onApplyText={(text) => {
          const clean = text.trim();
          setDescription(clean);
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
