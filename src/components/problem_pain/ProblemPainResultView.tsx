import React, { useState, useEffect } from 'react';
import { AppRoute, ProblemAssessment, ProblemPainAnalysisResult } from '../../types';
import { locationService, UserLocation } from '../../services/locationService';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  SlidersHorizontal,
  Compass,
  Wrench,
  Flag,
  Star,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartGuideModal } from './SmartGuideModal';
import { ReportSolutionModal } from '../common/ReportSolutionModal';
import { ShareSolutionCard } from '../ShareSolutionCard';
import { GuidedSolve } from '../GuidedSolve';
import { TimeProcessingBadge } from '../TimeProcessingBadge';
import { opportunityEngine } from '../../services/opportunityEngine';

interface ProblemPainResultViewProps {
  assessment: ProblemAssessment;
  analysisResult: ProblemPainAnalysisResult;
  onNavigate: (route: AppRoute) => void;
  onReset: () => void;
}

export const ProblemPainResultView: React.FC<ProblemPainResultViewProps> = ({
  assessment,
  analysisResult,
  onNavigate,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation>(() => locationService.getStoredLocation());
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [manualCityInput, setManualCityInput] = useState(userLocation.cityOrNeighborhood || '');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeContextNotice, setActiveContextNotice] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState<{ payload: string; title: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userFeedbackSubmitted, setUserFeedbackSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackResolved, setFeedbackResolved] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  const handleSubmitUserFeedback = (resolved: boolean) => {
    setFeedbackResolved(resolved);
    opportunityEngine.recordUserFeedback('', {
      dorResolvida: resolved,
      notaAtendimento: resolved ? feedbackRating : 3,
      comentario: feedbackComment || (resolved ? 'Usuário confirmou resolução com sucesso' : 'Usuário indicou que a dor ainda não foi resolvida'),
    });
    setUserFeedbackSubmitted(true);
  };

  const action = analysisResult.actionSolution;
  const problemName = action?.problemIdentified || assessment.initialDescription;
  const urgency = action?.urgency || (analysisResult.painLevel === 'CRÍTICO' ? 'URGENTE' : 'RESOLVER_LOGO');
  const urgencyLabel = action?.urgencyLabel || (urgency === 'URGENTE' ? 'URGENTE' : urgency === 'RESOLVER_LOGO' ? 'PRECISO RESOLVER LOGO' : 'PODE ESPERAR');

  // Steps estruturados para o GuidedSolve
  const guidedSteps = [
    ...(action?.immediateInstruction
      ? [{
          title: 'Primeira Ação Imediata',
          description: action.immediateInstruction,
        }]
      : []),
    ...(action?.bestOption
      ? [{
          title: action.bestOption.title,
          description: `${action.bestOption.description} (Opção recomendada: ${action.bestOption.actionLabel})`,
        }]
      : []),
    ...(action?.alternatives && action.alternatives.length > 0
      ? action.alternatives.map((alt) => ({
          title: `Alternativa: ${alt.title}`,
          description: alt.description,
        }))
      : [
          {
            title: 'Verificação Final',
            description: 'Confira se a situação estabilizou ou se o conserto/solução foi concluído com sucesso.',
          },
        ]),
  ];

  // Handle GPS location request
  const handleRequestLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const loc = await locationService.requestCurrentGps();
      setUserLocation(loc);
    } catch (err: any) {
      setLocationError('Não foi possível obter o GPS. Você pode digitar seu bairro ou cidade abaixo.');
      setShowManualInput(true);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveManualCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCityInput.trim()) {
      const loc = locationService.setManualLocation(manualCityInput.trim());
      setUserLocation(loc);
      setShowManualInput(false);
      setLocationError('');
    }
  };

  const handleCopySummary = async () => {
    const text = `🚨 ${problemName.toUpperCase()}\n` +
      `Urgência: ${urgencyLabel}\n` +
      `O que fazer agora: ${action?.immediateInstruction || analysisResult.summaryDiscovery}\n` +
      (action?.bestOption ? `Melhor opção: ${action.bestOption.title} - ${action.bestOption.actionLabel}\n` : '');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Solução: ${problemName}`,
          text: action?.immediateInstruction || 'Resolva esse problema agora.',
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopySummary();
    }
  };

  // Build target Google Maps URL based on user location
  const primarySearchQuery = action?.primaryAction?.searchQuery || `${problemName} perto de mim`;
  const primaryMapsUrl = locationService.buildGoogleMapsSearchUrl(primarySearchQuery, userLocation);

  const bestOptionSearchQuery = action?.bestOption?.searchQuery || primarySearchQuery;
  const bestOptionDirectionsUrl = locationService.buildGoogleMapsSearchUrl(bestOptionSearchQuery, userLocation);

  return (
    <main id="problem-action-result-view" className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-24">
      {/* Top Bar: Minimal & Scannable */}
      <div className="mb-4 flex items-center justify-between">
        <button
          id="btn-back-to-input"
          onClick={() => onNavigate('/dor-problema')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors py-1.5 px-2.5 rounded-md hover:bg-neutral-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-report-solution-top"
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
            title="Informar se a solução for fantasiosa ou inviável"
          >
            <Flag className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Informar Erro</span>
          </button>
          <button
            id="btn-copy-solution"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50"
            title="Copiar resumo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            id="btn-share-solution"
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50"
            title="Compartilhar"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* HEADER: URGENCY BADGE & IDENTIFIED PROBLEM */}
      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            id="badge-urgency"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
              urgency === 'URGENTE'
                ? 'bg-red-600 text-white'
                : urgency === 'RESOLVER_LOGO'
                ? 'bg-amber-500 text-neutral-950'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {urgencyLabel}
          </span>
          <TimeProcessingBadge
            estimatedMinutes={urgency === 'URGENTE' ? 10 : 30}
            type={urgency === 'URGENTE' ? 'alivio-imediato' : 'curto-prazo'}
          />
          <span className="text-xs text-neutral-400 font-mono">5s scan</span>
        </div>

        <h1
          id="title-identified-problem"
          className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-tight"
        >
          {problemName}
        </h1>
      </header>

      {/* CAMADA 1 — SOLUÇÃO IMEDIATA (O que fazer agora) */}
      <section
        id="layer-1-immediate-solution"
        className="mb-5 p-4 sm:p-5 rounded-xl bg-neutral-900 text-neutral-50 shadow-md border border-neutral-800"
      >
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
            1
          </div>
          <div className="space-y-2 flex-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
              O que fazer agora
            </p>
            <p className="text-base sm:text-lg font-bold leading-snug text-white">
              {action?.immediateInstruction || analysisResult.summaryDiscovery}
            </p>

            {/* Checklist de segurança rápido (se houver) */}
            {action?.immediateSafetySteps && action.immediateSafetySteps.length > 0 && (
              <div className="pt-2 space-y-1.5 border-t border-neutral-800">
                {action.immediateSafetySteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CAMADA 2 — AÇÃO PRINCIPAL (Botão Grande em Destaque) */}
      <section id="layer-2-primary-action" className="mb-5">
        <a
          id="btn-primary-action"
          href={primaryMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.99] group border border-amber-500/30"
        >
          <MapPin className="w-5 h-5 text-neutral-950 group-hover:scale-110 transition-transform" />
          <span className="text-center">{action?.primaryAction?.label || '📍 ENCONTRAR SOLUÇÃO PERTO DE MIM'}</span>
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>

        {/* Destaque para quem prefere trocar sozinho */}
        {(problemName.toLowerCase().includes('pneu') ||
          problemName.toLowerCase().includes('estepe') ||
          assessment.initialDescription.toLowerCase().includes('pneu')) && (
          <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
              <Wrench className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Prefere trocar o estepe sozinho agora?</strong> Veja o ponto do macaco e a sequência em cruz para o seu modelo.
              </span>
            </div>
            <button
              type="button"
              id="btn-quick-tire-guide"
              onClick={() => {
                setActiveGuide({
                  payload: 'passo-a-passo-estepe',
                  title: 'Troca de Estepe Inteligente no Local',
                });
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Ver Guia do Meu Carro ⚡</span>
            </button>
          </div>
        )}
      </section>

      {/* CAMADA 3 — MELHOR OPÇÃO & LOCALIZAÇÃO REAL */}
      <section
        id="layer-3-best-option"
        className="mb-5 p-4 sm:p-5 rounded-xl bg-white border-2 border-neutral-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs uppercase tracking-wider font-bold text-neutral-500">
              Melhor Opção Próxima
            </h2>
          </div>
          {action?.bestOption?.badge && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {action.bestOption.badge}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              {action?.bestOption?.title || 'Serviço mais próximo'}
            </h3>
            <p className="text-sm text-neutral-600 mt-0.5">
              {action?.bestOption?.description || 'Profissional ou estabelecimento com atendimento rápido.'}
            </p>
          </div>

          {/* Status de Localização do Usuário */}
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <Compass className="w-4 h-4 text-neutral-500 shrink-0" />
              {userLocation.source === 'gps' ? (
                <span>
                  <strong className="font-semibold text-emerald-700">GPS Ativo:</strong> Buscando serviços reais no seu raio atual.
                </span>
              ) : userLocation.source === 'manual' && userLocation.cityOrNeighborhood ? (
                <span>
                  <strong className="font-semibold text-neutral-900">Local configurado:</strong> {userLocation.cityOrNeighborhood}
                </span>
              ) : (
                <span className="text-neutral-600">
                  Para ver a distância exata até você, use sua localização.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {userLocation.source === 'none' ? (
                <button
                  id="btn-enable-location"
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {isLocating ? 'Obtendo...' : 'Usar minha localização'}
                </button>
              ) : (
                <button
                  id="btn-edit-location"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-neutral-500 hover:text-neutral-900 underline font-medium"
                >
                  Alterar cidade/bairro
                </button>
              )}
            </div>
          </div>

          {/* Input de Bairro / Cidade Manual caso precise */}
          {showManualInput && (
            <form onSubmit={handleSaveManualCity} className="flex gap-2 pt-1">
              <input
                id="input-manual-city"
                type="text"
                placeholder="Ex: Copacabana, Rio de Janeiro ou Centro, Curitiba"
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold rounded bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Salvar
              </button>
            </form>
          )}

          {locationError && (
            <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
              {locationError}
            </p>
          )}

          {/* Botões de Ação Imediata da Melhor Opção */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              id="btn-directions-best-option"
              href={bestOptionDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>{action?.bestOption?.actionLabel || 'COMO CHEGAR'}</span>
            </a>

            <a
              id="btn-search-maps-options"
              href={primaryMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span>VER OUTRAS OPÇÕES NO MAPA</span>
            </a>
          </div>
        </div>
      </section>

      {/* CAMADA 4 — ALTERNATIVAS (Máximo 2 ou 3) */}
      {action?.alternatives && action.alternatives.length > 0 && (
        <section id="layer-4-alternatives" className="mb-5 space-y-2">
          <h2 className="text-xs uppercase tracking-wider font-bold text-neutral-500 px-1">
            Outras Alternativas Rápidas
          </h2>

          <div className="grid grid-cols-1 gap-2">
            {action.alternatives.map((alt, idx) => {
              const mapsUrl = locationService.buildGoogleMapsSearchUrl(alt.actionPayload, userLocation);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-neutral-900">{alt.title}</p>
                    <p className="text-xs text-neutral-600">{alt.description}</p>
                  </div>

                  {alt.actionType === 'guide' ||
                  alt.actionPayload.includes('estepe') ||
                  alt.actionPayload.includes('guia') ||
                  alt.actionPayload.includes('passo-a-passo') ||
                  alt.actionPayload.includes('dinamica') ||
                  alt.actionPayload.includes('energia') ||
                  alt.actionPayload.includes('seguro') ? (
                    <button
                      type="button"
                      id={`btn-alt-guide-${idx}`}
                      onClick={() => {
                        setActiveGuide({
                          payload: alt.actionPayload,
                          title: alt.title,
                        });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shrink-0 shadow-2xs transition-all cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-neutral-950" />
                      <span>{alt.actionLabel}</span>
                    </button>
                  ) : alt.actionType === 'app' || alt.actionPayload.startsWith('http') || alt.actionPayload === 'comparar-uber-99' ? (
                    <button
                      type="button"
                      id={`btn-alt-app-${idx}`}
                      onClick={() => {
                        if (alt.actionPayload === 'comparar-uber-99') {
                          setActiveGuide({
                            payload: 'fuga-tarifa-dinamica',
                            title: 'Comparar Aplicativos & Fuga da Dinâmica',
                          });
                        } else {
                          const url = alt.actionPayload.startsWith('http') ? alt.actionPayload : `https://${alt.actionPayload}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shrink-0 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{alt.actionLabel}</span>
                    </button>
                  ) : alt.actionType === 'call' || alt.phone ? (
                    <a
                      href={`tel:${alt.phone || '190'}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-2xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{alt.actionLabel}</span>
                    </a>
                  ) : alt.actionType === 'maps' ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-900 shrink-0 shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{alt.actionLabel}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGuide({
                          payload: alt.actionPayload,
                          title: alt.title,
                        });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-900 shrink-0 shadow-2xs cursor-pointer"
                    >
                      <span>{alt.actionLabel}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* RESOLUÇÃO GUIADA PASSO A PASSO (GuidedSolve) */}
      <section id="section-guided-solve" className="mb-5">
        <GuidedSolve
          problemTitle={problemName}
          steps={guidedSteps}
          immediateWarning={
            urgency === 'URGENTE'
              ? 'Atenção: Situação urgente. Priorize segurança pessoal antes de tentar reparos complexos.'
              : undefined
          }
          onEmergencyClick={
            urgency === 'URGENTE'
              ? () => window.open(primaryMapsUrl, '_blank')
              : undefined
          }
          onFinishFeedback={(resolved) => handleSubmitUserFeedback(resolved)}
        />
      </section>

      {/* CARD DE COMPARTILHAMENTO INTELIGENTE (ShareSolutionCard) */}
      <section id="section-share-solution" className="mb-5">
        <ShareSolutionCard
          title={problemName}
          category="dor-problema"
          urgencyLabel={urgencyLabel}
          summaryText={analysisResult.summaryDiscovery}
          immediateAction={action?.immediateInstruction}
          bestOptionLabel={
            action?.bestOption
              ? `${action.bestOption.title} - ${action.bestOption.actionLabel}`
              : undefined
          }
          keySteps={guidedSteps.map((s) => `${s.title}: ${s.description}`)}
        />
      </section>

      {/* SEÇÃO 9: FEEDBACK DO USUÁRIO SOBRE A RESOLUÇÃO DA DOR */}
      <section
        id="section-user-feedback"
        className="mb-5 p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-800">
              Validação de Resolução
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">Ciclo de Feedback</span>
        </div>

        {userFeedbackSubmitted ? (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Obrigado pelo seu feedback sincero! {feedbackResolved ? 'Ficamos felizes em ter ajudado a resolver sua dor.' : 'Registramos seu caso para aprimorar o direcionamento.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-neutral-900">
              Conseguiu resolver a sua dor ou encontrar a solução que precisava?
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-feedback-resolved-yes"
                onClick={() => handleSubmitUserFeedback(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Sim, Resolvi!</span>
              </button>

              <button
                type="button"
                id="btn-feedback-resolved-no"
                onClick={() => handleSubmitUserFeedback(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <span>Ainda Não</span>
              </button>
            </div>

            <div className="flex items-center gap-1 pt-1">
              <span className="text-xs text-neutral-500 mr-2">Como avalia esta orientação:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* BOTÕES DE CONTEXTO DE SEGURANÇA (Ex: Local Perigoso vs Seguro) */}
      {action?.contextActions && action.contextActions.length > 0 && (
        <section id="context-safety-actions" className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="space-y-2">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Contexto do Momento:
            </p>
            <div className="flex flex-wrap gap-2">
              {action.contextActions.map((ctx, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveContextNotice(ctx.instruction)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                    ctx.variant === 'danger'
                      ? 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200'
                      : 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {ctx.label}
                </button>
              ))}
            </div>

            {activeContextNotice && (
              <div className="mt-2 p-2.5 rounded bg-white text-xs text-neutral-800 border border-amber-300 font-medium animate-fadeIn">
                ⚠️ {activeContextNotice}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CAMADA 5 — EXPLICAÇÃO / DICA TÉCNICA (Oculta por padrão para não poluir) */}
      {action?.explanationNote && (
        <section id="layer-5-explanation" className="mb-6">
          <button
            id="btn-toggle-explanation"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs text-neutral-500 font-medium transition-colors"
          >
            <span>💡 Detalhes técnicos e dica de prevenção</span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExplanation && (
            <div className="mt-2 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
              {action.explanationNote}
            </div>
          )}
        </section>
      )}

      {/* BANNER DEDICADO: REPORTAR SOLUÇÃO FANTASIOSA OU INVIÁVEL */}
      <section
        id="section-report-infeasible"
        className="mb-6 p-4 rounded-xl bg-amber-50/60 border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
      >
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-amber-200/70 text-amber-950 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 text-amber-800" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-950">
              Essa solução é fantasiosa, inviável ou não corresponde à realidade?
            </p>
            <p className="text-[11px] text-neutral-600 leading-relaxed mt-0.5">
              Informe o erro em 1 clique para que a IA e os parâmetros do sistema sejam corrigidos.
            </p>
          </div>
        </div>
        <button
          type="button"
          id="btn-open-report-solution-modal"
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Informar Erro</span>
        </button>
      </section>

      {/* Ação Final: Resolver Outro Problema */}
      <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          id="btn-solve-another-problem"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 hover:text-neutral-950 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Resolver Outro Problema
        </button>

        <p className="text-[11px] text-neutral-400">
          Qual é a sua dor? • Resolvedor de Problemas da Vida Real
        </p>
      </div>

      {/* MODAL INTELIGENTE DE GUIA PASSO A PASSO (NUNCA ENCAMINHA PARA GOOGLE MAPS) */}
      {activeGuide && (
        <SmartGuideModal
          guidePayload={activeGuide.payload}
          guideTitle={activeGuide.title}
          userLocation={userLocation}
          onClose={() => setActiveGuide(null)}
          onOpenMapsAlternative={(query) => {
            const url = locationService.buildGoogleMapsSearchUrl(query, userLocation);
            window.open(url, '_blank');
          }}
        />
      )}

      {/* MODAL DE REPORTAR SOLUÇÃO INVIÁVEL OU FANTASIOSA */}
      {showReportModal && (
        <ReportSolutionModal
          data={{
            problemDescription: assessment.initialDescription,
            solutionTitle: action?.problemIdentified || action?.bestOption?.title,
            primaryActionLabel: action?.primaryAction?.label,
            searchQuery: primarySearchQuery,
            fullSummary: action?.explanationNote,
            locationInfo: userLocation.cityOrNeighborhood || (userLocation.latitude ? `${userLocation.latitude}, ${userLocation.longitude}` : undefined),
          }}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </main>
  );
};
