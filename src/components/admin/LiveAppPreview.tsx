import React, { useState } from 'react';
import {
  ThemeConfig,
  getThemeContent,
  getThemePositions,
  getThemeVisibility,
  getThemeLayout,
} from '../../modules/theme/types';
import { BrandLogo } from '../brand/BrandLogo';
import {
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Search,
  ArrowLeft,
  Building2,
  Clock,
  Lock,
  Check,
  PenSquare,
  Palette,
  Mic,
} from 'lucide-react';

interface LiveAppPreviewProps {
  theme: ThemeConfig;
  onResetToTemplate?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({
  theme,
  onResetToTemplate,
  onNavigateToTab,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'home' | 'fisica' | 'problema'>('home');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const layout = getThemeLayout(theme);

  return (
    <div
      id="live-app-preview-container"
      className="flex flex-col h-full bg-stone-950/80 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl"
    >
      {/* Top Preview Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 sm:px-5 sm:py-3 bg-stone-900/90 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-black text-stone-200 uppercase tracking-wider">
            Preview Ao Vivo
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold hidden sm:inline">
            In Loco
          </span>
          {onNavigateToTab && (
            <span className="text-[10px] text-stone-400 hidden xl:inline border-l border-stone-800 pl-2">
              Passe o mouse sobre qualquer seção para editar diretamente
            </span>
          )}
        </div>

        {/* Controls: Screens, Zoom, Device */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Flow Screen Selector */}
          <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fisica')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'fisica'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Dor Física
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('problema')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'problema'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Dor / Problema
            </button>
          </div>

          {/* Zoom scale selector */}
          <div className="hidden xl:flex rounded-xl bg-stone-950 p-1 border border-stone-800 text-[10px] font-mono font-bold text-stone-400">
            {[
              { val: 1, label: '100%' },
              { val: 0.85, label: '85%' },
              { val: 0.75, label: '75%' },
            ].map((z) => (
              <button
                key={z.val}
                type="button"
                onClick={() => setZoomScale(z.val)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  zoomScale === z.val
                    ? 'bg-stone-800 text-amber-400'
                    : 'hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Desktop vs Mobile Toggle */}
          <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              title="Visualização Desktop"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-stone-800 text-amber-400'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              title="Visualização Smartphone"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-stone-800 text-amber-400'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox Canvas Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex items-start justify-center bg-stone-900/40">
        <div
          style={{
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="w-full flex justify-center"
        >
          {deviceMode === 'mobile' ? (
            /* Smartphone Frame Mockup */
            <div className="w-full max-w-[390px] min-h-[640px] bg-stone-950 rounded-[44px] p-3 border-4 border-stone-800 shadow-2xl relative flex flex-col transition-all">
              {/* Camera speaker notch */}
              <div className="w-28 h-4 bg-stone-900 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-800" />
              </div>

              {/* Smartphone screen contents */}
              <div
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.bodyFont,
                  paddingTop: `${Math.min(layout.topSpacing, 32)}px`,
                  paddingBottom: `${Math.min(layout.bottomSpacing ?? 64, 40)}px`,
                  paddingLeft: `${Math.min(layout.containerPaddingX ?? 24, 16)}px`,
                  paddingRight: `${Math.min(layout.containerPaddingX ?? 24, 16)}px`,
                }}
                className="flex-1 rounded-[32px] overflow-y-auto flex flex-col justify-between transition-all shadow-inner"
              >
                <RenderPreviewContent
                  theme={theme}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  isMobile={true}
                  onNavigateToTab={onNavigateToTab}
                />
              </div>

              {/* Home indicator bar */}
              <div className="w-32 h-1 bg-stone-700 rounded-full mx-auto mt-2.5 shrink-0" />
            </div>
          ) : (
            /* Desktop Canvas */
            <div
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.bodyFont,
                maxWidth: `${Math.min(layout.maxWidth, 980)}px`,
                paddingTop: `${layout.topSpacing}px`,
                paddingBottom: `${layout.bottomSpacing ?? 64}px`,
                paddingLeft: `${layout.containerPaddingX ?? 24}px`,
                paddingRight: `${layout.containerPaddingX ?? 24}px`,
              }}
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 shadow-xl transition-all"
            >
                <RenderPreviewContent
                  theme={theme}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  isMobile={false}
                  onNavigateToTab={onNavigateToTab}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Render inner mock content matching the real app screens with FULL theme support
function RenderPreviewContent({
  theme,
  activeTab,
  onSelectTab,
  isMobile,
  onNavigateToTab,
}: {
  theme: ThemeConfig;
  activeTab: 'home' | 'fisica' | 'problema';
  onSelectTab: (tab: 'home' | 'fisica' | 'problema') => void;
  isMobile: boolean;
  onNavigateToTab?: (tab: string) => void;
}) {
  const content = getThemeContent(theme);
  const positions = getThemePositions(theme);
  const visibility = getThemeVisibility(theme);
  const layout = getThemeLayout(theme);

  const titleSize = isMobile
    ? theme.typography.titleMobileSize
    : theme.typography.titleDesktopSize;
  const subtitleSize = isMobile
    ? theme.typography.subtitleMobileSize
    : theme.typography.subtitleDesktopSize;

  const heroAlignClass =
    positions.heroAlign === 'left'
      ? 'text-left mr-auto items-start'
      : positions.heroAlign === 'right'
      ? 'text-right ml-auto items-end'
      : 'text-center mx-auto items-center';

  const btnAlign = theme.buttons.alignment || positions.buttonsAlign || 'stretch';
  const btnAlignClass =
    btnAlign === 'left'
      ? 'w-auto mr-auto'
      : btnAlign === 'right'
      ? 'w-auto ml-auto'
      : btnAlign === 'center'
      ? 'w-auto mx-auto'
      : 'w-full';

  // Shadow class based on theme.cards.shadow
  const cardShadowClass =
    theme.cards.shadow === 'none'
      ? 'shadow-none'
      : theme.cards.shadow === 'xs'
      ? 'shadow-xs'
      : theme.cards.shadow === 'sm'
      ? 'shadow-sm'
      : theme.cards.shadow === 'lg'
      ? 'shadow-lg'
      : 'shadow-md';

  /* 1. Header Bar */
  const renderHeader = () => (
    <div
      style={{ marginBottom: '20px' }}
      className={`group/header relative flex items-center pb-3 border-b border-black/10 dark:border-white/10 shrink-0 gap-3 ${
        positions.headerLayout === 'centered'
          ? 'justify-center flex-col sm:flex-row'
          : positions.headerLayout === 'minimal'
          ? 'justify-between'
          : 'justify-between'
      }`}
    >
      {onNavigateToTab && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToTab('content');
          }}
          title="Editar logo e cabeçalho"
          className="opacity-0 group-hover/header:opacity-100 transition-opacity absolute -top-1 right-0 bg-stone-900/90 text-amber-400 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs cursor-pointer z-10"
        >
          <PenSquare className="w-2.5 h-2.5" />
          <span>Editar Cabeçalho</span>
        </button>
      )}

      {/* Brand logo */}
      {visibility.showHeaderBrand !== false && (
        <BrandLogo theme={theme} size="sm" />
      )}

      <div className="flex items-center gap-2 shrink-0">
        {/* Badge */}
        {visibility.showHeaderBadge !== false && content.headerBadgeVisible && (
          <span
            style={{
              backgroundColor: theme.colors.badgeBackground,
              color: theme.colors.badgeText,
              fontSize: `${Math.min(theme.typography.badgeSize, 11)}px`,
              fontWeight: theme.typography.badgeWeight,
            }}
            className="px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5"
          >
            {content.headerBadgeText}
          </span>
        )}

        {/* Supplier Button */}
        {visibility.showHeaderSupplierBtn !== false && positions.headerLayout !== 'minimal' && (
          <div
            style={{
              fontSize: '10px',
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
            className="px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold"
          >
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">Fornecedor</span>
          </div>
        )}
      </div>
    </div>
  );

  /* 2. Hero Section */
  const renderHero = () => (
    <div
      style={{ marginBottom: `${layout.heroSpacing}px` }}
      className={`group/hero relative space-y-2.5 flex flex-col ${heroAlignClass}`}
    >
      {onNavigateToTab && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToTab('content');
          }}
          title="Editar textos do Hero"
          className="opacity-0 group-hover/hero:opacity-100 transition-opacity absolute -top-4 right-0 bg-stone-900/90 text-amber-400 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs cursor-pointer z-10"
        >
          <PenSquare className="w-2.5 h-2.5" />
          <span>Editar Textos</span>
        </button>
      )}

      {/* Hero Badge */}
      {visibility.showHeroBadge !== false && (
        <div
          style={{
            backgroundColor: theme.colors.badgeBackground,
            color: theme.colors.badgeText,
            fontSize: `${theme.typography.badgeSize}px`,
            fontWeight: theme.typography.badgeWeight,
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5"
        >
          <Clock className="w-3 h-3" />
          <span>{content.heroBadgeText}</span>
          <span className="opacity-40">•</span>
          <Lock className="w-3 h-3" />
          <span>{content.heroBadgeSecondaryText}</span>
        </div>
      )}

      {/* Hero Title */}
      {visibility.showHeroTitle !== false && (
        <h1
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: `${titleSize}px`,
            fontWeight: theme.typography.titleWeight,
            lineHeight: theme.typography.titleLineHeight,
            letterSpacing: theme.typography.titleLetterSpacing,
          }}
          className="tracking-tight"
        >
          <span>{content.heroTitlePrefix} </span>
          <span style={{ color: theme.colors.accent }} className="font-black">
            {content.heroTitleHighlight}
          </span>
        </h1>
      )}

      {/* Hero Subtitle */}
      {visibility.showHeroSubtitle !== false && (
        <p
          style={{
            color: theme.colors.textSecondary,
            fontSize: `${subtitleSize}px`,
            fontWeight: theme.typography.subtitleWeight,
            lineHeight: theme.typography.subtitleLineHeight,
          }}
          className="max-w-xl"
        >
          {content.heroSubtitle}
        </p>
      )}
    </div>
  );

  /* 3. Cards Section */
  const renderCards = () => {
    const cardPhysical = visibility.showCardPhysical !== false && (
      <div
        key="card-physical"
        onClick={() => onSelectTab('fisica')}
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
          borderRadius: `${theme.cards.borderRadius}px`,
          borderWidth: `${theme.cards.borderWidth}px`,
          padding: `${layout.cardPadding}px`,
        }}
        className={`border flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${cardShadowClass}`}
      >
        <div>
          <div
            style={{ marginBottom: `${layout.cardContentGap ?? 16}px` }}
            className="flex items-center justify-between"
          >
            <span
              style={{
                backgroundColor: theme.colors.iconBoxBackground,
                color: theme.colors.iconColor,
                width: `${theme.cards.iconSize + 12}px`,
                height: `${theme.cards.iconSize + 12}px`,
              }}
              className="rounded-xl flex items-center justify-center font-bold text-sm"
            >
              <Activity className="w-4 h-4" />
            </span>
            {visibility.showCardPhysicalBadge !== false && (
              <span
                style={{
                  backgroundColor: theme.colors.badgeBackground,
                  color: theme.colors.badgeText,
                }}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              >
                {content.cardPhysicalBadge}
              </span>
            )}
          </div>

          <h3
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: `${theme.typography.cardTitleSize}px`,
              fontWeight: theme.typography.cardTitleWeight,
            }}
            className="mb-1 uppercase"
          >
            {content.cardPhysicalTitle}
          </h3>
          <p
            style={{
              color: theme.colors.textSecondary,
              fontSize: `${theme.typography.cardTextSize}px`,
              fontWeight: theme.typography.cardTextWeight,
              lineHeight: theme.typography.cardTextLineHeight,
            }}
            className="mb-4"
          >
            {content.cardPhysicalDesc}
          </p>
        </div>

        {visibility.showCardPhysicalButton !== false && (
          <div className="w-full flex pt-2">
            <div
              style={{
                height: `${theme.buttons.height}px`,
                borderRadius: `${theme.buttons.borderRadius}px`,
                paddingLeft: `${theme.buttons.paddingX}px`,
                paddingRight: `${theme.buttons.paddingX}px`,
                backgroundColor: theme.colors.buttonBackground,
                color: theme.colors.buttonText,
                fontSize: `${theme.typography.buttonTextSize}px`,
                fontWeight: theme.typography.buttonTextWeight,
              }}
              className={`${btnAlignClass} flex items-center justify-center gap-2 cursor-pointer transition-all font-bold`}
            >
              <span>{content.cardPhysicalButton}</span>
              {theme.buttons.arrowStyle !== 'none' && (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        )}
      </div>
    );

    const cardProblem = visibility.showCardProblem !== false && (
      <div
        key="card-problem"
        onClick={() => onSelectTab('problema')}
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
          borderRadius: `${theme.cards.borderRadius}px`,
          borderWidth: `${theme.cards.borderWidth}px`,
          padding: `${layout.cardPadding}px`,
        }}
        className={`border flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${cardShadowClass}`}
      >
        <div>
          <div
            style={{ marginBottom: `${layout.cardContentGap ?? 16}px` }}
            className="flex items-center justify-between"
          >
            <span
              style={{
                backgroundColor: theme.colors.iconBoxBackground,
                color: theme.colors.iconColor,
                width: `${theme.cards.iconSize + 12}px`,
                height: `${theme.cards.iconSize + 12}px`,
              }}
              className="rounded-xl flex items-center justify-center font-bold text-sm"
            >
              <Zap className="w-4 h-4" />
            </span>
            {visibility.showCardProblemBadge !== false && (
              <span
                style={{
                  backgroundColor: theme.colors.badgeBackground,
                  color: theme.colors.badgeText,
                }}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              >
                {content.cardProblemBadge}
              </span>
            )}
          </div>

          <h3
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: `${theme.typography.cardTitleSize}px`,
              fontWeight: theme.typography.cardTitleWeight,
            }}
            className="mb-1 uppercase"
          >
            {content.cardProblemTitle}
          </h3>
          <p
            style={{
              color: theme.colors.textSecondary,
              fontSize: `${theme.typography.cardTextSize}px`,
              fontWeight: theme.typography.cardTextWeight,
              lineHeight: theme.typography.cardTextLineHeight,
            }}
            className="mb-4"
          >
            {content.cardProblemDesc}
          </p>
        </div>

