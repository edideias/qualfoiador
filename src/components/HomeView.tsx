import React, { useState, useEffect } from 'react';
import { AppRoute, ProblemAssessment } from '../types';
import { ArrowRight, Activity, Zap, ShieldCheck, Clock, Search, Mic, History } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../modules/theme/ThemeContext';
import { getThemeContent, getThemePositions, getThemeVisibility, getThemeHeroLogo, getThemeLayout } from '../modules/theme/types';
import { problemSolverService } from '../services/problemSolverService';
import { problemPainService } from '../modules/problem_pain/problemPainStore';
import { physicalPainService } from '../modules/physical_pain/physicalPainStore';
import { classifyPainIntent } from '../services/ai/painClassifier';
import { detectQuintaSerie, QuintaSerieCheckResult } from '../services/quintaSerieService';
import { AudioInputModal } from './AudioInputModal';
import { QuintaSerieCard } from './QuintaSerieCard';
import { MascotImage } from './mascot/MascotImage';

interface HomeViewProps {
  onNavigate: (route: AppRoute) => void;
}

const QUICK_EMERGENCIES = [
  { label: '🚨 Pneu furado', query: 'pneu furado' },
  { label: '⚡ Carro não liga', query: 'carro não liga' },
  { label: '🔑 Perdi minha chave', query: 'perdi minha chave' },
  { label: '🔥 Acabou o gás', query: 'acabou o gás' },
  { label: '💧 Cano estourou', query: 'cano estourou' },
  { label: '💡 Eletricista', query: 'preciso de um eletricista' },
  { label: '🍔 Estou com fome', query: 'estou com fome' },
  { label: '📄 Imprimir documento', query: 'preciso imprimir um documento' },
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { effectiveTheme } = useTheme();
  const t = effectiveTheme;
  const content = getThemeContent(t);
  const positions = getThemePositions(t);
  const visibility = getThemeVisibility(t);
  const heroLogo = getThemeHeroLogo(t);
  const layout = getThemeLayout(t);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldCompressMobile = isMobile && layout.mobileAdaptive !== false;

  const effectiveTopSpacing = shouldCompressMobile
    ? Math.max(16, Math.round(layout.topSpacing * 0.6))
    : layout.topSpacing;
  const effectiveHeroSpacing = shouldCompressMobile
    ? Math.max(16, Math.round(layout.heroSpacing * 0.65))
    : layout.heroSpacing;
  const effectiveSearchSpacing = shouldCompressMobile
    ? Math.max(14, Math.round((layout.searchSpacing ?? 28) * 0.7))
    : (layout.searchSpacing ?? 28);
  const effectiveCardGap = shouldCompressMobile
    ? Math.max(12, Math.round(layout.cardGap * 0.65))
    : layout.cardGap;
  const effectiveCardPadding = shouldCompressMobile
    ? Math.max(16, Math.round(layout.cardPadding * 0.75))
    : layout.cardPadding;
  const effectiveCardContentGap = shouldCompressMobile
    ? Math.max(10, Math.round((layout.cardContentGap ?? 16) * 0.75))
    : (layout.cardContentGap ?? 16);
  const effectiveContainerPaddingX = shouldCompressMobile
    ? Math.min(layout.containerPaddingX ?? 24, 16)
    : (layout.containerPaddingX ?? 24);
  const effectiveFooterSpacing = shouldCompressMobile
    ? Math.max(16, Math.round((layout.footerSpacing ?? 32) * 0.7))
    : (layout.footerSpacing ?? 32);
  const effectiveBottomSpacing = shouldCompressMobile
    ? Math.max(24, Math.round((layout.bottomSpacing ?? 64) * 0.6))
    : (layout.bottomSpacing ?? 64);

  const [quickInput, setQuickInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [quintaSerieState, setQuintaSerieState] = useState<{
    isOpen: boolean;
    text: string;
    jokeResponse?: string;
  }>({
    isOpen: false,
    text: '',
  });

  const handleDirectSolve = async (textToSolve: string) => {
    const clean = textToSolve.trim();
    if (!clean) return;

    // Check for Quinta Série trigger before resolving
    const qsCheck = detectQuintaSerie(clean);
    if (qsCheck.isQuintaSerie) {
      setQuintaSerieState({
        isOpen: true,
        text: clean,
        jokeResponse: qsCheck.suggestedJokeResponse,
      });
      return;
    }

    setIsResolving(true);

    try {
      // Intelligently classify whether the user is expressing physical bodily pain or a practical life problem
      const classification = classifyPainIntent(clean);

      if (classification.type === 'physical') {
        // Physical Pain Workflow: populate draft and route to physical assessment
        physicalPainService.saveDraft({
          description: clean,
          voiceUsed: false,
          status: 'draft',
          currentStep: 0,
        });

        // If high confidence and already has location, create immediate clinical analysis
        const location = classification.extractedLocation || 'Corpo / Região dolorida';
        const intensity = classification.suggestedIntensity ?? 5;
        
        await physicalPainService.completeAssessment({
          initialDescription: clean,
          location,
          intensity,
          duration: 'Começou recentemente',
          painTypes: classification.extractedKeywords.length > 0 ? classification.extractedKeywords : ['Desconforto físico'],
          frequency: 'Presente agora',
          otherSymptoms: [],
          completedAt: new Date().toISOString(),
        });

        onNavigate('/dor-fisica/resultado');
        return;
      }

      // Problem / Emergency / Friction Workflow
      const assessment: ProblemAssessment = {
        initialDescription: clean,
        frequency: 'Agora',
        timeSpent: 'Imediato',
        area: 'Emergência & Vida Real',
        priorityGoal: 'Resolver agora',
        completedAt: new Date().toISOString(),
      };

      const analysisResult = await problemSolverService.solve(assessment);
      problemPainService.saveCurrentAssessment(assessment);
      problemPainService.saveCurrentAnalysis(analysisResult);
      onNavigate('/dor-problema/resultado');
    } catch (e) {
      console.warn('Erro ao resolver direto, usando fallback:', e);
      const assessment: ProblemAssessment = {
        initialDescription: clean,
        frequency: 'Agora',
        timeSpent: 'Imediato',
        area: 'Emergência & Vida Real',
        priorityGoal: 'Resolver agora',
        completedAt: new Date().toISOString(),
      };
      problemPainService.completeAssessment(assessment);
      onNavigate('/dor-problema/resultado');
    } finally {
      setIsResolving(false);
    }
  };

  // Alignment classes for hero
  const heroAlignClass =
    positions.heroAlign === 'left'
      ? 'text-left mr-auto items-start'
      : positions.heroAlign === 'right'
      ? 'text-right ml-auto items-end'
      : 'text-center mx-auto items-center';

  // Alignment classes for buttons
  const btnAlign = t.buttons.alignment || positions.buttonsAlign || 'stretch';
  const btnAlignClass =
    btnAlign === 'left'
      ? 'w-auto self-start mr-auto'
      : btnAlign === 'right'
      ? 'w-auto self-end ml-auto'
      : btnAlign === 'center'
      ? 'w-auto self-center mx-auto'
      : 'w-full';

  // HERO SECTION
  const renderHero = () => {
    const hasBadge = visibility.showHeroBadge !== false;
    const hasTitle = visibility.showHeroTitle !== false;
    const hasSubtitle = visibility.showHeroSubtitle !== false;

    if (!hasBadge && !hasTitle && !hasSubtitle) return null;

    return (
      <React.Fragment key="section-hero">
        {/* Subtle Curiosity Micro-Badge */}
        {hasBadge && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 sm:mb-8"
          >
            <div
              style={{
                backgroundColor: t.colors.badgeBackground,
                color: t.colors.badgeText,
                borderColor: t.colors.border,
                fontSize: `${t.typography.badgeSize}px`,
                fontWeight: t.typography.badgeWeight,
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5" style={{ color: t.colors.accent }} />
              <span>{content.heroBadgeText}</span>
              <span className="opacity-40">•</span>
              <span className="opacity-80 font-normal">{content.heroBadgeSecondaryText}</span>
            </div>
          </motion.div>
        )}

        {/* Hero: Conversational & Visual Masterpiece */}
        {(hasTitle || hasSubtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            style={{ marginBottom: `${effectiveHeroSpacing}px` }}
            className={`w-full max-w-2xl flex flex-col ${heroAlignClass}`}
          >
            {/* O "PAI" DAS IMAGENS - Mascote Principal Grande */}
            {visibility.showMascotHero !== false && visibility.showMascotsGlobal !== false && (
              <div className="flex flex-col items-center justify-center mb-6 select-none">
                <MascotImage
                  characterKey="paiHero"
                  customPixelSize={heroLogo.size}
                  floatingAnimation={heroLogo.floatingAnimation !== false}
                  animationDuration={heroLogo.animationDuration || 3.5}
                  animationAmplitude={heroLogo.animationAmplitude ?? 8}
                  pulseEffect={heroLogo.pulseEffect}
                  rotateEffect={heroLogo.rotateEffect}
                  shadowGlow={heroLogo.shadowGlow}
                  borderStyle={heroLogo.frameStyle || 'none'}
                  withGlow={heroLogo.frameStyle === 'glow'}
                  className="hover:scale-105 transition-transform duration-300 cursor-pointer"
                  alt="Mascote Principal Pai - Qual a sua dor?"
                />
              </div>
            )}

            {/* Main Display Title */}
            {hasTitle && (
              <h1
                id="main-hero-title"
                style={{
                  fontFamily: t.typography.headingFont,
                  fontWeight: t.typography.titleWeight,
                  lineHeight: t.typography.titleLineHeight,
                  letterSpacing: t.typography.titleLetterSpacing,
                  color: t.colors.textPrimary,
                  fontSize: `${t.typography.titleDesktopSize}px`,
                }}
                className="tracking-tight mb-4 select-none"
              >
                <span>{content.heroTitlePrefix} </span>
                <span style={{ color: t.colors.accent }} className="font-black">
                  {content.heroTitleHighlight}
                </span>
              </h1>
            )}

            {/* Human cadence & conversational subtitle */}
            {hasSubtitle && (
              <p
                id="hero-subtitle"
                style={{
                  fontFamily: t.typography.headingFont,
                  fontWeight: t.typography.subtitleWeight,
                  lineHeight: t.typography.subtitleLineHeight,
                  fontSize: `${t.typography.subtitleDesktopSize}px`,
                  color: t.colors.textSecondary,
                }}
                className="tracking-tight mb-4 max-w-xl leading-relaxed"
              >
                {content.heroSubtitle}
              </p>
            )}
          </motion.div>
        )}
      </React.Fragment>
    );
  };

  // SEARCH SECTION
  const renderSearchBar = () => {
    if (visibility.showSearchSection === false) return null;

    return (
      <div
        key="section-search"
        style={{ marginBottom: `${effectiveSearchSpacing}px` }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="text-center mb-3">
          <h3
            style={{
              fontFamily: t.typography.headingFont,
              color: t.colors.textPrimary,
            }}
            className="text-base sm:text-lg font-extrabold tracking-tight"
          >
            {content.searchTitle}
          </h3>
          <p style={{ color: t.colors.textSecondary }} className="text-xs sm:text-sm mt-0.5">
            {content.searchSubtitle}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDirectSolve(quickInput);
          }}
          className="w-full space-y-2.5"
        >
          <div
            style={{
              backgroundColor: t.colors.cardBackground,
              borderColor: t.colors.border,
            }}
            className="relative flex flex-col sm:flex-row gap-2 p-2 rounded-2xl border shadow-lg shadow-purple-500/5 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all"
          >
            <div className="flex items-center gap-2.5 px-3 flex-1 min-w-0">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                id="input-home-quick-solve"
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={content.searchPlaceholder}
                style={{ color: t.colors.textPrimary }}
                className="w-full py-2.5 text-sm sm:text-base font-medium placeholder:text-neutral-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Audio Input Trigger Button */}
              {visibility.showAudioInputButton !== false && (
                <button
                  id="btn-trigger-home-audio"
                  type="button"
                  onClick={() => setIsAudioModalOpen(true)}
                  title="Falar por áudio ou gravar voz"
                  className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-purple-200"
                >
                  <Mic className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span className="hidden sm:inline">Gravar Áudio</span>
                </button>
              )}

              <button
                id="btn-home-quick-solve"
                type="submit"
                disabled={isResolving || !quickInput.trim()}
                style={{
                  backgroundColor: t.colors.buttonBackground,
                  color: t.colors.buttonText,
                }}
                className="px-5 py-2.5 sm:py-3 rounded-xl hover:bg-neutral-800 active:scale-[0.98] font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>{isResolving ? 'Resolvendo...' : content.searchButtonText}</span>
              </button>
            </div>
          </div>

          {/* Quick Voice Bar for Mobile & Instant Voice Entry */}
          {visibility.showAudioInputButton !== false && (
            <div className="flex items-center justify-between px-1">
              <button
                id="btn-home-full-voice-bar"
                type="button"
                onClick={() => setIsAudioModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Mic className="w-4 h-4 text-purple-600" />
                <span>Prefere falar? Toque aqui para gravar áudio ou enviar arquivo de voz</span>
              </button>
            </div>
          )}

          {/* Quick Emergency Chips */}
          {visibility.showSearchChips !== false && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
                Casos rápidos:
              </span>
              {QUICK_EMERGENCIES.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuickInput(q.query);
                    handleDirectSolve(q.query);
                  }}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-xs font-semibold text-neutral-700 transition-colors border border-neutral-200/80 cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    );
  };

  // CARD 1: DOR FÍSICA
  const renderPhysicalCard = () => {
    if (visibility.showCardPhysical === false) return null;

    return (
      <motion.div
        key="card-dor-fisica"
        whileHover={t.cards.hoverLift ? { y: -4, transition: { duration: 0.2 } } : {}}
        whileTap={{ scale: 0.99 }}
        onClick={() => onNavigate('/dor-fisica')}
        id="card-dor-fisica"
        style={{
          backgroundColor: t.colors.cardBackground,
          borderColor: t.colors.border,
          borderRadius: `${t.cards.borderRadius}px`,
          borderWidth: `${t.cards.borderWidth}px`,
          padding: `${effectiveCardPadding}px`,
        }}
        className={`group relative cursor-pointer flex flex-col justify-between transition-all duration-200 focus:outline-none ${
          t.cards.shadow === 'none'
            ? 'shadow-none'
            : t.cards.shadow === 'xs'
            ? 'shadow-xs'
            : t.cards.shadow === 'sm'
            ? 'shadow-sm'
            : t.cards.shadow === 'md'
            ? 'shadow-md'
            : 'shadow-lg'
        }`}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('/dor-fisica')}
      >
        <div>
          {/* Icon & Category Badge */}
          <div
            style={{ marginBottom: `${effectiveCardContentGap}px` }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              {visibility.showCardPhysicalIcon !== false && (
                <div
                  style={{
                    backgroundColor: t.colors.iconBoxBackground,
                    color: t.colors.iconColor,
                    width: `${t.cards.iconSize + 24}px`,
                    height: `${t.cards.iconSize + 24}px`,
                  }}
                  className="rounded-2xl flex items-center justify-center transition-colors duration-200 shadow-2xs"
                >
                  <Activity
                    style={{
                      width: `${t.cards.iconSize}px`,
                      height: `${t.cards.iconSize}px`,
                    }}
                    className="stroke-[2.25]"
                  />
                </div>
              )}
              {visibility.showMascotCards !== false && visibility.showMascotsGlobal !== false && (
                <MascotImage
                  characterKey="pondering"
                  size="sm"
                  borderStyle="glow"
                  className="group-hover:scale-110 transition-transform shrink-0"
                  alt="Mascote Sintomas"
                />
              )}
            </div>
            {visibility.showCardPhysicalBadge !== false && (
              <span
                style={{
                  backgroundColor: t.colors.badgeBackground,
                  color: t.colors.badgeText,
                  borderColor: t.colors.border,
                }}
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
              >
                {content.cardPhysicalBadge}
              </span>
            )}
          </div>

          <h2
            style={{
              fontFamily: t.typography.headingFont,
              fontSize: `${t.typography.cardTitleSize}px`,
              fontWeight: t.typography.cardTitleWeight,
              color: t.colors.textPrimary,
            }}
            className="tracking-tight mb-2 uppercase"
          >
            {content.cardPhysicalTitle}
          </h2>

          <p
            style={{
              color: t.colors.textSecondary,
              fontSize: `${t.typography.cardTextSize}px`,
              fontWeight: t.typography.cardTextWeight,
              lineHeight: t.typography.cardTextLineHeight,
              marginBottom: `${layout.cardContentGap ?? 16}px`,
            }}
            className="font-normal"
          >
            {content.cardPhysicalDesc}
          </p>
        </div>

        {/* Integrated Modern CTA Button */}
        {visibility.showCardPhysicalButton !== false && (
          <div className="pt-2 w-full flex">
            <div
              id="btn-trigger-dor-fisica"
              style={{
                height: `${t.buttons.height}px`,
                borderRadius: `${t.buttons.borderRadius}px`,
                paddingLeft: `${t.buttons.paddingX}px`,
                paddingRight: `${t.buttons.paddingX}px`,
                backgroundColor: t.colors.buttonBackground,
                color: t.colors.buttonText,
                fontSize: `${t.typography.buttonTextSize}px`,
                fontWeight: t.typography.buttonTextWeight,
                letterSpacing: t.typography.buttonLetterSpacing,
              }}
              className={`${btnAlignClass} tracking-tight flex items-center justify-between gap-3 transition-all duration-200 pointer-events-none shadow-xs`}
            >
              <span>{content.cardPhysicalButton}</span>
              {t.buttons.arrowStyle !== 'none' && (
                <div
                  className={
                    t.buttons.arrowStyle === 'box'
                      ? 'w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center transition-colors'
                      : 'flex items-center justify-center'
                  }
                >
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-200" />
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // CARD 2: DOR DE PROBLEMA
  const renderProblemCard = () => {
    if (visibility.showCardProblem === false) return null;

    return (
      <motion.div
        key="card-dor-problema"
        whileHover={t.cards.hoverLift ? { y: -4, transition: { duration: 0.2 } } : {}}
        whileTap={{ scale: 0.99 }}
        onClick={() => onNavigate('/dor-problema')}
        id="card-dor-problema"
        style={{
          backgroundColor: t.colors.cardBackground,
          borderColor: t.colors.border,
          borderRadius: `${t.cards.borderRadius}px`,
          borderWidth: `${t.cards.borderWidth}px`,
          padding: `${effectiveCardPadding}px`,
        }}
        className={`group relative cursor-pointer flex flex-col justify-between transition-all duration-200 focus:outline-none ${
          t.cards.shadow === 'none'
            ? 'shadow-none'
            : t.cards.shadow === 'xs'
            ? 'shadow-xs'
            : t.cards.shadow === 'sm'
            ? 'shadow-sm'
            : t.cards.shadow === 'md'
            ? 'shadow-md'
            : 'shadow-lg'
        }`}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('/dor-problema')}
      >
        <div>
          {/* Icon & Category Badge with amber accent */}
          <div
            style={{ marginBottom: `${effectiveCardContentGap}px` }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              {visibility.showCardProblemIcon !== false && (
                <div
                  style={{
                    backgroundColor: t.colors.iconBoxBackground,
                    color: t.colors.iconColor,
                    width: `${t.cards.iconSize + 24}px`,
                    height: `${t.cards.iconSize + 24}px`,
                  }}
                  className="rounded-2xl flex items-center justify-center transition-colors duration-200 shadow-2xs"
                >
                  <Zap
                    style={{
                      width: `${t.cards.iconSize}px`,
                      height: `${t.cards.iconSize}px`,
                    }}
                    className="stroke-[2.25]"
                  />
                </div>
              )}
              {visibility.showMascotCards !== false && visibility.showMascotsGlobal !== false && (
                <MascotImage
                  characterKey="laptopWork"
                  size="sm"
                  borderStyle="glow"
                  className="group-hover:scale-110 transition-transform shrink-0"
                  alt="Mascote Problemas Práticos"
                />
              )}
            </div>
            {visibility.showCardProblemBadge !== false && (
              <span
                style={{
                  backgroundColor: t.colors.badgeBackground,
                  color: t.colors.badgeText,
                  borderColor: t.colors.border,
                }}
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
              >
                {content.cardProblemBadge}
              </span>
            )}
          </div>

          <h2
            style={{
              fontFamily: t.typography.headingFont,
              fontSize: `${t.typography.cardTitleSize}px`,
              fontWeight: t.typography.cardTitleWeight,
              color: t.colors.textPrimary,
            }}
            className="tracking-tight mb-2 uppercase"
          >
            {content.cardProblemTitle}
          </h2>

          <p
            style={{
              color: t.colors.textSecondary,
              fontSize: `${t.typography.cardTextSize}px`,
              fontWeight: t.typography.cardTextWeight,
              lineHeight: t.typography.cardTextLineHeight,
              marginBottom: `${effectiveCardContentGap}px`,
            }}
            className="font-normal"
          >
            {content.cardProblemDesc}
          </p>
        </div>

        {/* Integrated Modern CTA Button */}
        {visibility.showCardProblemButton !== false && (
          <div className="pt-2 w-full flex">
            <div
              id="btn-trigger-dor-problema"
              style={{
                height: `${t.buttons.height}px`,
                borderRadius: `${t.buttons.borderRadius}px`,
                paddingLeft: `${t.buttons.paddingX}px`,
                paddingRight: `${t.buttons.paddingX}px`,
                backgroundColor: t.colors.buttonBackground,
                color: t.colors.buttonText,
                fontSize: `${t.typography.buttonTextSize}px`,
                fontWeight: t.typography.buttonTextWeight,
                letterSpacing: t.typography.buttonLetterSpacing,
              }}
              className={`${btnAlignClass} tracking-tight flex items-center justify-between gap-3 transition-all duration-200 pointer-events-none shadow-xs`}
            >
              <span>{content.cardProblemButton}</span>
              {t.buttons.arrowStyle !== 'none' && (
                <div
                  className={
                    t.buttons.arrowStyle === 'box'
                      ? 'w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center transition-colors'
                      : 'flex items-center justify-center'
                  }
                >
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-200" />
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // CARDS CONTAINER
  const renderCards = () => {
    const hasPhysical = visibility.showCardPhysical !== false;
    const hasProblem = visibility.showCardProblem !== false;

    if (!hasPhysical && !hasProblem) return null;

    const cardsList =
      positions.cardsOrder === 'problem_first'
        ? [renderProblemCard(), renderPhysicalCard()]
        : [renderPhysicalCard(), renderProblemCard()];

    const singleCard = (hasPhysical && !hasProblem) || (!hasPhysical && hasProblem);

    return (
      <div
        key="section-cards"
        style={{
          gap: `${effectiveCardGap}px`,
          maxWidth: `${layout.maxWidth}px`,
        }}
        className={`w-full ${
          positions.cardsLayout === 'stack' || singleCard
            ? 'flex flex-col'
            : 'grid grid-cols-1 md:grid-cols-2'
        }`}
      >
        {cardsList}
      </div>
    );
  };

  // Resolve section order
  const effectiveSectionOrder =
    positions.sectionOrder ||
    (positions.searchPosition === 'below_cards' ? 'hero_cards_search' : 'hero_search_cards');

  const renderOrderedSections = () => {
    switch (effectiveSectionOrder) {
      case 'hero_cards_search':
        return [renderHero(), renderCards(), renderSearchBar()];
      case 'search_hero_cards':
        return [renderSearchBar(), renderHero(), renderCards()];
      case 'hero_search_cards':
      default:
        return [renderHero(), renderSearchBar(), renderCards()];
    }
  };

  return (
    <main
      id="home-view"
      style={{
        maxWidth: `${layout.maxWidth}px`,
        paddingTop: `${effectiveTopSpacing}px`,
        paddingBottom: `${effectiveBottomSpacing}px`,
        paddingLeft: `${effectiveContainerPaddingX}px`,
        paddingRight: `${effectiveContainerPaddingX}px`,
        fontFamily: t.typography.bodyFont,
      }}
      className="w-full mx-auto flex flex-col items-center transition-all"
    >
      {renderOrderedSections()}

      {/* Quick History Access Shortcut */}
      <div className="w-full flex justify-center mt-6">
        <button
          id="btn-home-history-shortcut"
          type="button"
          onClick={() => onNavigate('/historico')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold backdrop-blur-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
        >
          <History className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-white transition-colors" />
          <span>Ver histórico de dores avaliadas</span>
        </button>
      </div>

      {/* Trust & Simplicity Micro-Footer */}
      {visibility.showFooterSection !== false && visibility.showFooterNotice !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: `${effectiveFooterSpacing}px`,
            color: t.colors.textSecondary,
            fontSize: `${t.typography.footerSize}px`,
          }}
          className="text-center flex items-center justify-center gap-2 font-medium"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{content.footerNotice}</span>
        </motion.div>
      )}

      {/* Audio Input Modal */}
      <AudioInputModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        title="Falar o que você precisa agora"
        subtitle="Grave seu relato por voz ou envie um áudio gravado. Nós transcrevemos e resolvemos na hora."
        initialText={quickInput}
        onApplyText={(text) => {
          setQuickInput(text);
          handleDirectSolve(text);
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
          setQuickInput('');
          // Foco limpo para o usuário relatar de verdade
        }}
        onChooseJoke={() => {
          // Continua na zoeira descontraída
        }}
      />
    </main>
  );
};
