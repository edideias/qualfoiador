import React, { useState } from 'react';
import { ThemeConfig, ThemePositions, getThemePositions, getThemeLayout } from '../../modules/theme/types';
import { LayoutGrid, AlignLeft, AlignCenter, AlignRight, Columns, Rows, MoveVertical, Smartphone, Box, Layers } from 'lucide-react';
import { SpacingEditor } from './SpacingEditor';

interface LayoutCardsEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
}

export const LayoutCardsEditor: React.FC<LayoutCardsEditorProps> = ({ theme, onChange }) => {
  const [activeSubTab, setActiveSubTab] = useState<'spacing' | 'positions' | 'cards'>('spacing');

  const layout = theme.layout;
  const cards = theme.cards;
  const positions = getThemePositions(theme);

  const updateLayout = (field: keyof typeof layout, value: any) => {
    onChange((prev) => ({
      ...prev,
      layout: {
        ...getThemeLayout(prev),
        [field]: value,
      },
    }));
  };

  const updateCards = (field: keyof typeof cards, value: any) => {
    onChange((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [field]: value,
      },
    }));
  };

  const updatePosition = (field: keyof ThemePositions, value: any) => {
    onChange((prev) => ({
      ...prev,
      positions: {
        ...getThemePositions(prev),
        [field]: value,
      },
      buttons: {
        ...prev.buttons,
        ...(field === 'buttonsAlign' ? { alignment: value } : {}),
      },
    }));
  };

  const shadows: Array<'none' | 'xs' | 'sm' | 'md' | 'lg'> = ['none', 'xs', 'sm', 'md', 'lg'];

  return (
    <div id="layout-cards-editor-section" className="space-y-6">
      {/* Section Header */}
      <div className="pb-3 border-b border-stone-800">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-amber-400" />
          <span>Layout, Espaçamento e Estrutura dos Cards</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Ajuste fino de distâncias, box model, alinhamentos, ordem das seções e proporções visuais.
        </p>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1.5 mt-4 p-1 rounded-xl bg-stone-900 border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('spacing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'spacing'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <MoveVertical className="w-3.5 h-3.5" />
            <span>📐 Espaçamento & Box Model</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('positions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'positions'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🏛️ Posições & Alinhamentos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'cards'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>🃏 Estilo & Sombras dos Cards</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Spacing Editor */}
      {activeSubTab === 'spacing' && (
        <div className="animate-in fade-in duration-150">
          <SpacingEditor theme={theme} onChange={onChange} />
        </div>
      )}

      {/* SUB-TAB 2: Element Positions & Alignments */}
      {activeSubTab === 'positions' && (
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-5 animate-in fade-in duration-150">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <MoveVertical className="w-4 h-4" />
          <span>Posições e Alinhamentos dos Elementos</span>
        </h3>

        {/* Section Order */}
        <div>
          <span className="text-xs font-bold text-stone-200 block mb-2">
            Ordem Geral das Seções na Página
          </span>
          <div className="space-y-1.5">
            {[
              { id: 'hero_cards_search', label: '1. Apresentação (Hero) ➔ 2. Cards ➔ 3. Busca de Emergências' },
              { id: 'hero_search_cards', label: '1. Apresentação (Hero) ➔ 2. Busca ➔ 3. Cards' },
              { id: 'search_hero_cards', label: '1. Busca no Topo ➔ 2. Apresentação (Hero) ➔ 3. Cards' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updatePosition('sectionOrder', s.id)}
                className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  (positions.sectionOrder || 'hero_cards_search') === s.id
                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                <span>{s.label}</span>
                {(positions.sectionOrder || 'hero_cards_search') === s.id && (
                  <span className="text-[10px] bg-stone-950 text-amber-400 px-2 py-0.5 rounded font-black">
                    ATIVO
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Order */}
        <div>
          <span className="text-xs font-bold text-stone-200 block mb-2">
            Ordem de Exibição dos Cards Principais
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updatePosition('cardsOrder', 'physical_first')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                (positions.cardsOrder || 'physical_first') === 'physical_first'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              1º Dor Física (Corpo & Saúde)
            </button>
            <button
              type="button"
              onClick={() => updatePosition('cardsOrder', 'problem_first')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                positions.cardsOrder === 'problem_first'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              1º Dor de Problema (Vida & Rotina)
            </button>
          </div>
        </div>

        {/* Hero Alignment */}
        <div>
          <span className="text-xs font-bold text-stone-200 block mb-2">
            Alinhamento do Bloco Principal (Hero / Título)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updatePosition('heroAlign', 'left')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.heroAlign === 'left'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>À Esquerda</span>
            </button>
            <button
              type="button"
              onClick={() => updatePosition('heroAlign', 'center')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.heroAlign === 'center'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
              <span>Centralizado</span>
            </button>
            <button
              type="button"
              onClick={() => updatePosition('heroAlign', 'right')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.heroAlign === 'right'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
              <span>À Direita</span>
            </button>
          </div>
        </div>

        {/* Cards Layout: Grid vs Stack */}
        <div>
          <span className="text-xs font-bold text-stone-200 block mb-2">
            Disposição dos Dois Cards Principais
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updatePosition('cardsLayout', 'grid')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.cardsLayout === 'grid'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado (Grid 2 Colunas)</span>
            </button>
            <button
              type="button"
              onClick={() => updatePosition('cardsLayout', 'stack')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.cardsLayout === 'stack'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Empilhados Verticalmente</span>
            </button>
          </div>
        </div>

        {/* Buttons Alignment inside Cards */}
        <div>
          <span className="text-xs font-bold text-stone-200 block mb-2">
            Posicionamento dos Botões dentro dos Cards
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'stretch', label: 'Largura Total' },
              { id: 'left', label: 'À Esquerda' },
              { id: 'center', label: 'Ao Centro' },
              { id: 'right', label: 'À Direita' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => updatePosition('buttonsAlign', btn.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  positions.buttonsAlign === btn.id
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Position of Search Bar */}
        <div>
          <span className="text-xs font-bold text-stone-200 block mb-2">
            Posição da Barra de Emergências & Busca Rápida
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updatePosition('searchPosition', 'above_cards')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.searchPosition === 'above_cards'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>Acima dos Cards de Dor</span>
            </button>
            <button
              type="button"
              onClick={() => updatePosition('searchPosition', 'below_cards')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                positions.searchPosition === 'below_cards'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>Abaixo dos Cards (Padrão)</span>
            </button>
          </div>
        </div>

        {/* Header Layout & Supplier Area Positioning */}
        <div className="pt-4 border-t border-stone-800 space-y-4">
          <div>
            <span className="text-xs font-bold text-stone-200 block mb-2">
              Estilo de Layout do Cabeçalho Superior (Topo)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Padrão (Marca + Ações)' },
                { id: 'centered', label: 'Centralizado' },
                { id: 'minimal', label: 'Minimalista (Apenas Logo)' },
              ].map((hl) => (
                <button
                  key={hl.id}
                  type="button"
                  onClick={() => updatePosition('headerLayout', hl.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    (positions.headerLayout || 'standard') === hl.id
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {hl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-stone-200 block mb-2">
              Onde Exibir o Acesso à "Área do Fornecedor"?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'footer_only', label: 'Apenas no Rodapé (Recomendado)' },
                { id: 'header_only', label: 'Apenas no Topo' },
                { id: 'both', label: 'No Topo e no Rodapé' },
                { id: 'none', label: 'Não Exibir' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updatePosition('headerSupplierPosition', opt.id)}
                  className={`py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                    (positions.headerSupplierPosition || 'footer_only') === opt.id
                      ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                      : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* SUB-TAB 3: Card Dimensions & Shadows */}
      {activeSubTab === 'cards' && (
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4 animate-in fade-in duration-150">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Box className="w-4 h-4" />
          <span>Dimensões, Arredondamento e Sombras dos Cards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card Border Radius */}
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Arredondamento dos Cantos (Radius)</span>
              <strong className="text-white font-mono">{cards.borderRadius} px</strong>
            </div>
            <input
              type="range"
              min={0}
              max={36}
              value={cards.borderRadius}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateCards('borderRadius', val);
                updateLayout('borderRadius', val);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Card Internal Padding */}
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Preenchimento Interno (Padding)</span>
              <strong className="text-white font-mono">{layout.cardPadding} px</strong>
            </div>
            <input
              type="range"
              min={16}
              max={44}
              value={layout.cardPadding}
              onChange={(e) => updateLayout('cardPadding', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Border Width */}
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Espessura da Borda</span>
              <strong className="text-white font-mono">{cards.borderWidth} px</strong>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              value={cards.borderWidth}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateCards('borderWidth', val);
                updateLayout('borderWidth', val);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Icon Box Size */}
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tamanho do Ícone</span>
              <strong className="text-white font-mono">{cards.iconSize} px</strong>
            </div>
            <input
              type="range"
              min={20}
              max={36}
              value={cards.iconSize}
              onChange={(e) => updateCards('iconSize', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Shadow style and Hover lift */}
        <div className="pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-stone-300 block mb-2">Intensidade da Sombra</span>
            <div className="flex gap-2">
              {shadows.map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => updateCards('shadow', sh)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    cards.shadow === sh
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800">
            <div>
              <span className="text-xs font-bold text-white block">Efeito de Elevação (Hover Lift)</span>
              <span className="text-[10px] text-stone-400">Card sobe suavemente ao passar o mouse</span>
            </div>
            <input
              type="checkbox"
              checked={cards.hoverLift}
              onChange={(e) => updateCards('hoverLift', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
