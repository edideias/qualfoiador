import React, { useState, useEffect } from 'react';
import { PhysicalPainAssessment } from '../../types';
import { classifyPainIntent } from '../../services/ai/painClassifier';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhysicalPainStepQuestionsProps {
  initialDescription: string;
  onComplete: (assessment: PhysicalPainAssessment) => void;
  onBackToInitial: () => void;
}

const COMMON_LOCATIONS = [
  'Cabeça',
  'Costas / Lombar',
  'Barriga / Abdômen',
  'Peito / Tórax',
  'Pescoço / Ombros',
  'Perna / Joelho',
  'Braço / Mão',
  'Garganta',
];

const DURATION_OPTIONS = [
  'Menos de 1 hora',
  'Algumas horas',
  '1 dia',
  'Alguns dias',
  'Algumas semanas',
  'Há meses',
  'Outro tempo',
];

const PAIN_TYPES_OPTIONS = [
  'Pressão ou aperto',
  'Pontada fina',
  'Queimação',
  'Cólica',
  'Peso constante',
  'Pulsação',
  'Choque elétrico',
  'Não sei explicar',
];

const FREQUENCY_OPTIONS = [
  'O tempo todo (contínua)',
  'Vai e volta',
  'Apenas em determinados momentos',
  'Só quando faço algum movimento',
  'Não sei',
];

const OTHER_SYMPTOMS_OPTIONS = [
  'Febre',
  'Náusea ou enjoo',
  'Tontura',
  'Falta de ar',
  'Fraqueza no corpo',
  'Inchaço',
  'Sangramento',
  'Nenhum desses',
];

