import {
  CategoryPricingConfig,
  MonetizationSettings,
  SupplierPlan,
  SupplierPlanType,
  SupplierWallet,
  SupplierWalletTransaction,
  OpportunityDispute,
  DisputeReason,
  LeadTemperature,
  SupplierOpportunity,
  BusinessPerformanceMetrics,
  AdminBusinessMetrics,
} from '../types';

const STORAGE_KEY_SETTINGS = 'qual_e_a_sua_dor:monetization_settings';
const STORAGE_KEY_CATEGORY_PRICING = 'qual_e_a_sua_dor:category_pricing_v2';
const STORAGE_KEY_WALLET = 'qual_e_a_sua_dor:supplier_wallet';
const STORAGE_KEY_DISPUTES = 'qual_e_a_sua_dor:opportunity_disputes';
const STORAGE_KEY_PLANS = 'qual_e_a_sua_dor:supplier_plans';

export const DEFAULT_PLANS: SupplierPlan[] = [
  {
    id: 'BASICO',
    name: 'BÁSICO',
    priceMonthly: 0,
    badge: 'Gratuito Para Sempre',
    features: [
      'Cadastro completo do negócio',
      'Perfil público e localização no mapa',
      'Telefone e WhatsApp direto com cliente',
      'Catálogo de serviços e horários',
      'Aparecer em resultados orgânicos',
      'Receber oportunidades da sua região',
      'Opção Pay-as-you-go (paga só se aceitar lead)',
    ],
    isActive: true,
    isAvailableForPurchase: true,
  },
  {
    id: 'PRO',
    name: 'PRO',
    priceMonthly: 39.9,
    badge: 'Mais Recomendado',
    features: [
      'Tudo do Plano Básico',
      'Selo Oficial de Fornecedor PRO ⚡',
      'Perfil ampliado com fotos ilimitadas',
      'Painel de Estatísticas Avançadas',
      'Métricas de visualizações e contatos',
      'Taxa de conversão e histórico de ROI',
      'Ferramentas comerciais exclusivas',
      'Maior raio de cobertura configurável (+50 km)',
      'Aviso de oportunidades quentes 4 min antes',
      'Desconto de 20% em créditos adicionais',
    ],
    isActive: true,
    isAvailableForPurchase: true,
  },
  {
    id: 'EMPRESA',
    name: 'EMPRESA',
    priceMonthly: 199.0,
    badge: 'Em Breve',
    features: [
      'Tudo do Plano PRO',
      'Múltiplos usuários e operadores simultâneos',
      'Múltiplas unidades e filiais cadastradas',
      'Maior volume prioritário de oportunidades',
      'Relatórios executivos e auditoria de SLAs',
      'Campanhas customizadas de alta demanda',
      'Destaque regional patrocinado',
      'Integrações via Webhook / API direta',
    ],
    isActive: false,
    isAvailableForPurchase: false,
    comingSoon: true,
  },
];

export const DEFAULT_CATEGORY_PRICES: CategoryPricingConfig[] = [
  { category: 'Borracharia & Socorro Móvel', baseLeadValue: 5.0, suggestedCommissionPct: 10 },
  { category: 'Eletricista Residencial & Comercial', baseLeadValue: 7.0, suggestedCommissionPct: 15 },
  { category: 'Encanador & SOS Hidráulico', baseLeadValue: 7.0, suggestedCommissionPct: 15 },
  { category: 'Chaveiro 24h & Residencial', baseLeadValue: 5.0, suggestedCommissionPct: 12 },
  { category: 'Mecânica Geral & Guincho', baseLeadValue: 10.0, suggestedCommissionPct: 10 },
  { category: 'Autoelétrica & Bateria', baseLeadValue: 8.0, suggestedCommissionPct: 12 },
  { category: 'Desentupidora 24h', baseLeadValue: 12.0, suggestedCommissionPct: 15 },
  { category: 'Gás & Conveniência Rápida', baseLeadValue: 4.0, suggestedCommissionPct: 8 },
  { category: 'Transporte & Mobilidade', baseLeadValue: 5.0, suggestedCommissionPct: 5 },
  { category: 'Outros Serviços Emergenciais', baseLeadValue: 6.0, suggestedCommissionPct: 10 },
];

