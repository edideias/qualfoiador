import React, { useState } from 'react';
import { AppRoute, PhysicalPainAssessment, PhysicalPainAnalysisResult } from '../../types';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Flame,
  Clock,
  Activity,
  HeartPulse,
  Info,
  X,
  Flag,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ReportSolutionModal } from '../common/ReportSolutionModal';
import { ShareSolutionCard } from '../ShareSolutionCard';
import { GuidedSolve } from '../GuidedSolve';
import { VisualAdviceCard } from './VisualAdviceCard';
import { TimeProcessingBadge } from '../TimeProcessingBadge';

interface PhysicalPainResultViewProps {
  assessment: PhysicalPainAssessment;
  analysisResult: PhysicalPainAnalysisResult;
  onNavigate: (route: AppRoute) => void;
  onReset: () => void;
}

export const PhysicalPainResultView: React.FC<PhysicalPainResultViewProps> = ({
  assessment,
  analysisResult,
  onNavigate,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { visualSummary, summaryParagraph, interpretationParagraph, redFlags } = analysisResult;

  const physicalGuidedSteps = [
    {
      title: 'Repouso da Região Afetada',
      description: `Evite sobrecarregar ${visualSummary.location}. Interrompa movimentos bruscos ou posições que provoquem pontadas agudas.`,
      tipOrWarning: 'Não force a articulação ou músculo além do limiar confortável.',
    },
    {
      title: 'Aplicação Térmica (Compressa de 15 min)',
      description:
        visualSummary.duration.toLowerCase().includes('hoje') || visualSummary.intensity >= 7
          ? 'Para dores recentes, pancadas ou sensação de calor/inchaço, aplique compressa de gelo envolvida em pano por 15 minutos.'
          : 'Para dores musculares crônicas, rigidez ou tensão acumulada, uma compressa morna por 15 minutos ajuda a relaxar as fibras.',
      waitDurationSeconds: 900,
      tipOrWarning: 'Nunca aplique gelo diretamente na pele desprotegida.',
    },
    {
      title: 'Ajuste Postural e Respiração',
      description:
        'Sente-se com bom apoio lombar ou deite-se em posição confortável. Respire pausadamente pelo nariz e solte o ar devagar pela boca, relaxando ombros e mandíbula.',
    },
    {
      title: 'Monitoramento Preventivo',
      description:
        'Observe a evolução nas próximas horas. Se surgirem febre alta, perda de sensibilidade, formigamento contínuo ou dor no peito, busque pronto atendimento presencial imediatamente.',
      tipOrWarning: 'Em emergências com risco à vida: SAMU 192 ou Bombeiros 193.',
    },
  ];

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryParagraph);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Resumo da minha dor - Qual é a sua dor?',
          text: summaryParagraph,
        });
        return;
      } catch {
        // user cancelled
      }
    }
    setShowShareModal(true);
  };

  return (
    <main id="physical-pain-result-view" className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-20">
      {/* Top Discreet Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="btn-return-home-from-result"
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Início</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-report-physical-pain-top"
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="Informar se a orientação for fantasiosa ou inviável"
          >
            <Flag className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Informar Erro</span>
          </button>
          <button
            id="btn-new-pain-top"
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Descrever outra dor</span>
          </button>
        </div>
      </div>

      {/* Hero Discovery Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 text-left"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-stone-700 bg-white border border-stone-200/80 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-stone-900" />
            <span>DOR FÍSICA ORGANIZADA</span>
          </div>
          <TimeProcessingBadge
            estimatedMinutes={15}
            type={redFlags.hasRedFlags ? 'avaliacao-medica' : 'alivio-imediato'}
          />
        </div>

        <h1
          id="result-main-title"
          className="font-display text-3xl sm:text-5xl font-extrabold text-stone-950 tracking-tight leading-[1.08] mb-3"
        >
          SUA DOR, <br />
          <span className="relative inline-block text-stone-950 font-black">
            <span className="relative z-10">AGORA FAZ SENTIDO.</span>
            <span
              className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-400/35 rounded-sm z-0"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="text-stone-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
          Aqui está o panorama estruturado do que você relatou. Claro, direto e pronto para te orientar ou compartilhar com um profissional.
        </p>
      </motion.div>

      {/* SINAIS DE ALERTA SE HOUVER */}
      {redFlags.hasRedFlags ? (
        <section
          id="section-red-flags-urgent"
          className="mb-8 p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-xs"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-black text-rose-950 tracking-tight mb-1">
                Quando procurar atendimento rapidamente
              </h2>
              <p className="text-sm sm:text-base font-bold text-rose-900 leading-relaxed mb-3">
                {redFlags.urgentRecommendationMessage ||
                  'As informações relatadas podem indicar que é importante uma avaliação médica imediata.'}
              </p>

              <div className="space-y-2 mb-3">
                {redFlags.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/90 rounded-xl border border-rose-200 text-xs sm:text-sm text-rose-950"
                  >
                    <span className="font-bold block mb-0.5">• {alert.title}</span>
                    <span className="text-rose-800 font-medium">{alert.reason}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-rose-800 font-semibold">
                Se a dor for súbita no peito, com falta de ar, desmaio ou sangramento intenso, procure um Pronto Atendimento ou SAMU (192).
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="mb-8 p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-stone-700 flex items-start gap-3 text-xs sm:text-sm">
          <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <span>
            <strong>Atenção preventiva:</strong> Caso essa dor piore de forma súbita, venha acompanhada de febre alta, falta de ar ou perda de força, não hesite em buscar avaliação presencial.
          </span>
        </div>
      )}

      {/* DISCOVERY MATRIX (CARDS) */}
      <section id="section-visual-summary" className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3 px-1">
          O raio-x do que você descreveu
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Localização */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-stone-600" />
              <span>ONDE DÓI</span>
            </div>
            <p className="text-stone-900 font-extrabold text-base sm:text-lg capitalize">
              {visualSummary.location}
            </p>
          </div>

          {/* Intensidade */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>INTENSIDADE</span>
            </div>
            <p className="text-stone-900 font-extrabold text-base sm:text-lg">
              {visualSummary.intensity}
            </p>
          </div>

          {/* Duração */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>HÁ QUANTO TEMPO</span>
            </div>
            <p className="text-stone-900 font-extrabold text-base sm:text-lg">
              {visualSummary.duration}
            </p>
          </div>

          {/* Tipo de sensação */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold mb-1">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>SENSAÇÃO</span>
            </div>
            <p className="text-stone-900 font-extrabold text-sm sm:text-base line-clamp-2">
              {visualSummary.painType}
            </p>
          </div>

          {/* Frequência */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold mb-1">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>FREQUÊNCIA</span>
            </div>
            <p className="text-stone-900 font-extrabold text-sm sm:text-base">
              {visualSummary.frequency}
            </p>
          </div>

          {/* Outros sinais */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>OUTROS SINAIS</span>
            </div>
            <p className="text-stone-900 font-extrabold text-sm sm:text-base line-clamp-2">
              {visualSummary.otherSymptoms}
            </p>
          </div>
        </div>
      </section>

      {/* O QUE ESSAS INFORMAÇÕES MOSTRAM (HUMANO & CLARO) */}
      <section className="mb-8 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight mb-3">
          O que essas informações mostram
        </h2>
        <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-medium mb-5">
          {interpretationParagraph}
        </p>

        {/* Resumo formatado para consulta */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
              Resumo pronto para mostrar ou copiar:
            </span>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-stone-950 bg-white border border-stone-300/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>
          </div>
          <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-mono whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-stone-200/80">
            {summaryParagraph}
          </p>
        </div>
      </section>

      {/* GUIA VISUAL & CONSELHOS ERGONÔMICOS (VisualAdviceCard) */}
      <section id="section-visual-advice-physical" className="mb-8">
        <VisualAdviceCard location={visualSummary.location} />
      </section>

      {/* RESOLUÇÃO GUIADA PASSO A PASSO (GuidedSolve) */}
      <section id="section-guided-solve-physical" className="mb-8">
        <GuidedSolve
          problemTitle={`Alívio para dor em ${visualSummary.location}`}
          steps={physicalGuidedSteps}
          immediateWarning={
            redFlags?.hasRedFlags
              ? 'Atenção preventiva: Seus sintomas podem exigir avaliação médica presencial. Não tente movimentos bruscos.'
              : undefined
          }
          onEmergencyClick={
            redFlags?.hasRedFlags
              ? () => {
                  if (typeof window !== 'undefined') {
                    window.open('tel:192', '_self');
                  }
                }
              : undefined
          }
        />
      </section>

      {/* CARD DE COMPARTILHAMENTO INTELIGENTE (ShareSolutionCard) */}
      <section id="section-share-solution-physical" className="mb-8">
        <ShareSolutionCard
          title={`Dor em ${visualSummary.location} (Intensidade ${visualSummary.intensity}/10)`}
          category="dor-fisica"
          urgencyLabel={redFlags?.hasRedFlags ? 'AVALIAÇÃO MÉDICA RECOMENDADA' : 'CUIDADOS PREVENTIVOS'}
          summaryText={summaryParagraph}
          immediateAction={interpretationParagraph}
          keySteps={physicalGuidedSteps.map((s) => `${s.title}: ${s.description}`)}
        />
      </section>

      {/* ACTIONS ROW: RESET / NOVA DOR */}
      <div className="flex items-center justify-end mb-8">
        <button
          id="btn-new-pain-bottom"
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-sm transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Avaliar Outra Dor</span>
        </button>
      </div>

      {/* BANNER: REPORTAR ORIENTAÇÃO INVIÁVEL OU FANTASIOSA */}
      <section
        id="section-report-infeasible-physical"
        className="mb-8 p-4 rounded-3xl bg-amber-50/70 border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-200/70 text-amber-950 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-stone-950">
              Essa orientação pareceu fantasiosa, inviável ou não condiz com sua realidade?
            </p>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Você pode avisar o sistema em 1 clique para calibrarmos os algoritmos e evitar recomendações irreais.
            </p>
          </div>
        </div>
        <button
          type="button"
          id="btn-open-report-physical-pain"
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Informar Erro</span>
        </button>
      </section>

      {/* SÓ DEPOIS: QUER GUARDAR ISSO? CRIAR CONTA */}
      <section
        id="section-account-cta"
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white shadow-md text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5"
      >
        <div className="max-w-md">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Histórico pessoal
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            Quer guardar isso?
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-medium">
            Salve o registro desta dor para comparar a evolução ao longo do tempo ou consultar sempre que precisar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAccountModal(true)}
          className="min-h-[48px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shrink-0 cursor-pointer shadow-xs"
        >
          Criar minha conta
        </button>
      </section>

      {/* Account Modal Teaser */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-xl">
            <h3 className="text-xl font-black text-stone-950 mb-2">
              Conta e Histórico
            </h3>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed font-medium">
              O módulo de autenticação e histórico salvo na nuvem estará disponível na próxima atualização. Por enquanto, seu relato fica salvo no seu próprio navegador!
            </p>
            <button
              type="button"
              onClick={() => setShowAccountModal(false)}
              className="w-full min-h-[46px] py-2.5 bg-stone-950 text-white font-bold rounded-xl text-sm hover:bg-stone-800 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-stone-950">
                Compartilhar resumo
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-stone-600 text-sm mb-4">
              Copie o texto para enviar no WhatsApp ou e-mail de quem vai te acompanhar:
            </p>
            <textarea
              readOnly
              rows={5}
              value={summaryParagraph}
              className="w-full p-3 rounded-xl border border-stone-200 text-xs bg-stone-50 font-mono mb-4 resize-none"
            />
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full min-h-[46px] py-2.5 bg-stone-950 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar para a área de transferência'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Reporte de Solução Inviável/Fantasiosa */}
      {showReportModal && (
        <ReportSolutionModal
          data={{
            problemDescription: `Dor: ${assessment.region || 'Região'} - Sintomas: ${assessment.symptoms?.join(', ')}`,
            solutionTitle: visualSummary?.title || 'Resumo e Interpretação de Dor Física',
            fullSummary: `${summaryParagraph}\n\n${interpretationParagraph}`,
          }}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </main>
  );
};
