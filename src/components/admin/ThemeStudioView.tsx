import React, { useState, useEffect } from 'react';
import { useTheme } from '../../modules/theme/ThemeContext';
import { ThemeConfig, getThemeContent, getThemeHeroLogo } from '../../modules/theme/types';
import { DEFAULT_THEME, TEMPLATE_01_UBER_MINIMAL } from '../../modules/theme/templates';
import { TemplateSelector } from './TemplateSelector';
import { TypographyEditor } from './TypographyEditor';
import { ColorsEditor } from './ColorsEditor';
import { LayoutCardsEditor } from './LayoutCardsEditor';
import { ButtonsEditor } from './ButtonsEditor';
import { ContentMenusEditor } from './ContentMenusEditor';
import { VisibilityEditor } from './VisibilityEditor';
import { HeroLogoEditor } from './HeroLogoEditor';
import { ThemeHistoryView } from './ThemeHistoryView';
import { LiveAppPreview } from './LiveAppPreview';
import { ReportedSolutionsView } from './ReportedSolutionsView';
import { AdminOpportunitiesView } from './AdminOpportunitiesView';
import { AdminMonetizationView } from './AdminMonetizationView';
import { DraggableLivePreview } from './DraggableLivePreview';
import { QuickStudioEditor } from './QuickStudioEditor';
import { SpacingEditor } from './SpacingEditor';
import { AdminMascotModal } from './AdminMascotModal';
import {
  Sparkles,
  Type,
  Palette,
  LayoutGrid,
  MousePointerClick,
  History,
  Save,
  Send,
  RotateCcw,
  LogOut,
  Eye,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Flame,
  DollarSign,
  FileText,
  Columns,
  Maximize2,
  Minimize2,
  PictureInPicture,
  X,
  Smartphone,
  Zap,
  SlidersHorizontal,
  MoveVertical,
} from 'lucide-react';

interface ThemeStudioViewProps {
  onNavigateHome: () => void;
}

type StudioTab =
  | 'quick'
  | 'mascots'
  | 'templates'
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'layout'
  | 'content'
  | 'buttons'
  | 'visibility'
  | 'history'
  | 'reports'
  | 'opportunities'
  | 'monetization';

