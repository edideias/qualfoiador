import React from 'react';
import { ThemeConfig, getThemeContent, getThemeLayout } from '../../modules/theme/types';
import { ALL_TEMPLATES } from '../../modules/theme/templates';
import { AVAILABLE_GOOGLE_FONTS, ensureFontLoaded } from '../../modules/theme/fontLoader';
import { PRESETS, SpacingPreset } from './SpacingEditor';
import {
  Sparkles,
  Palette,
  Type,
  LayoutGrid,
  Sliders,
  Check,
  Wand2,
  Columns,
  Rows,
  Sun,
  Moon,
  MousePointerClick,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  Eye,
  Shield,
  Layers,
  Briefcase,
  MoveVertical,
} from 'lucide-react';

interface QuickStudioEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
  onSelectTemplate: (template: ThemeConfig) => void;
  onOpenAdvancedTab: (tabName: string) => void;
  onQuickPublish: () => void;
  isPublishing?: boolean;
}

// 8 curated, high-converting color pairs for 1-click selection
const INSTANT_PALETTES = [
  {
    id: 'official-neon-purple',
    name: 'Lilás Neon & Preto (Oficial)',
    tag: 'Marca Oficial • Fundo Branco',
    isDark: false,
    bg: '#ffffff',
    card: '#ffffff',
    border: '#e4e4e7',
    text: '#09090b',
    accent: '#a855f7',
    btn: '#09090b',
    btnText: '#ffffff',
  },
  {
    id: 'neon-purple-dark',
    name: 'Lilás Neon Noturno',
    tag: 'Ultra-Contraste Escuro',
    isDark: true,
    bg: '#09090b',
    card: '#121216',
    border: '#27272a',
    text: '#fafafa',
    accent: '#c084fc',
    btn: '#a855f7',
    btnText: '#09090b',
  },
  {
    id: 'amber-dark',
    name: 'Âmbar Noturno',
    tag: 'Foco & Urgência',
    isDark: true,
    bg: '#0c0a09',
    card: '#1c1917',
    border: '#44403c',
    text: '#fafaf9',
    accent: '#f59e0b',
    btn: '#f59e0b',
    btnText: '#0c0a09',
  },
  {
    id: 'emerald-health',
    name: 'Esmeralda Saúde',
    tag: 'Cuidado & Bem-estar',
    isDark: true,
    bg: '#061712',
    card: '#0b241c',
    border: '#1b4d3e',
    text: '#f0fdf4',
    accent: '#10b981',
    btn: '#10b981',
    btnText: '#041f17',
  },
  {
    id: 'sapphire-corp',
    name: 'Azul Confiança',
    tag: 'Clássico & Seguro',
    isDark: false,
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#cbd5e1',
    text: '#0f172a',
    accent: '#2563eb',
    btn: '#2563eb',
    btnText: '#ffffff',
  },
  {
    id: 'pure-minimal',
    name: 'Clean Editorial',
    tag: 'Minimalismo Total',
    isDark: false,
    bg: '#ffffff',
    card: '#fbfbfa',
    border: '#e5e5e3',
    text: '#1a1a19',
    accent: '#1a1a19',
    btn: '#1a1a19',
    btnText: '#ffffff',
  },
  {
    id: 'ruby-energy',
    name: 'Rubi Impacto',
    tag: 'Energia & Prontidão',
    isDark: true,
    bg: '#140c10',
    card: '#20121a',
    border: '#4c2236',
    text: '#fff1f2',
    accent: '#f43f5e',
    btn: '#f43f5e',
    btnText: '#ffffff',
  },
  {
    id: 'violet-modern',
    name: 'Violeta Tecnológico',
    tag: 'Inovador & Moderno',
    isDark: true,
    bg: '#0d0d1a',
    card: '#16162a',
    border: '#323258',
    text: '#f5f3ff',
    accent: '#8b5cf6',
    btn: '#8b5cf6',
    btnText: '#ffffff',
  },
];

