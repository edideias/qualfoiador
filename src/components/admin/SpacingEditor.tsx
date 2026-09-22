import React, { useState } from 'react';
import {
  MoveVertical,
  MoveHorizontal,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCcw,
  Sliders,
  Box,
  Check,
  Smartphone,
  Monitor,
  ArrowUpDown,
  ArrowLeftRight,
  Layers,
  MousePointerClick,
  Info,
  Save,
  UploadCloud,
  Eye,
  Activity,
  Zap,
  Search,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  ThemeConfig,
  ThemeLayout,
  DEFAULT_THEME_LAYOUT,
  getThemeLayout,
  getThemeContent,
  getThemePositions,
} from '../../modules/theme/types';
import { BrandLogo } from '../brand/BrandLogo';

export interface SpacingEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
  onPublish?: () => Promise<void> | void;
  onSaveDraft?: () => Promise<void> | void;
  onTestOnSite?: () => void;
  isPublishing?: boolean;
}

export type SpacingPresetKey = 'compact' | 'balanced' | 'focus' | 'spacious';

export interface SpacingPreset {
  key: SpacingPresetKey;
  label: string;
  badge: string;
  description: string;
  icon: string;
  values: Required<ThemeLayout>;
}

export const PRESETS: SpacingPreset[] = [
  {
    key: 'compact',
    label: 'Ultra Compacto',
    badge: 'Sem Rolar a Tela',
    description: 'Espaços mais justos para ver o Hero, Busca e Cards na primeira dobra sem precisar rolar.',
    icon: '⚡',
    values: {
      maxWidth: 860,
      topSpacing: 24,
      bottomSpacing: 36,
      heroSpacing: 20,
      searchSpacing: 18,
      cardGap: 14,
      cardPadding: 20,
      cardContentGap: 12,
      containerPaddingX: 16,
      footerSpacing: 22,
      borderRadius: 18,
      borderWidth: 1,
      density: 'compact',
      mobileAdaptive: true,
    },
  },
  {
    key: 'balanced',
    label: 'Equilibrado',
    badge: 'Padrão Recomendado',
    description: 'Harmonia visual ideal entre respiro, estética refinada e facilidade de leitura.',
    icon: '🎯',
    values: {
      maxWidth: 920,
      topSpacing: 44,
      bottomSpacing: 60,
      heroSpacing: 32,
      searchSpacing: 24,
      cardGap: 20,
      cardPadding: 26,
      cardContentGap: 16,
      containerPaddingX: 24,
      footerSpacing: 32,
      borderRadius: 24,
      borderWidth: 1,
      density: 'balanced',
      mobileAdaptive: true,
    },
  },
  {
    key: 'focus',
    label: 'Executivo & Foco',
    badge: 'Alta Densidade',
    description: 'Largura um pouco maior, respiro moderado e foco imediato nos cartões de ação.',
    icon: '💼',
    values: {
      maxWidth: 980,
      topSpacing: 32,
      bottomSpacing: 48,
      heroSpacing: 26,
      searchSpacing: 20,
      cardGap: 16,
      cardPadding: 24,
      cardContentGap: 14,
      containerPaddingX: 20,
      footerSpacing: 28,
      borderRadius: 20,
      borderWidth: 1,
      density: 'balanced',
      mobileAdaptive: true,
    },
  },
  {
    key: 'spacious',
    label: 'Arejado & Conforto',
    badge: 'Espaçoso',
    description: 'Respiro amplo para um estilo visual clean, relaxante e com muito espaço negativo.',
    icon: '🌿',
    values: {
      maxWidth: 1040,
      topSpacing: 64,
      bottomSpacing: 80,
      heroSpacing: 44,
      searchSpacing: 32,
      cardGap: 28,
      cardPadding: 34,
      cardContentGap: 20,
      containerPaddingX: 32,
      footerSpacing: 40,
      borderRadius: 28,
      borderWidth: 1,
      density: 'spacious',
      mobileAdaptive: true,
    },
  },
];