        {visibility.showCardProblemButton !== false && (
          <div className="w-full flex pt-2">
            <div
              style={{
                height: `${theme.buttons.height}px`,
                borderRadius: `${theme.buttons.borderRadius}px`,
                paddingLeft: `${theme.buttons.paddingX}px`,
                paddingRight: `${theme.buttons.paddingX}px`,
                backgroundColor: theme.colors.buttonBackground,
                color: theme.colors.buttonText,
                fontSize: `${theme.typography.buttonTextSize}px`,
                fontWeight: theme.typography.buttonTextWeight,
              }}
              className={`${btnAlignClass} flex items-center justify-center gap-2 cursor-pointer transition-all font-bold`}
            >
              <span>{content.cardProblemButton}</span>
              {theme.buttons.arrowStyle !== 'none' && (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        )}
      </div>
    );

    const cardsList =
      positions.cardsOrder === 'problem_first'
        ? [cardProblem, cardPhysical]
        : [cardPhysical, cardProblem];

    return (
      <div className="group/cards relative">
        {onNavigateToTab && (
          <div className="opacity-0 group-hover/cards:opacity-100 transition-opacity absolute -top-4 right-0 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToTab('colors');
              }}
              title="Alterar cores dos cartões"
              className="bg-stone-900/95 text-stone-300 hover:text-amber-400 border border-stone-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Palette className="w-2.5 h-2.5" />
              <span>Cores</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToTab('layout');
              }}
              title="Editar layout e bordas dos Cards"
              className="bg-stone-900/95 text-amber-400 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <PenSquare className="w-2.5 h-2.5" />
              <span>Editar Cards & Layout</span>
            </button>
          </div>
        )}
        <div
          style={{ gap: `${layout.cardGap}px` }}
          className={`grid ${
            positions.cardsLayout === 'stack' || isMobile
              ? 'grid-cols-1'
              : 'grid-cols-2'
          }`}
        >
          {cardsList}
        </div>
      </div>
    );
  };

  /* 4. Search Bar Section */
  const renderSearchBar = () => {
    if (visibility.showSearchSection === false) return null;

    return (
      <div
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
          borderRadius: `${theme.cards.borderRadius}px`,
          marginBottom: `${layout.searchSpacing ?? 28}px`,
        }}
        className="group/search relative p-4 border space-y-2.5"
      >
        {onNavigateToTab && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToTab('content');
            }}
            title="Editar textos de busca"
            className="opacity-0 group-hover/search:opacity-100 transition-opacity absolute top-2 right-2 bg-stone-900/90 text-amber-400 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs cursor-pointer z-10"
          >
            <PenSquare className="w-2.5 h-2.5" />
            <span>Editar Busca</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" style={{ color: theme.colors.accent }} />
          <span className="text-xs font-bold">{content.searchTitle}</span>
        </div>
        <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
          {content.searchSubtitle}
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            placeholder={content.searchPlaceholder}
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
              color: theme.colors.textPrimary,
              borderRadius: `${theme.buttons.borderRadius}px`,
            }}
            className="flex-1 px-3 py-2 text-xs border focus:outline-none"
          />
          <button
            type="button"
            title="Entrada por áudio"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
              color: theme.colors.accent,
              borderRadius: `${theme.buttons.borderRadius}px`,
            }}
            className="px-2.5 py-2 text-xs font-bold border shrink-0 flex items-center justify-center"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            style={{
              backgroundColor: theme.colors.buttonBackground,
              color: theme.colors.buttonText,
              borderRadius: `${theme.buttons.borderRadius}px`,
            }}
            className="px-3 py-2 text-xs font-bold shrink-0"
          >
            {content.searchButtonText}
          </button>
        </div>

        {visibility.showSearchChips !== false && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Pneu furado', 'Chaveiro 24h', 'Cano estourado', 'Dentista urgente'].map(
              (chip, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: theme.colors.badgeBackground,
                    color: theme.colors.badgeText,
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  /* Ordered Sections */
  const renderHomeSections = () => {
    const order = positions.sectionOrder || 'hero_search_cards';

    if (order === 'hero_cards_search') {
      return (
        <div>
          {renderHero()}
          <div style={{ marginBottom: `${layout.heroSpacing}px` }}>
            {renderCards()}
          </div>
          {renderSearchBar()}
        </div>
      );
    }

    if (order === 'search_hero_cards') {
      return (
        <div>
          {renderSearchBar()}
          {renderHero()}
          {renderCards()}
        </div>
      );
    }

    // Default: hero_search_cards
    return (
      <div>
        {renderHero()}
        {renderSearchBar()}
        {renderCards()}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-6">
      {/* Top Header inside preview */}
      {renderHeader()}

      {/* Screen 1: HOME */}
      {activeTab === 'home' && (
        <div className="flex-1 flex flex-col justify-center">
          {renderHomeSections()}
        </div>
      )}

      {/* Screen 2: DOR FÍSICA */}
      {activeTab === 'fisica' && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
              borderRadius: `${theme.cards.borderRadius}px`,
            }}
            className="p-5 border space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Fluxo Dor Física</span>
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className="text-[11px] font-bold flex items-center gap-1 text-stone-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Voltar</span>
              </button>
            </div>

            <h2
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.titleWeight,
              }}
              className="text-base leading-tight"
            >
              Onde no seu corpo você está sentindo desconforto agora?
            </h2>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                'Costas / Lombar',
                'Pescoço / Ombros',
                'Cabeça / Enxaqueca',
                'Pernas / Joelhos',
              ].map((part) => (
                <div
                  key={part}
                  style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderRadius: `${Math.min(theme.cards.borderRadius, 12)}px`,
                  }}
                  className="p-2.5 border text-xs font-bold text-center"
                >
                  {part}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: DOR / PROBLEMA */}
      {activeTab === 'problema' && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
              borderRadius: `${theme.cards.borderRadius}px`,
            }}
            className="p-5 border space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Fluxo Dor de Problema</span>
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className="text-[11px] font-bold flex items-center gap-1 text-stone-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Voltar</span>
              </button>
            </div>

            <h2
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.titleWeight,
              }}
              className="text-base leading-tight"
            >
              O que está travando o seu dia ou roubando sua paz?
            </h2>

            <div
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              }}
              className="w-full h-20 rounded-xl border p-2.5 text-xs text-stone-400"
            >
              Ex: Meu pneu furou e preciso de socorro mecânico urgente...
            </div>
          </div>
        </div>
      )}

      {/* Footer Notice */}
      {visibility.showFooterNotice !== false && (
        <div
          style={{
            fontSize: `${theme.typography.footerSize}px`,
            color: theme.colors.textSecondary,
            marginTop: `${layout.footerSpacing ?? 32}px`,
          }}
          className="text-center pt-3 border-t border-black/10 dark:border-white/10 shrink-0"
        >
          {content.footerNotice}
        </div>
      )}
    </div>
  );
}
