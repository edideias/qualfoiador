import React, { useState, useEffect } from 'react';
import { ThemeHistoryEntry } from '../../modules/theme/types';
import { themeService } from '../../modules/theme/themeService';
import { History, RotateCcw, CheckCircle, Clock, User, Sparkles, Loader2 } from 'lucide-react';

interface ThemeHistoryViewProps {
  onRestore: (historyId: string) => Promise<void>;
}

export const ThemeHistoryView: React.FC<ThemeHistoryViewProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<ThemeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await themeService.adminFetchThemeData();
      setHistory(data.history || []);
    } catch (err) {
      console.warn('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRestore = async (id: string) => {
    if (!window.confirm('Deseja realmente restaurar esta versão histórica do tema para o site público?')) {
      return;
    }
    setRestoringId(id);
    try {
      await onRestore(id);
      await loadHistory();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div id="theme-history-section" className="space-y-6">
      <div className="pb-3 border-b border-stone-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Histórico de Versões Publicadas</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Todas as publicações do tema são registradas com data, hora e dados do administrador.
          </p>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 transition-colors cursor-pointer"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Carregando histórico...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 rounded-2xl bg-stone-900/40 border border-stone-800 text-center text-xs text-stone-400">
          Nenhuma versão foi arquivada ainda. Ao clicar em “Publicar Tema Oficial”, ela aparecerá aqui.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, idx) => {
            const isCurrentlyActive = entry.status === 'active';
            const formattedDate = new Date(entry.publishedAt).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrentlyActive
                    ? 'border-amber-500/80 bg-stone-900/90 ring-1 ring-amber-500/30'
                    : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{entry.themeName}</span>
                    {isCurrentlyActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Versão Ativa no Ar
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      {entry.publishedBy}
                    </span>
                    <span className="font-mono text-stone-500">
                      Fonte: {entry.config.typography.headingFont}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!isCurrentlyActive && (
                    <button
                      type="button"
                      disabled={restoringId === entry.id}
                      onClick={() => handleRestore(entry.id)}
                      className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {restoringId === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Restaurar esta versão</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
