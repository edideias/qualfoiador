import React from 'react';
import { ThemeConfig } from '../../modules/theme/types';
import { Palette, Moon, Sun, Wand2, Check, Sparkles } from 'lucide-react';

interface ColorsEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
}

// Curated high-converting color palettes
const COLOR_PRESETS = [
  {
    name: 'Lilás Neon & Preto (Oficial)',
    isDark: false,
    colors: {
      background: '#ffffff',
      cardBackground: '#ffffff',
      cardBackgroundHover: '#faf5ff',
      border: '#e4e4e7',
      textPrimary: '#09090b',
      textSecondary: '#52525b',
      accent: '#a855f7',
      accentMuted: 'rgba(168, 85, 247, 0.12)',
      buttonBackground: '#09090b',
      buttonText: '#ffffff',
      buttonHoverBackground: '#7e22ce',
      badgeBackground: '#faf5ff',
      badgeText: '#7c3aed',
      iconBoxBackground: '#09090b',
      iconColor: '#c084fc',
    },
  },
  {
    name: 'Lilás Neon Escuro',
    isDark: true,
    colors: {
      background: '#09090b',
      cardBackground: '#121216',
      cardBackgroundHover: '#1c1924',
      border: '#27272a',
      textPrimary: '#fafafa',
      textSecondary: '#a1a1aa',
      accent: '#c084fc',
      accentMuted: 'rgba(192, 132, 252, 0.18)',
      buttonBackground: '#a855f7',
      buttonText: '#09090b',
      buttonHoverBackground: '#c084fc',
      badgeBackground: 'rgba(168, 85, 247, 0.2)',
      badgeText: '#e9d5ff',
      iconBoxBackground: '#1c1924',
      iconColor: '#c084fc',
    },
  },
  {
    name: 'Escuro Âmbar',
    isDark: true,
    colors: {
      background: '#0c0a09',
      cardBackground: '#1c1917',
      cardBackgroundHover: '#292524',
      border: '#44403c',
      textPrimary: '#fafaf9',
      textSecondary: '#a8a29e',
      accent: '#f59e0b',
      accentMuted: 'rgba(245, 158, 11, 0.15)',
      buttonBackground: '#f59e0b',
      buttonText: '#0c0a09',
      buttonHoverBackground: '#d97706',
      badgeBackground: 'rgba(245, 158, 11, 0.2)',
      badgeText: '#fbbf24',
      iconBoxBackground: '#292524',
      iconColor: '#f59e0b',
    },
  },
  {
    name: 'Claro Corporativo',
    isDark: false,
    colors: {
      background: '#f8fafc',
      cardBackground: '#ffffff',
      cardBackgroundHover: '#f1f5f9',
      border: '#cbd5e1',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      accent: '#2563eb',
      accentMuted: 'rgba(37, 99, 235, 0.12)',
      buttonBackground: '#2563eb',
      buttonText: '#ffffff',
      buttonHoverBackground: '#1d4ed8',
      badgeBackground: '#eff6ff',
      badgeText: '#1d4ed8',
      iconBoxBackground: '#eff6ff',
      iconColor: '#2563eb',
    },
  },
  {
    name: 'Esmeralda Saúde',
    isDark: true,
    colors: {
      background: '#061712',
      cardBackground: '#0b241c',
      cardBackgroundHover: '#103328',
      border: '#1b4d3e',
      textPrimary: '#f0fdf4',
      textSecondary: '#86efac',
      accent: '#10b981',
      accentMuted: 'rgba(16, 185, 129, 0.15)',
      buttonBackground: '#10b981',
      buttonText: '#041f17',
      buttonHoverBackground: '#059669',
      badgeBackground: 'rgba(16, 185, 129, 0.2)',
      badgeText: '#6ee7b7',
      iconBoxBackground: '#103328',
      iconColor: '#10b981',
    },
  },
  {
    name: 'Minimalista Neutro',
    isDark: false,
    colors: {
      background: '#ffffff',
      cardBackground: '#fbfbfa',
      cardBackgroundHover: '#f3f3f1',
      border: '#e5e5e3',
      textPrimary: '#1a1a19',
      textSecondary: '#71716e',
      accent: '#1a1a19',
      accentMuted: 'rgba(26, 26, 25, 0.08)',
      buttonBackground: '#1a1a19',
      buttonText: '#ffffff',
      buttonHoverBackground: '#333330',
      badgeBackground: '#f3f3f1',
      badgeText: '#1a1a19',
      iconBoxBackground: '#f3f3f1',
      iconColor: '#1a1a19',
    },
  },
  {
    name: 'Rubi Energético',
    isDark: true,
    colors: {
      background: '#120b0e',
      cardBackground: '#1e1217',
      cardBackgroundHover: '#2d1822',
      border: '#451e30',
      textPrimary: '#fff1f2',
      textSecondary: '#fda4af',
      accent: '#f43f5e',
      accentMuted: 'rgba(244, 63, 94, 0.15)',
      buttonBackground: '#f43f5e',
      buttonText: '#ffffff',
      buttonHoverBackground: '#e11d48',
      badgeBackground: 'rgba(244, 63, 94, 0.2)',
      badgeText: '#fecdd3',
      iconBoxBackground: '#2d1822',
      iconColor: '#f43f5e',
    },
  },
];

