import React from 'react';
import { ThemeConfig, getThemeContent, getThemePositions } from '../../modules/theme/types';
import { MousePointerClick, ArrowRight, Palette, Type, AlignJustify } from 'lucide-react';

interface ButtonsEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
}

export const ButtonsEditor: React.FC<ButtonsEditorProps> = ({ theme, onChange }) => {
  const buttons = theme.buttons;
  const typo = theme.typography;
  const colors = theme.colors;
  const content = getThemeContent(theme);
  const positions = getThemePositions(theme);

  const updateButtons = (field: keyof typeof buttons, value: any) => {
    onChange((prev) => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [field]: value,
      },
    }));
  };

  const updateTypo = (field: keyof typeof typo, value: any) => {
    onChange((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: value,
      },
    }));
  };

  const updateColors = (field: keyof typeof colors, value: any) => {
    onChange((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [field]: value,
      },
    }));
  };

  const updateContent = (field: keyof typeof content, value: any) => {
    onChange((prev) => ({
      ...prev,
      content: {
        ...getThemeContent(prev),
        [field]: value,
      },
    }));
  };

  const updateAlignment = (alignment: 'stretch' | 'left' | 'center' | 'right') => {
    onChange((prev) => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        alignment,
      },
      positions: {
        ...getThemePositions(prev),
        buttonsAlign: alignment,
      },
    }));
  };

  const arrowStyles: Array<'classic' | 'box' | 'subtle' | 'none'> = ['classic', 'box', 'subtle', 'none'];
  const hoverEffects: Array<'lift' | 'darken' | 'glow' | 'scale'> = ['lift', 'darken', 'glow', 'scale'];
  const shadows: Array<'none' | 'xs' | 'sm' | 'md'> = ['none', 'xs', 'sm', 'md'];
  const currentAlign = buttons.alignment || positions.buttonsAlign || 'stretch';

  return (
    <div id="buttons-editor-section" className="space-y-8">
      {/* Section Header */}
      <div className="pb-3 border-b border-stone-800">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-amber-400" />
          <span>Editor de Botões, Rótulos e Interações</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Ajuste textos dos botões, tamanho da fonte, altura, raio dos cantos, alinhamento e cores em tempo real.
        </p>
      </div>

      {/* 1. Quick Button Text Labels */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4" />
          <span>1. Textos e Rótulos dos Botões de Ação</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Botão: Card Dor Física
            </label>
            <input
              type="text"
              value={content.cardPhysicalButton}
              onChange={(e) => updateContent('cardPhysicalButton', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Botão: Card Dor de Problema
            </label>
            <input
              type="text"
              value={content.cardProblemButton}
              onChange={(e) => updateContent('cardProblemButton', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* 2. Button Typography & Font Sizes */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
          2. Tipografia e Tamanho da Fonte do Botão
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho da Fonte</span>
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
              <span>Peso da Fonte</span>
              <strong className="text-white font-mono">{typo.buttonTextWeight}</strong>
            </div>
            <select
              value={typo.buttonTextWeight}
              onChange={(e) => updateTypo('buttonTextWeight', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
            >
              <option value={500}>500 - Médio</option>
              <option value={600}>600 - Semi-bold</option>
              <option value={700}>700 - Bold</option>
              <option value={800}>800 - Extra-bold</option>
              <option value={900}>900 - Black</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Espaçamento de Letras</span>
              <strong className="text-white font-mono">{typo.buttonLetterSpacing}</strong>
            </div>
            <select
              value={typo.buttonLetterSpacing}
              onChange={(e) => updateTypo('buttonLetterSpacing', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
            >
              <option value="-0.03em">-0.03em (Apertado)</option>
              <option value="-0.015em">-0.015em (Moderno)</option>
              <option value="0em">0em (Normal)</option>
              <option value="0.03em">0.03em (Expandido)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Button Dimensions & Proportions */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
          3. Dimensões, Arredondamento e Alinhamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Altura do Botão (Height)</span>
              <strong className="text-white font-mono">{buttons.height} px</strong>
            </div>
            <input
              type="range"
              min={44}
              max={64}
              value={buttons.height}
              onChange={(e) => updateButtons('height', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Arredondamento (Radius)</span>
              <strong className="text-white font-mono">{buttons.borderRadius} px</strong>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={buttons.borderRadius}
              onChange={(e) => updateButtons('borderRadius', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Padding Horizontal</span>
              <strong className="text-white font-mono">{buttons.paddingX} px</strong>
            </div>
            <input
              type="range"
              min={12}
              max={36}
              value={buttons.paddingX}
              onChange={(e) => updateButtons('paddingX', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Alignment */}
        <div>
          <span className="text-xs text-stone-300 block mb-2 font-bold flex items-center gap-1.5">
            <AlignJustify className="w-3.5 h-3.5" />
            <span>Alinhamento do Botão no Card</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'stretch', label: 'Largura Total (Esticado)' },
              { id: 'left', label: 'À Esquerda' },
              { id: 'center', label: 'Ao Centro' },
              { id: 'right', label: 'À Direita' },
            ].map((al) => (
              <button
                key={al.id}
                type="button"
                onClick={() => updateAlignment(al.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentAlign === al.id
                    ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {al.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Button Colors */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span>4. Cores do Botão</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Cor de Fundo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.buttonBackground}
                onChange={(e) => updateColors('buttonBackground', e.target.value)}
                className="w-9 h-9 rounded-lg border border-stone-700 bg-stone-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={colors.buttonBackground}
                onChange={(e) => updateColors('buttonBackground', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Cor do Texto</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.buttonText}
                onChange={(e) => updateColors('buttonText', e.target.value)}
                className="w-9 h-9 rounded-lg border border-stone-700 bg-stone-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={colors.buttonText}
                onChange={(e) => updateColors('buttonText', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Cor no Hover</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.buttonHoverBackground}
                onChange={(e) => updateColors('buttonHoverBackground', e.target.value)}
                className="w-9 h-9 rounded-lg border border-stone-700 bg-stone-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={colors.buttonHoverBackground}
                onChange={(e) => updateColors('buttonHoverBackground', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Interactive Styles & Arrow */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-5">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
          5. Estilo Visual, Seta e Microanimação
        </h3>

        {/* Arrow Style */}
        <div>
          <span className="text-xs text-stone-300 block mb-2">Estilo da Seta de Ação</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {arrowStyles.map((ast) => (
              <button
                key={ast}
                type="button"
                onClick={() => updateButtons('arrowStyle', ast)}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  buttons.arrowStyle === ast
                    ? 'bg-amber-500 text-stone-950 font-extrabold shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {ast}
              </button>
            ))}
          </div>
        </div>

        {/* Hover Effect */}
        <div>
          <span className="text-xs text-stone-300 block mb-2">Efeito ao Passar o Mouse (Hover)</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {hoverEffects.map((he) => (
              <button
                key={he}
                type="button"
                onClick={() => updateButtons('hoverEffect', he)}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  buttons.hoverEffect === he
                    ? 'bg-amber-500 text-stone-950 font-extrabold shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {he}
              </button>
            ))}
          </div>
        </div>

        {/* Shadow */}
        <div>
          <span className="text-xs text-stone-300 block mb-2">Sombra do Botão</span>
          <div className="flex gap-2">
            {shadows.map((sh) => (
              <button
                key={sh}
                type="button"
                onClick={() => updateButtons('shadow', sh)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  buttons.shadow === sh
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {sh}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Button Live Preview Card */}
      <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center gap-3">
        <span className="text-xs text-stone-400 font-medium">Prévia instantânea com as propriedades aplicadas:</span>
        <div
          style={{
            height: `${buttons.height}px`,
            borderRadius: `${buttons.borderRadius}px`,
            paddingLeft: `${buttons.paddingX}px`,
            paddingRight: `${buttons.paddingX}px`,
            backgroundColor: theme.colors.buttonBackground,
            color: theme.colors.buttonText,
            fontFamily: theme.typography.bodyFont,
            fontSize: `${theme.typography.buttonTextSize}px`,
            fontWeight: theme.typography.buttonTextWeight,
            letterSpacing: theme.typography.buttonLetterSpacing,
          }}
          className="inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md select-none hover:opacity-95"
        >
          <span>{content.cardPhysicalButton || 'Começar avaliação da dor'}</span>
          {buttons.arrowStyle !== 'none' && (
            <span
              className={
                buttons.arrowStyle === 'box'
                  ? 'w-6 h-6 rounded-md bg-white/20 flex items-center justify-center'
                  : ''
              }
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
