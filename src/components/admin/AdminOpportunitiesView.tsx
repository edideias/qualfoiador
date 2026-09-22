import React, { useState, useEffect } from 'react';
import {
  AdminOpportunityFunnel,
  CategoryPricingConfig,
  SupplierOpportunity,
  OpportunityStatus,
} from '../../types';
import { opportunityEngine } from '../../services/opportunityEngine';
import {
  TrendingUp,
  Target,
  Users,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Flame,
  ArrowRight,
  Filter,
  Save,
  Clock,
  MapPin,
  Star,
  RefreshCw,
} from 'lucide-react';

export const AdminOpportunitiesView: React.FC = () => {
  const [funnel, setFunnel] = useState<AdminOpportunityFunnel>(() => opportunityEngine.getFunnelMetrics());
  const [opportunities, setOpportunities] = useState<SupplierOpportunity[]>(() => opportunityEngine.getOpportunities());
  const [categoryPricing, setCategoryPricing] = useState<CategoryPricingConfig[]>(() => opportunityEngine.getCategoryPricing());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pricingSaved, setPricingSaved] = useState(false);

  const handleRefresh = () => {
    setFunnel(opportunityEngine.getFunnelMetrics());
    setOpportunities(opportunityEngine.getOpportunities());
    setCategoryPricing(opportunityEngine.getCategoryPricing());
  };

  const handleUpdatePrice = (category: string, newPrice: number) => {
    const updated = categoryPricing.map((c) =>
      c.category === category ? { ...c, baseLeadValue: newPrice } : c
    );
    setCategoryPricing(updated);
    opportunityEngine.saveCategoryPricing(updated);
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2500);
  };

  const filteredOpportunities = opportunities.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  // Calculate Monetization Projection
  const totalProjectedVolume = opportunities.reduce((acc, curr) => acc + (curr.leadValue || 0), 0);
  const resolvedCount = opportunities.filter(
    (o) => o.status === 'RESOLVIDA' || o.supplierFeedback?.servicoConcluido || o.userFeedback?.dorResolvida
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER: TITLE & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-neutral-900 tracking-tight">
              Máquina de Oportunidades & Funil de Resolução
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitoramento de ponta a ponta: da dor informada pelo usuário até a resolução concluída pelo fornecedor.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
          <span>Atualizar Métricas</span>
        </button>
      </div>

      {/* 17. MÉTRICA PRINCIPAL (TAXA DE RESOLUÇÃO) + CARDS CHAVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CARD PRINCIPAL: TAXA DE RESOLUÇÃO */}
        <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Métrica Mais Importante
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Meta ≥ 65%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {funnel.taxaResolucao}%
            </span>
            <span className="text-xs text-neutral-400 font-medium">Taxa de Resolução Real</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            {funnel.resolvidos} dores resolvidas com sucesso de um total de {funnel.doresInformadas} registradas.
          </p>
        </div>

        {/* CARD 2: OPORTUNIDADES GERADAS QUALIFICADAS */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Oportunidades Qualificadas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900">
              {funnel.oportunidadesGeradas}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              Score ≥ 60
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Separadas de buscas informativas / pesquisas sem intenção real.
          </p>
        </div>

        {/* CARD 3: TAXA DE ACEITAÇÃO DE FORNECEDORES */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Aceitação Fornecedores
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900">
              {funnel.fornecedoresNotificados > 0
                ? Math.round((funnel.fornecedoresAceitaram / funnel.fornecedoresNotificados) * 100)
                : 0}
              %
            </span>
            <span className="text-xs text-neutral-500">
              {funnel.fornecedoresAceitaram}/{funnel.fornecedoresNotificados} chamados
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Tempo médio de 1º aceite: <strong>3.8 minutos</strong>
          </p>
        </div>

        {/* CARD 4: PROJEÇÃO DE MONETIZAÇÃO */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Volume Projetado de Leads
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              R$ {totalProjectedVolume.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Arquitetura pronta para monetização sem cobrança ativa no momento.
          </p>
        </div>
      </div>

      {/* 16. O FUNIL COMPLETO DE CONVERSÃO DA DOR */}
      <section className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-neutral-600" />
            Funil de Conversão & Resolução de Dores
          </h3>
          <span className="text-xs text-neutral-500">8 Etapas Rastreadas</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-400">1. Dores</span>
            <p className="text-lg font-black text-neutral-900">{funnel.doresInformadas}</p>
            <span className="text-[10px] text-neutral-500">Informadas</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-400">2. Necessidades</span>
            <p className="text-lg font-black text-neutral-900">{funnel.necessidadesIdentificadas}</p>
            <span className="text-[10px] text-neutral-500">Reais</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700">3. Leads</span>
            <p className="text-lg font-black text-amber-950">{funnel.oportunidadesGeradas}</p>
            <span className="text-[10px] text-amber-800">Oportunidades</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-400">4. Notificados</span>
            <p className="text-lg font-black text-neutral-900">{funnel.fornecedoresNotificados}</p>
            <span className="text-[10px] text-neutral-500">Fornecedores</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-400">5. Aceites</span>
            <p className="text-lg font-black text-neutral-900">{funnel.fornecedoresAceitaram}</p>
            <span className="text-[10px] text-neutral-500">Chamados</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-400">6. Contatos</span>
            <p className="text-lg font-black text-neutral-900">{funnel.contatosRealizados}</p>
            <span className="text-[10px] text-neutral-500">Iniciados</span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700">7. Atendimentos</span>
            <p className="text-lg font-black text-blue-950">{funnel.atendimentosIniciados}</p>
            <span className="text-[10px] text-blue-800">Em curso</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
            <span className="text-[10px] uppercase font-black text-emerald-800">8. Resolvidos</span>
            <p className="text-lg font-black text-emerald-950">{funnel.resolvidos}</p>
            <span className="text-[10px] text-emerald-800 font-bold">Concluídos 🎉</span>
          </div>
        </div>
      </section>

      {/* 13. PREÇOS POR CATEGORIA (ARQUITETURA DE MONETIZAÇÃO FUTURA) */}
      <section className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Tabela de Precificação de Leads por Categoria (Preparação)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defina o valor médio estimado de cada oportunidade qualificada por setor para futuros modelos de cobrança.
            </p>
          </div>

          {pricingSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-fadeIn">
              Valores salvos!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {categoryPricing.map((cat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-neutral-900 leading-tight">{cat.category}</p>
                <p className="text-[10px] text-neutral-500">Comissão sugerida: {cat.suggestedCommissionPct}%</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-neutral-500 font-bold">R$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={cat.baseLeadValue}
                  onChange={(e) => handleUpdatePrice(cat.category, Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs font-bold rounded bg-white border border-neutral-300 text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARTEIRA COMPLETA DE OPORTUNIDADES GERADAS */}
      <section className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Feed de Oportunidades & Qualificação de Leads
            </h3>
            <p className="text-xs text-neutral-500">
              Exibindo histórico com pontuação de qualificação (Score 0-100) e feedbacks.
            </p>
          </div>

          {/* FILTRO DE STATUS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'NOVA', label: 'Novas' },
              { id: 'ACEITA', label: 'Aceitas' },
              { id: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
              { id: 'RESOLVIDA', label: 'Resolvidas' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200 hover:border-neutral-300 transition-colors space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge de Qualificação */}
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${
                        opp.qualificationLevel === 'OPORTUNIDADE_QUENTE'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : opp.qualificationLevel === 'NECESSIDADE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {opp.qualificationLevel === 'OPORTUNIDADE_QUENTE'
                        ? '🔴 QUENTE'
                        : opp.qualificationLevel === 'NECESSIDADE'
                        ? '🟠 NECESSIDADE'
                        : '🟢 PESQUISA'}
                    </span>

                    {/* Score */}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-neutral-800 border border-neutral-300">
                      Score: {opp.leadScore || 85}/100
                    </span>

                    <span className="text-xs font-semibold text-neutral-600">{opp.category}</span>
                    <span className="text-xs text-neutral-400">• {opp.timeAgo}</span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-950">{opp.title}</h4>
                  <p className="text-xs text-neutral-700">{opp.problemSummary}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      opp.status === 'RESOLVIDA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : opp.status === 'EM_ATENDIMENTO'
                        ? 'bg-blue-100 text-blue-800'
                        : opp.status === 'ACEITA'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {opp.status}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-semibold">
                    Valor Lead: R$ {opp.leadValue?.toFixed(2) || '18.00'}
                  </span>
                </div>
              </div>

              {/* Feedbacks registrados */}
              {(opp.supplierFeedback || opp.userFeedback) && (
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {opp.supplierFeedback && (
                    <div className="p-2 rounded bg-white border border-neutral-200">
                      <span className="font-bold text-neutral-700">Feedback do Fornecedor:</span>
                      <p className="text-neutral-600">
                        {opp.supplierFeedback.virouAtendimento ? '✅ Virou Atendimento' : '❌ Não virou atendimento'}
                        {opp.supplierFeedback.servicoConcluido && ' • Serviço Concluído com Sucesso'}
                        {opp.supplierFeedback.valorServico && ` (R$ ${opp.supplierFeedback.valorServico})`}
                      </p>
                    </div>
                  )}

                  {opp.userFeedback && (
                    <div className="p-2 rounded bg-white border border-neutral-200">
                      <span className="font-bold text-neutral-700">Feedback do Usuário:</span>
                      <p className="text-neutral-600">
                        {opp.userFeedback.dorResolvida ? '🎉 Dor Resolvida com Sucesso' : '⚠️ Pendência em aberto'}
                        {opp.userFeedback.notaAtendimento && ` • Avaliação: ${opp.userFeedback.notaAtendimento}★`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
