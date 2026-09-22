import React from 'react';
import { ThemeConfig } from '../../modules/theme/types';
import { ALL_TEMPLATES } from '../../modules/theme/templates';
import { CheckCircle, Play, Sparkles, SlidersHorizontal, ArrowRight, Eye } from 'lucide-react';

interface TemplateSelectorProps {
  currentDraft: ThemeConfig;
  activePublished: ThemeConfig;
  onSelectTemplate: (template: ThemeConfig) => void;
  onTestTemplate: (template: ThemeConfig) => void;
  onPublishTemplate: (template: ThemeConfig) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentDraft,
  activePublished,
  onSelectTemplate,
  onTestTemplate,
  onPublishTemplate,
}) => {
  return (
    <section id="template-selector-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>10 Templates Visuais de Alta Performance</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Cada template possui identidade, tipografia, contraste e sensação estética próprias. Clique para carregar no editor, testar ou publicar.
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

              {/* Realistic Mini Preview Frame */}
              <div className="p-4">
                <div
                  style={{
                    backgroundColor: tmpl.colors.background,
                    color: tmpl.colors.textPrimary,
                    borderColor: tmpl.colors.border,
                    fontFamily: tmpl.typography.bodyFont,
                  }}
                  className="rounded-xl border p-4 shadow-xs select-none transition-colors"
                >
                  {/* Mini Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10 dark:border-white/10 text-[9px]">
                    <span className="font-extrabold tracking-tight">QUAL É A SUA DOR?</span>
                    <span
                      style={{
                        backgroundColor: tmpl.colors.badgeBackground,
                        color: tmpl.colors.badgeText,
                      }}
                      className="px-1.5 py-0.5 rounded font-bold"
                    >
                      Direto ao ponto
                    </span>
                  </div>

                  {/* Mini Title */}
                  <div
                    style={{
                      fontFamily: tmpl.typography.headingFont,
                      fontWeight: tmpl.typography.titleWeight,
                      letterSpacing: tmpl.typography.titleLetterSpacing,
                    }}
                    className="text-sm leading-tight mb-1"
                  >
                    Você está sentindo uma dor no corpo ou um problema na sua rotina?
                  </div>

                  {/* Mini Subtitle */}
                  <div
                    style={{ color: tmpl.colors.textSecondary }}
                    className="text-[10px] mb-3 leading-snug"
                  >
                    Toque na opção abaixo para alívio imediato.
                  </div>

                  {/* Mini Cards Pair */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Card 1 */}
                    <div
                      style={{
                        backgroundColor: tmpl.colors.cardBackground,
                        borderColor: tmpl.colors.border,
                        borderRadius: `${Math.min(tmpl.cards.borderRadius, 14)}px`,
                        borderWidth: `${tmpl.cards.borderWidth}px`,
                      }}
                      className="p-2.5 border flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          style={{
                            backgroundColor: tmpl.colors.iconBoxBackground,
                            color: tmpl.colors.iconColor,
                          }}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                        >
                          ✦
                        </span>
                        <span className="text-[10px] font-extrabold leading-tight">
                          Dor Física
                        </span>
                      </div>
                      <div
                        style={{ color: tmpl.colors.textSecondary }}
                        className="text-[8px] leading-tight mb-2 line-clamp-1"
                      >
                        Corpo, costas, cabeça
                      </div>
                      <span
                        style={{
                          backgroundColor: tmpl.colors.buttonBackground,
                          color: tmpl.colors.buttonText,
                          borderRadius: `${Math.min(tmpl.buttons.borderRadius, 8)}px`,
                        }}
                        className="text-[8px] font-bold py-1 px-1.5 text-center flex items-center justify-center gap-1"
                      >
                        <span>Avaliar</span>
                        <ArrowRight className="w-2 h-2" />
                      </span>
                    </div>

                    {/* Card 2 */}
                    <div
                      style={{
                        backgroundColor: tmpl.colors.cardBackground,
                        borderColor: tmpl.colors.border,
                        borderRadius: `${Math.min(tmpl.cards.borderRadius, 14)}px`,
                        borderWidth: `${tmpl.cards.borderWidth}px`,
                      }}
                      className="p-2.5 border flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          style={{
                            backgroundColor: tmpl.colors.iconBoxBackground,
                            color: tmpl.colors.iconColor,
                          }}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                        >
                          ⚡
                        </span>
                        <span className="text-[10px] font-extrabold leading-tight">
                          Dor / Problema
                        </span>
                      </div>
                      <div
                        style={{ color: tmpl.colors.textSecondary }}
                        className="text-[8px] leading-tight mb-2 line-clamp-1"
                      >
                        Rotina, tempo, trabalho
                      </div>
                      <span
                        style={{
                          backgroundColor: tmpl.colors.buttonBackground,
                          color: tmpl.colors.buttonText,
                          borderRadius: `${Math.min(tmpl.buttons.borderRadius, 8)}px`,
                        }}
                        className="text-[8px] font-bold py-1 px-1.5 text-center flex items-center justify-center gap-1"
                      >
                        <span>Desabafar</span>
                        <ArrowRight className="w-2 h-2" />
                      </span>
                    </div>
                  </div>

                  {/* Fonts token preview */}
                  <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-black/5 dark:border-white/5 text-stone-400">
                    <span>Fonte: <strong className="text-stone-300">{tmpl.typography.headingFont}</strong></span>
                    <span className="font-mono">{tmpl.colors.isDark ? 'Modo Escuro' : 'Modo Claro'}</span>
                  </div>
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
                  onClick={() => onTestTemplate(tmpl)}
                  title="Testar este template no site real"
                  className="py-2 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Testar</span>
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
    </section>
  );
};