export const ColorsEditor: React.FC<ColorsEditorProps> = ({ theme, onChange }) => {
  const colors = theme.colors;

  const updateColor = (field: keyof typeof colors, value: any) => {
    onChange((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [field]: value,
      },
    }));
  };

  const applyPalettePreset = (preset: typeof COLOR_PRESETS[0]) => {
    onChange((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...preset.colors,
        isDark: preset.isDark,
      },
    }));
  };

  // Smart harmonization: generate harmonious complementary backgrounds, cards and borders
  const harmonizeFromAccent = (accentHex: string, isDark: boolean) => {
    if (isDark) {
      onChange((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          accent: accentHex,
          buttonBackground: accentHex,
          buttonHoverBackground: accentHex,
          iconColor: accentHex,
          badgeBackground: `${accentHex}25`,
          badgeText: accentHex,
          accentMuted: `${accentHex}18`,
        },
      }));
    } else {
      onChange((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          accent: accentHex,
          buttonBackground: accentHex,
          buttonHoverBackground: accentHex,
          buttonText: '#ffffff',
          iconColor: accentHex,
          badgeBackground: `${accentHex}15`,
          badgeText: accentHex,
          accentMuted: `${accentHex}15`,
          iconBoxBackground: `${accentHex}10`,
        },
      }));
    }
  };

  const ColorInput = ({
    label,
    field,
    desc,
  }: {
    label: string;
    field: keyof typeof colors;
    desc?: string;
  }) => {
    const val = String(colors[field]);
    return (
      <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-3 hover:border-stone-700 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-xs"
              style={{ backgroundColor: val }}
            />
            <span className="text-xs font-bold text-stone-200 truncate">{label}</span>
          </div>
          {desc && <span className="text-[10px] text-stone-400 block truncate mt-0.5">{desc}</span>}
          <span className="text-[10px] font-mono text-stone-500 uppercase">{val}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={val.startsWith('#') ? val : '#f59e0b'}
              onChange={(e) => updateColor(field, e.target.value)}
              className="w-8 h-8 rounded-lg border border-stone-700 bg-transparent cursor-pointer"
            />
          </label>
          <input
            type="text"
            value={val}
            onChange={(e) => updateColor(field, e.target.value)}
            className="w-20 px-2 py-1 rounded-md bg-stone-950 border border-stone-700 text-xs font-mono text-white text-center focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div id="colors-editor-section" className="space-y-7">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <span>Paleta de Cores e Contraste</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure todas as cores com precisão hexadecimal para telas claras ou escuras.
          </p>
        </div>

        {/* Dark Mode Quick Switch */}
        <button
          type="button"
          onClick={() => updateColor('isDark', !colors.isDark)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            colors.isDark
              ? 'bg-stone-800 text-amber-400 border border-stone-700'
              : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
          }`}
        >
          {colors.isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>{colors.isDark ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}</span>
        </button>
      </div>

      {/* Quick Color Presets */}
      <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Paletas Rápidas Harmonizadas (1 Clique)
            </span>
          </div>
          <button
            type="button"
            onClick={() => harmonizeFromAccent(colors.accent, colors.isDark)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ajusta automaticamente botões, badges e ícones para combinar com a cor de destaque atual"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Harmonizar Botões & Badges com Destaque</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isCurrent =
              colors.background === preset.colors.background &&
              colors.accent === preset.colors.accent;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPalettePreset(preset)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate">{preset.name}</span>
                  {isCurrent && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shadow-2xs"
                    style={{ backgroundColor: preset.colors.background }}
                    title="Fundo"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shadow-2xs"
                    style={{ backgroundColor: preset.colors.cardBackground }}
                    title="Card"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shadow-2xs"
                    style={{ backgroundColor: preset.colors.accent }}
                    title="Destaque"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shadow-2xs"
                    style={{ backgroundColor: preset.colors.buttonBackground }}
                    title="Botão"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Layout Colors */}
      <div>
        <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider mb-3">
          1. Fundo e Superfícies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ColorInput label="Fundo da Aplicação (Background)" field="background" desc="Canvas principal de fundo" />
          <ColorInput label="Fundo dos Cards" field="cardBackground" desc="Superfície dos blocos de seleção" />
          <ColorInput label="Fundo dos Cards (Hover)" field="cardBackgroundHover" desc="Ao passar o mouse" />
          <ColorInput label="Bordas Estruturais" field="border" desc="Linhas de cartões e divisores" />
        </div>
      </div>

      {/* Typography Colors */}
      <div>
        <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider mb-3">
          2. Cores dos Textos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ColorInput label="Texto Principal (Primary)" field="textPrimary" desc="Títulos e chamadas principais" />
          <ColorInput label="Texto Secundário (Secondary)" field="textSecondary" desc="Subtítulos e descrições" />
        </div>
      </div>

      {/* Accents & Highlights */}
      <div>
        <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider mb-3">
          3. Destaque e Acentos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ColorInput label="Cor de Destaque (Accent)" field="accent" desc="Pontos luminosos, badges e ênfase" />
          <ColorInput label="Destaque Suave (Accent Muted)" field="accentMuted" desc="Fundos suaves de destaque" />
          <ColorInput label="Fundo do Ícone" field="iconBoxBackground" desc="Quadrado ou círculo do ícone" />
          <ColorInput label="Cor do Ícone" field="iconColor" desc="Elemento gráfico do ícone" />
        </div>
      </div>

      {/* Buttons and Badges */}
      <div>
        <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider mb-3">
          4. Botões e Badges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ColorInput label="Fundo do Botão (Button BG)" field="buttonBackground" desc="Botão de ação principal" />
          <ColorInput label="Texto do Botão" field="buttonText" desc="Cor da fonte do botão" />
          <ColorInput label="Fundo do Botão (Hover)" field="buttonHoverBackground" desc="Ao passar o mouse" />
          <ColorInput label="Fundo da Badge" field="badgeBackground" desc="Etiquetas e tags de contexto" />
          <ColorInput label="Texto da Badge" field="badgeText" desc="Cor da fonte da etiqueta" />
        </div>
      </div>
    </div>
  );
};