export const DEFAULT_SETTINGS: MonetizationSettings = {
  monetizationActive: true,
  billingActive: false, // Regra fundamental: cobrança financeira real DESATIVADA por enquanto
  proMonthlyPrice: 39.9,
  minLeadScoreToMonetize: 70,
  maxSuppliersPerOpportunity: 3,
  dailySupplierLeadCap: 10,
  monthlySupplierLeadCap: 100,
  futureCommissionPct: 10,
  enabledModels: {
    free: true,
    pro: true,
    payAsYouGo: true,
    hybrid: true,
  },
};

const INITIAL_WALLET: SupplierWallet = {
  balance: 50.0, // R$ 50,00 de saldo inicial promocional de teste
  totalRecharged: 50.0,
  totalSpent: 10.0,
  transactions: [
    {
      id: 'tx_bonus_welcome',
      date: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      type: 'CREDITO_PROMO',
      amount: 50.0,
      description: 'Bônus Promocional de Boas-Vindas (Ambiente de Testes)',
    },
    {
      id: 'tx_demo_01',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      type: 'CONSUMO_LEAD',
      amount: -5.0,
      description: 'Oportunidade Quente Aceita: Pneu Furado',
      opportunityId: 'opp_01',
    },
    {
      id: 'tx_demo_02',
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'CONSUMO_LEAD',
      amount: -5.0,
      description: 'Oportunidade Aceita: Bateria Arriada',
      opportunityId: 'opp_02',
    },
  ],
};

const INITIAL_DISPUTES: OpportunityDispute[] = [
  {
    id: 'disp_01',
    opportunityId: 'opp_03',
    supplierId: 'supp_demo_01',
    reason: 'CLIENTE_NAO_SOLICITOU',
    details: 'Cliente informou que chamou um vizinho antes da chegada da equipe.',
    status: 'APROVADA',
    refundAmount: 5.0,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    adminNote: 'Estorno concedido após conferência de registro.',
  },
];

