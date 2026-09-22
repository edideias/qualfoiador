import React, { useState } from 'react';
import { useTheme } from '../../modules/theme/ThemeContext';
import {
  getThemeContent,
  getThemePositions,
  getThemeVisibility,
  getThemeHeroLogo,
  ThemeHeroLogo,
  getThemeLayout,
  ThemeLayout,
  DEFAULT_THEME_LAYOUT,
} from '../../modules/theme/types';
import { AdminMascotModal } from './AdminMascotModal';
import { HeroLogoEditor } from './HeroLogoEditor';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Check,
  RotateCcw,
  UploadCloud,
  Layers,
  FileText,
  MousePointerClick,
  Type,
  LayoutGrid,
  ExternalLink,
  ChevronUp,
  Save,
  Sliders,
  Palette,
  Eye,
  EyeOff,
  ArrowUpDown,
  MoveHorizontal,
} from 'lucide-react';

interface LiveAdminQuickEditorProps {
  onOpenStudio?: () => void;
}

export const LiveAdminQuickEditor: React.FC<LiveAdminQuickEditorProps> = ({ onOpenStudio }) => {
  const {
    isAdmin,
    adminSession,
    effectiveTheme,
    updateLiveTheme,
    publishLiveTheme,
    saveDraft,
    discardLiveChanges,
  } = useTheme();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'content' | 'buttons' | 'typography' | 'positions' | 'colors' | 'visibility' | 'herologo' | 'spacing'>('spacing');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const t = effectiveTheme;
  const content = getThemeContent(t);
  const positions = getThemePositions(t);
  const visibility = getThemeVisibility(t);
  const heroLogo = getThemeHeroLogo(t);
  const layout = getThemeLayout(t);

  const handleUpdateLayout = (field: keyof ThemeLayout, val: any) => {
    updateLiveTheme((prev) => ({
      ...prev,
      layout: {
        ...getThemeLayout(prev),
        [field]: val,
      },
    }));
  };

  const handleUpdateHeroLogo = (updated: ThemeHeroLogo) => {
    updateLiveTheme((prev) => ({
      ...prev,
      heroLogo: updated,
    }));
  };

  const handleUpdateContent = (field: string, val: any) => {
    updateLiveTheme((prev) => ({
      ...prev,
      content: {
        ...getThemeContent(prev),
        [field]: val,
      },
    }));
  };

  const handleUpdateButtons = (field: string, val: any) => {
    updateLiveTheme((prev) => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [field]: val,
      },
    }));
  };

  const handleUpdateTypo = (field: string, val: any) => {
    updateLiveTheme((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: val,
      },
    }));
  };

  const handleUpdatePosition = (field: string, val: any) => {
    updateLiveTheme((prev) => ({
      ...prev,
      positions: {
        ...getThemePositions(prev),
        [field]: val,
      },
      buttons: {
        ...prev.buttons,
        ...(field === 'buttonsAlign' ? { alignment: val } : {}),
      },
    }));
  };

  const handleUpdateColors = (field: string, val: any) => {
    updateLiveTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [field]: val,
      },
    }));
  };

  const handleUpdateVisibility = (field: string, val: boolean) => {
    updateLiveTheme((prev) => ({
      ...prev,
      visibility: {
        ...getThemeVisibility(prev),
        [field]: val,
      },
    }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaveStatus('Salvando rascunho...');
      await saveDraft();
      setSaveStatus('Rascunho salvo!');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e) {
      setSaveStatus('Erro ao salvar rascunho');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handlePublish = async () => {
    try {
      setSaveStatus('Publicando ao vivo...');
      await publishLiveTheme();
      setSaveStatus('Tema publicado ao vivo!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus('Erro ao publicar');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Deseja descartar as alterações não publicadas e voltar ao tema ativo?')) {
      discardLiveChanges();
      setSaveStatus('Alterações revertidas');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  return (
    <>
      {/* Floating trigger button (when closed) */}
      {!isOpen && (
        visibility.showFloatingAdminWidget !== false ? (
          <div
            id="live-admin-widget-closed"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setIsMascotModalOpen(true)}
              title="Gerenciar e trocar mascotes do app"
              className="flex items-center gap-2 px-3.5 py-3 rounded-full bg-purple-950/95 hover:bg-purple-900 text-white shadow-2xl border-2 border-purple-500 hover:border-purple-400 backdrop-blur-md transition-all active:scale-95 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black tracking-tight">🐾 Mascotes</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-stone-950/95 hover:bg-stone-900 text-white shadow-2xl border-2 border-amber-500/80 hover:border-amber-400 backdrop-blur-md transition-all active:scale-95 cursor-pointer group"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <Sliders className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span className="text-xs font-black tracking-tight">EDITAR AO VIVO</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                Admin
              </span>
            </button>
          </div>
        ) : (
          /* Acesso discreto de segurança: se o admin ocultar os botões flutuantes, ainda mantém atalho no canto */
          <div
            id="live-admin-widget-discrete"
            className="fixed bottom-2 right-2 z-50 opacity-20 hover:opacity-100 transition-opacity"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              title="Botões flutuantes ocultos para visitantes • Clique aqui para reabrir o Live Editor"
              className="px-2.5 py-1 rounded-full bg-stone-900/90 text-stone-300 hover:text-amber-400 border border-stone-700 text-[10px] font-bold shadow-md cursor-pointer flex items-center gap-1"
            >
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Admin (Oculto)</span>
            </button>
          </div>
        )
      )}

      {/* Expanded Live Quick Editor Drawer / Floating Dock */}
      {isOpen && (
        <div
          id="live-admin-dock"
          className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:w-[540px] max-h-[85vh] z-50 flex flex-col bg-stone-950/95 text-white rounded-3xl border-2 border-amber-500/70 shadow-2xl backdrop-blur-xl transition-all overflow-hidden"
        >
          {/* Dock Header */}
          <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-black tracking-tight text-white uppercase">
                    Editor ao Vivo (Instantâneo)
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 truncate max-w-[280px]">
                  Sessão Autenticada
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMascotModalOpen(true)}
                title="Abrir Gerenciador de Mascotes do App"
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 shadow-sm border border-purple-400 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mascotes</span>
              </button>
              {onOpenStudio && (
                <button
                  type="button"
                  onClick={onOpenStudio}
                  title="Abrir Studio Completo no /admin"
                  className="p-1.5 text-stone-400 hover:text-amber-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimizar barra"
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dock Tabs */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-stone-800 bg-stone-900/40 p-1 gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setIsMascotModalOpen(true)}
              className="py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-700/50 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>🐾 Mascotes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'content'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Textos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('herologo')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'herologo'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Logo & Animação</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buttons')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'buttons'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Botões</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('typography')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'typography'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fontes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('positions')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'positions'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Posições</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'colors'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Cores</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('visibility')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'visibility'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visibilidade</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('spacing')}
              className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'spacing'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Espaços</span>
            </button>
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="p-4 overflow-y-auto max-h-[50vh] space-y-4 text-xs">
            {/* 1. TEXTOS & MENUS TAB */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* Header & Logo */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Cabeçalho & Menu Superior
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-0.5 font-bold">Prefixo Logo</label>
                      <input
                        type="text"
                        value={content.headerBrandPrefix}
                        onChange={(e) => handleUpdateContent('headerBrandPrefix', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-0.5 font-bold">Destaque Logo</label>
                      <input
                        type="text"
                        value={content.headerBrandHighlight}
                        onChange={(e) => handleUpdateContent('headerBrandHighlight', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-amber-400 font-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-0.5 font-bold">Botão Menu Fornecedor</label>
                    <input
                      type="text"
                      value={content.headerSupplierText}
                      onChange={(e) => handleUpdateContent('headerSupplierText', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white font-medium"
                    />
                  </div>
                </div>

                {/* Hero Section */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Título Principal e Apresentação
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-0.5 font-bold">Título: Prefixo</label>
                      <input
                        type="text"
                        value={content.heroTitlePrefix}
                        onChange={(e) => handleUpdateContent('heroTitlePrefix', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-0.5 font-bold">Título: Destaque</label>
                      <input
                        type="text"
                        value={content.heroTitleHighlight}
                        onChange={(e) => handleUpdateContent('heroTitleHighlight', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-amber-400 font-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 block mb-0.5 font-bold">Subtítulo / Chamada</label>
                    <textarea
                      rows={2}
                      value={content.heroSubtitle}
                      onChange={(e) => handleUpdateContent('heroSubtitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white leading-tight"
                    />
                  </div>
                </div>

                {/* Cards Texts */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Textos dos Cards
                  </span>

                  {/* Card 1: Dor Física */}
                  <div className="space-y-1.5 p-2 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[11px] font-bold text-sky-400 block">Card 1: Dor Física</span>
                    <input
                      type="text"
                      placeholder="Título"
                      value={content.cardPhysicalTitle}
                      onChange={(e) => handleUpdateContent('cardPhysicalTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Descrição"
                      value={content.cardPhysicalDesc}
                      onChange={(e) => handleUpdateContent('cardPhysicalDesc', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300"
                    />
                    <input
                      type="text"
                      placeholder="Texto do Botão"
                      value={content.cardPhysicalButton}
                      onChange={(e) => handleUpdateContent('cardPhysicalButton', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-amber-500/60 text-white font-extrabold"
                    />
                  </div>

                  {/* Card 2: Dor de Problema */}
                  <div className="space-y-1.5 p-2 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[11px] font-bold text-amber-400 block">Card 2: Dor de Problema</span>
                    <input
                      type="text"
                      placeholder="Título"
                      value={content.cardProblemTitle}
                      onChange={(e) => handleUpdateContent('cardProblemTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Descrição"
                      value={content.cardProblemDesc}
                      onChange={(e) => handleUpdateContent('cardProblemDesc', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300"
                    />
                    <input
                      type="text"
                      placeholder="Texto do Botão"
                      value={content.cardProblemButton}
                      onChange={(e) => handleUpdateContent('cardProblemButton', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-amber-500/60 text-white font-extrabold"
                    />
                  </div>
                </div>

                {/* Search Bar Texts */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Barra de Emergências / Busca
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Título da Busca"
                      value={content.searchTitle}
                      onChange={(e) => handleUpdateContent('searchTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Texto do Botão"
                      value={content.searchButtonText}
                      onChange={(e) => handleUpdateContent('searchButtonText', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. BOTÕES TAB */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                {/* Button Dimensions */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Dimensões e Proporções dos Botões
                  </span>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Altura do Botão:</span>
                      <strong className="text-white font-mono">{t.buttons.height} px</strong>
                    </div>
                    <input
                      type="range"
                      min={44}
                      max={64}
                      value={t.buttons.height}
                      onChange={(e) => handleUpdateButtons('height', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Arredondamento (Radius):</span>
                      <strong className="text-white font-mono">{t.buttons.borderRadius} px</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={32}
                      value={t.buttons.borderRadius}
                      onChange={(e) => handleUpdateButtons('borderRadius', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Tamanho da Fonte:</span>
                      <strong className="text-white font-mono">{t.typography.buttonTextSize} px</strong>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={t.typography.buttonTextSize}
                      onChange={(e) => handleUpdateTypo('buttonTextSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Button Alignment */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Alinhamento do Botão nos Cards
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'stretch', label: 'Largura Total' },
                      { id: 'left', label: 'À Esquerda' },
                      { id: 'center', label: 'Ao Centro' },
                      { id: 'right', label: 'À Direita' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => handleUpdatePosition('buttonsAlign', btn.id)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          (t.buttons.alignment || positions.buttonsAlign || 'stretch') === btn.id
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Colors */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Cores do Botão
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Fundo</label>
                      <input
                        type="color"
                        value={t.colors.buttonBackground}
                        onChange={(e) =>
                          updateLiveTheme((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, buttonBackground: e.target.value },
                          }))
                        }
                        className="w-full h-8 rounded-lg bg-stone-950 border border-stone-700 cursor-pointer p-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Texto</label>
                      <input
                        type="color"
                        value={t.colors.buttonText}
                        onChange={(e) =>
                          updateLiveTheme((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, buttonText: e.target.value },
                          }))
                        }
                        className="w-full h-8 rounded-lg bg-stone-950 border border-stone-700 cursor-pointer p-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Hover</label>
                      <input
                        type="color"
                        value={t.colors.buttonHoverBackground}
                        onChange={(e) =>
                          updateLiveTheme((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, buttonHoverBackground: e.target.value },
                          }))
                        }
                        className="w-full h-8 rounded-lg bg-stone-950 border border-stone-700 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FONTES TAB */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Tamanhos das Fontes na Tela
                  </span>

                  {/* Title Desktop Size */}
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Título Principal (Desktop):</span>
                      <strong className="text-white font-mono">{t.typography.titleDesktopSize} px</strong>
                    </div>
                    <input
                      type="range"
                      min={32}
                      max={84}
                      value={t.typography.titleDesktopSize}
                      onChange={(e) => handleUpdateTypo('titleDesktopSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Subtitle Size */}
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Subtítulo:</span>
                      <strong className="text-white font-mono">{t.typography.subtitleDesktopSize} px</strong>
                    </div>
                    <input
                      type="range"
                      min={14}
                      max={36}
                      value={t.typography.subtitleDesktopSize}
                      onChange={(e) => handleUpdateTypo('subtitleDesktopSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Card Title Size */}
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Títulos dos Cards:</span>
                      <strong className="text-white font-mono">{t.typography.cardTitleSize} px</strong>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={36}
                      value={t.typography.cardTitleSize}
                      onChange={(e) => handleUpdateTypo('cardTitleSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Card Text Size */}
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Descrições dos Cards:</span>
                      <strong className="text-white font-mono">{t.typography.cardTextSize} px</strong>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={22}
                      value={t.typography.cardTextSize}
                      onChange={(e) => handleUpdateTypo('cardTextSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Button Text Size */}
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Fonte do Botão:</span>
                      <strong className="text-white font-mono">{t.typography.buttonTextSize} px</strong>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={t.typography.buttonTextSize}
                      onChange={(e) => handleUpdateTypo('buttonTextSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Header Logo Size */}
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Logo do Cabeçalho:</span>
                      <strong className="text-white font-mono">{t.typography.headerLogoSize || 14} px</strong>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={t.typography.headerLogoSize || 14}
                      onChange={(e) => handleUpdateTypo('headerLogoSize', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. POSIÇÕES DOS ELEMENTOS TAB */}
            {activeTab === 'positions' && (
              <div className="space-y-4">
                {/* Hero Alignment */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Alinhamento do Título / Hero
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', label: 'À Esquerda' },
                      { id: 'center', label: 'Centralizado' },
                      { id: 'right', label: 'À Direita' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleUpdatePosition('heroAlign', h.id)}
                        className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          positions.heroAlign === h.id
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Order */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Ordem Geral das Seções na Página
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'hero_cards_search', label: '1. Apresentação (Hero) ➔ 2. Cards ➔ 3. Busca' },
                      { id: 'hero_search_cards', label: '1. Apresentação (Hero) ➔ 2. Busca ➔ 3. Cards' },
                      { id: 'search_hero_cards', label: '1. Busca no Topo ➔ 2. Apresentação ➔ 3. Cards' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleUpdatePosition('sectionOrder', s.id)}
                        className={`w-full text-left py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                          (positions.sectionOrder || 'hero_cards_search') === s.id
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        <span>{s.label}</span>
                        {(positions.sectionOrder || 'hero_cards_search') === s.id && (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards Order */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Ordem de Exibição dos Cards
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdatePosition('cardsOrder', 'physical_first')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        (positions.cardsOrder || 'physical_first') === 'physical_first'
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      1º Corpo & Saúde
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePosition('cardsOrder', 'problem_first')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        positions.cardsOrder === 'problem_first'
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      1º Vida & Rotina
                    </button>
                  </div>
                </div>

                {/* Cards Layout */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Disposição dos Cards
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdatePosition('cardsLayout', 'grid')}
                      className={`py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        positions.cardsLayout === 'grid'
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      Lado a Lado (Grid)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePosition('cardsLayout', 'stack')}
                      className={`py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        positions.cardsLayout === 'stack'
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      Empilhados (Vertical)
                    </button>
                  </div>
                </div>

                {/* Header Layout */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Disposição do Cabeçalho
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', label: 'Padrão' },
                      { id: 'centered', label: 'Centralizado' },
                      { id: 'minimal', label: 'Minimal' },
                    ].map((hl) => (
                      <button
                        key={hl.id}
                        type="button"
                        onClick={() => handleUpdatePosition('headerLayout', hl.id)}
                        className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
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

                {/* Max Width & Spacings */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Largura e Espaçamentos
                  </span>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Largura Máxima do Conteúdo:</span>
                      <strong className="text-white font-mono">{t.layout.maxWidth} px</strong>
                    </div>
                    <input
                      type="range"
                      min={720}
                      max={1200}
                      step={10}
                      value={t.layout.maxWidth}
                      onChange={(e) =>
                        updateLiveTheme((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, maxWidth: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Espaçamento do Topo:</span>
                      <strong className="text-white font-mono">{t.layout.topSpacing} px</strong>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={80}
                      value={t.layout.topSpacing}
                      onChange={(e) =>
                        updateLiveTheme((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, topSpacing: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Espaçamento do Hero:</span>
                      <strong className="text-white font-mono">{t.layout.heroSpacing} px</strong>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={72}
                      value={t.layout.heroSpacing}
                      onChange={(e) =>
                        updateLiveTheme((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, heroSpacing: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Espaço entre os Cards:</span>
                      <strong className="text-white font-mono">{t.layout.cardGap} px</strong>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={36}
                      value={t.layout.cardGap}
                      onChange={(e) =>
                        updateLiveTheme((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, cardGap: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. CORES TAB */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {/* Palettes Presets */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Paletas Rápidas Prontas
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        name: 'Âmbar Clássico',
                        bg: '#fafaf9',
                        accent: '#f59e0b',
                        btnBg: '#0c0a09',
                        text: '#0c0a09',
                      },
                      {
                        name: 'Esmeralda Vital',
                        bg: '#f8fafc',
                        accent: '#10b981',
                        btnBg: '#0f172a',
                        text: '#0f172a',
                      },
                      {
                        name: 'Índigo Moderno',
                        bg: '#f8fafc',
                        accent: '#6366f1',
                        btnBg: '#312e81',
                        text: '#1e1b4b',
                      },
                      {
                        name: 'Minimalista Neutro',
                        bg: '#ffffff',
                        accent: '#18181b',
                        btnBg: '#18181b',
                        text: '#18181b',
                      },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          updateLiveTheme((prev) => ({
                            ...prev,
                            colors: {
                              ...prev.colors,
                              background: p.bg,
                              accent: p.accent,
                              buttonBackground: p.btnBg,
                              textPrimary: p.text,
                            },
                          }))
                        }
                        className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 text-left transition-all cursor-pointer flex items-center gap-2"
                      >
                        <div className="flex gap-1">
                          <span className="w-3 h-3 rounded-full border border-stone-700" style={{ backgroundColor: p.bg }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.btnBg }} />
                        </div>
                        <span className="text-[11px] font-bold text-stone-200">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Color Pickers */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Editar Cores dos Elementos ao Vivo
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'background', label: 'Fundo da Página' },
                      { key: 'cardBackground', label: 'Fundo dos Cards' },
                      { key: 'accent', label: 'Cor de Destaque / Acento' },
                      { key: 'buttonBackground', label: 'Fundo dos Botões' },
                      { key: 'buttonText', label: 'Texto dos Botões' },
                      { key: 'textPrimary', label: 'Texto Principal' },
                      { key: 'textSecondary', label: 'Texto Secundário' },
                      { key: 'border', label: 'Bordas e Divisórias' },
                      { key: 'badgeBackground', label: 'Fundo dos Badges' },
                      { key: 'badgeText', label: 'Texto dos Badges' },
                      { key: 'iconBoxBackground', label: 'Fundo do Ícone' },
                      { key: 'iconColor', label: 'Cor do Ícone' },
                    ].map((item) => {
                      const colorVal = (t.colors as any)[item.key] || '#000000';
                      return (
                        <div key={item.key} className="space-y-1">
                          <label className="text-[10px] text-stone-400 block font-bold truncate">
                            {item.label}
                          </label>
                          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-950 border border-stone-800">
                            <input
                              type="color"
                              value={colorVal.startsWith('#') ? colorVal : '#000000'}
                              onChange={(e) => handleUpdateColors(item.key, e.target.value)}
                              className="w-7 h-7 rounded border-0 p-0 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={colorVal}
                              onChange={(e) => handleUpdateColors(item.key, e.target.value)}
                              className="w-full text-[11px] font-mono font-bold text-white bg-transparent border-0 focus:outline-none uppercase"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6. VISIBILIDADE DOS ELEMENTOS TAB */}
            {activeTab === 'visibility' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-[11px] text-stone-300">
                    Oculte ou exiba qualquer elemento da página instantaneamente (botões admin, mascotes, cards, ícones, etc). As alterações são refletidas ao vivo na tela.
                  </p>
                </div>

                {/* 1. Botões & Acesso Admin */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    🛡️ Acesso & Botões Administrativos
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: 'showHeaderAdminBtn', label: 'Botão "Admin" no Cabeçalho do Topo' },
                      { key: 'showFloatingAdminWidget', label: 'Botões Flutuantes no Canto da Tela (Editar / Mascotes)' },
                    ].map((item) => {
                      const isVisible = (visibility as any)[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition-colors"
                        >
                          <span className="text-[11px] font-semibold text-stone-300">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVisibility(item.key, !isVisible)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mascotes & Elementos Gráficos */}
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/50 space-y-2.5">
                  <span className="font-extrabold text-purple-300 block uppercase tracking-wider text-[11px]">
                    🐾 Mascotes & Elementos Gráficos
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: 'showMascotsGlobal', label: 'Chave Mestre: Todos os Mascotes do App' },
                      { key: 'showMascotHero', label: 'Mascote Principal no Topo ("Pai" centralizado)' },
                      { key: 'showMascotCards', label: 'Mascotes Ilustrativos nos Cards de Entrada' },
                      { key: 'showMascotAudioModal', label: 'Mascote Ouvinte no Modal de Voz' },
                    ].map((item) => {
                      const isVisible = (visibility as any)[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-purple-900/40 hover:border-purple-750 transition-colors"
                        >
                          <span className="text-[11px] font-semibold text-stone-300">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVisibility(item.key, !isVisible)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Cabeçalho */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    🏷️ Cabeçalho & Menu Superior
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: 'showHeaderBrand', label: 'Logo / Marca no Topo' },
                      { key: 'showHeaderBadge', label: 'Tag / Badge "Sem cadastro"' },
                      { key: 'showHeaderSupplierBtn', label: 'Botão "Área do Fornecedor"' },
                    ].map((item) => {
                      const isVisible = (visibility as any)[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition-colors"
                        >
                          <span className="text-[11px] font-semibold text-stone-300">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVisibility(item.key, !isVisible)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Hero / Apresentação */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    ✨ Seção Principal (Hero)
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: 'showHeroBadge', label: 'Badge de Resposta Imediata' },
                      { key: 'showHeroTitle', label: 'Título Principal ("QUAL É A SUA DOR?")' },
                      { key: 'showHeroSubtitle', label: 'Subtítulo Conversacional' },
                    ].map((item) => {
                      const isVisible = (visibility as any)[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition-colors"
                        >
                          <span className="text-[11px] font-semibold text-stone-300">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVisibility(item.key, !isVisible)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Cards de Ação */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    🎴 Cards e Botões de Entrada
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: 'showCardPhysical', label: 'Card Completo: Corpo & Saúde' },
                      { key: 'showCardPhysicalIcon', label: 'Ícone Gráfico do Card Corpo & Saúde' },
                      { key: 'showCardPhysicalBadge', label: 'Badge do Card Corpo & Saúde' },
                      { key: 'showCardPhysicalButton', label: 'Botão do Card Corpo & Saúde' },
                      { key: 'showCardProblem', label: 'Card Completo: Vida & Rotina' },
                      { key: 'showCardProblemIcon', label: 'Ícone Gráfico do Card Vida & Rotina' },
                      { key: 'showCardProblemBadge', label: 'Badge do Card Vida & Rotina' },
                      { key: 'showCardProblemButton', label: 'Botão do Card Vida & Rotina' },
                    ].map((item) => {
                      const isVisible = (visibility as any)[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition-colors"
                        >
                          <span className="text-[11px] font-semibold text-stone-300">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVisibility(item.key, !isVisible)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Busca, Áudio e Rodapé */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    🎙️ Busca, Áudio & Rodapé
                  </span>
                  <div className="space-y-2">
                    {[
                      { key: 'showSearchSection', label: 'Seção de Busca de Emergências' },
                      { key: 'showAudioInputButton', label: 'Botões de Gravação de Áudio & Voz' },
                      { key: 'showSearchChips', label: 'Botões / Tags de Casos Rápidos' },
                      { key: 'showFooterNotice', label: 'Aviso de Confiança no Rodapé' },
                      { key: 'showFooterSection', label: 'Seção Completa do Rodapé' },
                    ].map((item) => {
                      const isVisible = (visibility as any)[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition-colors"
                        >
                          <span className="text-[11px] font-semibold text-stone-300">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVisibility(item.key, !isVisible)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 7. LOGO & ANIMAÇÃO TAB */}
            {activeTab === 'herologo' && (
              <HeroLogoEditor
                heroLogo={heroLogo}
                onChange={handleUpdateHeroLogo}
                onOpenMascotUpload={() => setIsMascotModalOpen(true)}
              />
            )}

            {/* 8. ESPAÇAMENTOS TAB (AO VIVO NO SITE) */}
            {activeTab === 'spacing' && (
              <div className="space-y-4">
                {/* Presets Rápidos */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2.5">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Presets Prontos em 1 Clique
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateLayout('topSpacing', 24);
                        handleUpdateLayout('heroSpacing', 20);
                        handleUpdateLayout('searchSpacing', 18);
                        handleUpdateLayout('cardGap', 14);
                        handleUpdateLayout('cardPadding', 20);
                        handleUpdateLayout('maxWidth', 860);
                      }}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-left transition-all cursor-pointer"
                    >
                      <span className="text-sm">⚡</span>
                      <div className="text-[11px] font-bold text-white mt-1">Compacto</div>
                      <div className="text-[9px] text-stone-400">Sem rolar</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateLayout('topSpacing', 44);
                        handleUpdateLayout('heroSpacing', 32);
                        handleUpdateLayout('searchSpacing', 24);
                        handleUpdateLayout('cardGap', 20);
                        handleUpdateLayout('cardPadding', 26);
                        handleUpdateLayout('maxWidth', 920);
                      }}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-left transition-all cursor-pointer"
                    >
                      <span className="text-sm">🎯</span>
                      <div className="text-[11px] font-bold text-white mt-1">Equilibrado</div>
                      <div className="text-[9px] text-stone-400">Recomendado</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateLayout('topSpacing', 32);
                        handleUpdateLayout('heroSpacing', 26);
                        handleUpdateLayout('searchSpacing', 20);
                        handleUpdateLayout('cardGap', 16);
                        handleUpdateLayout('cardPadding', 24);
                        handleUpdateLayout('maxWidth', 980);
                      }}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-left transition-all cursor-pointer"
                    >
                      <span className="text-sm">💼</span>
                      <div className="text-[11px] font-bold text-white mt-1">Executivo</div>
                      <div className="text-[9px] text-stone-400">Mais largo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateLayout('topSpacing', 64);
                        handleUpdateLayout('heroSpacing', 44);
                        handleUpdateLayout('searchSpacing', 32);
                        handleUpdateLayout('cardGap', 28);
                        handleUpdateLayout('cardPadding', 34);
                        handleUpdateLayout('maxWidth', 1040);
                      }}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-left transition-all cursor-pointer"
                    >
                      <span className="text-sm">🌿</span>
                      <div className="text-[11px] font-bold text-white mt-1">Arejado</div>
                      <div className="text-[9px] text-stone-400">Espaçoso</div>
                    </button>
                  </div>
                </div>

                {/* Distâncias Verticais */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Alturas & Respiros Verticais
                  </span>

                  {/* Top Spacing */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Topo da Página (Top Spacing)</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.topSpacing}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={8}
                        max={120}
                        step={2}
                        value={layout.topSpacing}
                        onChange={(e) => handleUpdateLayout('topSpacing', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('topSpacing', DEFAULT_THEME_LAYOUT.topSpacing)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Hero Spacing */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Espaço abaixo do Hero</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.heroSpacing}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={80}
                        step={2}
                        value={layout.heroSpacing}
                        onChange={(e) => handleUpdateLayout('heroSpacing', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('heroSpacing', DEFAULT_THEME_LAYOUT.heroSpacing)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Search Spacing */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Espaço abaixo da Busca</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.searchSpacing ?? 28}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={8}
                        max={64}
                        step={2}
                        value={layout.searchSpacing ?? 28}
                        onChange={(e) => handleUpdateLayout('searchSpacing', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('searchSpacing', DEFAULT_THEME_LAYOUT.searchSpacing ?? 28)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cards Spacing */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Espaçamento dos Cards de Ação
                  </span>

                  {/* Card Gap */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Separação entre os Cards (Gap)</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.cardGap}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={8}
                        max={60}
                        step={2}
                        value={layout.cardGap}
                        onChange={(e) => handleUpdateLayout('cardGap', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('cardGap', DEFAULT_THEME_LAYOUT.cardGap)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Card Padding */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Preenchimento Interno (Padding)</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.cardPadding}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={14}
                        max={56}
                        step={2}
                        value={layout.cardPadding}
                        onChange={(e) => handleUpdateLayout('cardPadding', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('cardPadding', DEFAULT_THEME_LAYOUT.cardPadding)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Card Content Gap */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Respiro Interno dos Elementos</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.cardContentGap ?? 16}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={8}
                        max={36}
                        step={2}
                        value={layout.cardContentGap ?? 16}
                        onChange={(e) => handleUpdateLayout('cardContentGap', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('cardContentGap', DEFAULT_THEME_LAYOUT.cardContentGap ?? 16)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Largura da Tela & Mobile */}
                <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3">
                  <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[11px]">
                    Largura Máxima & Celular
                  </span>

                  {/* Max Width */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-300 font-bold">Largura Máxima Central (Max-Width)</span>
                      <span className="font-mono text-amber-400 font-bold">{layout.maxWidth}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={720}
                        max={1300}
                        step={10}
                        value={layout.maxWidth}
                        onChange={(e) => handleUpdateLayout('maxWidth', Number(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLayout('maxWidth', DEFAULT_THEME_LAYOUT.maxWidth)}
                        className="text-[10px] text-stone-500 hover:text-white px-1.5 py-0.5 rounded bg-stone-800 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Mobile Adaptive */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white">Compressão Automática Mobile</div>
                      <div className="text-[9px] text-stone-400">Ajusta 30% em smartphones</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateLayout('mobileAdaptive', !layout.mobileAdaptive)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        layout.mobileAdaptive !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {layout.mobileAdaptive !== false ? 'Ativado' : 'Desativado'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dock Bottom Action Footer */}
          <div className="p-3.5 border-t border-stone-800 bg-stone-900/90 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDiscard}
                title="Descartar e voltar ao tema ativo publicado"
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Descartar</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Rascunho</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {saveStatus && (
                <span className="text-[11px] font-bold text-amber-400 animate-pulse truncate">
                  {saveStatus}
                </span>
              )}
              <button
                type="button"
                onClick={handlePublish}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>PUBLICAR AO VIVO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento e Upload de Mascotes */}
      <AdminMascotModal
        isOpen={isMascotModalOpen}
        onClose={() => setIsMascotModalOpen(false)}
      />
    </>
  );
};
