import React, { useState } from 'react';
import {
  MonetizationSettings,
  CategoryPricingConfig,
  OpportunityDispute,
  AdminBusinessMetrics,
  SupplierPlan,
} from '../../types';
import { monetizationService } from '../../services/monetizationService';
import { opportunityEngine } from '../../services/opportunityEngine';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Settings,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Sparkles,
  Users,
  Building2,
  Sliders,
  Scale,
  CreditCard,
  Percent,
} from 'lucide-react';

export const AdminMonetizationView: React.FC = () => {
  const [settings, setSettings] = useState<MonetizationSettings>(() => monetizationService.getSettings());
  const [pricing, setPricing] = useState<CategoryPricingConfig[]>(() => monetizationService.getCategoryPricing());
  const [plans, setPlans] = useState<SupplierPlan[]>(() => monetizationService.getPlans());
  const [disputes, setDisputes] = useState<OpportunityDispute[]>(() => monetizationService.getDisputes());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [disputeModal, setDisputeModal] = useState<OpportunityDispute | null>(null);
  const [disputeAdminNote, setDisputeAdminNote] = useState('');

  const opportunities = opportunityEngine.getOpportunities();
  const metrics: AdminBusinessMetrics = monetizationService.getAdminBusinessMetrics(opportunities);

  const handleSaveSettings = () => {
    monetizationService.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateCategoryPrice = (category: string, newPrice: number, commission?: number) => {
    const updated = monetizationService.updateCategoryPrice(category, newPrice, commission);
    setPricing(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleUpdateProPrice = (price: number) => {
    setSettings((prev) => ({ ...prev, proMonthlyPrice: price }));
    monetizationService.updatePlanPrice('PRO', price);
  };

  const handleResolveDispute = (disputeId: string, status: 'APROVADA' | 'REJEITADA') => {
    const updated = monetizationService.resolveDispute(disputeId, status, disputeAdminNote || (status === 'APROVADA' ? 'Estorno aceito pela moderação.' : 'Justificativa considerada improcedente.'));
    setDisputes(updated);
    setDisputeModal(null);
    setDisputeAdminNote('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ETAPA 3 • MONETIZAÇÃO
            </span>
            <span className="text-xs text-neutral-400">Ambiente de Simulação Comercial</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Painel de Monetização & Gestão Comercial</h2>
          <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
            Princípio fundamental: Usuário final sempre 100% gratuito. O fornecedor só é cobrado quando valor real é gerado para o negócio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configurações comerciais e tabelas de preços salvas com sucesso!</span>
        </div>
      )}

      {/* 1. Métricas Principais do Negócio */}
      <div>
        <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Métricas Principais do Negócio & Desempenho Financeiro
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs text-neutral-500 font-medium">Receita Simulada</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              R$ {metrics.totalRevenue.toFixed(2)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Planos + Leads pagos</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs text-neutral-500 font-medium">Assinaturas Ativas</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              {metrics.activeSubscriptions} <span className="text-xs text-blue-600 font-semibold">PRO</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Fornecedores assinantes</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs text-neutral-500 font-medium">Leads Monetizáveis</p>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {metrics.monetizableOpportunities}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Score ≥ {settings.minLeadScoreToMonetize}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs text-neutral-500 font-medium">Valor Potencial Gerado</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              R$ {metrics.potentialValueGenerated.toFixed(0)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Serviços para parceiros</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs text-neutral-500 font-medium">CAC Estimado</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              R$ {metrics.customerAcquisitionCostEst.toFixed(2)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Custo por fornecedor</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-xs text-neutral-500 font-medium">ARPU Médio</p>
            <p className="text-xl font-bold text-indigo-600 mt-1">
              R$ {metrics.averageRevenuePerSupplier.toFixed(2)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Receita / parceiro</p>
          </div>
        </div>
      </div>

      {/* 2. Toggles de Regulação Master */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-neutral-700" />
          Controles Principais do Sistema de Cobrança
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Monetização */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">Monetização Comercial</span>
                {settings.monetizationActive ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                    ATIVA
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-600">
                    DESATIVADA
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Controla se o motor qualifica oportunidades como pagas ou comerciais e calcula comissões.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({ ...s, monetizationActive: !s.monetizationActive }))
              }
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                settings.monetizationActive
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {settings.monetizationActive ? 'Desativar' : 'Ativar'}
            </button>
          </div>

          {/* Status Cobrança Real (DESATIVADA) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">Cobrança Financeira Real</span>
                {settings.billingActive ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                    COBRANDO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                    DESATIVADA (TESTE)
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800/80 mt-1 max-w-sm">
                Regra estrita: Nenhum gateway real está conectado. Fornecedores utilizam créditos simulados de teste.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({ ...s, billingActive: !s.billingActive }))
              }
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
            >
              {settings.billingActive ? 'Desligar Cobrança' : 'Manter Desativada'}
            </button>
          </div>
        </div>

        {/* Parâmetros Globais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Preço Mensal Plano PRO (R$)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.proMonthlyPrice}
              onChange={(e) => handleUpdateProPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Valor recorrente configurável</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Lead Score Mínimo p/ Monetizar
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.minLeadScoreToMonetize}
              onChange={(e) =>
                setSettings((s) => ({ ...s, minLeadScoreToMonetize: parseInt(e.target.value) || 0 }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Abaixo disso = Lead Frio / Gratuito</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Máximo Fornecedores / Lead
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxSuppliersPerOpportunity}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  maxSuppliersPerOpportunity: parseInt(e.target.value) || 3,
                }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Proteção contra spam e leilão</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Comissão Futura Sugerida (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={settings.futureCommissionPct}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  futureCommissionPct: parseInt(e.target.value) || 10,
                }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Estimativa de take-rate de sucesso</p>
          </div>
        </div>
      </div>

      {/* 3. Tabela de Preço por Categoria */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Tabela de Valor das Oportunidades por Categoria
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defina o valor cobrado por lead (Pay-as-you-go) e a comissão sugerida para cada segmento.
            </p>
          </div>
          <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full self-start">
            {pricing.length} categorias cadastradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-neutral-50/50">
                <th className="py-3 px-4">Categoria de Serviço</th>
                <th className="py-3 px-4">Preço do Lead (R$)</th>
                <th className="py-3 px-4">Comissão Sugerida (%)</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pricing.map((item) => (
                <tr key={item.category} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-neutral-900">{item.category}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 w-32">
                      <span className="text-xs text-neutral-500 font-semibold">R$</span>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={item.baseLeadValue}
                        onChange={(e) =>
                          handleUpdateCategoryPrice(
                            item.category,
                            parseFloat(e.target.value) || 0,
                            item.suggestedCommissionPct
                          )
                        }
                        className="w-20 px-2 py-1 text-sm border border-neutral-300 rounded font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 w-28">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.suggestedCommissionPct}
                        onChange={(e) =>
                          handleUpdateCategoryPrice(
                            item.category,
                            item.baseLeadValue,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 text-sm border border-neutral-300 rounded font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-neutral-500 font-semibold">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleUpdateCategoryPrice(item.category, item.baseLeadValue)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      Atualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Gerenciamento de Disputas & Proteção do Fornecedor */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              Proteção do Fornecedor — Disputas de Leads
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Analise contestações de fornecedores contra cobranças de leads inválidos, duplicados ou com clientes que cancelaram.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {disputes.filter((d) => d.status === 'PENDENTE').length} Pendentes
          </span>
        </div>

        {disputes.length === 0 ? (
          <p className="text-sm text-neutral-500 py-4 text-center">Nenhuma disputa registrada até o momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase bg-neutral-50/50">
                  <th className="py-3 px-4">ID Disputa</th>
                  <th className="py-3 px-4">Oportunidade</th>
                  <th className="py-3 px-4">Motivo Declarado</th>
                  <th className="py-3 px-4">Valor Estorno</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-600">{d.id}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">{d.opportunityId}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-neutral-800 block text-xs">{d.reason}</span>
                        <span className="text-xs text-neutral-500 line-clamp-1">{d.details}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">R$ {d.refundAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {d.status === 'APROVADA' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                          APROVADA (ESTORNADO)
                        </span>
                      )}
                      {d.status === 'REJEITADA' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                          REJEITADA
                        </span>
                      )}
                      {d.status === 'PENDENTE' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700">
                          AGUARDANDO ANÁLISE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {d.status === 'PENDENTE' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleResolveDispute(d.id, 'APROVADA')}
                            className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Aprovar Estorno
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveDispute(d.id, 'REJEITADA')}
                            className="px-2.5 py-1 text-xs font-bold rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Concluída</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Planos de Fornecedor Configuráveis */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <h3 className="text-base font-bold text-neutral-900 mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Estrutura de Planos de Parceiros
        </h3>
        <p className="text-xs text-neutral-500 mb-6">
          Três níveis estruturais: Básico (Gratuito), PRO (Assinatura com destaque) e EMPRESA (Em Breve).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                p.id === 'PRO'
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-300'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-900">{p.name}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      p.id === 'PRO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.comingSoon
                        ? 'bg-neutral-200 text-neutral-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>

                <div className="my-4">
                  <span className="text-2xl font-black text-neutral-900">
                    {p.priceMonthly === 0 ? 'R$ 0' : `R$ ${p.priceMonthly.toFixed(2)}`}
                  </span>
                  <span className="text-xs text-neutral-500"> / mês</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {p.features.map((feat, i) => (
                    <li key={i} className="text-xs text-neutral-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <span className="text-[11px] text-neutral-500 block">
                  {p.id === 'PRO'
                    ? 'Disponível para fornecedores no painel.'
                    : p.comingSoon
                    ? 'Desativado comercialmente para lançamento futuro.'
                    : 'Acesso orgânico liberado permanentemente.'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
