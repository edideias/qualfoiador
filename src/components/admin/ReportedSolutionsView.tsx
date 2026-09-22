import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Search,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface ReportedSolution {
  id: string;
  problemDescription: string;
  reportedSolution: {
    title?: string;
    primaryActionLabel?: string;
    searchQuery?: string;
    fullSummary?: string;
  };
  issueType: 'fanciful' | 'unfeasible' | 'unrelated' | 'wrong_service' | 'other';
  issueLabel: string;
  userComment: string;
  suggestedCorrection?: string;
  locationInfo?: string;
  createdAt: string;
  status: 'pending' | 'reviewed';
}

export const ReportedSolutionsView: React.FC = () => {
  const [reports, setReports] = useState<ReportedSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback/reported-solutions');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error('Erro ao carregar reportes:', e);
      // Fallback local caso offline
      try {
        const local = JSON.parse(localStorage.getItem('reported_solutions_offline_queue') || '[]');
        setReports(local);
      } catch {
        setReports([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: 'pending' | 'reviewed') => {
    const newStatus = currentStatus === 'pending' ? 'reviewed' : 'pending';
    try {
      const res = await fetch(`/api/feedback/reported-solutions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setActionSuccess(`Relatório marcado como ${newStatus === 'reviewed' ? 'revisado' : 'pendente'}.`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error('Erro ao atualizar status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente remover este registro de erro?')) return;
    try {
      const res = await fetch(`/api/feedback/reported-solutions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        setActionSuccess('Registro removido com sucesso.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error('Erro ao deletar:', e);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.issueType !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const inDesc = r.problemDescription.toLowerCase().includes(q);
      const inComment = (r.userComment || '').toLowerCase().includes(q);
      const inSol = (r.reportedSolution.title || '').toLowerCase().includes(q);
      const inCorrection = (r.suggestedCorrection || '').toLowerCase().includes(q);
      if (!inDesc && !inComment && !inSol && !inCorrection) return false;
    }
    return true;
  });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'fanciful':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'unfeasible':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unrelated':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'wrong_service':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER DA SEÇÃO */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-neutral-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Soluções Reportadas pelos Usuários</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {reports.filter((r) => r.status === 'pending').length} Pendentes
              </span>
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Feedbacks de usuários que sinalizaram soluções fantasiosas, inviáveis ou que não correspondem à realidade. Use para refinar os prompts e regras de negócio.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors self-start cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {actionSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* FILTROS E BUSCA */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 border-t border-neutral-100">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por problema, comentário ou solução..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white font-medium text-neutral-700"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Apenas Pendentes</option>
              <option value="reviewed">Apenas Revisados</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white font-medium text-neutral-700"
            >
              <option value="all">Todos os Motivos</option>
              <option value="fanciful">Fantasiosa / Irreal</option>
              <option value="unfeasible">Inviável na Prática</option>
              <option value="unrelated">Não Corresponde</option>
              <option value="wrong_service">Serviço Errado</option>
              <option value="other">Outro</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE REGISTROS */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 font-medium">
          Carregando relatórios de inconsistências...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-neutral-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            Nenhum reporte encontrado
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Não há relatos de soluções fantasiosas ou inviáveis correspondentes aos filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((item) => {
            const isReviewed = item.status === 'reviewed';
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isReviewed
                    ? 'bg-neutral-50/70 border-neutral-200 opacity-75'
                    : 'bg-white border-neutral-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getBadgeColor(
                        item.issueType
                      )}`}
                    >
                      {item.issueLabel}
                    </span>

                    {isReviewed ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Revisado
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                        Pendente
                      </span>
                    )}

                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        isReviewed
                          ? 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                          : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {isReviewed ? 'Marcar Pendente' : 'Marcar como Revisado'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir reporte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CONTEÚDO COMPARATIVO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* LADO ESQUERDO: O QUE O USUÁRIO PEDIU E O QUE O APP DISSE */}
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Problema Original Informado:
                      </span>
                      <p className="text-neutral-900 font-bold mt-0.5">
                        “{item.problemDescription}”
                      </p>
                    </div>

                    {item.reportedSolution.title && (
                      <div className="pt-1.5 border-t border-neutral-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Solução dada pelo App:
                        </span>
                        <p className="text-neutral-700 font-medium">
                          {item.reportedSolution.title}
                        </p>
                        {item.reportedSolution.primaryActionLabel && (
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Botão: {item.reportedSolution.primaryActionLabel}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LADO DIREITO: O QUE O USUÁRIO REPORTOU */}
                  <div className="p-3 rounded-xl bg-red-50/40 border border-red-200 space-y-2">
                    {item.userComment ? (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                          Por que foi considerada inviável/fantasiosa:
                        </span>
                        <p className="text-red-950 font-medium mt-0.5">
                          “{item.userComment}”
                        </p>
                      </div>
                    ) : (
                      <p className="text-neutral-400 italic text-[11px]">
                        Nenhum comentário detalhado adicional informado.
                      </p>
                    )}

                    {item.suggestedCorrection && (
                      <div className="pt-1.5 border-t border-red-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Sugestão do Usuário para a Vida Real:
                        </span>
                        <p className="text-emerald-950 font-semibold mt-0.5">
                          “{item.suggestedCorrection}”
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