export const SpacingEditor: React.FC<SpacingEditorProps> = ({
  theme,
  onChange,
  onPublish,
  onSaveDraft,
  onTestOnSite,
  isPublishing = false,
}) => {
  const currentLayout = getThemeLayout(theme);
  const themeContent = getThemeContent(theme);
  const themePositions = getThemePositions(theme);

  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [sandboxDevice, setSandboxDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  // Identificar se o layout atual corresponde a algum preset
  const activePresetKey = PRESETS.find((p) => {
    return (
      p.values.topSpacing === currentLayout.topSpacing &&
      p.values.heroSpacing === currentLayout.heroSpacing &&
      p.values.cardGap === currentLayout.cardGap &&
      p.values.cardPadding === currentLayout.cardPadding
    );
  })?.key;

  // Atualizar campo cirúrgico individual
  const updateLayoutField = (field: keyof ThemeLayout, value: any) => {
    onChange((prev) => {
      const existing = getThemeLayout(prev);
      return {
        ...prev,
        layout: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  // Aplicar preset completo em 1 clique
  const applyPreset = (preset: SpacingPreset) => {
    onChange((prev) => ({
      ...prev,
      layout: {
        ...getThemeLayout(prev),
        ...preset.values,
      },
    }));
  };

  // Ajuste global proporcional (+10% ou -10%)
  const applyGlobalScale = (factor: number) => {
    onChange((prev) => {
      const cur = getThemeLayout(prev);
      return {
        ...prev,
        layout: {
          ...cur,
          topSpacing: Math.max(12, Math.round(cur.topSpacing * factor)),
          heroSpacing: Math.max(12, Math.round(cur.heroSpacing * factor)),
          searchSpacing: Math.max(10, Math.round((cur.searchSpacing ?? 28) * factor)),
          cardGap: Math.max(8, Math.round(cur.cardGap * factor)),
          cardPadding: Math.max(14, Math.round(cur.cardPadding * factor)),
          cardContentGap: Math.max(8, Math.round((cur.cardContentGap ?? 16) * factor)),
          footerSpacing: Math.max(12, Math.round((cur.footerSpacing ?? 32) * factor)),
          bottomSpacing: Math.max(20, Math.round((cur.bottomSpacing ?? 64) * factor)),
        },
      };
    });
  };

  // Ajuste global de offset (+5px ou -5px em tudo)
  const applyGlobalDelta = (delta: number) => {
    onChange((prev) => {
      const cur = getThemeLayout(prev);
      return {
        ...prev,
        layout: {
          ...cur,
          topSpacing: Math.max(12, cur.topSpacing + delta),
          heroSpacing: Math.max(12, cur.heroSpacing + delta),
          searchSpacing: Math.max(10, (cur.searchSpacing ?? 28) + delta),
          cardGap: Math.max(8, cur.cardGap + delta),
          cardPadding: Math.max(14, cur.cardPadding + delta),
          cardContentGap: Math.max(8, (cur.cardContentGap ?? 16) + delta),
          footerSpacing: Math.max(12, (cur.footerSpacing ?? 32) + delta),
          bottomSpacing: Math.max(20, (cur.bottomSpacing ?? 64) + delta),
        },
      };
    });
  };

  // Restaurar padrão de fábrica
  const handleResetToFactory = () => {
    onChange((prev) => ({
      ...prev,
      layout: { ...DEFAULT_THEME_LAYOUT },
    }));
  };

  // Executar publicação direta a partir do configurador de espaçamento
  const handlePublishNow = async () => {
    if (!onPublish) return;
    setIsSavingLocal(true);
    try {
      await onPublish();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 4500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingLocal(false);
    }
  };

  // Valores simulados para o mini-sandbox (comprimidos se mobile)
  const isMobile = sandboxDevice === 'mobile';
  const shouldCompress = isMobile && currentLayout.mobileAdaptive !== false;

  const simTopSpacing = shouldCompress ? Math.max(16, Math.round(currentLayout.topSpacing * 0.6)) : currentLayout.topSpacing;
  const simHeroSpacing = shouldCompress ? Math.max(16, Math.round(currentLayout.heroSpacing * 0.65)) : currentLayout.heroSpacing;
  const simSearchSpacing = shouldCompress ? Math.max(14, Math.round((currentLayout.searchSpacing ?? 28) * 0.7)) : (currentLayout.searchSpacing ?? 28);
  const simCardGap = shouldCompress ? Math.max(12, Math.round(currentLayout.cardGap * 0.65)) : currentLayout.cardGap;
  const simCardPadding = shouldCompress ? Math.max(16, Math.round(currentLayout.cardPadding * 0.75)) : currentLayout.cardPadding;
  const simCardContentGap = shouldCompress ? Math.max(10, Math.round((currentLayout.cardContentGap ?? 16) * 0.75)) : (currentLayout.cardContentGap ?? 16);
  const simPaddingX = shouldCompress ? Math.min(currentLayout.containerPaddingX ?? 24, 16) : (currentLayout.containerPaddingX ?? 24);
  const simFooterSpacing = shouldCompress ? Math.max(16, Math.round((currentLayout.footerSpacing ?? 32) * 0.7)) : (currentLayout.footerSpacing ?? 32);

  return (
    <div id="spacing-editor-container" className="space-y-6">
      {/* 1. TOP ACTION & STATUS BAR */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/95 to-stone-900 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Configurador Prático de Espaçamentos</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Em Tempo Real
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Altere distâncias, alturas, margens e densidade visual com aplicação imediata.
              </p>
            </div>
          </div>

          {/* Quick Actions: Salvar & Publicar / Testar no Site */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onTestOnSite && (
              <button
                type="button"
                onClick={onTestOnSite}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-stone-700 active:scale-95"
                title="Ativar modo de teste para conferir na página inicial"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Testar no Site</span>
              </button>
            )}

            {onPublish && (
              <button
                type="button"
                onClick={handlePublishNow}
                disabled={isPublishing || isSavingLocal}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
              >
                {isPublishing || isSavingLocal ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-stone-950" />
                    <span>Salvar & Publicar no Site</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleResetToFactory}
              className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer border border-stone-800"
              title="Restaurar padrão original de fábrica"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback visual de publicação */}
        {showSaveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">
                🎉 Espaçamentos salvos e publicados com sucesso! O site principal já está com as novas medidas.
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-bold shrink-0">Ativo</span>
          </div>
        )}
      </div>

      {/* 2. DENSIDADE GERAL (1-CLIQUE): PRESETS & AJUSTES RÁPIDOS */}
      <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              1. Densidade Geral em 1 Clique (Presets Prontos)
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Escolha uma harmonia pronta ou faça ajustes finos abaixo
          </span>
        </div>

        {/* 4 Cards de Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const isActive = activePresetKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative group ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{preset.icon}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                    {preset.label}
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-snug mt-1">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Topo: {preset.values.topSpacing}px</span>
                  <span>Gap: {preset.values.cardGap}px</span>
                  <span>Pad: {preset.values.cardPadding}px</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Botões de Aceleração Rápida Global */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">Ajustes Rápidos em Lote:</span>
            <span className="text-[11px] text-stone-500 hidden sm:inline">
              (Aumenta ou reduz todos os espaçamentos ao mesmo tempo)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyGlobalDelta(-5)}
              className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-bold border border-stone-800 transition-colors cursor-pointer active:scale-95"
              title="Reduzir 5px em todos os espaçamentos"
            >
              -5px em Tudo
            </button>
            <button
              type="button"
              onClick={() => applyGlobalDelta(+5)}
              className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-bold border border-stone-800 transition-colors cursor-pointer active:scale-95"
              title="Aumentar 5px em todos os espaçamentos"
            >
              +5px em Tudo
            </button>
            <button
              type="button"
              onClick={() => applyGlobalScale(0.9)}
              className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-amber-400 hover:text-amber-300 text-xs font-bold border border-stone-800 transition-colors cursor-pointer active:scale-95"
              title="Comprimir todos os espaços em 10%"
            >
              -10% Compactar
            </button>
            <button
              type="button"
              onClick={() => applyGlobalScale(1.1)}
              className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-amber-400 hover:text-amber-300 text-xs font-bold border border-stone-800 transition-colors cursor-pointer active:scale-95"
              title="Expandir todos os espaços em 10%"
            >
              +10% Arejar
            </button>
          </div>
        </div>
      </div>

      {/* 3. MINI-SANDBOX VISUAL INTERATIVO AO VIVO COM RÉGUAS DE PIXELS */}
      <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              2. Simulador Visual em Tempo Real
            </h3>
            <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full font-bold">
              {sandboxDevice === 'desktop' ? `Desktop (${currentLayout.maxWidth}px max)` : 'Celular (390px)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setSandboxDevice('desktop')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                sandboxDevice === 'desktop'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setSandboxDevice('mobile')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                sandboxDevice === 'mobile'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular</span>
            </button>
          </div>
        </div>

        {/* Canvas do Simulador com Réguas Interativas */}
        <div className="p-4 sm:p-6 rounded-2xl bg-stone-950 border border-stone-800 flex justify-center overflow-x-auto min-h-[360px]">
          <div
            style={{
              width: isMobile ? '380px' : '100%',
              maxWidth: isMobile ? '380px' : `${Math.min(currentLayout.maxWidth, 840)}px`,
              backgroundColor: theme.colors.background,
              color: theme.colors.textPrimary,
              paddingLeft: `${simPaddingX}px`,
              paddingRight: `${simPaddingX}px`,
              paddingTop: `${simTopSpacing}px`,
              paddingBottom: `${Math.round((currentLayout.bottomSpacing ?? 64) * 0.5)}px`,
            }}
            className="rounded-2xl border border-stone-700/60 shadow-2xl flex flex-col transition-all duration-200 relative select-none"
          >
            {/* Régua Indicativa do Top Spacing */}
            <div
              onMouseEnter={() => setHighlightedField('topSpacing')}
              onMouseLeave={() => setHighlightedField(null)}
              className={`w-full py-0.5 mb-1 text-[9px] font-mono font-bold flex items-center justify-center gap-1 transition-all rounded ${
                highlightedField === 'topSpacing'
                  ? 'bg-amber-500 text-stone-950 font-black ring-2 ring-amber-400'
                  : 'bg-amber-500/10 text-amber-400/70 border border-dashed border-amber-500/30'
              }`}
            >
              <span>↑ Top Spacing: {simTopSpacing}px</span>
            </div>

            {/* Simulação do Header/Logo */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/40">
              <div className="flex items-center gap-1.5">
                <BrandLogo theme={theme} size="sm" />
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-bold">
                Cabeçalho Fixo
              </span>
            </div>

            {/* Simulação do Hero */}
            <div className="text-center pt-3">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 mb-1.5">
                <span>{themeContent.heroBadgeText || 'Rápido & Gratuito'}</span>
              </div>
              <h4 className="text-sm font-black tracking-tight">
                {themeContent.heroTitlePrefix} <span className="text-amber-500">{themeContent.heroTitleHighlight}</span>
              </h4>
              <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5 max-w-sm mx-auto">
                {themeContent.heroSubtitle}
              </p>
            </div>

            {/* Régua Indicativa do Hero Spacing */}
            <div
              onMouseEnter={() => setHighlightedField('heroSpacing')}
              onMouseLeave={() => setHighlightedField(null)}
              style={{ margin: `${simHeroSpacing}px 0` }}
              className={`w-full py-1 text-[9px] font-mono font-bold flex items-center justify-center gap-1 transition-all rounded cursor-pointer ${
                highlightedField === 'heroSpacing'
                  ? 'bg-purple-500 text-white font-black ring-2 ring-purple-400'
                  : 'bg-purple-500/10 text-purple-400 border border-dashed border-purple-500/40'
              }`}
            >
              <span>↕ Hero Spacing: {simHeroSpacing}px</span>
            </div>

            {/* Simulação da Barra de Busca */}
            <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-700/60 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1 truncate">
                <Search className="w-3 h-3 text-stone-500 shrink-0" />
                <span className="truncate">{themeContent.searchPlaceholder || 'Digite seu sintoma ou problema...'}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-black text-[9px] shrink-0">
                {themeContent.searchButtonText || 'Resolver'}
              </div>
            </div>

            {/* Régua Indicativa do Search Spacing */}
            <div
              onMouseEnter={() => setHighlightedField('searchSpacing')}
              onMouseLeave={() => setHighlightedField(null)}
              style={{ margin: `${simSearchSpacing}px 0` }}
              className={`w-full py-1 text-[9px] font-mono font-bold flex items-center justify-center gap-1 transition-all rounded cursor-pointer ${
                highlightedField === 'searchSpacing'
                  ? 'bg-blue-500 text-white font-black ring-2 ring-blue-400'
                  : 'bg-blue-500/10 text-blue-400 border border-dashed border-blue-500/40'
              }`}
            >
              <span>↕ Search Spacing: {simSearchSpacing}px</span>
            </div>

            {/* Simulação dos Cards com Gap e Padding */}
            <div
              style={{ gap: `${simCardGap}px` }}
              className={`w-full grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {/* Card Dor Física */}
              <div
                style={{ padding: `${simCardPadding}px` }}
                className="rounded-xl border border-stone-700/80 bg-stone-900/60 flex flex-col justify-between"
              >
                <div>
                  <div
                    style={{ marginBottom: `${simCardContentGap}px` }}
                    className="flex items-center justify-between"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                      Corpo & Saúde
                    </span>
                  </div>
                  <h5 className="text-[11px] font-black text-white uppercase">Dor Física</h5>
                  <p className="text-[9px] text-stone-400 line-clamp-1 mt-0.5">
                    Sintomas musculares ou corporais.
                  </p>
                </div>
                <div className="mt-3 pt-2 flex justify-end">
                  <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[9px] font-black">
                    Avaliar Sintomas
                  </span>
                </div>
              </div>

              {/* Card Dor de Problema */}
              <div
                style={{ padding: `${simCardPadding}px` }}
                className="rounded-xl border border-stone-700/80 bg-stone-900/60 flex flex-col justify-between"
              >
                <div>
                  <div
                    style={{ marginBottom: `${simCardContentGap}px` }}
                    className="flex items-center justify-between"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                      Vida Prática
                    </span>
                  </div>
                  <h5 className="text-[11px] font-black text-white uppercase">Problema Prático</h5>
                  <p className="text-[9px] text-stone-400 line-clamp-1 mt-0.5">
                    Urgências, casa e dia a dia.
                  </p>
                </div>
                <div className="mt-3 pt-2 flex justify-end">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 text-[9px] font-black">
                    Resolver Agora
                  </span>
                </div>
              </div>
            </div>

            {/* Régua Indicativa do Footer Spacing */}
            <div
              onMouseEnter={() => setHighlightedField('footerSpacing')}
              onMouseLeave={() => setHighlightedField(null)}
              style={{ marginTop: `${simFooterSpacing}px` }}
              className={`w-full py-1 text-[9px] font-mono font-bold flex items-center justify-center gap-1 transition-all rounded cursor-pointer ${
                highlightedField === 'footerSpacing'
                  ? 'bg-emerald-500 text-white font-black ring-2 ring-emerald-400'
                  : 'bg-emerald-500/10 text-emerald-400 border border-dashed border-emerald-500/40'
              }`}
            >
              <span>↕ Footer Spacing: {simFooterSpacing}px</span>
            </div>

            {/* Micro Rodapé */}
            <div className="text-center pt-2 flex items-center justify-center gap-1 text-[9px] text-stone-500 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{themeContent.footerNotice || 'Informações e triagem protegida'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTROLES INDIVIDUAIS CIRÚRGICOS ORGANIZADOS POR SEÇÃO */}

      {/* SEÇÃO 1: TOPO & INÍCIO DA PÁGINA */}
      <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoveVertical className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              3. Topo & Altura Inicial da Página
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Define onde o primeiro elemento surge na tela
          </span>
        </div>

        <SpacingSliderItem
          id="control-topSpacing"
          icon={<MoveVertical className="w-4 h-4 text-amber-400" />}
          label="Distância do Topo (Top Spacing)"
          description="Espaço entre o cabeçalho fixo e o primeiro elemento (Mascote/Hero). Valores menores (20-30px) deixam tudo visível sem rolar."
          value={currentLayout.topSpacing}
          min={8}
          max={120}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.topSpacing}
          unit="px"
          isHighlighted={highlightedField === 'topSpacing'}
          onMouseEnter={() => setHighlightedField('topSpacing')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('topSpacing', val)}
        />
      </div>

      {/* SEÇÃO 2: RITMO VERTICAL DAS SEÇÕES */}
      <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              4. Respiro Vertical das Seções Principais
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Distância de separação entre blocos de conteúdo
          </span>
        </div>

        {/* 4.1 heroSpacing */}
        <SpacingSliderItem
          id="control-heroSpacing"
          icon={<ArrowUpDown className="w-4 h-4 text-purple-400" />}
          label="Espaço abaixo do Hero (Hero Spacing)"
          description="Distância vertical entre os textos principais/Mascote e o próximo bloco (Busca ou Cards)."
          value={currentLayout.heroSpacing}
          min={10}
          max={80}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.heroSpacing}
          unit="px"
          isHighlighted={highlightedField === 'heroSpacing'}
          onMouseEnter={() => setHighlightedField('heroSpacing')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('heroSpacing', val)}
        />

        {/* 4.2 searchSpacing */}
        <SpacingSliderItem
          id="control-searchSpacing"
          icon={<Search className="w-4 h-4 text-blue-400" />}
          label="Espaço abaixo da Barra de Busca (Search Spacing)"
          description="Distância vertical entre a caixa de pesquisa rápida/botão de voz e os cards de sintomas."
          value={currentLayout.searchSpacing ?? 28}
          min={8}
          max={64}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.searchSpacing ?? 28}
          unit="px"
          isHighlighted={highlightedField === 'searchSpacing'}
          onMouseEnter={() => setHighlightedField('searchSpacing')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('searchSpacing', val)}
        />

        {/* 4.3 footerSpacing */}
        <SpacingSliderItem
          id="control-footerSpacing"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          label="Espaço acima do Rodapé (Footer Spacing)"
          description="Distância entre os cards e o micro-rodapé de confiança e segurança."
          value={currentLayout.footerSpacing ?? 32}
          min={8}
          max={64}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.footerSpacing ?? 32}
          unit="px"
          isHighlighted={highlightedField === 'footerSpacing'}
          onMouseEnter={() => setHighlightedField('footerSpacing')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('footerSpacing', val)}
        />

        {/* 4.4 bottomSpacing */}
        <SpacingSliderItem
          id="control-bottomSpacing"
          icon={<MoveVertical className="w-4 h-4 text-stone-400" />}
          label="Margem Final da Página (Bottom Spacing)"
          description="Espaço de respiro no final absoluto da página para que o conteúdo não cole na borda da tela."
          value={currentLayout.bottomSpacing ?? 64}
          min={16}
          max={120}
          step={4}
          defaultValue={DEFAULT_THEME_LAYOUT.bottomSpacing ?? 64}
          unit="px"
          isHighlighted={highlightedField === 'bottomSpacing'}
          onMouseEnter={() => setHighlightedField('bottomSpacing')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('bottomSpacing', val)}
        />
      </div>

      {/* SEÇÃO 3: ESPAÇAMENTO DOS CARDS */}
      <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              5. Espaçamento Interno & Separação dos Cards
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Ajuste a densidade dos cartões de ação
          </span>
        </div>

        {/* 5.1 cardGap */}
        <SpacingSliderItem
          id="control-cardGap"
          icon={<ArrowLeftRight className="w-4 h-4 text-emerald-400" />}
          label="Distância entre os Cards (Card Gap)"
          description="Espaço horizontal ou vertical de separação entre o card de Dor Física e o de Dor de Problema."
          value={currentLayout.cardGap}
          min={8}
          max={60}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.cardGap}
          unit="px"
          isHighlighted={highlightedField === 'cardGap'}
          onMouseEnter={() => setHighlightedField('cardGap')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('cardGap', val)}
        />

        {/* 5.2 cardPadding */}
        <SpacingSliderItem
          id="control-cardPadding"
          icon={<Box className="w-4 h-4 text-emerald-400" />}
          label="Preenchimento Interno dos Cards (Card Padding)"
          description="Espaço entre a borda do card e o conteúdo interior (ícone, títulos, descrição e botão)."
          value={currentLayout.cardPadding}
          min={14}
          max={56}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.cardPadding}
          unit="px"
          isHighlighted={highlightedField === 'cardPadding'}
          onMouseEnter={() => setHighlightedField('cardPadding')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('cardPadding', val)}
        />

        {/* 5.3 cardContentGap */}
        <SpacingSliderItem
          id="control-cardContentGap"
          icon={<MoveVertical className="w-4 h-4 text-emerald-400" />}
          label="Respiro Interno dos Elementos do Card"
          description="Distância vertical entre o cabeçalho/ícone, o texto descritivo e o botão CTA."
          value={currentLayout.cardContentGap ?? 16}
          min={8}
          max={36}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.cardContentGap ?? 16}
          unit="px"
          isHighlighted={highlightedField === 'cardContentGap'}
          onMouseEnter={() => setHighlightedField('cardContentGap')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('cardContentGap', val)}
        />
      </div>

      {/* SEÇÃO 4: LARGURA MÁXIMA & MARGENS LATERAIS */}
      <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoveHorizontal className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              6. Largura do Container & Margens Laterais
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Define como o site se acomoda na tela
          </span>
        </div>

        {/* 6.1 maxWidth */}
        <SpacingSliderItem
          id="control-maxWidth"
          icon={<Maximize2 className="w-4 h-4 text-blue-400" />}
          label="Largura Máxima do Conteúdo Central (Max-Width)"
          description="Limita a expansão em monitores grandes. Valores entre 880px e 980px proporcionam leitura ideal."
          value={currentLayout.maxWidth}
          min={720}
          max={1300}
          step={10}
          defaultValue={DEFAULT_THEME_LAYOUT.maxWidth}
          unit="px"
          isHighlighted={highlightedField === 'maxWidth'}
          onMouseEnter={() => setHighlightedField('maxWidth')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('maxWidth', val)}
        />

        {/* 6.2 containerPaddingX */}
        <SpacingSliderItem
          id="control-containerPaddingX"
          icon={<ArrowLeftRight className="w-4 h-4 text-blue-400" />}
          label="Margem Lateral de Segurança da Tela (Padding X)"
          description="Respiro lateral mínimo para impedir que o conteúdo encoste nas laterais do navegador."
          value={currentLayout.containerPaddingX ?? 24}
          min={12}
          max={48}
          step={2}
          defaultValue={DEFAULT_THEME_LAYOUT.containerPaddingX ?? 24}
          unit="px"
          isHighlighted={highlightedField === 'containerPaddingX'}
          onMouseEnter={() => setHighlightedField('containerPaddingX')}
          onMouseLeave={() => setHighlightedField(null)}
          onChange={(val) => updateLayoutField('containerPaddingX', val)}
        />
      </div>

      {/* SEÇÃO 5: ADAPTAÇÃO INTELIGENTE MOBILE */}
      <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              7. Adaptação Automática para Celulares
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white">
              Compressão Proporcional Inteligente em Telas Pequenas
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed max-w-xl">
              Quando ativado, os espaçamentos configurados acima são mantidos no Desktop e comprimidos harmonicamente em 30-35% em smartphones, garantindo que o Hero, a Busca e os Cards apareçam na primeira dobra da tela.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateLayoutField('mobileAdaptive', !currentLayout.mobileAdaptive)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              currentLayout.mobileAdaptive !== false
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            {currentLayout.mobileAdaptive !== false ? (
              <>
                <Check className="w-4 h-4" />
                <span>Ativado (Recomendado)</span>
              </>
            ) : (
              <span>Desativado (Medidas Fixas)</span>
            )}
          </button>
        </div>
      </div>

      {/* BARRA FIXA DE SALVAR / PUBLICAR NO RODAPÉ DO EDITOR */}
      {onPublish && (
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-stone-950/95 backdrop-blur-md border border-amber-500/40 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-stone-200">
              Pronto para aplicar no site público?
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onTestOnSite && (
              <button
                type="button"
                onClick={onTestOnSite}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
              >
                Conferir no Site
              </button>
            )}
            <button
              type="button"
              onClick={handlePublishNow}
              disabled={isPublishing || isSavingLocal}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {isPublishing || isSavingLocal ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Publicar Espaçamentos Agora</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE DE CONTROLE PRECISO COM SLIDER + ENTRADA NUMÉRICA + BOTÕES DE INCREMENTO RÁPIDOS
interface SpacingSliderItemProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onChange: (val: number) => void;
}

const SpacingSliderItem: React.FC<SpacingSliderItemProps> = ({
  id,
  icon,
  label,
  description,
  value,
  min,
  max,
  step,
  defaultValue,
  unit,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onChange,
}) => {
  return (
    <div
      id={id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`p-4 rounded-2xl border transition-all ${
        isHighlighted
          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
          : 'bg-stone-950/50 border-stone-800 hover:border-stone-700/80'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white">{label}</h4>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                {value}{unit}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">{description}</p>
          </div>
        </div>

        {/* Indicador Numérico e Botões Rápidos */}
        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
          {/* Botão decremento -5px */}
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 5))}
            disabled={value <= min}
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-25 text-stone-400 hover:text-white text-[10px] font-mono font-bold border border-stone-800 flex items-center justify-center cursor-pointer transition-colors"
            title="Diminuir 5px"
          >
            -5
          </button>

          {/* Botão decremento -1px ou step */}
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            disabled={value <= min}
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-25 text-stone-300 text-xs font-black border border-stone-800 flex items-center justify-center cursor-pointer transition-colors"
            title={`Diminuir ${step}${unit}`}
          >
            -{step}
          </button>

          {/* Campo Numérico Direto */}
          <div className="relative flex items-center">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!isNaN(parsed)) {
                  onChange(Math.min(max, Math.max(min, parsed)));
                }
              }}
              className="w-16 h-7 rounded-lg bg-stone-900 border border-stone-700 text-amber-400 text-xs font-black text-center focus:outline-none focus:border-amber-500 px-1 font-mono"
            />
            <span className="absolute right-1 text-[9px] text-stone-500 pointer-events-none font-bold">
              {unit}
            </span>
          </div>

          {/* Botão incremento +1px ou step */}
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + step))}
            disabled={value >= max}
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-25 text-stone-300 text-xs font-black border border-stone-800 flex items-center justify-center cursor-pointer transition-colors"
            title={`Aumentar ${step}${unit}`}
          >
            +{step}
          </button>

          {/* Botão incremento +5px */}
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 5))}
            disabled={value >= max}
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-25 text-stone-400 hover:text-white text-[10px] font-mono font-bold border border-stone-800 flex items-center justify-center cursor-pointer transition-colors"
            title="Aumentar 5px"
          >
            +5
          </button>

          {/* Reset para valor de fábrica individual */}
          {value !== defaultValue && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              className="px-2 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-[10px] font-bold border border-stone-800 flex items-center gap-1 cursor-pointer transition-colors ml-1"
              title={`Restaurar padrão original: ${defaultValue}${unit}`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{defaultValue}</span>
            </button>
          )}
        </div>
      </div>

      {/* Slider Visual Contínuo */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[10px] text-stone-500 font-bold w-7 text-right font-mono">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg appearance-none"
        />
        <span className="text-[10px] text-stone-500 font-bold w-9 font-mono">{max}</span>
      </div>
    </div>
  );
};
