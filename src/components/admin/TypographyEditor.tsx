import React from 'react';
import { ThemeConfig } from '../../modules/theme/types';
import { AVAILABLE_GOOGLE_FONTS, ensureFontLoaded } from '../../modules/theme/fontLoader';
import { Type, Sparkles } from 'lucide-react';

interface TypographyEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
}

export const TypographyEditor: React.FC<TypographyEditorProps> = ({ theme, onChange }) => {
  const typo = theme.typography;

  const updateTypo = (field: keyof typeof typo, value: any) => {
    if (field === 'headingFont' || field === 'bodyFont') {
      ensureFontLoaded(value);
    }
    onChange((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: value,
      },
    }));
  };

  const weights = [400, 500, 600, 700, 800, 900];

  return (
    <div id="typography-editor-section" className="space-y-8">
      {/* Section Header */}
      <div className="pb-3 border-b border-stone-800">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Type className="w-5 h-5 text-amber-400" />
          <span>Controle Tipográfico e Fontes</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Ajuste as fontes oficiais do Google Fonts, escala em pixels, pesos, entrelinha e espaçamento entre letras.
        </p>
      </div>

      {/* 1. Font Family Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
        <div>
          <label className="text-xs font-bold text-stone-200 block mb-1.5 flex items-center justify-between">
            <span>Fonte de Títulos (Heading Font)</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">{typo.headingFont}</span>
          </label>
          <select
            value={typo.headingFont}
            onChange={(e) => updateTypo('headingFont', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {AVAILABLE_GOOGLE_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400 mt-2" style={{ fontFamily: typo.headingFont }}>
            Exemplo com {typo.headingFont}: Qual é a sua dor hoje?
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-200 block mb-1.5 flex items-center justify-between">
            <span>Fonte de Textos e Botões (Body Font)</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">{typo.bodyFont}</span>
          </label>
          <select
            value={typo.bodyFont}
            onChange={(e) => updateTypo('bodyFont', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {AVAILABLE_GOOGLE_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400 mt-2" style={{ fontFamily: typo.bodyFont }}>
            Exemplo com {typo.bodyFont}: Toque para começar a avaliação sem burocracia.
          </p>
        </div>
      </div>

      {/* 2. TÍTULO PRINCIPAL */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
            1. Título Principal (Hero Title)
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            {typo.titleDesktopSize}px Desktop / {typo.titleMobileSize}px Mobile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Desktop Size */}
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho Desktop</span>
              <strong className="text-white font-mono">{typo.titleDesktopSize} px</strong>
            </div>
            <input
              type="range"
              min={36}
              max={76}
              value={typo.titleDesktopSize}
              onChange={(e) => updateTypo('titleDesktopSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Mobile Size */}
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho Celular</span>
              <strong className="text-white font-mono">{typo.titleMobileSize} px</strong>
            </div>
            <input
              type="range"
              min={24}
              max={54}
              value={typo.titleMobileSize}
              onChange={(e) => updateTypo('titleMobileSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Peso (Weight) */}
        <div>
          <span className="text-xs text-stone-300 block mb-2">Peso da Fonte (Weight)</span>
          <div className="flex flex-wrap gap-2">
            {weights.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => updateTypo('titleWeight', w)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  typo.titleWeight === w
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Letter Spacing & Line Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Altura de Linha (Line Height)</span>
              <strong className="text-white font-mono">{typo.titleLineHeight}</strong>
            </div>
            <input
              type="range"
              min={0.95}
              max={1.35}
              step={0.01}
              value={typo.titleLineHeight}
              onChange={(e) => updateTypo('titleLineHeight', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs text-stone-300 block mb-1">Espaçamento Entre Letras (Tracking)</label>
            <select
              value={typo.titleLetterSpacing}
              onChange={(e) => updateTypo('titleLetterSpacing', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="-0.05em">Muito Apertado (-0.05em)</option>
              <option value="-0.04em">Apertado (-0.04em)</option>
              <option value="-0.035em">Padrão Moderno (-0.035em)</option>
              <option value="-0.02em">Levemente Apertado (-0.02em)</option>
              <option value="0em">Normal (0em)</option>
              <option value="0.02em">Expandido (+0.02em)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SUBTÍTULO */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-wider">
            2. Subtítulo e Instruções
          </h3>
          <span className="text-xs text-stone-400 font-mono">{typo.subtitleDesktopSize}px Desktop</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho Desktop</span>
              <strong className="text-white font-mono">{typo.subtitleDesktopSize} px</strong>
            </div>
            <input
              type="range"
              min={16}
              max={32}
              value={typo.subtitleDesktopSize}
              onChange={(e) => updateTypo('subtitleDesktopSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho Mobile</span>
              <strong className="text-white font-mono">{typo.subtitleMobileSize} px</strong>
            </div>
            <input
              type="range"
              min={14}
              max={26}
              value={typo.subtitleMobileSize}
              onChange={(e) => updateTypo('subtitleMobileSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-stone-300 mr-2">Peso:</span>
          {weights.slice(0, 5).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => updateTypo('subtitleWeight', w)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                typo.subtitleWeight === w
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CARDS E BOTÕES */}
      {/* 3. Cards & Actions Typography */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cards Typography */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-wider">
            3. Textos dos Cards
          </h3>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Título do Card</span>
              <strong className="text-white font-mono">{typo.cardTitleSize} px</strong>
            </div>
            <input
              type="range"
              min={18}
              max={36}
              value={typo.cardTitleSize}
              onChange={(e) => updateTypo('cardTitleSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Texto de Descrição do Card</span>
              <strong className="text-white font-mono">{typo.cardTextSize} px</strong>
            </div>
            <input
              type="range"
              min={12}
              max={22}
              value={typo.cardTextSize}
              onChange={(e) => updateTypo('cardTextSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons & Badges */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
          <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-wider">
            4. Botões e Badges
          </h3>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Texto dos Botões</span>
              <strong className="text-white font-mono">{typo.buttonTextSize} px</strong>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              value={typo.buttonTextSize}
              onChange={(e) => updateTypo('buttonTextSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho das Badges</span>
              <strong className="text-white font-mono">{typo.badgeSize} px</strong>
            </div>
            <input
              type="range"
              min={10}
              max={18}
              value={typo.badgeSize}
              onChange={(e) => updateTypo('badgeSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Header, Menus & Footer */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-wider">
          5. Cabeçalho, Menus e Rodapé
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Logo / Marca (Header)</span>
              <strong className="text-white font-mono">{typo.headerLogoSize || 14} px</strong>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              value={typo.headerLogoSize || 14}
              onChange={(e) => updateTypo('headerLogoSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Itens de Menu</span>
              <strong className="text-white font-mono">{typo.menuTextSize || 12} px</strong>
            </div>
            <input
              type="range"
              min={10}
              max={18}
              value={typo.menuTextSize || 12}
              onChange={(e) => updateTypo('menuTextSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Rodapé</span>
              <strong className="text-white font-mono">{typo.footerSize} px</strong>
            </div>
            <input
              type="range"
              min={11}
              max={16}
              value={typo.footerSize}
              onChange={(e) => updateTypo('footerSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