export const PhysicalPainStepQuestions: React.FC<PhysicalPainStepQuestionsProps> = ({
  initialDescription,
  onComplete,
  onBackToInitial,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-detect location & intensity from initial free-text description
  const initialClassification = classifyPainIntent(initialDescription);

  // Form State with smart initial recognition
  const [location, setLocation] = useState(initialClassification.extractedLocation || '');
  const [intensity, setIntensity] = useState<number | null>(initialClassification.suggestedIntensity ?? null);
  const [duration, setDuration] = useState('');
  const [painTypes, setPainTypes] = useState<string[]>(() => {
    const types: string[] = [];
    const textLower = initialDescription.toLowerCase();
    if (textLower.includes('pressão') || textLower.includes('aperto')) types.push('Pressão ou aperto');
    if (textLower.includes('pontada') || textLower.includes('fisgada')) types.push('Pontada fina');
    if (textLower.includes('queima') || textLower.includes('ard')) types.push('Queimação');
    if (textLower.includes('cólica') || textLower.includes('colica')) types.push('Cólica');
    if (textLower.includes('pulsa') || textLower.includes('lateja')) types.push('Pulsação');
    return types;
  });
  const [frequency, setFrequency] = useState('');
  const [otherSymptoms, setOtherSymptoms] = useState<string[]>(() => {
    const syms: string[] = [];
    const textLower = initialDescription.toLowerCase();
    if (textLower.includes('febre')) syms.push('Febre');
    if (textLower.includes('enjoo') || textLower.includes('náusea') || textLower.includes('nausea')) syms.push('Náusea ou enjoo');
    if (textLower.includes('tontura')) syms.push('Tontura');
    if (textLower.includes('falta de ar') || textLower.includes('respirar')) syms.push('Falta de ar');
    if (textLower.includes('inchaço') || textLower.includes('inchado')) syms.push('Inchaço');
    if (textLower.includes('sangr')) syms.push('Sangramento');
    return syms;
  });

  const totalSteps = 6;

  // Auto-advance helper with short visual feedback delay
  const advanceWithFeedback = (nextStepIdx: number) => {
    setTimeout(() => {
      setCurrentStep(nextStepIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 240);
  };

  const handleNextManual = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finalizeAssessment();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToInitial();
    }
  };

  const finalizeAssessment = () => {
    const assessment: PhysicalPainAssessment = {
      initialDescription,
      location: location.trim() || 'Região não especificada',
      intensity: intensity !== null ? intensity : 5,
      duration: duration || 'Não especificada',
      painTypes: painTypes.length > 0 ? painTypes : ['Não especificado'],
      frequency: frequency || 'Não especificada',
      otherSymptoms,
      completedAt: new Date().toISOString(),
    };
    onComplete(assessment);
  };

  const togglePainType = (type: string) => {
    setPainTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        if (type === 'Não sei explicar') return [type];
        return [...prev.filter((t) => t !== 'Não sei explicar'), type];
      }
    });
  };

  const toggleSymptom = (sym: string) => {
    setOtherSymptoms((prev) => {
      if (sym === 'Nenhum desses') {
        return prev.includes('Nenhum desses') ? [] : ['Nenhum desses'];
      }
      const filtered = prev.filter((s) => s !== 'Nenhum desses');
      if (filtered.includes(sym)) {
        return filtered.filter((s) => s !== sym);
      } else {
        return [...filtered, sym];
      }
    });
  };

  return (
    <div id="physical-pain-questions" className="w-full max-w-xl mx-auto min-h-[500px] flex flex-col justify-between py-2">
      {/* Top discreet bar */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <button
          id="btn-step-back"
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-full bg-white border border-stone-200/80 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </button>

        {/* Modern Segmented Step Indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-amber-500'
                  : idx < currentStep
                  ? 'w-2 bg-stone-900'
                  : 'w-2 bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center Conversational Area */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 0: ONDE DÓI? */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight text-center sm:text-left">
                Onde você sente essa dor?
              </h2>

              <input
                id="input-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && location.trim()) {
                    advanceWithFeedback(1);
                  }
                }}
                placeholder="Escreva a região (ex.: na nuca, lombar...)"
                className="w-full px-5 py-4 rounded-2xl border border-stone-300 bg-white text-stone-900 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-stone-950 transition-all shadow-2xs"
                autoFocus
              />

              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                  Ou escolha uma opção rápida:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {COMMON_LOCATIONS.map((loc) => {
                    const isSelected = location === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocation(loc);
                          advanceWithFeedback(1);
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl text-left font-semibold text-sm sm:text-base border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-stone-200 bg-white hover:bg-stone-100/80 text-stone-800'
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {location.trim() && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => advanceWithFeedback(1)}
                    className="min-h-[48px] px-6 py-3 bg-stone-950 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2 hover:bg-stone-800 transition-all"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1: INTENSIDADE (0 a 10) */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-950 tracking-tight leading-tight mb-2">
                  De 0 a 10, quanto está doendo agora?
                </h2>
                <p className="text-stone-500 text-sm sm:text-base">
                  0 = sem dor e 10 = o pior que você já sentiu.
                </p>
              </div>

              {/* Visual Buttons 0 to 10 */}
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 pt-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = intensity === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setIntensity(num);
                        advanceWithFeedback(2);
                      }}
                      className={`h-14 sm:h-16 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white scale-105 shadow-md ring-2 ring-stone-950'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-900'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between text-xs font-semibold text-stone-400 px-1">
                <span>Leve</span>
                <span>Moderada</span>
                <span>Muito forte</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DURAÇÃO */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-950 tracking-tight leading-tight text-center sm:text-left">
                Há quanto tempo você sente isso?
              </h2>

              <div className="space-y-2.5 pt-2">
                {DURATION_OPTIONS.map((item) => {
                  const isSelected = duration === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setDuration(item);
                        advanceWithFeedback(3);
                      }}
                      className={`w-full min-h-[54px] p-4 rounded-2xl text-left font-bold text-base border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                          : 'border-stone-200 bg-white hover:bg-stone-100/90 text-stone-800'
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <Check className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: TIPO DE DOR */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-950 tracking-tight leading-tight mb-2 text-center sm:text-left">
                  Como você descreveria essa dor?
                </h2>
                <p className="text-stone-500 text-sm sm:text-base">
                  Pode escolher uma ou mais sensações.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {PAIN_TYPES_OPTIONS.map((type) => {
                  const isSelected = painTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => togglePainType(type)}
                      className={`min-h-[52px] p-4 rounded-2xl text-left font-bold text-sm sm:text-base border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-200 bg-white hover:bg-stone-100/90 text-stone-800'
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => advanceWithFeedback(4)}
                  className="min-h-[48px] px-6 py-3 bg-stone-950 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2 hover:bg-stone-800 transition-all cursor-pointer"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: FREQUÊNCIA */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-950 tracking-tight leading-tight text-center sm:text-left">
                E isso acontece com que frequência?
              </h2>

              <div className="space-y-2.5 pt-2">
                {FREQUENCY_OPTIONS.map((opt) => {
                  const isSelected = frequency === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setFrequency(opt);
                        advanceWithFeedback(5);
                      }}
                      className={`w-full min-h-[54px] p-4 rounded-2xl text-left font-bold text-base border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                          : 'border-stone-200 bg-white hover:bg-stone-100/90 text-stone-800'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: OUTROS SINTOMAS */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-950 tracking-tight leading-tight mb-2 text-center sm:text-left">
                  Você percebeu alguma outra coisa junto com essa dor?
                </h2>
                <p className="text-stone-500 text-sm sm:text-base">
                  Marque se houver algo mais ou selecione "Nenhum desses".
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {OTHER_SYMPTOMS_OPTIONS.map((sym) => {
                  const isSelected = otherSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`min-h-[50px] p-3.5 rounded-2xl text-left font-bold text-xs sm:text-sm border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-200 bg-white hover:bg-stone-100/90 text-stone-800'
                      }`}
                    >
                      <span>{sym}</span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={finalizeAssessment}
                  className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-stone-950 text-white font-extrabold text-base rounded-2xl inline-flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-xs cursor-pointer"
                >
                  <span>Ver minha dor organizada</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-[11px] text-stone-400 mt-8">
        Passo {currentStep + 1} de {totalSteps} • Suas respostas são confidenciais
      </div>
    </div>
  );
};