export const monetizationService = {
  getSettings(): MonetizationSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  },

  updateSettings(updates: Partial<MonetizationSettings>): MonetizationSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  getPlans(): SupplierPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PLANS;
  },

  updatePlanPrice(planId: SupplierPlanType, newPrice: number): SupplierPlan[] {
    const plans = this.getPlans().map((p) =>
      p.id === planId ? { ...p, priceMonthly: newPrice } : p
    );
    try {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
    } catch {
      // ignore
    }
    if (planId === 'PRO') {
      this.updateSettings({ proMonthlyPrice: newPrice });
    }
    return plans;
  },

  getCategoryPricing(): CategoryPricingConfig[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORY_PRICING);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_CATEGORY_PRICES;
  },

  updateCategoryPrice(category: string, newBaseLeadValue: number, commissionPct?: number): CategoryPricingConfig[] {
    const current = this.getCategoryPricing();
    const exists = current.some((c) => c.category === category);
    let updated: CategoryPricingConfig[];
    if (exists) {
      updated = current.map((c) =>
        c.category === category
          ? {
              ...c,
              baseLeadValue: newBaseLeadValue,
              suggestedCommissionPct: commissionPct !== undefined ? commissionPct : c.suggestedCommissionPct,
            }
          : c
      );
    } else {
      updated = [
        ...current,
        {
          category,
          baseLeadValue: newBaseLeadValue,
          suggestedCommissionPct: commissionPct || 10,
        },
      ];
    }
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY_PRICING, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  getPriceForCategory(category: string): number {
    const pricing = this.getCategoryPricing();
    const found = pricing.find(
      (c) => c.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(c.category.toLowerCase())
    );
    return found ? found.baseLeadValue : 6.0;
  },

  /**
   * SEÇÃO 5 & 6 — Lead Score (0 a 100) e Temperatura do Lead
   */
  evaluateLeadTemperature(leadScore: number): {
    temperature: LeadTemperature;
    label: string;
    isMonetizable: boolean;
    explanation: string;
  } {
    const settings = this.getSettings();
    if (leadScore >= settings.minLeadScoreToMonetize) {
      return {
        temperature: 'QUENTE',
        label: 'Lead Quente (Alta Intenção)',
        isMonetizable: true,
        explanation: 'Problema urgente com intenção clara e pronta para contato.',
      };
    }
    if (leadScore >= 50) {
      return {
        temperature: 'MORNO',
        label: 'Lead Morno (Necessidade)',
        isMonetizable: true,
        explanation: 'Necessidade real com flexibilidade de horário ou pesquisa ativa.',
      };
    }
    return {
      temperature: 'FRIO',
      label: 'Lead Frio (Pesquisa Informativa)',
      isMonetizable: false,
      explanation: 'Consulta de preços ou dúvidas gerais. Fornecedor NÃO paga por pesquisa genérica.',
    };
  },

  /**
   * SEÇÃO 9 — Carteira e Saldo de Oportunidades do Fornecedor
   */
  getWallet(): SupplierWallet {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WALLET);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_WALLET;
  },

  rechargeWalletTest(amount: number): SupplierWallet {
    const wallet = this.getWallet();
    const tx: SupplierWalletTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString(),
      type: 'RECARGA_TESTE',
      amount,
      description: `Recarga Simulada de Teste (+R$ ${amount.toFixed(2)})`,
    };
    const updated: SupplierWallet = {
      balance: wallet.balance + amount,
      totalRecharged: wallet.totalRecharged + amount,
      totalSpent: wallet.totalSpent,
      transactions: [tx, ...wallet.transactions],
    };
    try {
      localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  consumeLeadCredit(opportunity: SupplierOpportunity): { success: boolean; wallet: SupplierWallet; message: string } {
    const wallet = this.getWallet();
    const settings = this.getSettings();
    const cost = opportunity.opportunityPrice || this.getPriceForCategory(opportunity.category);

    // Se cobrança real desativada, simula o débito sem travar
    if (wallet.balance < cost && settings.billingActive) {
      return {
        success: false,
        wallet,
        message: 'Saldo insuficiente para aceitar esta oportunidade no modo Pay-As-You-Go.',
      };
    }

    const tx: SupplierWalletTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString(),
      type: 'CONSUMO_LEAD',
      amount: -cost,
      description: `Lead Aceito: ${opportunity.title} (${opportunity.neighborhood})`,
      opportunityId: opportunity.id,
    };

    const updated: SupplierWallet = {
      balance: Math.max(0, wallet.balance - cost),
      totalRecharged: wallet.totalRecharged,
      totalSpent: wallet.totalSpent + cost,
      transactions: [tx, ...wallet.transactions],
    };

    try {
      localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return {
      success: true,
      wallet: updated,
      message: `Oportunidade aceita! Débito de R$ ${cost.toFixed(2)} em créditos de teste.`,
    };
  },

  /**
   * SEÇÃO 8 — Sistema de Proteção & Disputa de Oportunidades
   */
  getDisputes(): OpportunityDispute[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DISPUTES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_DISPUTES;
  },

  createDispute(
    opportunityId: string,
    supplierId: string,
    reason: DisputeReason,
    details: string,
    refundAmount: number
  ): OpportunityDispute {
    const disputes = this.getDisputes();
    const newDispute: OpportunityDispute = {
      id: `disp_${Date.now()}`,
      opportunityId,
      supplierId,
      reason,
      details,
      status: 'PENDENTE',
      refundAmount,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDispute, ...disputes];
    try {
      localStorage.setItem(STORAGE_KEY_DISPUTES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newDispute;
  },

  resolveDispute(disputeId: string, status: 'APROVADA' | 'REJEITADA', adminNote: string): OpportunityDispute[] {
    const disputes = this.getDisputes();
    let refundAmountToApply = 0;

    const updated = disputes.map((d) => {
      if (d.id === disputeId) {
        if (status === 'APROVADA') {
          refundAmountToApply = d.refundAmount;
        }
        return {
          ...d,
          status,
          adminNote,
          resolvedAt: new Date().toISOString(),
        };
      }
      return d;
    });

    try {
      localStorage.setItem(STORAGE_KEY_DISPUTES, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Se foi aprovada, efetua o estorno na carteira
    if (refundAmountToApply > 0) {
      const wallet = this.getWallet();
      const tx: SupplierWalletTransaction = {
        id: `tx_refund_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'ESTORNO_DISPUTA',
        amount: refundAmountToApply,
        description: `Estorno de Disputa Aprovada (${disputeId})`,
      };
      const updatedWallet: SupplierWallet = {
        balance: wallet.balance + refundAmountToApply,
        totalRecharged: wallet.totalRecharged,
        totalSpent: Math.max(0, wallet.totalSpent - refundAmountToApply),
        transactions: [tx, ...wallet.transactions],
      };
      try {
        localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(updatedWallet));
      } catch {
        // ignore
      }
    }

    return updated;
  },

  /**
   * SEÇÃO 15 & 16 — Desempenho e ROI do Fornecedor
   */
  getSupplierPerformanceMetrics(opportunities: SupplierOpportunity[]): BusinessPerformanceMetrics {
    const acceptedOpps = opportunities.filter((o) => o.status !== 'NOVA' && o.status !== 'ABERTA');
    const resolvedOpps = opportunities.filter((o) => o.status === 'RESOLVIDA');
    const convertedOpps = opportunities.filter((o) => o.supplierFeedback?.virouAtendimento);

    let declaredRevenue = 0;
    opportunities.forEach((o) => {
      if (o.supplierFeedback?.valorServico) {
        declaredRevenue += o.supplierFeedback.valorServico;
      }
    });

    // Se nenhuma receita informada ainda, faz estimativa conservadora baseada em ticket médio de R$ 95
    const potentialRevenue = declaredRevenue > 0 ? declaredRevenue : resolvedOpps.length * 95;
    const wallet = this.getWallet();
    const totalInvested = wallet.totalSpent > 0 ? wallet.totalSpent : 39.9; // Valor investido em créditos ou plano

    const conversionRate =
      acceptedOpps.length > 0
        ? Math.round((convertedOpps.length / acceptedOpps.length) * 100)
        : 67;

    const roiMultiplier = totalInvested > 0 ? Number((potentialRevenue / totalInvested).toFixed(1)) : 1;

    return {
      views: 312,
      opportunities: opportunities.length,
      contacts: acceptedOpps.length,
      resolved: resolvedOpps.length,
      potentialRevenueGenerated: potentialRevenue,
      totalInvested,
      conversionRate,
      estimatedROI: Math.max(1, roiMultiplier),
    };
  },

  /**
   * SEÇÃO 18 & 20 — Métricas de Negócio para o Administrador
   */
  getAdminBusinessMetrics(opportunities: SupplierOpportunity[]): AdminBusinessMetrics {
    const settings = this.getSettings();
    const monetizable = opportunities.filter((o) => (o.leadScore || 80) >= settings.minLeadScoreToMonetize);
    const resolved = opportunities.filter((o) => o.status === 'RESOLVIDA');
    const wallet = this.getWallet();

    const proSuppliersCount = 4; // Mock dinâmico representativo
    const activeSubscriptions = proSuppliersCount;
    const simulatedSubscriptionRevenue = proSuppliersCount * settings.proMonthlyPrice;
    const creditsUsed = wallet.totalSpent;
    const totalRevenue = simulatedSubscriptionRevenue + creditsUsed;

    let totalPotentialValue = 0;
    opportunities.forEach((o) => {
      if (o.supplierFeedback?.valorServico) {
        totalPotentialValue += o.supplierFeedback.valorServico;
      } else {
        totalPotentialValue += 85;
      }
    });

    const conversionRate = opportunities.length > 0 ? Math.round((resolved.length / opportunities.length) * 100) : 0;
    const resolutionRate = conversionRate;

    return {
      totalRevenue,
      activeSubscriptions,
      totalOpportunities: opportunities.length,
      monetizableOpportunities: monetizable.length,
      potentialValueGenerated: totalPotentialValue,
      proSuppliersCount,
      creditsUsed,
      customerAcquisitionCostEst: 14.5, // CAC estimado em R$ 14,50
      valueGeneratedPerSupplier: Math.round(totalPotentialValue / Math.max(1, proSuppliersCount + 1)),
      averageRevenuePerSupplier: Number((totalRevenue / Math.max(1, proSuppliersCount + 1)).toFixed(2)),
      opportunitiesPerSupplier: Number((opportunities.length / Math.max(1, proSuppliersCount + 1)).toFixed(1)),
      conversionRate,
      resolutionRate,
    };
  },
};
