import React, { useState } from 'react';
import { ThemeConfig, ThemePositions, ThemeVisibility } from '../../modules/theme/types';
import { ALL_TEMPLATES } from '../../modules/theme/templates';
import { CheckCircle, Sparkles, SlidersHorizontal, ArrowRight, Eye, Layout, AlignLeft, AlignCenter, Columns, Rows, MoveUp, MoveDown } from 'lucide-react';
import { LiveAppPreview } from './LiveAppPreview';

interface TemplateSelectorProps {
  currentDraft: ThemeConfig;
  activePublished: ThemeConfig;
  onSelectTemplate: (template: ThemeConfig) => void;
  onTestTemplate: (template: ThemeConfig) => void;
  onPublishTemplate: (template: ThemeConfig) => void;
}

function getPositions(t: ThemeConfig): Required<ThemePositions> {
  const d: Required<ThemePositions> = {
    heroAlign: 'center',
    cardsLayout: 'grid',
    cardsOrder: 'physical_first',
    sectionOrder: 'hero_search_cards',
    buttonsAlign: 'stretch',
    searchPosition: 'above_cards',
    headerLayout: 'standard',
    headerSupplierPosition: 'footer_only',
  };
  return { ...d, ...(t.positions || {}) };
}

function getVisibility(t: ThemeConfig): Required<ThemeVisibility> {
  const d: Required<ThemeVisibility> = {
    showHeaderBrand: true,
    showHeaderBadge: true,
    showHeaderSupplierBtn: true,
    showHeaderAdminBtn: true,
    showFloatingAdminWidget: true,
    showMascotsGlobal: true,
    showMascotHero: true,
    showMascotCards: true,
    showMascotAudioModal: true,
    showHeroBadge: true,
    showHeroTitle: true,
    showHeroSubtitle: true,
    showCardPhysical: true,
    showCardProblem: true,
    showCardPhysicalIcon: true,
    showCardProblemIcon: true,
    showCardPhysicalBadge: true,
    showCardProblemBadge: true,
    showCardPhysicalButton: true,
    showCardProblemButton: true,
    showSearchSection: true,
    showAudioInputButton: true,
    showSearchChips: true,
    showFooterNotice: true,
    showFooterSection: true,
    showFooterSupplierBanner: true,
  };
  return { ...d, ...(t.visibility || {}) };
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentDraft,
  activePublished,
  onSelectTemplate,
  onTestTemplate,
  onPublishTemplate,
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<ThemeConfig | null>(null);

  const positions = (t: ThemeConfig) => getPositions(t);
  const visibility = (t: ThemeConfig) => getVisibility(t);

  const getSectionOrderLabel = (order: string) => {
    switch (order) {
      case 'hero_search_cards': return 'Hero → Busca → Cards';
      case 'hero_cards_search': return 'Hero → Cards → Busca';
      case 'search_hero_cards': return 'Busca → Hero → Cards';
      default: return order;
    }
  };

  const getHeaderLabel = (layout: string) => {
    switch (layout) {
      case 'minimal': return 'Minimal';
      case 'centered': return 'Centrado';
      case 'standard': return 'Padrão';
      default: return layout;
    }
  };

  const getCardsLabel = (layout: string) => {
    return layout === 'stack' ? 'Pilha' : 'Grade';
  };

  const getHeroAlignLabel = (align: string) => {
    return align === 'left' ? 'Esquerda' : align === 'right' ? 'Direita' : 'Centro';
  };

  const getLayoutIcon = (order: string) => {
    if (order === 'search_hero_cards') return <MoveUp className="w-3 h-3" />;
    if (order === 'hero_cards_search') return <MoveDown className="w-3 h-3" />;
    return null;
  };

  const getDifferentiationTags = (t: ThemeConfig) => {
    const pos = positions(t);
    const tags: string[] = [];

    if (pos.headerLayout === 'minimal') tags.push('Header Minimal');
    if (pos.headerLayout === 'centered') tags.push('Header Centrado');
    if (pos.sectionOrder === 'search_hero_cards') tags.push('Busca 1º');
    if (pos.sectionOrder === 'hero_cards_search') tags.push('Cards 1º');
    if (pos.cardsLayout === 'stack') tags.push('Cards Pilha');
    if (pos.heroAlign === 'left') tags.push('Hero Esquerda');
    if (pos.heroAlign === 'right') tags.push('Hero Direita');
    if (visibility(t).showMascotsGlobal === false) tags.push('Sem Mascotes');
    if (visibility(t).showCardPhysicalBadge === false && visibility(t).showCardProblemBadge === false) tags.push('Sem Badges');
    if (pos.headerSupplierPosition === 'none') tags.push('Sem Supplier');

    return tags;
  };

  return (
    <section id="template-selector-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{ALL_TEMPLATES.length} Templates Visuais Únicos</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Cada template possui layout, tipografia, cores e sensação estética totalmente diferentes. Clique para carregar no editor, testar ou publicar.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 self-start sm:self-auto">
          Tema publicado: <strong className="text-amber-400">{activePublished.name}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ALL_TEMPLATES.map((tmpl, idx) => {
          const isCurrentActive = activePublished.id === tmpl.id;
          const isCurrentDraft = currentDraft.id === tmpl.id;
          const pos = positions(tmpl);
          const vis = visibility(tmpl);

          return (
            <div
              key={tmpl.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                isCurrentActive
                  ? 'border-amber-500/80 bg-stone-900/90 ring-2 ring-amber-500/20 shadow-lg shadow-amber-950/20'
                  : isCurrentDraft
                  ? 'border-stone-600 bg-stone-900/60 shadow-md'
                  : 'border-stone-800 bg-stone-950/70 hover:border-stone-700'
              }`}
            >
              {/* Template Header bar */}
              <div className="p-4 border-b border-stone-800/80 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {tmpl.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 font-medium line-clamp-1">
                    {tmpl.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isCurrentActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Publicado
                    </span>
                  )}
                  {isCurrentDraft && !isCurrentActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-stone-300 bg-stone-800 border border-stone-700 px-2 py-0.5 rounded-full">
                      No Editor
                    </span>
                  )}
                </div>
              </div>

              {/* Layout Visualization Mini Preview */}
              <div className="p-4">
                <div
                  style={{
                    backgroundColor: tmpl.colors.background,
                    color: tmpl.colors.textPrimary,
                    borderColor: tmpl.colors.border,
                    fontFamily: tmpl.typography.bodyFont,
                  }}
                  className="rounded-xl border p-4 shadow-xs select-none transition-colors relative overflow-hidden"
                >
                  {/* Mini Header showing layout type */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10 dark:border-white/10 text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold tracking-tight">{pos.headerSupplierPosition === 'none' ? '' : 'SUP'}</span>
                      <span className="font-extrabold tracking-tight">
                        {pos.headerLayout === 'minimal' ? 'M' : pos.headerLayout === 'centered' ? 'C' : 'S'}
                      </span>
                    </div>
                    <span
                      style={{
                        backgroundColor: tmpl.colors.badgeBackground,
                        color: tmpl.colors.badgeText,
                      }}
                      className="px-1.5 py-0.5 rounded font-bold"
                    >
                      {pos.headerLayout === 'minimal' ? 'Minimal' : pos.headerLayout === 'centered' ? 'Centrado' : 'Padrão'}
                    </span>
                  </div>

                  {/* Mini Layout Flow - shows section order */}
                  <div className="space-y-1.5 mb-3">
                    <div
                      style={{ fontFamily: tmpl.typography.headingFont, fontWeight: tmpl.typography.titleWeight }}
                      className="text-xs leading-tight"
                    >
                      {pos.heroAlign === 'left' && <span className="float-left">← </span>}
                      {pos.heroAlign === 'right' && <span className="float-right"> →</span>}
                      <div className={pos.heroAlign === 'center' ? 'text-center' : pos.heroAlign === 'left' ? 'text-left' : 'text-right'}>
                        Você tem uma dor
                      </div>
                    </div>

                    {/* Section order visualization */}
                    <div className="flex items-center gap-1 text-[8px] text-stone-400 dark:text-stone-500">
                      {getLayoutIcon(pos.sectionOrder)}
                      <span>{getSectionOrderLabel(pos.sectionOrder || 'hero_search_cards')}</span>
                    </div>

                    {/* Mini Cards row */}
                    <div className="grid" style={{
                      gridTemplateColumns: pos.cardsLayout === 'stack' ? '1fr' : '1fr 1fr',
                      gap: '4px'
                    }}>
                      <div
                        style={{
                          backgroundColor: tmpl.colors.cardBackground,
                          borderColor: tmpl.colors.border,
                          borderRadius: `${Math.min(tmpl.cards.borderRadius, 10)}px`,
                          borderWidth: `${tmpl.cards.borderWidth}px`,
                        }}
                        className="p-2 border flex items-center gap-1"
                      >
                        <span
                          style={{
                            backgroundColor: tmpl.colors.iconBoxBackground,
                            color: tmpl.colors.iconColor,
                          }}
                          className="w-3 h-3 rounded flex items-center justify-center text-[6px] font-bold"
                        >
                          ✦
                        </span>
                        <span className="text-[8px] font-extrabold">Física</span>
                        {vis.showCardPhysicalBadge !== false && (
                          <span
                            style={{ backgroundColor: tmpl.colors.badgeBackground, color: tmpl.colors.badgeText }}
                            className="text-[7px] font-bold px-1 rounded"
                          >
                            !
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          backgroundColor: tmpl.colors.cardBackground,
                          borderColor: tmpl.colors.border,
                          borderRadius: `${Math.min(tmpl.cards.borderRadius, 10)}px`,
                          borderWidth: `${tmpl.cards.borderWidth}px`,
                        }}
                        className="p-2 border flex items-center gap-1"
                      >
                        <span
                          style={{
                            backgroundColor: tmpl.colors.iconBoxBackground,
                            color: tmpl.colors.iconColor,
                          }}
                          className="w-3 h-3 rounded flex items-center justify-center text-[6px] font-bold"
                        >
                          ⚡
                        </span>
                        <span className="text-[8px] font-extrabold">Problema</span>
                        {vis.showCardProblemBadge !== false && (
                          <span
                            style={{ backgroundColor: tmpl.colors.badgeBackground, color: tmpl.colors.badgeText }}
                            className="text-[7px] font-bold px-1 rounded"
                          >
                            !
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fonts & Layout token preview */}
                  <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-black/5 dark:border-white/5 text-stone-400">
                    <span>Fonte: <strong className="text-stone-300">{tmpl.typography.headingFont}</strong></span>
                    <div className="flex items-center gap-1">
                      {pos.cardsLayout === 'stack' ? <Rows className="w-3 h-3" /> : <Columns className="w-3 h-3" />}
                      <span className="font-mono">{tmpl.colors.isDark ? 'Escuro' : 'Claro'}</span>
                    </div>
                  </div>

                  {/* Differentiation Tags */}
                  {getDifferentiationTags(tmpl).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getDifferentiationTags(tmpl).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-stone-800/50 text-stone-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-stone-900/60 border-t border-stone-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tmpl)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Carregar no Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tmpl)}
                  title="Preview ao vivo deste template"
                  className="py-2 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-sky-400 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTestTemplate(tmpl)}
                  title="Testar este template no site real"
                  className="py-2 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Site</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPublishTemplate(tmpl)}
                  title="Publicar este template como tema oficial do site"
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Publicar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-950/50">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-amber-400" />
                Preview ao Vivo: {previewTemplate.name}
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <LiveAppPreview theme={previewTemplate} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
