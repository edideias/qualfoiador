import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../modules/theme/ThemeContext';
import { getThemeHeroLogo, ThemeHeroLogo } from '../../modules/theme/types';
import { HeroLogoEditor } from './HeroLogoEditor';
import {
  MascotCharacter,
  MASCOT_REGISTRY,
  getStoredMascots,
  saveStoredMascots,
  resetSingleStoredMascot,
  resetStoredMascots,
} from '../../modules/mascot/mascotAssets';
import {
  Sparkles,
  Upload,
  RotateCcw,
  Check,
  X,
  Image as ImageIcon,
  Link,
  Info,
  Layers,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface AdminMascotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMascotModal: React.FC<AdminMascotModalProps> = ({ isOpen, onClose }) => {
  const { effectiveTheme, updateLiveTheme } = useTheme();
  const heroLogo = getThemeHeroLogo(effectiveTheme);
  const [mascots, setMascots] = useState<Record<string, MascotCharacter>>(() => getStoredMascots());
  const [selectedKey, setSelectedKey] = useState<string>('paiHero');
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateHeroLogo = (updated: ThemeHeroLogo) => {
    updateLiveTheme((prev) => ({
      ...prev,
      heroLogo: updated,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      const current = getStoredMascots();
      setMascots(current);
      const urls: Record<string, string> = {};
      Object.entries(current).forEach(([k, v]) => {
        urls[k] = v.defaultSrc;
      });
      setUrlInputs(urls);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleFileUpload = (key: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor envie um arquivo de imagem válido (PNG, JPG, WebP, SVG).', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        const target = mascots[key] || MASCOT_REGISTRY[key];
        const updated = {
          ...mascots,
          [key]: {
            ...target,
            defaultSrc: result,
          },
        };
        setMascots(updated);
        showToast(`Salvando e fixando ${target?.name || key} no servidor...`, 'info');
        const persisted = await saveStoredMascots(updated);
        if (persisted) {
          setMascots(persisted);
        }
        setUrlInputs((prev) => ({ ...prev, [key]: result.substring(0, 45) + '... (base64)' }));
        showToast(`🔒 ${target?.name || key} fixado com sucesso no servidor!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (key: string, url: string) => {
    setUrlInputs((prev) => ({ ...prev, [key]: url }));
  };

  const handleApplyUrl = async (key: string) => {
    const url = urlInputs[key]?.trim();
    if (!url) return;

    const target = mascots[key] || MASCOT_REGISTRY[key];
    const updated = {
      ...mascots,
      [key]: {
        ...target,
        defaultSrc: url,
      },
    };
    setMascots(updated);
    showToast(`Salvando e fixando no servidor...`, 'info');
    const persisted = await saveStoredMascots(updated);
    if (persisted) {
      setMascots(persisted);
    }
    showToast(`🔒 URL de ${target?.name || key} fixada com sucesso!`, 'success');
  };

  const handleResetSingle = async (key: string) => {
    const defaultVal = MASCOT_REGISTRY[key];
    if (!defaultVal) return;

    await resetSingleStoredMascot(key);
    setMascots((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return { ...MASCOT_REGISTRY, ...copy };
    });
    setUrlInputs((prev) => ({ ...prev, [key]: defaultVal.defaultSrc }));
    showToast(`${defaultVal.name} restaurado para o padrão original.`, 'info');
  };

  const handleResetAll = async () => {
    if (window.confirm('Deseja realmente restaurar todos os 10 mascotes para os padrões originais?')) {
      await resetStoredMascots();
      setMascots({ ...MASCOT_REGISTRY });
      const urls: Record<string, string> = {};
      Object.entries(MASCOT_REGISTRY).forEach(([k, v]) => {
        urls[k] = v.defaultSrc;
      });
      setUrlInputs(urls);
      showToast('Todos os mascotes foram resetados para o padrão original.', 'info');
    }
  };

  const activeMascot = mascots[selectedKey] || MASCOT_REGISTRY[selectedKey] || MASCOT_REGISTRY.paiHero;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 border border-purple-500/30 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                  Gerenciador de Mascotes do App
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  10 Personagens
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Insira, troque, configure e faça upload de imagens para cada mascote do sistema em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              title="Restaurar todos os 10 mascotes para imagens padrão de fábrica"
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Restaurar Padrões</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shield Banner: Garantia de Fixação e Imunidade a Republicação */}
        <div className="px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold">
              Fixação Definitiva Ativa: As alterações aqui são gravadas de forma permanente no servidor e blindadas contra qualquer republicação de tema ou atualização do app.
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
            Blindado
          </span>
        </div>

        {/* Feedback Toast */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/20'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-b border-purple-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Content Body: Left Column (List of 10 Mascots) + Right Column (Active Editor) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Left Column: Mascot Cards Grid */}
          <div className="md:col-span-5 p-3 sm:p-4 overflow-y-auto space-y-2 bg-zinc-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Selecione o Mascote para Editar
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                {Object.keys(MASCOT_REGISTRY).length} posições disponíveis
              </span>
            </div>

            {Object.entries(MASCOT_REGISTRY).map(([key, defaultChar], idx) => {
              const current = mascots[key] || defaultChar;
              const isSelected = selectedKey === key;
              const isPaiHero = key === 'paiHero';

              return (
                <div
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-800'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl bg-white border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                    <img
                      src={current.defaultSrc}
                      alt={current.name}
                      className="w-full h-full object-contain p-0.5"
                      onError={(e) => {
                        if (current.fallbackSrc) {
                          (e.target as HTMLImageElement).src = current.fallbackSrc;
                        }
                      }}
                    />
                    {isPaiHero && (
                      <span className="absolute -top-1 -right-1 px-1 rounded-sm bg-purple-600 text-[8px] font-black text-white">
                        ★ PAI
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {idx + 1}. {current.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {isPaiHero ? '🌟 Principal: acima de "Qual a sua dor?"' : current.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Editor for Selected Mascot */}
          <div className="md:col-span-7 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between bg-white dark:bg-zinc-900">
            <div className="space-y-5">
              {/* Active Mascot Header Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-2 border-purple-500/40 shadow-lg shadow-purple-500/10 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={activeMascot.defaultSrc}
                    alt={activeMascot.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      if (activeMascot.fallbackSrc) {
                        (e.target as HTMLImageElement).src = activeMascot.fallbackSrc;
                      }
                    }}
                  />
                  {selectedKey === 'paiHero' && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-purple-600 text-[9px] font-black text-white">
                      Mascote Pai (Grande no Topo)
                    </span>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 mb-1 border border-purple-200 dark:border-purple-800">
                    Posição: {activeMascot.context}
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    {activeMascot.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {activeMascot.description}
                  </p>

                  {selectedKey === 'paiHero' && (
                    <div className="mt-2.5 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Este é o mascote principal que fica em destaque grande no centro da tela inicial!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Section: Drag & Drop or Click */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  1. Fazer Upload de Imagem (PNG, JPG, WebP, SVG)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(selectedKey, e.dataTransfer.files[0]);
                    }
                  }}
                  className="p-6 border-2 border-dashed border-purple-500/30 hover:border-purple-500 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/10 group-hover:bg-purple-600/20 text-purple-600 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Clique aqui ou arraste um arquivo de imagem
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      A imagem será gravada instantaneamente e exibida no app
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(selectedKey, e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* URL or Local Path Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  2. Ou Inserir Caminho / URL da Imagem
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={urlInputs[selectedKey] || ''}
                      onChange={(e) => handleUrlChange(selectedKey, e.target.value)}
                      placeholder="/assets/characters/meu_mascote.jpg ou https://..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyUrl(selectedKey)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar URL</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Exemplos: <code className="text-purple-600 dark:text-purple-400">/suador1.png</code>,{' '}
                  <code className="text-purple-600 dark:text-purple-400">/assets/characters/mascot_pai_hero.jpg</code>
                </p>
              </div>

              {/* Se for o Mascote Pai (Hero), permite configurar quadro, tamanho e movimentos independentemente */}
              {selectedKey === 'paiHero' && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Quadro, Tamanho & Animação da Logo/Mascote</span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Deixe a imagem solta (sem quadrado) e ajuste o tamanho e movimentos de sobe e desce.
                      </p>
                    </div>
                  </div>

                  <HeroLogoEditor
                    heroLogo={heroLogo}
                    onChange={handleUpdateHeroLogo}
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions for Selected Mascot */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => handleResetSingle(selectedKey)}
                className="px-3 py-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão Deste Mascote</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Concluir e Ver no App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
