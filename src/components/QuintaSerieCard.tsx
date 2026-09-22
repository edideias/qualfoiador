import React, { useState } from 'react';
import { Sparkles, Smile, ArrowRight, HeartPulse, Wrench, RefreshCw, X } from 'lucide-react';

interface QuintaSerieCardProps {
  isOpen: boolean;
  onClose: () => void;
  detectedText: string;
  jokeResponse?: string;
  onChooseSerious: () => void;
  onChooseJoke: () => void;
}

export const QuintaSerieCard: React.FC<QuintaSerieCardProps> = ({
  isOpen,
  onClose,
  detectedText,
  jokeResponse,
  onChooseSerious,
  onChooseJoke,
}) => {
  const [isPlayingJoke, setIsPlayingJoke] = useState(false);
  const [jokeHistoryIndex, setJokeHistoryIndex] = useState(0);

  if (!isOpen) return null;

  const extraJokes = [
    'Quer uma água com açúcar ou um boleto vencido pra passar essa dor rapidinho? 😂',
    'Diagnosticado com excesso de zoeira no sangue! Tratamento: 1 minuto de silêncio e foco no problema.',
    'Se piada infame pagasse conta, você já estava milionário! Bora falar o que tá pegando de verdade?',
    'A 5ª série que habita em mim saúda a 5ª série que habita em você! ✌️',
  ];

  const currentJoke = jokeResponse || extraJokes[jokeHistoryIndex % extraJokes.length];

  return (
    <div
      id="quinta-serie-aviso-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="quinta-serie-aviso-card"
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-400 text-neutral-900 relative my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de Fechar */}
        <button
          id="btn-fechar-quinta-serie"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emblema da 5ª Série */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center text-2xl shadow-sm">
            🎒
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wide uppercase">
              <Smile className="w-3.5 h-3.5 text-amber-600" />
              <span>Modo 5ª Série Ativado</span>
            </div>
            <h3 className="font-black text-xl text-neutral-950 tracking-tight mt-0.5">
              Sentimos cheiro de zoeira por aqui!
            </h3>
          </div>
        </div>

        {/* O que a pessoa falou */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 mb-4 text-sm">
          <p className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-1">
            O que você mandou:
          </p>
          <p className="font-medium text-neutral-800 italic">
            "{detectedText}"
          </p>
        </div>

        {/* Resposta Bem-humorada */}
        <div className="bg-neutral-100 rounded-2xl p-4 mb-6 border border-neutral-200 text-sm leading-relaxed">
          <p className="font-semibold text-neutral-900">
            {currentJoke}
          </p>
        </div>

        {/* Pergunta Direta ao Brasileiro */}
        <p className="text-sm font-bold text-neutral-900 text-center mb-4">
          E aí, como vamos tocar agora? Escolha o seu caminho:
        </p>

        {/* As Duas Escolhas */}
        <div className="space-y-3">
          {/* Opção 1: Falar Sério */}
          <button
            id="btn-escolher-falar-serio"
            type="button"
            onClick={onChooseSerious}
            className="w-full p-4 rounded-2xl bg-neutral-950 hover:bg-neutral-850 text-white font-extrabold text-sm sm:text-base transition-all shadow-md active:scale-[0.99] flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="leading-tight">Quero falar sério</p>
                <p className="text-xs text-neutral-400 font-normal">Tenho uma dor ou perrengue de verdade</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </button>

          {/* Opção 2: Continuar na Brincadeira */}
          <button
            id="btn-escolher-brincadeira"
            type="button"
            onClick={() => {
              setIsPlayingJoke(true);
              setJokeHistoryIndex((prev) => prev + 1);
              onChooseJoke();
            }}
            className="w-full p-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm sm:text-base transition-all shadow-sm active:scale-[0.99] flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-500/30 flex items-center justify-center text-neutral-950">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <p className="leading-tight">Quero continuar na zoeira</p>
                <p className="text-xs text-neutral-800 font-medium">Manda outra que eu aguento!</p>
              </div>
            </div>
            <RefreshCw className="w-4 h-4 text-neutral-900 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Nota simples e direta */}
        <p className="text-center text-xs text-neutral-500 mt-4">
          Quando cansar de rir, o app tá pronto pra resolver qualquer parada real.
        </p>
      </div>
    </div>
  );
};
