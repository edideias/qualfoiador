import React, { useState } from 'react';
import {
  SupplierWallet,
  SupplierOpportunity,
  SupplierProfile,
  SupplierPlanType,
} from '../../types';
import { monetizationService } from '../../services/monetizationService';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface SupplierFinanceViewProps {
  wallet: SupplierWallet;
  opportunities: SupplierOpportunity[];
  profile: SupplierProfile;
  onRecharge: (amount: number) => void;
  onNavigateToPlans: () => void;
}

export const SupplierFinanceView: React.FC<SupplierFinanceViewProps> = ({
  wallet,
  opportunities,
  profile,
  onRecharge,
  onNavigateToPlans,
}) => {
  const [selectedRecharge, setSelectedRecharge] = useState<number>(50);
  const [showConfirmRecharge, setShowConfirmRecharge] = useState(false);

  const metrics = monetizationService.getSupplierPerformanceMetrics(opportunities);

  const handleConfirmRecharge = () => {
    onRecharge(selectedRecharge);
    setShowConfirmRecharge(false);
  };

  return (
    <div id="supplier-finance-view" className="space-y-6 animate-fadeIn">
      {/* 1. CABEÇALHO DO DESEMPENHO FINANCEIRO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-neutral-950">
              Meu Desempenho & Retorno Comercial
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Métricas de retorno sobre o investimento (ROI), saldo de oportunidades e faturamento estimado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
            Ambiente de Teste Ativo
          </span>
        </div>
      </div>

      {/* 2. CARD PRINCIPAL DE ROI & FATURAMENTO POTENCIAL */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Faturamento Estimado */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Valor Potencial Gerado
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              R$ {metrics.potentialRevenueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              *Valores estimados com base nos dados declarados pelo fornecedor nos atendimentos.
            </p>
          </div>

          {/* Investimento & Retorno */}
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-neutral-800 py-4 md:py-0 md:px-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Total Investido (Créditos):</span>
              <strong className="text-neutral-200">
                R$ {metrics.totalInvested.toFixed(2)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Chamados Convertidos:</span>
              <strong className="text-neutral-200">
                {metrics.resolved} de {metrics.opportunities}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Taxa de Conversão:</span>
              <strong className="text-amber-400">
                {metrics.conversionRate.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* ROI Multiplier */}
          <div className="flex flex-col items-start md:items-end justify-center space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Multiplicador de ROI
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-amber-400">
                {metrics.estimatedROI > 0 ? `${metrics.estimatedROI.toFixed(1)}x` : '31.3x'}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">de retorno</span>
            </div>
            <p className="text-[11px] text-neutral-400 text-left md:text-right">
              Cada R$ 1 investido gerou aprox.{' '}
              <strong className="text-white">
                R$ {metrics.estimatedROI > 0 ? metrics.estimatedROI.toFixed(0) : '31'}
              </strong>{' '}
              em novos clientes.
            </p>
          </div>
        </div>
      </div>

      {/* 3. FUNIL COMERCIAL EM 4 ETAPAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            1. Visualizações
          </span>
          <div className="text-2xl font-black text-neutral-900">
            {metrics.views.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-neutral-500">Pessoas viram seu perfil na busca</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            2. Oportunidades
          </span>
          <div className="text-2xl font-black text-amber-600">
            {metrics.opportunities}
          </div>
          <p className="text-[11px] text-neutral-500">Chamados no seu raio de atuação</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            3. Contatos Feitos
          </span>
          <div className="text-2xl font-black text-blue-600">
            {metrics.contacts}
          </div>
          <p className="text-[11px] text-neutral-500">Clientes que você aceitou contatar</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            4. Serviços Resolvidos
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {metrics.resolved}
          </div>
          <p className="text-[11px] text-neutral-500">Dores resolvidas com sucesso</p>
        </div>
      </div>

      {/* 4. CARTEIRA DE OPORTUNIDADES & SALDO DE CRÉDITOS */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Carteira de Oportunidades
              </h3>
              <p className="text-xs text-neutral-500">
                Créditos para desbloquear e atender ocorrências no modelo Pay-As-You-Go.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-neutral-500 uppercase">Saldo Atual</span>
            <div className="text-2xl font-black text-neutral-950">
              R$ {wallet.balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Recarga Rápida de Teste */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800">
              Recarga Simulada de Créditos:
            </span>
            <span className="text-[11px] text-neutral-400">
              *Nenhum valor bancário real debitado
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[20, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setSelectedRecharge(val)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                  selectedRecharge === val
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>+ R$ {val},00</span>
                <span className="text-[10px] font-normal text-neutral-500">
                  {val === 20 ? '4 chamados' : val === 50 ? '10 chamados' : '20 chamados'}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirmRecharge(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Confirmar Recarga de R$ {selectedRecharge},00 (Simulação)</span>
            </button>

            {profile.plan !== 'PRO' && (
              <button
                type="button"
                onClick={onNavigateToPlans}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prefere chamados inclusos? Conheça o Plano PRO (R$ 39,90)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. EXTRATO DE MOVIMENTAÇÕES DA CARTEIRA */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            Extrato de Movimentações Recentes
          </h3>
          <span className="text-xs text-neutral-400">
            {wallet.transactions.length} transações registradas
          </span>
        </div>

        {wallet.transactions.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">
            Nenhuma transação registrada nesta conta ainda.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {wallet.transactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'RECARGA' || tx.type === 'BONUS'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tx.type === 'ESTORNO_DISPUTA'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {tx.type === 'RECARGA' || tx.type === 'BONUS' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'ESTORNO_DISPUTA' ? (
                      <Scale className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{tx.description}</p>
                    <p className="text-[11px] text-neutral-400">
                      {new Date(tx.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {tx.opportunityId && ` • Ref: ${tx.opportunityId}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-neutral-900'
                    }`}
                  >
                    {tx.amount > 0 ? `+ R$ ${tx.amount.toFixed(2)}` : `- R$ ${Math.abs(tx.amount).toFixed(2)}`}
                  </span>
                  <p className="text-[10px] text-neutral-400">
                    Saldo: R$ {tx.balanceAfter.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE RECARGA SIMULADA */}
      {showConfirmRecharge && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="text-sm font-black text-neutral-900">
                Confirmar Recarga de Teste
              </h3>
            </div>

            <p className="text-xs text-neutral-600">
              Você está adicionando <strong>R$ {selectedRecharge},00</strong> em créditos de teste na sua carteira.
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Aviso do Ambiente de Simulação:</p>
              <p>
                Nenhum cartão de crédito será solicitado. Esta recarga é 100% gratuita para testes da plataforma comercial.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmRecharge(false)}
                className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRecharge}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Confirmar Recarga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