// Quick typography pairing presets
const FONT_PRESETS = [
  {
    id: 'jakarta-clean',
    name: 'Plus Jakarta Sans',
    subtitle: 'Moderno, ultra-legível (Estilo Uber/Linear)',
    heading: 'Plus Jakarta Sans',
    body: 'Plus Jakarta Sans',
  },
  {
    id: 'inter-tech',
    name: 'Inter Pro',
    subtitle: 'Neutro, tecnológico e de altíssima clareza',
    heading: 'Inter',
    body: 'Inter',
  },
  {
    id: 'outfit-friendly',
    name: 'Outfit & Poppins',
    subtitle: 'Amigável, acolhedor e humanizado',
    heading: 'Outfit',
    body: 'Poppins',
  },
  {
    id: 'playfair-premium',
    name: 'Playfair & Plus Jakarta',
    subtitle: 'Editorial requintado, médico e premium',
    heading: 'Playfair Display',
    body: 'Plus Jakarta Sans',
  },
  {
    id: 'montserrat-bold',
    name: 'Montserrat Impact',
    subtitle: 'Marcante, robusto e direto ao ponto',
    heading: 'Montserrat',
    body: 'Open Sans',
  },
];

// Quick Style presets (Border-radius and card visual feel)
const STYLE_PRESETS = [
  {
    id: 'super-rounded',
    name: 'Bordas Super Curvas (Pills)',
    radius: 28,
    btnRadius: 20,
    borderWidth: 1,
    desc: 'Moderno, amigável e acolhedor (pílula)',
  },
  {
    id: 'balanced',
    name: 'Bordas Suaves Equilibradas',
    radius: 16,
    btnRadius: 12,
    borderWidth: 1,
    desc: 'Padrão profissional, sofisticado e polido',
  },
  {
    id: 'crisp-minimal',
    name: 'Bordas Sutis & Retas',
    radius: 8,
    btnRadius: 8,
    borderWidth: 1,
    desc: 'Sério, corporativo e com precisão suíça',
  },
];

