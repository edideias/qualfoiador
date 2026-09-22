import React, { useState, useEffect } from 'react';
import {
  AppRoute,
  SupplierMetrics,
  SupplierOpportunity,
  SupplierServiceItem,
  SupplierProfile,
  OpportunityStatus,
  SupplierPlanType,
  SupplierWallet,
  DisputeReason,
  SupplierPreferences,
} from '../../types';
import { supplierService } from '../../services/supplierService';
import { monetizationService } from '../../services/monetizationService';
import {
  Eye,
  PhoneCall,
  Star,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  Settings,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  X,
  Save,
  MessageSquare,
  Navigation,
  Phone,
  Truck,
  DollarSign,
  Check,
  Flame,
  CreditCard,
  Sparkles,
  Scale,
  Wallet,
  ArrowDownLeft,
  Building2,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupplierFinanceView } from './SupplierFinanceView';
import { SupplierPlansView } from './SupplierPlansView';
import { SupplierDisputeModal } from './SupplierDisputeModal';

interface SupplierDashboardViewProps {
  onNavigate: (route: AppRoute) => void;
}

type TabType = 'overview' | 'opportunities' | 'finance' | 'plans' | 'services' | 'profile';

export const SupplierDashboardView: React.FC<SupplierDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  
  const [profile, setProfile] = useState<SupplierProfile>(() => supplierService.getProfile());
  const [metrics, setMetrics] = useState<SupplierMetrics>(() => supplierService.getMetrics('week'));
  const [services, setServices] = useState<SupplierServiceItem[]>(() => supplierService.getServices());
  const [opportunities, setOpportunities] = useState<SupplierOpportunity[]>(() => supplierService.getOpportunities());
  const [wallet, setWallet] = useState<SupplierWallet>(() => supplierService.getWallet());

  // Opportunities State & Feedback Modals
  const [oppFilter, setOppFilter] = useState<'ALL' | 'NOVA' | 'ACEITA' | 'EM_ATENDIMENTO' | 'RESOLVIDA'>('ALL');
  const [feedbackModalOpp, setFeedbackModalOpp] = useState<SupplierOpportunity | null>(null);
  const [feedbackVirouAtendimento, setFeedbackVirouAtendimento] = useState<boolean>(true);
  const [feedbackServicoConcluido, setFeedbackServicoConcluido] = useState<boolean>(true);
  const [feedbackValor, setFeedbackValor] = useState<string>('80.00');
  const [feedbackMotivo, setFeedbackMotivo] = useState<string>('Cliente já havia resolvido');
  const [customerModalOpp, setCustomerModalOpp] = useState<SupplierOpportunity | null>(null);

  // Monetization & Dispute States
  const [disputeModalOpp, setDisputeModalOpp] = useState<SupplierOpportunity | null>(null);
  const [disputeReason, setDisputeReason] = useState<DisputeReason>('INVALIDA');
  const [disputeDetails, setDisputeDetails] = useState<string>('');
  const [disputeNotice, setDisputeNotice] = useState<string | null>(null);
  const [planNotice, setPlanNotice] = useState<string | null>(null);
  const [rechargeNotice, setRechargeNotice] = useState<string | null>(null);

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState<SupplierProfile>(profile);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // New Service Modal
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceTime, setNewServiceTime] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Automotivo');

  // Update metrics when period changes
  useEffect(() => {
    setMetrics(supplierService.getMetrics(period));
  }, [period]);

  const handleToggleOnlineStatus = () => {
    const next = supplierService.toggleAvailability();
    setProfile((prev) => ({ ...prev, isAvailableNow: next }));
  };

  const handleToggleService = (id: string) => {
    const updated = supplierService.toggleServiceStatus(id);
    setServices(updated);
  };

  const handleAcceptOpportunity = (id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (opp && profile.plan === 'BASICO') {
      const debitResult = monetizationService.consumeLeadCredit(opp);
      setWallet(debitResult.wallet);
    }
    const updated = supplierService.acceptOpportunity(id);
    setOpportunities(updated);
    const accepted = updated.find((o) => o.id === id);
    if (accepted) {
      setCustomerModalOpp(accepted);
    }
  };

  const handleRechargeWallet = (amount: number) => {
    const updated = monetizationService.rechargeWalletTest(amount);
    setWallet(updated);
    setRechargeNotice(`Recarga simulada de +R$ ${amount.toFixed(2)} efetuada com sucesso!`);
    setTimeout(() => setRechargeNotice(null), 3000);
  };

  const handleOpenDispute = (opp: SupplierOpportunity) => {
    setDisputeModalOpp(opp);
    setDisputeReason('INVALIDA');
    setDisputeDetails('');
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalOpp) return;
    const cost = disputeModalOpp.opportunityPrice || 5.0;
    supplierService.submitDispute(disputeModalOpp.id, disputeReason, disputeDetails, cost);
    setDisputeNotice(`Disputa da oportunidade #${disputeModalOpp.id} enviada para análise. Pedido de estorno: R$ ${cost.toFixed(2)}.`);
    setDisputeModalOpp(null);
    setTimeout(() => setDisputeNotice(null), 4000);
  };

  const handleUpgradePlan = (plan: SupplierPlanType) => {
    const updated = supplierService.upgradePlan(plan);
    setProfile(updated);
    setPlanNotice(
      plan === 'PRO'
        ? '⚡ Plano PRO ativado com sucesso! (Ambiente de Teste — Nenhuma cobrança financeira efetuada).'
        : 'Plano Básico Gratuito selecionado.'
    );
    setTimeout(() => setPlanNotice(null), 3500);
  };

  const handleUpdatePreferences = (prefs: Partial<SupplierPreferences>) => {
    const updated = supplierService.updatePreferences(prefs);
    setProfile(updated);
  };

  const handleUpdateOppStatus = (id: string, status: OpportunityStatus, note?: string) => {
    const updated = supplierService.updateOpportunityStatus(id, status, note);
    setOpportunities(updated);
  };

  const handleOpenFeedbackModal = (opp: SupplierOpportunity) => {
    setFeedbackModalOpp(opp);
    setFeedbackVirouAtendimento(true);
    setFeedbackServicoConcluido(true);
    const num = opp.estimatedBudget?.replace(/[^0-9]/g, '') || '80';
    setFeedbackValor(num);
  };

  const handleSubmitSupplierFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalOpp) return;
    const updated = supplierService.recordSupplierFeedback(feedbackModalOpp.id, {
      virouAtendimento: feedbackVirouAtendimento,
      servicoConcluido: feedbackServicoConcluido,
      valorServico: feedbackVirouAtendimento ? Number(feedbackValor) || 0 : undefined,
      motivoNaoAtendido: !feedbackVirouAtendimento ? feedbackMotivo : undefined,
    });
    setOpportunities(updated);
    setFeedbackModalOpp(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = supplierService.updateProfile(editingProfile);
    setProfile(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newSrv: SupplierServiceItem = {
      id: 'srv_' + Date.now(),
      name: newServiceName.trim(),
      priceFrom: newServicePrice.trim() || 'Sob consulta',
      estimatedTime: newServiceTime.trim() || '30 min',
      category: newServiceCategory,
      active: true,
      isEmergency24h: true,
    };

    const updated = supplierService.saveService(newSrv);
    setServices(updated);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceTime('');
    setIsNewServiceOpen(false);
  };

  const pendingOpportunitiesCount = opportunities.filter((o) => o.status === 'ABERTA').length;

  return (
    <main id="supplier-dashboard-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-20">
      {/* TOP HEADER: Breadcrumb & Online Toggle */}
      <header className="mb-6 pb-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-supplier-back-home"
            onClick={() => onNavigate('/')}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            title="Voltar ao site"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                {profile.businessName}
              </h1>
              {profile.verifiedBadge && (
                <span
                  title="Fornecedor Verificado"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verificado
                </span>
              )}
              {profile.plan === 'PRO' ? (
                <span
                  title="Plano PRO Ativo"
                  className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300"
                >
                  ⚡ PRO
                </span>
              ) : (
                <span
                  title="Plano Básico Gratuito"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200"
                >
                  BÁSICO
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
              <span>{profile.tradeCategory}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                {profile.neighborhood}, {profile.city} ({profile.coverageRadiusKm} km)
              </span>
            </p>
          </div>
        </div>

        {/* STATUS TOGGLE & WALLET BALANCE */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Saldo de Créditos */}
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 transition-colors cursor-pointer"
            title="Ver Carteira & Saldo de Oportunidades"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saldo: R$ {wallet.balance.toFixed(2)}</span>
          </button>

          <button
            id="btn-toggle-availability"
            onClick={handleToggleOnlineStatus}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-2xs ${
              profile.isAvailableNow
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                profile.isAvailableNow ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span>{profile.isAvailableNow ? 'Online • Recebendo Chamados' : 'Pausado • Offline'}</span>
          </button>
        </div>
      </header>

      {/* FEEDBACK BANNERS */}
      {rechargeNotice && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{rechargeNotice}</span>
        </div>
      )}
      {planNotice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{planNotice}</span>
        </div>
      )}
      {disputeNotice && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Scale className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{disputeNotice}</span>
        </div>
      )}

      {/* TABS DE NAVEGAÇÃO DO FORNECEDOR */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-2">
        <button
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Visão Geral
        </button>

        <button
          id="tab-opportunities"
          onClick={() => setActiveTab('opportunities')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'opportunities'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <span>Oportunidades & Leads</span>
          {pendingOpportunitiesCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-400 text-neutral-950">
              {pendingOpportunitiesCount}
            </span>
          )}
        </button>

        <button
          id="tab-finance"
          onClick={() => setActiveTab('finance')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'finance'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Meu Desempenho & Financeiro</span>
        </button>

        <button
          id="tab-plans"
          onClick={() => setActiveTab('plans')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'plans'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Planos & Aquisição</span>
        </button>

        <button
          id="tab-services"
          onClick={() => setActiveTab('services')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'services'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <span>Serviços</span>
          <span className="text-[11px] text-neutral-400">({services.length})</span>
        </button>

        <button
          id="tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Perfil Comercial
        </button>
      </nav>

      {/* TAB 1: VISÃO GERAL & CARDS DE MÉTRICAS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* SELETOR DE PERÍODO */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Painel de Desempenho
            </h2>
            <div className="flex items-center p-1 rounded-lg bg-neutral-100 border border-neutral-200 text-xs">
              <button
                onClick={() => setPeriod('today')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  period === 'today' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  period === 'week' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  period === 'month' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                30 Dias
              </button>
            </div>
          </div>

          {/* OS 3 CARDS DE MÉTRICAS OBRIGATÓRIOS DO MÓDULO 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CARD 1: VISUALIZAÇÕES */}
            <div
              id="card-metric-views"
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Visualizações
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-neutral-950 tracking-tight">
                    {metrics.views.total.toLocaleString('pt-BR')}
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{metrics.views.trendPercentage}%
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
                <span>Buscas no seu raio de {profile.coverageRadiusKm} km</span>
                <span className="font-semibold text-neutral-700">{metrics.views.periodLabel}</span>
              </div>
            </div>

            {/* CARD 2: CONTATOS */}
            <div
              id="card-metric-contacts"
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Contatos & Chamados
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-neutral-950 tracking-tight">
                    {metrics.contacts.total}
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{metrics.contacts.trendPercentage}%
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
                <span>Cliques em Ligar / WhatsApp</span>
                <span className="font-semibold text-neutral-700">{metrics.contacts.periodLabel}</span>
              </div>
            </div>

            {/* CARD 3: AVALIAÇÃO */}
            <div
              id="card-metric-rating"
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Avaliação dos Clientes
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-neutral-950 tracking-tight">
                    {metrics.rating.average.toFixed(1)}
                  </span>
                  <div className="flex text-yellow-400 text-xs">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-xs text-neutral-400">
                    ({metrics.rating.totalReviews} avaliações)
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
                <span>Taxa de recomendação</span>
                <span className="font-bold text-emerald-700">{metrics.rating.recommendationRate}% positiva</span>
              </div>
            </div>
          </div>

          {/* 3 LINKS DE GESTÃO RÁPIDA (CONFORME MÓDULO 1) */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
              Ações Rápidas de Gestão
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* LINK: GERENCIAR PERFIL */}
              <button
                id="link-manage-profile"
                onClick={() => setActiveTab('profile')}
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/80 transition-all text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Gerenciar Perfil</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Dados de contato, horários, endereço e raio de socorro.
                  </p>
                </div>
              </button>

              {/* LINK: GERENCIAR SERVIÇOS */}
              <button
                id="link-manage-services"
                onClick={() => setActiveTab('services')}
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/80 transition-all text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Gerenciar Serviços</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {services.filter((s) => s.active).length} serviços ativos • Preços e tempo.
                  </p>
                </div>
              </button>

              {/* LINK: VER NOVAS OPORTUNIDADES */}
              <button
                id="link-view-opportunities"
                onClick={() => setActiveTab('opportunities')}
                className="p-4 rounded-xl bg-amber-50 border border-amber-300 hover:border-amber-400 hover:bg-amber-100/80 transition-all text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
                    <Radio className="w-4 h-4" />
                  </div>
                  {pendingOpportunitiesCount > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 border border-amber-500/20">
                      {pendingOpportunitiesCount} NOVAS
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-950">Ver Novas Oportunidades</h4>
                  <p className="text-xs text-neutral-700 mt-0.5">
                    Chamados abertos agora próximos ao seu estabelecimento.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* OPORTUNIDADES RECENTES EM DESTAQUE */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Chamados Recentes na Sua Região
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('opportunities')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
              >
                Ver todos ({opportunities.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {opportunities.slice(0, 2).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {opp.urgency}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-950">{opp.title}</h4>
                      <span className="text-xs text-neutral-400">• {opp.timeAgo}</span>
                    </div>
                    <p className="text-xs text-neutral-600">{opp.problemSummary}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {opp.neighborhood}, {opp.city} — a {opp.distanceKm} km de você
                    </p>
                  </div>

                  <button
                    onClick={() => handleAcceptOpportunity(opp.id)}
                    className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    {opp.status === 'EM_ANDAMENTO' ? 'Em Atendimento' : 'Atender Chamado'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARTEIRA DE OPORTUNIDADES & RESOLUÇÃO DE DORES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4 animate-fadeIn">
          {/* HEADER DA CARTEIRA & POLÍTICA ANTI-SPAM */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-black text-neutral-950">
                  Carteira de Oportunidades & Resolução de Dores
                </h2>
              </div>
              <p className="text-xs text-neutral-500">
                Ocorrências em tempo real no seu raio de {profile.coverageRadiusKm} km qualificadas por urgência e proximidade.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Anti-Spam Ativo (Máx. 3 fornecedores)
              </span>
            </div>
          </div>

          {/* BADGE DE RANKING E QUALIDADE DO FORNECEDOR (SEÇÃO 12) */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>Sua Classificação: Fornecedor Prioritário ⚡</strong> — Você responde em média em <strong>3.8 min</strong>.
                Fornecedores rápidos recebem chamados 4 minutos antes no raio de emergência.
              </span>
            </div>
          </div>

          {/* FILTROS DE STATUS DO FUNIL (SEÇÃO 6) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[
              { id: 'ALL', label: 'Todas as Oportunidades' },
              { id: 'NOVA', label: 'Novos Chamados' },
              { id: 'ACEITA', label: 'Aceitas' },
              { id: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
              { id: 'RESOLVIDA', label: 'Concluídas / Resolvidas' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOppFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  oppFilter === f.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* LISTA DE CARDS DE OPORTUNIDADES QUALIFICADAS */}
          <div className="grid grid-cols-1 gap-3">
            {opportunities
              .filter((opp) => {
                if (oppFilter === 'ALL') return true;
                if (oppFilter === 'NOVA') return opp.status === 'NOVA' || opp.status === 'ABERTA';
                if (oppFilter === 'ACEITA') return opp.status === 'ACEITA' || opp.status === 'CONTATANDO';
                if (oppFilter === 'EM_ATENDIMENTO') return opp.status === 'EM_ATENDIMENTO' || opp.status === 'EM_ANDAMENTO';
                if (oppFilter === 'RESOLVIDA') return opp.status === 'RESOLVIDA';
                return true;
              })
              .map((opp) => (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Qualificação do Lead (Seção 10) */}
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
                            ? '🔴 OPORTUNIDADE QUENTE'
                            : opp.qualificationLevel === 'NECESSIDADE'
                            ? '🟠 NECESSIDADE REAL'
                            : '🟢 PESQUISA / INTERESSE'}
                        </span>

                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                          Score: {opp.leadScore || 85}/100
                        </span>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {opp.category}
                        </span>
                        <span className="text-xs text-neutral-400">• {opp.timeAgo}</span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-950">{opp.title}</h3>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {opp.problemSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-neutral-800">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {opp.neighborhood}, {opp.city} ({opp.distanceKm} km)
                        </span>
                        {opp.estimatedBudget && (
                          <span>
                            Estimativa: <strong className="text-neutral-900">{opp.estimatedBudget}</strong>
                          </span>
                        )}
                        <span className="text-neutral-400">
                          Notificados: <strong>{opp.assignedSuppliersCount || 1} / 3 fornecedores</strong>
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS POR STATUS DO PIPELINE (SEÇÃO 7) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          opp.status === 'RESOLVIDA'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : opp.status === 'EM_ATENDIMENTO' || opp.status === 'EM_ANDAMENTO'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : opp.status === 'ACEITA' || opp.status === 'CONTATANDO'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {opp.status === 'RESOLVIDA'
                          ? '✅ Atendimento Concluído'
                          : opp.status === 'EM_ATENDIMENTO' || opp.status === 'EM_ANDAMENTO'
                          ? '🚚 Em Atendimento'
                          : opp.status === 'ACEITA' || opp.status === 'CONTATANDO'
                          ? '📞 Contatando Cliente'
                          : '⚡ Oportunidade Aberta'}
                      </span>

                      {/* BOTOES DE AÇÃO */}
                      {opp.status === 'NOVA' || opp.status === 'ABERTA' ? (
                        <button
                          onClick={() => handleAcceptOpportunity(opp.id)}
                          className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          Aceitar Chamado ⚡
                        </button>
                      ) : opp.status === 'ACEITA' || opp.status === 'CONTATANDO' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCustomerModalOpp(opp)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>Contatar</span>
                          </button>
                          <button
                            onClick={() => handleUpdateOppStatus(opp.id, 'EM_ATENDIMENTO', 'Técnico em deslocamento')}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>A caminho</span>
                          </button>
                        </div>
                      ) : opp.status === 'EM_ATENDIMENTO' || opp.status === 'EM_ANDAMENTO' ? (
                        <button
                          onClick={() => handleOpenFeedbackModal(opp)}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Concluir & Feedback</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenFeedbackModal(opp)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
                        >
                          Ver Resumo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BARRA COMERCIAL & CONTROLE DE MONETIZAÇÃO */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold text-neutral-800">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Valor do Lead:</span>
                        <strong className="text-emerald-700">
                          {opp.leadTemperature === 'FRIO'
                            ? 'Gratuito (Informativo)'
                            : `R$ ${(opp.opportunityPrice || 5.0).toFixed(2)}`}
                        </strong>
                      </span>

                      <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {profile.plan === 'PRO'
                          ? 'Incluso no seu Plano PRO'
                          : 'Modelo Pay-as-you-go (Créditos de teste)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {opp.hasDispute ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          <span>Disputa sob análise</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenDispute(opp)}
                          className="text-[11px] font-semibold text-neutral-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Contestar este lead caso o contato seja inválido ou fora de escopo"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Contestar Lead</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* FEEDBACK DO FORNECEDOR SALVO */}
                  {opp.supplierFeedback && (
                    <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600 flex items-center justify-between">
                      <span>
                        Resultado: <strong>{opp.supplierFeedback.virouAtendimento ? 'Virou Atendimento Real' : 'Não convertido'}</strong>
                        {opp.supplierFeedback.servicoConcluido && ' • Concluído com sucesso'}
                      </span>
                      {opp.supplierFeedback.valorServico && (
                        <span className="font-bold text-emerald-700">
                          Valor faturado: R$ {opp.supplierFeedback.valorServico.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEU DESEMPENHO & FINANCEIRO */}
      {activeTab === 'finance' && (
        <SupplierFinanceView
          wallet={wallet}
          opportunities={opportunities}
          profile={profile}
          onRecharge={handleRechargeWallet}
          onNavigateToPlans={() => setActiveTab('plans')}
        />
      )}

      {/* TAB 4: PLANOS & AQUISIÇÃO COMERCIAL */}
      {activeTab === 'plans' && (
        <SupplierPlansView
          profile={profile}
          onUpgradePlan={handleUpgradePlan}
          onUpdatePreferences={handleUpdatePreferences}
        />
      )}

      {/* TAB 5: GERENCIAR SERVIÇOS */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-extrabold text-neutral-950">Catálogo de Serviços</h2>
              <p className="text-xs text-neutral-500">
                Ative ou pause serviços oferecidos pelo seu estabelecimento em tempo real.
              </p>
            </div>
            <button
              onClick={() => setIsNewServiceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Serviço
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  srv.active ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-50 border-neutral-200 opacity-60'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-950">{srv.name}</h3>
                    {srv.isEmergency24h && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        24 Horas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>
                      A partir de: <strong className="text-neutral-900">{srv.priceFrom}</strong>
                    </span>
                    <span>•</span>
                    <span>Tempo médio: {srv.estimatedTime}</span>
                    <span>•</span>
                    <span className="text-neutral-400">{srv.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleService(srv.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      srv.active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                    }`}
                  >
                    {srv.active ? 'Ativo no Mapa' : 'Pausado'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Novo Serviço */}
          {isNewServiceOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-950">Novo Serviço</h3>
                  <button
                    onClick={() => setIsNewServiceOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddService} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Nome do Serviço
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Troca de Pneu no Local"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Preço Base
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: R$ 80,00"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Tempo Médio
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 25 min"
                        value={newServiceTime}
                        onChange={(e) => setNewServiceTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewServiceOpen(false)}
                      className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
                    >
                      Salvar Serviço
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GERENCIAR PERFIL COMERCIAL */}
      {activeTab === 'profile' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="mb-2">
            <h2 className="text-base font-extrabold text-neutral-950">Perfil Comercial</h2>
            <p className="text-xs text-neutral-500">
              Essas informações serão exibidas diretamente nos cards de recomendação quando os usuários buscarem socorro.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Nome da Empresa / Profissional
                </label>
                <input
                  type="text"
                  value={editingProfile.businessName}
                  onChange={(e) => setEditingProfile({ ...editingProfile, businessName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Ramo de Atuação / Categoria
                </label>
                <input
                  type="text"
                  value={editingProfile.tradeCategory}
                  onChange={(e) => setEditingProfile({ ...editingProfile, tradeCategory: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  WhatsApp para Atendimento
                </label>
                <input
                  type="text"
                  value={editingProfile.whatsapp}
                  onChange={(e) => setEditingProfile({ ...editingProfile, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Telefone Fixo / Celular
                </label>
                <input
                  type="text"
                  value={editingProfile.phone}
                  onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={editingProfile.neighborhood}
                  onChange={(e) => setEditingProfile({ ...editingProfile, neighborhood: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={editingProfile.city}
                  onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Raio de Cobertura de Atendimento (km)
                </label>
                <input
                  type="number"
                  value={editingProfile.coverageRadiusKm}
                  onChange={(e) => setEditingProfile({ ...editingProfile, coverageRadiusKm: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  value={editingProfile.operatingHours}
                  onChange={(e) => setEditingProfile({ ...editingProfile, operatingHours: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              {isSavedNotice ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso!
                </span>
              ) : (
                <span className="text-xs text-neutral-400">
                  Suas alterações são aplicadas imediatamente.
                </span>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: FEEDBACK DO FORNECEDOR (SEÇÃO 8) */}
      {feedbackModalOpp && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-neutral-900">
                  Conclusão & Feedback da Oportunidade
                </h3>
              </div>
              <button
                onClick={() => setFeedbackModalOpp(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <p className="font-bold text-neutral-900">{feedbackModalOpp.title}</p>
              <p className="text-neutral-500">{feedbackModalOpp.neighborhood}, {feedbackModalOpp.city}</p>
            </div>

            <form onSubmit={handleSubmitSupplierFeedback} className="space-y-3.5">
              {/* Pergunta 1: Virou atendimento? */}
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  1. Essa oportunidade virou atendimento real?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackVirouAtendimento(true)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      feedbackVirouAtendimento
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Sim, Atendi
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackVirouAtendimento(false)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      !feedbackVirouAtendimento
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Não Atendi
                  </button>
                </div>
              </div>

              {feedbackVirouAtendimento ? (
                <>
                  {/* Pergunta 2: Serviço concluído? */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                      2. O serviço foi concluído com sucesso?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeedbackServicoConcluido(true)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          feedbackServicoConcluido
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        Sim, Concluído
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackServicoConcluido(false)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          !feedbackServicoConcluido
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        Incompleto / Pendente
                      </button>
                    </div>
                  </div>

                  {/* Pergunta 3: Valor cobrado / realizado */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1">
                      3. Valor do serviço realizado (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-neutral-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={feedbackValor}
                        onChange={(e) => setFeedbackValor(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="0,00"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Usado apenas para estatísticas internas do seu negócio.
                    </p>
                  </div>
                </>
              ) : (
                /* Motivo caso não tenha atendido */
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Qual foi o motivo do não atendimento?
                  </label>
                  <select
                    value={feedbackMotivo}
                    onChange={(e) => setFeedbackMotivo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  >
                    <option value="Cliente já havia resolvido">Cliente já havia resolvido antes</option>
                    <option value="Fora do raio de deslocamento">Fora do meu raio no momento</option>
                    <option value="Orçamento não aprovado">Orçamento não aprovado pelo cliente</option>
                    <option value="Sem peça/ferramenta necessária">Falta de peça/equipamento</option>
                    <option value="Outro">Outro motivo</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpp(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Confirmar & Salvar Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTATO RÁPIDO COM O CLIENTE DO CHAMADO */}
      {customerModalOpp && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-neutral-900">
                  Canal Direto com o Solicitante
                </h3>
              </div>
              <button
                onClick={() => setCustomerModalOpp(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Chamado Aceito
              </span>
              <h4 className="text-sm font-bold text-neutral-950">{customerModalOpp.title}</h4>
              <p className="text-xs text-neutral-600">{customerModalOpp.problemSummary}</p>
              <p className="text-xs text-neutral-500 font-medium">
                📍 {customerModalOpp.neighborhood}, {customerModalOpp.city} • a {customerModalOpp.distanceKm} km
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
              <p className="font-bold text-neutral-900">Mensagem rápida sugerida para WhatsApp:</p>
              <p className="p-2 rounded bg-white border border-neutral-200 text-neutral-600 italic">
                "Olá! Sou do {profile.businessName}. Recebemos seu chamado emergencial de '{customerModalOpp.title}' e já estamos disponíveis para lhe atender. Podemos combinar o deslocamento?"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${profile.phone || '190'}`}
                className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Ligar Agora</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  handleUpdateOppStatus(customerModalOpp.id, 'EM_ATENDIMENTO', 'Iniciou contato com o cliente');
                  setCustomerModalOpp(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Iniciar Deslocamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DISPUTA E CONTESTAÇÃO DE OPORTUNIDADE */}
      {disputeModalOpp && (
        <SupplierDisputeModal
          opportunity={disputeModalOpp}
          onClose={() => setDisputeModalOpp(null)}
          onSubmit={(reason, details) => {
            const cost = disputeModalOpp.opportunityPrice || 5.0;
            supplierService.submitDispute(disputeModalOpp.id, reason, details, cost);
            setDisputeNotice(
              `Disputa da oportunidade #${disputeModalOpp.id} enviada com sucesso. Pedido de estorno: R$ ${cost.toFixed(2)}.`
            );
            setDisputeModalOpp(null);
            setTimeout(() => setDisputeNotice(null), 4500);
          }}
        />
      )}
    </main>
  );
};