export const ThemeStudioView: React.FC<ThemeStudioViewProps> = ({ onNavigateHome }) => {
  const {
    draftTheme,
    activeTheme,
    adminSession,
    setDraftTheme,
    updateDraft,
    saveDraft,
    publishTheme,
    resetToDefault,
    restoreHistory,
    setTestTheme,
    logoutAdmin,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<StudioTab>('quick');
  const [showMascotModal, setShowMascotModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'editor'>('split');
  const [isFloatingPreview, setIsFloatingPreview] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Carregar contagem de pendências de relatórios
  useEffect(() => {
    fetch('/api/feedback/reported-solutions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.pendingCount === 'number') {
          setPendingReportsCount(data.pendingCount);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await saveDraft();
      showToast('Rascunho de tema salvo e aplicado com sucesso!');
    } catch (err: any) {
      showToast('Rascunho aplicado localmente com sucesso!', 'info');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      await publishTheme(draftTheme);
      setShowPublishModal(false);
      showToast('🎉 Tema publicado e aplicado com sucesso no site público!');
    } catch (err: any) {
      showToast('Tema ativado e aplicado localmente no site!', 'info');
      setShowPublishModal(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleQuickApplyAndPublish = async () => {
    setPublishing(true);
    try {
      await publishTheme(draftTheme);
      showToast('✨ Alterações aplicadas e ativas no site público!');
    } catch (err: any) {
      showToast('Alterações ativadas e aplicadas localmente!', 'info');
    } finally {
      setPublishing(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetToDefault();
      setShowResetModal(false);
      showToast('Tema restaurado para o padrão original de fábrica.');
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar padrão.');
    }
  };

  const handleSelectTemplate = (tmpl: ThemeConfig, redirectTab: StudioTab = 'quick') => {
    setDraftTheme(tmpl);
    showToast(`Template "${tmpl.name}" carregado no editor.`);
    setActiveTab(redirectTab);
  };

  const handleTestTemplate = (tmpl: ThemeConfig) => {
    setTestTheme(tmpl);
    onNavigateHome();
  };

  const handlePublishDirectTemplate = async (tmpl: ThemeConfig) => {
    if (window.confirm(`Deseja publicar imediatamente o template "${tmpl.name}" para todos os usuários públicos?`)) {
      setPublishing(true);
      try {
        await publishTheme(tmpl);
        showToast(`🎉 "${tmpl.name}" publicado como tema oficial!`);
      } catch (err: any) {
        alert(err.message || 'Erro ao publicar.');
      } finally {
        setPublishing(false);
      }
    }
  };

  const tabs = [
    { id: 'quick', label: '⚡ 1-Clique Rápido', icon: Zap, isHighlight: true },
    { id: 'mascots', label: '🐾 10 Mascotes', icon: Sparkles },
    { id: 'templates', label: '10 Templates Prontos', icon: Sparkles },
    { id: 'colors', label: 'Cores & Contraste', icon: Palette },
    { id: 'typography', label: 'Tipografia & Fontes', icon: Type },
    { id: 'spacing', label: '📐 Espaçamento', icon: MoveVertical },
    { id: 'layout', label: 'Layout & Cards', icon: LayoutGrid },
    { id: 'content', label: 'Textos & Menus', icon: FileText },
    { id: 'buttons', label: 'Botões', icon: MousePointerClick },
    { id: 'visibility', label: 'Visibilidade', icon: Eye },
    { id: 'history', label: 'Histórico', icon: History },
    {
      id: 'opportunities',
      label: 'Funil de Oportunidades',
      icon: Flame,
    },
    {
      id: 'monetization',
      label: 'Monetização & Preços',
      icon: DollarSign,
    },
    {
      id: 'reports',
      label: 'Soluções Reportadas',
      icon: AlertTriangle,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
    },
  ];

  return (
    <main id="theme-studio-main" className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* 1. TOP HEADER BAR */}
      <header
        id="admin-top-header"
        className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-3"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs shadow-sm">
              TS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  THEME STUDIO
                </span>
                <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">Sessão Autenticada</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase">Autorizado</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Mascots Manager */}
            <button
              id="btn-admin-manage-mascots"
              type="button"
              onClick={() => setShowMascotModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-purple-400"
              title="Gerenciar, trocar ou fazer upload de fotos dos mascotes"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>🐾 10 Mascotes</span>
            </button>

            {/* Quick Apply & Publish */}
            <button
              id="btn-admin-quick-apply"
              type="button"
              disabled={publishing}
              onClick={handleQuickApplyAndPublish}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Aplica e salva todas as alterações imediatamente no site público"
            >
              {publishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              )}
              <span>Aplicar no Site Agora</span>
            </button>

            {/* Test on Public Site */}
            <button
              id="btn-admin-test-live"
              type="button"
              onClick={() => {
                setTestTheme(draftTheme);
                onNavigateHome();
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Navegar no site real com as configurações deste rascunho"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Ver no Site Real</span>
              <span className="sm:hidden">Ver Site</span>
            </button>

            {/* Save Draft */}
            <button
              id="btn-admin-save-draft"
              type="button"
              disabled={savingDraft}
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingDraft ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Salvar Rascunho</span>
            </button>

            {/* Publish Theme Modal */}
            <button
              id="btn-admin-publish-theme"
              type="button"
              disabled={publishing}
              onClick={() => setShowPublishModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>

            {/* Reset Factory Default */}
            <button
              id="btn-admin-reset-default"
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-2.5 py-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs transition-colors cursor-pointer"
              title="Restaurar padrão inicial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Logout */}
            <button
              id="btn-admin-logout"
              type="button"
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-xl text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Encerrar sessão de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-amber-500 text-stone-950 font-extrabold text-xs flex items-center gap-2 shadow-2xl">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* 2. TAB NAVIGATION BAR & VIEW CONTROLS */}
      <nav id="studio-tabs-bar" className="bg-stone-900 border-b border-stone-800 px-3 sm:px-6 shrink-0">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 py-2">
          {/* Scrollable Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1 pb-1 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as StudioTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? tab.id === 'quick'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400/30'
                        : 'bg-amber-500 text-stone-950 shadow-xs'
                      : tab.id === 'quick'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Universal View Mode Controls (Split, Preview, Editor, PIP) */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Tela Dividida: Formulário e Miniatura da Página lado a lado"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dividido</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Expandir Miniatura da Página ao Vivo"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1">
                <span>Miniatura Ao Vivo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'editor'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Apenas formulário do editor"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Apenas Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFloatingPreview(!isFloatingPreview)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFloatingPreview
                  ? 'bg-sky-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Miniatura Flutuante (Picture-in-Picture) que fica visível enquanto você rola as configurações"
            >
              <PictureInPicture className="w-3.5 h-3.5" />
              <span>Miniatura Flutuante</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. MAIN WORKSPACE */}
      {activeTab === 'reports' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
          <ReportedSolutionsView />
        </div>
      ) : activeTab === 'opportunities' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-y-auto bg-stone-900/30 rounded-3xl border border-stone-800 my-4">
          <AdminOpportunitiesView />
        </div>
      ) : activeTab === 'monetization' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-y-auto bg-stone-900/30 rounded-3xl border border-stone-800 my-4">
          <AdminMonetizationView />
        </div>
      ) : (
        <div className="flex-1 max-w-[1700px] w-full mx-auto p-2.5 sm:p-5 flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-130px)] min-h-[640px] overflow-visible lg:overflow-hidden">
          {/* Left Column: Editor Controls (with independent scroll) */}
          <div
            className={`w-full ${
              viewMode === 'preview'
                ? 'hidden lg:flex lg:w-4/12'
                : viewMode === 'editor'
                ? 'lg:w-full'
                : 'lg:w-1/2'
            } h-full bg-stone-900/40 border border-stone-800 rounded-3xl p-4 sm:p-6 overflow-y-auto flex flex-col transition-all`}
          >
            {/* Live Visual Instant Feedback Banner */}
            <div className="mb-4 p-3 rounded-2xl bg-stone-950 border border-stone-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Feedback Visual Ao Vivo
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {/* Visual Palette Dots */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-900 border border-stone-800">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: draftTheme.colors.background }}
                    title={`Fundo: ${draftTheme.colors.background}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: draftTheme.colors.cardBackground }}
                    title={`Card: ${draftTheme.colors.cardBackground}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: draftTheme.colors.accent }}
                    title={`Acento: ${draftTheme.colors.accent}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: draftTheme.colors.buttonBackground }}
                    title={`Botão: ${draftTheme.colors.buttonBackground}`}
                  />
                </div>

                {/* Sample Live Button */}
                <button
                  type="button"
                  style={{
                    backgroundColor: draftTheme.colors.buttonBackground,
                    color: draftTheme.colors.buttonText,
                    borderRadius: `${draftTheme.buttons.borderRadius}px`,
                  }}
                  className="px-2.5 py-1 text-[11px] font-extrabold truncate max-w-[140px] shadow-xs cursor-default"
                >
                  {getThemeContent(draftTheme).cardPhysicalButton || 'Acessar'}
                </button>

                {/* Quick Toggle for Mini Preview */}
                <button
                  type="button"
                  onClick={() => setIsFloatingPreview(!isFloatingPreview)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    isFloatingPreview
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{isFloatingPreview ? 'PIP Ativo' : 'Ver Miniatura'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Switch to Live Preview */}
            <div className="lg:hidden mb-4 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-amber-300 font-bold">Ver Miniatura da Página:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-extrabold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Eye className="w-3 h-3" />
                  <span>Miniatura Ao Vivo</span>
                </button>
              </div>
            </div>

            {activeTab === 'quick' && (
              <QuickStudioEditor
                theme={draftTheme}
                onChange={updateDraft}
                onSelectTemplate={(tmpl) => handleSelectTemplate(tmpl, 'quick')}
                onOpenAdvancedTab={(tab) => setActiveTab(tab as StudioTab)}
                onQuickPublish={handleQuickApplyAndPublish}
                isPublishing={publishing}
              />
            )}

            {activeTab === 'mascots' && (
              <div className="p-6 bg-stone-900/90 border border-purple-500/40 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Central de Mascotes do App (10 Personagens)</h2>
                      <p className="text-xs text-stone-400">
                        Personalize qualquer mascote, faça upload de imagens ou configure links e nomes.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMascotModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Abrir Editor Completo de Mascotes</span>
                  </button>
                </div>

                {/* Editor Direto do Logo Hero / Pai */}
                <div className="pt-4 border-t border-stone-800 space-y-3">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Quadro, Tamanho & Animações da Logo / Mascote Principal (Hero)</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Defina a logo como solta (sem quadrado), ajuste o tamanho exato em pixels e configure a velocidade e amplitude do sobe e desce.
                  </p>
                  <HeroLogoEditor
                    heroLogo={getThemeHeroLogo(draftTheme)}
                    onChange={(updated) => updateDraft((prev) => ({ ...prev, heroLogo: updated }))}
                    onOpenMascotUpload={() => setShowMascotModal(true)}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 text-stone-300 text-xs leading-relaxed space-y-2">
                  <p className="font-bold text-white">Como funciona:</p>
                  <p>• Você pode fazer upload de imagens do seu computador (PNG, JPG, WebP) ou inserir URLs diretas.</p>
                  <p>• As alterações são salvas e refletidas instantaneamente em todas as telas onde o mascote aparece (Home, Áudio, Sintomas, Soluções, etc.).</p>
                  <p>• Cada mascote pode ser restaurado individualmente para o padrão de fábrica.</p>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <TemplateSelector
                currentDraft={draftTheme}
                activePublished={activeTheme}
                onSelectTemplate={handleSelectTemplate}
                onTestTemplate={handleTestTemplate}
                onPublishTemplate={handlePublishDirectTemplate}
              />
            )}

            {activeTab === 'content' && (
              <ContentMenusEditor theme={draftTheme} onChange={updateDraft} />
            )}

            {activeTab === 'typography' && (
              <TypographyEditor theme={draftTheme} onChange={updateDraft} />
            )}

            {activeTab === 'colors' && (
              <ColorsEditor theme={draftTheme} onChange={updateDraft} />
            )}

            {activeTab === 'spacing' && (
              <SpacingEditor
                theme={draftTheme}
                onChange={updateDraft}
                onPublish={handleQuickApplyAndPublish}
                onSaveDraft={handleSaveDraft}
                onTestOnSite={() => {
                  setTestTheme(draftTheme);
                  showToast('🧪 Modo de teste ativado! Abra a página inicial para conferir.');
                }}
                isPublishing={publishing}
              />
            )}

            {activeTab === 'layout' && (
              <LayoutCardsEditor theme={draftTheme} onChange={updateDraft} />
            )}

            {activeTab === 'buttons' && (
              <ButtonsEditor theme={draftTheme} onChange={updateDraft} />
            )}

            {activeTab === 'visibility' && (
              <VisibilityEditor theme={draftTheme} onChange={updateDraft} />
            )}

            {activeTab === 'history' && (
              <ThemeHistoryView onRestore={restoreHistory} />
            )}
          </div>

          {/* Right Column: Live App Preview (In-Place Live Miniature Simulator) */}
          <div
            className={`w-full ${
              viewMode === 'preview'
                ? 'lg:w-8/12 min-h-[640px]'
                : viewMode === 'editor'
                ? 'hidden'
                : 'lg:w-1/2 min-h-[560px]'
            } h-full flex flex-col shrink-0 transition-all`}
          >
            <LiveAppPreview
              theme={draftTheme}
              onNavigateToTab={(tab) => setActiveTab(tab as StudioTab)}
            />
          </div>
        </div>
      )}

      {/* Interactive Draggable, Resizable & Semi-transparent Live Preview */}
      <DraggableLivePreview
        theme={draftTheme}
        isOpen={isFloatingPreview}
        onClose={() => setIsFloatingPreview(false)}
        onNavigateToTab={(tab) => setActiveTab(tab as StudioTab)}
      />

      {/* Mobile Floating Action Button */}
      <button
        type="button"
        onClick={() => setShowMobilePreviewModal(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-amber-500 text-stone-950 font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-stone-900 cursor-pointer active:scale-95 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-800 animate-pulse" />
        <Eye className="w-4 h-4" />
        <span>Ver Preview Ao Vivo</span>
      </button>

      {/* Mobile Fullscreen Modal Preview */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-5 lg:hidden animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Preview Ao Vivo (In Loco)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMobilePreviewModal(false);
                  setIsFloatingPreview(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                title="Minimizar para janela flutuante arrastável"
              >
                <PictureInPicture className="w-3.5 h-3.5" />
                <span>Miniatura Flutuante</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="px-2.5 py-1 rounded-xl bg-stone-800 text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <LiveAppPreview
              theme={draftTheme}
              onNavigateToTab={(tab) => {
                setActiveTab(tab as StudioTab);
                setShowMobilePreviewModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ================= MODAL: PUBLICAR TEMA ================= */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white">Publicar Tema Oficial?</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Este tema passará a ser exibido para <strong>todos os usuários públicos</strong> que acessarem o aplicativo “QUAL É A SUA DOR?”.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-stone-950 text-left text-xs text-stone-400 space-y-1">
                <div>Tema: <strong className="text-white">{draftTheme.name}</strong></div>
                <div>Fonte principal: <strong className="text-amber-400">{draftTheme.typography.headingFont}</strong></div>
                <div>Modo: <strong className="text-white">{draftTheme.colors.isDark ? 'Escuro' : 'Claro'}</strong></div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handleConfirmPublish}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Confirmar e Publicar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESTAURAR PADRÃO ================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white">Restaurar Padrão de Fábrica?</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                As alterações no rascunho atual serão substituídas pelo tema padrão <strong>Uber Minimal</strong>.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                Restaurar Padrão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento e Upload de Mascotes */}
      <AdminMascotModal
        isOpen={showMascotModal}
        onClose={() => setShowMascotModal(false)}
      />
    </main>
  );
};
