import React from 'react';
import { ThemeConfig, ThemeContent, getThemeContent } from '../../modules/theme/types';
import { FileText, Menu, Sparkles, HelpCircle, RotateCcw, Check } from 'lucide-react';

interface ContentMenusEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
}

export const ContentMenusEditor: React.FC<ContentMenusEditorProps> = ({ theme, onChange }) => {
  const content = getThemeContent(theme);

  const updateContent = (field: keyof ThemeContent, value: any) => {
    onChange((prev) => ({
      ...prev,
      content: {
        ...getThemeContent(prev),
        [field]: value,
      },
    }));
  };

  return (
    <div id="content-menus-editor-section" className="space-y-8">
      {/* Section Header */}
      <div className="pb-3 border-b border-stone-800">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Editor de Textos, Títulos e Menus</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Edite em tempo real todas as frases, títulos, itens de menu e chamadas da interface.
        </p>
      </div>

      {/* 1. Header & Menus */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span>1. Cabeçalho e Menu Superior</span>
          </h3>
          <span className="text-[10px] text-stone-400 font-mono">Topo da página</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Prefixo da Marca (Header)
            </label>
            <input
              type="text"
              value={content.headerBrandPrefix}
              onChange={(e) => updateContent('headerBrandPrefix', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="QUAL É A SUA"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Palavra em Destaque da Marca
            </label>
            <input
              type="text"
              value={content.headerBrandHighlight}
              onChange={(e) => updateContent('headerBrandHighlight', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="DOR?"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Texto do Menu Fornecedor
            </label>
            <input
              type="text"
              value={content.headerSupplierText}
              onChange={(e) => updateContent('headerSupplierText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="Área do Fornecedor"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1 flex items-center justify-between">
              <span>Badge / Selo do Cabeçalho</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.headerBadgeVisible}
                  onChange={(e) => updateContent('headerBadgeVisible', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-stone-400">Exibir</span>
              </label>
            </label>
            <input
              type="text"
              value={content.headerBadgeText}
              onChange={(e) => updateContent('headerBadgeText', e.target.value)}
              disabled={!content.headerBadgeVisible}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
              placeholder="Direto ao ponto • Sem cadastro"
            />
          </div>
        </div>
      </div>

      {/* 2. Hero Section Texts */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>2. Textos do Hero (Apresentação Principal)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Micro-Selo: Texto Principal
            </label>
            <input
              type="text"
              value={content.heroBadgeText}
              onChange={(e) => updateContent('heroBadgeText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="Leva menos de 1 minuto"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Micro-Selo: Texto Secundário
            </label>
            <input
              type="text"
              value={content.heroBadgeSecondaryText}
              onChange={(e) => updateContent('heroBadgeSecondaryText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="100% privado"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Título Principal: Prefixo
            </label>
            <input
              type="text"
              value={content.heroTitlePrefix}
              onChange={(e) => updateContent('heroTitlePrefix', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              placeholder="QUAL É A SUA"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Título Principal: Destaque
            </label>
            <input
              type="text"
              value={content.heroTitleHighlight}
              onChange={(e) => updateContent('heroTitleHighlight', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 font-black text-amber-400"
              placeholder="DOR?"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-300 block mb-1">
            Subtítulo / Chamada Explicativa
          </label>
          <textarea
            rows={2}
            value={content.heroSubtitle}
            onChange={(e) => updateContent('heroSubtitle', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            placeholder="Selecione o tipo de incômodo que você está sentindo..."
          />
        </div>
      </div>

      {/* 3. Cards Texts & Buttons */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-5">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
          3. Textos dos Cards e Botões de Ação
        </h3>

        {/* Card 1: Dor Física */}
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="text-xs font-extrabold text-sky-400">Card 1: Dor Física</span>
            <span className="text-[10px] text-stone-500 font-mono">Saúde & Corpo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">Título do Card</label>
              <input
                type="text"
                value={content.cardPhysicalTitle}
                onChange={(e) => updateContent('cardPhysicalTitle', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">Etiqueta (Badge)</label>
              <input
                type="text"
                value={content.cardPhysicalBadge}
                onChange={(e) => updateContent('cardPhysicalBadge', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-400 block mb-1">Descrição</label>
            <input
              type="text"
              value={content.cardPhysicalDesc}
              onChange={(e) => updateContent('cardPhysicalDesc', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-amber-400 block mb-1">Texto do Botão de Ação</label>
            <input
              type="text"
              value={content.cardPhysicalButton}
              onChange={(e) => updateContent('cardPhysicalButton', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-amber-500/50 text-xs text-white font-bold"
            />
          </div>
        </div>

        {/* Card 2: Dor de Problema */}
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="text-xs font-extrabold text-amber-400">Card 2: Dor de Problema</span>
            <span className="text-[10px] text-stone-500 font-mono">Vida Prática & Emergências</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">Título do Card</label>
              <input
                type="text"
                value={content.cardProblemTitle}
                onChange={(e) => updateContent('cardProblemTitle', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">Etiqueta (Badge)</label>
              <input
                type="text"
                value={content.cardProblemBadge}
                onChange={(e) => updateContent('cardProblemBadge', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-400 block mb-1">Descrição</label>
            <input
              type="text"
              value={content.cardProblemDesc}
              onChange={(e) => updateContent('cardProblemDesc', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-amber-400 block mb-1">Texto do Botão de Ação</label>
            <input
              type="text"
              value={content.cardProblemButton}
              onChange={(e) => updateContent('cardProblemButton', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-amber-500/50 text-xs text-white font-bold"
            />
          </div>
        </div>
      </div>

      {/* 4. Emergências & Busca Rápida */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
          4. Busca Rápida e Emergências
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Título da Busca</label>
            <input
              type="text"
              value={content.searchTitle}
              onChange={(e) => updateContent('searchTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">Botão de Ação da Busca</label>
            <input
              type="text"
              value={content.searchButtonText}
              onChange={(e) => updateContent('searchButtonText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-300 block mb-1">Placeholder do Campo de Busca</label>
          <input
            type="text"
            value={content.searchPlaceholder}
            onChange={(e) => updateContent('searchPlaceholder', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
          />
        </div>
      </div>

      {/* 5. Rodapé & Área do Fornecedor */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
          5. Rodapé & Área do Fornecedor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Título da Chamada de Fornecedor (Rodapé)
            </label>
            <input
              type="text"
              value={content.footerSupplierTitle || ''}
              onChange={(e) => updateContent('footerSupplierTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
              placeholder="Você é médico, especialista ou prestador de serviços?"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Subtítulo / Descrição da Chamada
            </label>
            <input
              type="text"
              value={content.footerSupplierSubtitle || ''}
              onChange={(e) => updateContent('footerSupplierSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
              placeholder="Conecte-se a pessoas com dores reais que precisam de atendimento..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Texto do Botão de Acesso ao Fornecedor
            </label>
            <input
              type="text"
              value={content.footerSupplierButtonText || ''}
              onChange={(e) => updateContent('footerSupplierButtonText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
              placeholder="Acessar Área do Fornecedor"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Badge / Etiqueta da Chamada
            </label>
            <input
              type="text"
              value={content.footerSupplierBadgeText || ''}
              onChange={(e) => updateContent('footerSupplierBadgeText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
              placeholder="Oportunidades Abertas"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-stone-800">
          <label className="text-xs font-bold text-stone-300 block mb-1">Texto Institucional do Rodapé</label>
          <input
            type="text"
            value={content.footerNotice}
            onChange={(e) => updateContent('footerNotice', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
            placeholder="Privado • Sem cadastro inicial • Responda do seu jeito"
          />
        </div>
      </div>
    </div>
  );
};
