import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ThumbsDown,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ReportSolutionData {
  problemDescription: string;
  solutionTitle?: string;
  primaryActionLabel?: string;
  searchQuery?: string;
  fullSummary?: string;
  locationInfo?: string;
}

interface ReportSolutionModalProps {
  data: ReportSolutionData;
  onClose: () => void;
  onSuccess?: () => void;
}

type IssueType = 'fanciful' | 'unfeasible' | 'unrelated' | 'wrong_service' | 'other';

const ISSUE_OPTIONS: { type: IssueType; title: string; desc: string; icon: string }[] = [
  {
    type: 'fanciful',
    title: 'Fantasiosa ou Irrealista',
    desc: 'Propõe algo mirabolante, mágico ou que não existe no mundo real.',
    icon: '🪄',
  },
  {
    type: 'unfeasible',
    title: 'Inviável na Prática ou Perigosa',
    desc: 'Impossível de fazer sozinho, perigoso ou exige ferramenta inacessível.',
    icon: '🛑',
  },
  {
    type: 'unrelated',
    title: 'Não Corresponde à Realidade / Minha Dor',
    desc: 'Ignorou o que eu realmente precisava ou entendeu o problema errado.',
    icon: '❌',
  },
  {
    type: 'wrong_service',
    title: 'Serviço ou Categoria Incorreta',
    desc: 'Sugeriu um tipo de comércio, socorro ou busca que não resolve o caso.',
    icon: '📍',
  },
  {
    type: 'other',
    title: 'Outro Erro ou Inconsistência',
    desc: 'Outro motivo que tornou a resposta inútil ou equivocada.',
    icon: '💬',
  },
];

export const ReportSolutionModal: React.FC<ReportSolutionModalProps> = ({
  data,
  onClose,
  onSuccess,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<IssueType>('unfeasible');
  const [userComment, setUserComment] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const activeOption = ISSUE_OPTIONS.find((o) => o.type === selectedIssue);

    const payload = {
      problemDescription: data.problemDescription,
      reportedSolution: {
        title: data.solutionTitle,
        primaryActionLabel: data.primaryActionLabel,
        searchQuery: data.searchQuery,
        fullSummary: data.fullSummary,
      },
      issueType: selectedIssue,
      issueLabel: activeOption ? activeOption.title : selectedIssue,
      userComment: userComment.trim(),
      suggestedCorrection: suggestedCorrection.trim(),
      locationInfo: data.locationInfo,
    };

    try {
      const res = await fetch('/api/feedback/report-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar relatório');
      }

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.warn('Erro ao enviar para API, salvando em localStorage:', err);
      // Fallback local caso o backend esteja offline
      try {
        const localKey = 'reported_solutions_offline_queue';
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.unshift({
          ...payload,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        });
        localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
        setSubmitted(true);
      } catch (storageErr) {
        setErrorMsg('Não foi possível salvar o reporte no momento. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="report-solution-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="report-solution-modal-container"
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-stone-800 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <header className="px-5 py-4 border-b border-neutral-200 dark:border-stone-800 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Informar Solução Inviável ou Errada</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Ajude a calibrar o sistema para nunca mais recomendar algo fora da realidade.
              </p>
            </div>
          </div>

          <button
            id="btn-close-report-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* CONTEÚDO */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-neutral-900 dark:text-stone-100">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-50 dark:border-emerald-900/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-neutral-950 dark:text-white">
                  Relatório Registrado com Sucesso!
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                  Obrigado por nos avisar. Registramos esse caso para auditar e ajustar os prompts de inteligência do aplicativo, evitando que respostas impraticáveis sejam repetidas.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  id="btn-report-finished-close"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Concluir e Voltar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* O QUE O SISTEMA RELATOU */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-stone-800/60 border border-neutral-200 dark:border-stone-700 text-xs space-y-1.5">
                <span className="font-bold text-neutral-500 dark:text-stone-400 uppercase tracking-wider text-[10px] block">
                  Problema e Solução Avaliados:
                </span>
                <p className="text-neutral-800 dark:text-stone-200 font-semibold">
                  <span className="text-neutral-500 dark:text-stone-400">Problema:</span> “{data.problemDescription}”
                </p>
                {data.solutionTitle && (
                  <p className="text-neutral-700 dark:text-stone-300">
                    <span className="text-neutral-500 dark:text-stone-400">Solução recomendada pelo app:</span> “{data.solutionTitle}”
                  </p>
                )}
                {data.primaryActionLabel && (
                  <p className="text-neutral-600 dark:text-stone-400 text-[11px]">
                    <span className="text-neutral-400 dark:text-stone-500">Ação principal:</span> {data.primaryActionLabel}
                  </p>
                )}
              </div>

              {/* OPÇÕES DE PROBLEMA / INCONSISTÊNCIA */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-900 dark:text-stone-200 block">
                  Qual é a principal inconsistência dessa solução?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ISSUE_OPTIONS.map((opt) => {
                    const isSelected = selectedIssue === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setSelectedIssue(opt.type)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-red-50/60 dark:bg-red-950/40 border-red-400 dark:border-red-600 shadow-2xs'
                            : 'bg-white dark:bg-stone-800/50 border-neutral-200 dark:border-stone-700 hover:border-neutral-300 dark:hover:border-stone-600 hover:bg-neutral-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-bold ${
                              isSelected ? 'text-red-950 dark:text-red-300' : 'text-neutral-900 dark:text-stone-100'
                            }`}
                          >
                            {opt.title}
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-stone-400 leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                            isSelected
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-neutral-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DETALHAMENTO LIVRE DO USUÁRIO */}
              <div className="space-y-1.5">
                <label
                  htmlFor="userComment"
                  className="text-xs font-bold text-neutral-900 dark:text-stone-200 flex items-center justify-between"
                >
                  <span>Por que essa solução não funciona na prática?</span>
                  <span className="text-[10px] text-neutral-400 dark:text-stone-500 font-normal">Opcional</span>
                </label>
                <textarea
                  id="userComment"
                  rows={2}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Ex: Esse carro não tem chave de roda nesse local / não existe esse serviço de madrugada / é perigoso tentar fazer isso na chuva..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-stone-800 text-neutral-900 dark:text-stone-100 placeholder:text-neutral-400 dark:placeholder:text-stone-500"
                />
              </div>

              {/* SUGESTÃO DO USUÁRIO */}
              <div className="space-y-1.5">
                <label
                  htmlFor="suggestedCorrection"
                  className="text-xs font-bold text-neutral-900 dark:text-stone-200 flex items-center justify-between"
                >
                  <span>O que o app deveria ter sugerido em vez disso?</span>
                  <span className="text-[10px] text-neutral-400 dark:text-stone-500 font-normal">Opcional</span>
                </label>
                <input
                  id="suggestedCorrection"
                  type="text"
                  value={suggestedCorrection}
                  onChange={(e) => setSuggestedCorrection(e.target.value)}
                  placeholder="Ex: Chamar um guincho plataforma direto / ligar para o seguro / procurar auto-elétrica 24h"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-stone-800 text-neutral-900 dark:text-stone-100 placeholder:text-neutral-400 dark:placeholder:text-stone-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* FOOTER DO FORMULÁRIO */}
              <div className="pt-2 border-t border-neutral-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-neutral-400 dark:text-stone-500">
                  Seu feedback será analisado no painel administrativo.
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-semibold text-neutral-600 dark:text-stone-300 hover:bg-neutral-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="btn-submit-report-solution"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Correção</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
