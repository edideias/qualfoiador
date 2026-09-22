import React, { useState, useEffect } from 'react';
import {
  History,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
  Trash2,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppRoute, PhysicalPainRecord, ProblemPainRecord } from '../../types';
import { physicalPainService } from '../../modules/physical_pain/physicalPainStore';
import { problemPainService } from '../../modules/problem_pain/problemPainStore';
import { useTheme } from '../../modules/theme/ThemeContext';
import { TimeProcessingBadge } from '../TimeProcessingBadge';

interface PainHistoryViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const PainHistoryView: React.FC<PainHistoryViewProps> = ({ onNavigate }) => {
  const { effectiveTheme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'physical' | 'problem'>('all');
  const [physicalRecords, setPhysicalRecords] = useState<PhysicalPainRecord[]>([]);
  const [problemRecords, setProblemRecords] = useState<ProblemPainRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<{
    type: 'physical' | 'problem';
    data: PhysicalPainRecord | ProblemPainRecord;
  } | null>(null);

  useEffect(() => {
    setPhysicalRecords(physicalPainService.getRecords());
    setProblemRecords(problemPainService.getRecords());
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de dores avaliadas?')) {
      try {
        localStorage.removeItem('qual_e_a_sua_dor:physical_pain_records');
        localStorage.removeItem('qual_e_a_sua_dor:problem_pain_records');
        setPhysicalRecords([]);
        setProblemRecords([]);
        setSelectedRecord(null);
      } catch {
        // ignore
      }
    }
  };

  const handleOpenPhysicalResult = (rec: PhysicalPainRecord) => {
    physicalPainService.saveCurrentAssessment(rec.assessment);
    physicalPainService.saveCurrentAnalysis(rec.analysisResult);
    onNavigate('/dor-fisica/resultado');
  };

  const handleOpenProblemResult = (rec: ProblemPainRecord) => {
    problemPainService.saveCurrentAssessment(rec.assessment);
    problemPainService.saveCurrentAnalysis(rec.analysisResult);
    onNavigate('/dor-problema/resultado');
  };

  const totalCount = physicalRecords.length + problemRecords.length;

  // Unir e ordenar registros decrescente por data
  type UnifiedItem =
    | { type: 'physical'; date: Date; raw: PhysicalPainRecord }
    | { type: 'problem'; date: Date; raw: ProblemPainRecord };

  const unifiedList: UnifiedItem[] = [
    ...physicalRecords.map((r) => ({
      type: 'physical' as const,
      date: new Date(r.createdAt || 0),
      raw: r,
    })),
    ...problemRecords.map((r) => ({
      type: 'problem' as const,
      date: new Date(r.createdAt || 0),
      raw: r,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const filteredList = unifiedList.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-2">
            <History className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
            <span>REGISTRO PESSOAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            Histórico de Dores e Perrengues
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Reveja soluções anteriores, passos guiados e orientações de alívio salvas no seu dispositivo.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* Tabs Filtro */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Todas ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('physical')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'physical'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Dores Físicas ({physicalRecords.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('problem')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'problem'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Perrengues ({problemRecords.length})</span>
        </button>
      </div>

      {/* Lista de Registros */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
          <History className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Nenhum registro encontrado
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            Quando você descrever uma dor física ou um perrengue do dia a dia, ele aparecerá aqui com seu plano de ação para consulta rápida.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/dor-fisica')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Avaliar Dor Física
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/dor-problema')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Resolver Perrengue
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item, index) => {
            const isPhysical = item.type === 'physical';

            if (isPhysical) {
              const rec = item.raw as PhysicalPainRecord;
              const dateStr = new Date(rec.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rec.id || index}
                  onClick={() => handleOpenPhysicalResult(rec)}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300">
                          Dor Física
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <TimeProcessingBadge
                          estimatedMinutes={15}
                          type="alivio-imediato"
                          interactive={false}
                        />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {rec.assessment.location} (Intensidade {rec.assessment.intensity}/10)
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {rec.analysisResult.summaryParagraph || rec.assessment.initialDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Ver Solução</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            } else {
              const rec = item.raw as ProblemPainRecord;
              const dateStr = new Date(rec.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rec.id || index}
                  onClick={() => handleOpenProblemResult(rec)}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-300 dark:hover:border-amber-700/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          Perrengue
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <TimeProcessingBadge
                          estimatedMinutes={20}
                          type="curto-prazo"
                          interactive={false}
                        />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white group-hover:text-amber-600 transition-colors">
                        {rec.analysisResult.actionSolution?.bestOption?.title ||
                          rec.analysisResult.summaryDiscovery ||
                          rec.assessment.initialDescription}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {rec.analysisResult.summaryDiscovery}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Ver Solução</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};
