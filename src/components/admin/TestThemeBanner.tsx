import React from 'react';
import { useTheme } from '../../modules/theme/ThemeContext';
import { Eye, Send, ArrowLeft, X, Sparkles } from 'lucide-react';

interface TestThemeBannerProps {
  onReturnToAdmin: () => void;
}

export const TestThemeBanner: React.FC<TestThemeBannerProps> = ({ onReturnToAdmin }) => {
  const { testTheme, setTestTheme, publishTheme } = useTheme();

  if (!testTheme) return null;

  const handlePublishNow = async () => {
    if (window.confirm(`Deseja publicar o tema "${testTheme.name}" agora para todos os visitantes do site?`)) {
      await publishTheme(testTheme);
      setTestTheme(null);
    }
  };

  const handleExitTest = () => {
    setTestTheme(null);
  };

  return (
    <aside
      id="test-theme-banner"
      className="sticky top-0 z-50 bg-amber-500 text-stone-950 px-3 sm:px-4 py-2 shadow-md flex flex-wrap items-center justify-between gap-2 border-b border-amber-600/40 select-none animate-in slide-in-from-top duration-200"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="p-1 rounded-md bg-stone-950 text-amber-400 font-bold shrink-0">
          <Eye className="w-3.5 h-3.5" />
        </span>
        <div className="leading-tight">
          <span className="font-extrabold uppercase tracking-wide mr-1.5">
            Modo de Teste:
          </span>
          <span className="font-medium">
            Você está visualizando <strong className="font-extrabold">"{testTheme.name}"</strong>. Os visitantes públicos continuam vendo o tema publicado.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onReturnToAdmin}
          className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-900 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Voltar ao Admin</span>
        </button>

        <button
          type="button"
          onClick={handlePublishNow}
          className="px-2.5 py-1 rounded-lg bg-stone-950 text-white hover:bg-stone-900 text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Send className="w-3 h-3 text-amber-400" />
          <span>Publicar Este Tema</span>
        </button>

        <button
          type="button"
          onClick={handleExitTest}
          title="Sair do modo de teste"
          className="p-1 rounded-lg text-stone-900 hover:text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
