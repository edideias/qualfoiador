import React from 'react';
import { Mic, X } from 'lucide-react';

interface VoiceNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'fisica' | 'problema';
}

export const VoiceNoticeModal: React.FC<VoiceNoticeModalProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="voice-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="voice-modal-card"
        className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200/90 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <button
            id="btn-close-voice-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-display text-xl font-extrabold text-stone-950 mb-2">
          Entrada por voz em preparação
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed mb-6 font-medium">
          A transcrição por áudio direto estará disponível na próxima atualização do micro-SaaS{' '}
          {context === 'fisica' ? 'de Dor Física' : 'de Dor / Problema'}. Por enquanto, conte seu relato por escrito no campo principal.
        </p>

        <button
          id="btn-confirm-voice-modal"
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] py-3 px-6 bg-stone-950 text-white font-bold rounded-2xl hover:bg-stone-850 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
        >
          Entendido, vou digitar
        </button>
      </div>
    </div>
  );
};