export const QuickStudioEditor: React.FC<QuickStudioEditorProps> = ({
  theme,
  onChange,
  onSelectTemplate,
  onOpenAdvancedTab,
  onQuickPublish,
  isPublishing = false,
}) => {
  const content = getThemeContent(theme);
  const colors = theme.colors;
  const typo = theme.typography;
  const cards = theme.cards;

  // 1-Click apply palette
  const applyInstantPalette = (p: typeof INSTANT_PALETTES[0]) => {
    onChange((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        background: p.bg,
        cardBackground: p.card,
        cardBackgroundHover: p.isDark ? '#292524' : '#f1f5f9',
        border: p.border,
        textPrimary: p.text,
        textSecondary: p.isDark ? '#a8a29e' : '#475569',
        accent: p.accent,
        accentMuted: `${p.accent}20`,
        buttonBackground: p.btn,
        buttonText: p.btnText,
        buttonHoverBackground: p.btn,
        badgeBackground: `${p.accent}20`,
        badgeText: p.accent,
        iconBoxBackground: p.card,
        iconColor: p.accent,
        isDark: p.isDark,
      },
    }));
  };

  // 1-Click apply typography
  const applyFontPreset = (fp: typeof FONT_PRESETS[0]) => {
    ensureFontLoaded(fp.heading);
    ensureFontLoaded(fp.body);
    onChange((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        headingFont: fp.heading,
        bodyFont: fp.body,
      },
    }));
  };

  // 1-Click apply style/radius
  const applyStylePreset = (sp: typeof STYLE_PRESETS[0]) => {
    onChange((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        borderRadius: sp.radius,
        borderWidth: sp.borderWidth,
      },
      buttons: {
        ...prev.buttons,
        borderRadius: sp.btnRadius,
      },
      layout: {
        ...prev.layout,
        borderRadius: sp.radius,
        borderWidth: sp.borderWidth,
      },
    }));
  };

  // 1-Click apply spacing density preset
  const applySpacingPreset = (preset: SpacingPreset) => {
    onChange((prev) => ({
      ...prev,
      layout: {
        ...getThemeLayout(prev),
        ...preset.values,
      },
    }));
  };

  // Update text field quickly
  const updateContentField = (field: string, value: string) => {
    onChange((prev) => ({
      ...prev,
      content: {
        ...getThemeContent(prev),
        [field]: value,
      },
    }));
  };

  // Toggle Dark/Light mode keeping colors
  const toggleThemeMode = () => {
    const newIsDark = !colors.isDark;
    if (newIsDark) {
      // Switch to dark palette variant
      onChange((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          isDark: true,
          background: '#0c0a09',
          cardBackground: '#1c1917',
          border: '#44403c',
          textPrimary: '#fafaf9',
          textSecondary: '#a8a29e',
        },
      }));
    } else {
      // Switch to light palette variant
      onChange((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          isDark: false,
          background: '#f8fafc',
          cardBackground: '#ffffff',
          border: '#cbd5e1',
          textPrimary: '#0f172a',
          textSecondary: '#475569',
        },
      }));
    }
  };

  return (
    <div id="quick-studio-editor" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Quick Perfection Hub */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-stone-900 to-stone-900 border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500 text-stone-950 font-black shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Personalizador Rápido de 1 Clique
            </h2>
          </div>
          <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
            Deixe seu aplicativo perfeito em segundos. Escolha uma paleta pronta, estilo de bordas ou template completo. Todas as alterações refletem imediatamente na miniatura ao lado.
          </p>
        </div>

        <button
          type="button"
          onClick={onQuickPublish}
          disabled={isPublishing}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Check className="w-4 h-4" />
          <span>{isPublishing ? 'Publicando...' : 'Salvar & Publicar Agora'}</span>
        </button>
      </div>

      {/* 1. SELEÇÃO DE TEMPLATES COMPLETOS (1 CLIQUE) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              1. Templates Prontos de Alta Conversão (1 Clique)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenAdvancedTab('templates')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver os 10 templates detalhados</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ALL_TEMPLATES.slice(0, 5).map((tmpl) => {
            const isCurrent = theme.id === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onSelectTemplate(tmpl)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-800 bg-stone-950/80 hover:border-stone-700 hover:bg-stone-900/80'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white truncate">
                      {tmpl.name}
                    </span>
                    {isCurrent && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-stone-400 line-clamp-1 block">
                    {tmpl.tagline}
                  </span>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-stone-800/80">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: tmpl.colors.background }}
                    title="Fundo"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: tmpl.colors.cardBackground }}
                    title="Cartão"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: tmpl.colors.accent }}
                    title="Destaque"
                  />
                  <span className="text-[9px] font-mono text-stone-500 ml-auto uppercase">
                    {tmpl.colors.isDark ? 'Escuro' : 'Claro'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PALETAS HARMONIZADAS & MODO CLARO/ESCURO */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              2. Paleta de Cores Instantânea (Harmonizada)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleThemeMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                colors.isDark
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'bg-stone-800 text-stone-200 border border-stone-700'
              }`}
            >
              {colors.isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{colors.isDark ? 'Modo Escuro' : 'Modo Claro'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAdvancedTab('colors')}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer ml-1"
            >
              <span>Hexadecimais</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {INSTANT_PALETTES.map((palette) => {
            const isCurrent =
              colors.background === palette.bg && colors.accent === palette.accent;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => applyInstantPalette(palette)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-800 bg-stone-950/80 hover:border-stone-700 hover:bg-stone-900/80'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white truncate">
                      {palette.name}
                    </span>
                    {isCurrent && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                    {palette.tag}
                  </span>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-1 shrink-0 p-1.5 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: palette.bg }}
                    title="Fundo"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: palette.card }}
                    title="Cartão"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: palette.accent }}
                    title="Destaque"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TIPOGRAFIA & FAMÍLIA DE FONTES (1 CLIQUE) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              3. Combinações Tipográficas (Fontes Oficiais)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenAdvancedTab('typography')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Tamanhos e Pesos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FONT_PRESETS.map((fp) => {
            const isCurrent = typo.headingFont === fp.heading;
            return (
              <button
                key={fp.id}
                type="button"
                onClick={() => applyFontPreset(fp)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-800 bg-stone-950/80 hover:border-stone-700 hover:bg-stone-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ fontFamily: fp.heading }}
                    className="text-sm font-black text-white truncate"
                  >
                    {fp.name}
                  </span>
                  {isCurrent && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                </div>
                <span className="text-[10px] text-stone-400 block truncate mt-1">
                  {fp.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ESTILO VISUAL DOS CARDS E BORDAS (1 CLIQUE) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              4. Formato das Bordas e Cartões (Estilo)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenAdvancedTab('layout')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Posições & Alinhamento</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {STYLE_PRESETS.map((sp) => {
            const isCurrent = cards.borderRadius === sp.radius;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => applyStylePreset(sp)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-800 bg-stone-950/80 hover:border-stone-700 hover:bg-stone-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-white">{sp.name}</span>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-stone-400">{sp.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    style={{ borderRadius: `${sp.radius}px` }}
                    className="w-10 h-7 border-2 border-amber-400/50 bg-stone-900 flex items-center justify-center text-[9px] font-bold text-stone-300"
                  >
                    Card
                  </div>
                  <div
                    style={{ borderRadius: `${sp.btnRadius}px` }}
                    className="px-2.5 h-6 bg-amber-500 text-stone-950 flex items-center justify-center text-[9px] font-black"
                  >
                    Botão
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. ESPAÇAMENTO & DENSIDADE DA PÁGINA (1 CLIQUE) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MoveVertical className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              5. Espaçamento & Densidade da Página (1 Clique)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenAdvancedTab('spacing')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Configurador Avançado de Espaçamento</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => {
            const currentDensity = theme.layout?.density || 'balanced';
            const isCurrent = currentDensity === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => applySpacingPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-800 bg-stone-950/80 hover:border-stone-700 hover:bg-stone-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-amber-400/90 font-mono font-semibold block mb-1">
                    {preset.badge}
                  </span>
                  <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[9px] text-stone-400 font-mono">
                  <span>Gap: {preset.values.cardGap}px</span>
                  <span>Pad: {preset.values.cardPadding}px</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. TEXTOS PRINCIPAIS RÁPIDOS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              6. Textos Principais em Destaque
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenAdvancedTab('content')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Todos os Textos & Menus</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Prefixo do Título Principal
            </label>
            <input
              type="text"
              value={content.heroTitlePrefix || ''}
              onChange={(e) => updateContentField('heroTitlePrefix', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              placeholder="Ex: QUAL É A SUA"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Palavra com Destaque Amarelo
            </label>
            <input
              type="text"
              value={content.heroTitleHighlight || ''}
              onChange={(e) => updateContentField('heroTitleHighlight', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-amber-400 font-black focus:outline-none focus:border-amber-500"
              placeholder="Ex: DOR HOJE?"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Subtítulo de Apresentação
            </label>
            <input
              type="text"
              value={content.heroSubtitle || ''}
              onChange={(e) => updateContentField('heroSubtitle', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
              placeholder="Ex: Selecione abaixo se o seu incômodo é no corpo ou se é um problema prático da sua rotina."
            />
          </div>
        </div>
      </div>

      {/* 7. TOPO LIMPO & ÁREA DO FORNECEDOR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              7. Topo da Página & Área do Fornecedor
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenAdvancedTab('layout')}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Configurações Detalhadas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Onde fica o Fornecedor */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="text-xs font-bold text-stone-200 block">
              Posição do Acesso de Fornecedores
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    positions: {
                      ...(prev.positions || {}),
                      headerSupplierPosition: 'footer_only',
                    },
                    visibility: {
                      ...(prev.visibility || {}),
                      showHeaderSupplierBtn: false,
                      showFooterSupplierBanner: true,
                    },
                  }))
                }
                className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                  (theme.positions?.headerSupplierPosition || 'footer_only') === 'footer_only'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}
              >
                No Rodapé (Topo Limpo)
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    positions: {
                      ...(prev.positions || {}),
                      headerSupplierPosition: 'both',
                    },
                    visibility: {
                      ...(prev.visibility || {}),
                      showHeaderSupplierBtn: true,
                      showFooterSupplierBanner: true,
                    },
                  }))
                }
                className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                  theme.positions?.headerSupplierPosition === 'both' || theme.positions?.headerSupplierPosition === 'header_only'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}
              >
                Também no Topo
              </button>
            </div>
            <p className="text-[10px] text-stone-400">
              Mantém o topo 100% focado no paciente/usuário ou adiciona atalho direto no cabeçalho.
            </p>
          </div>

          {/* Banner no Rodapé */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-200">
                  Banner em Destaque no Rodapé
                </span>
                <input
                  type="checkbox"
                  checked={theme.visibility?.showFooterSupplierBanner !== false}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      visibility: {
                        ...(prev.visibility || {}),
                        showFooterSupplierBanner: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Card grande com convite profissional para médicos e parceiros se cadastrarem.
              </p>
            </div>
            <div className="text-[10px] text-amber-400 font-mono">
              Status: {theme.visibility?.showFooterSupplierBanner !== false ? 'Ativo no rodapé' : 'Oculto'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
