import {
  SupplierOpportunity,
  LeadQualificationLevel,
  OpportunityStatus,
  CategoryPricingConfig,
  AdminOpportunityFunnel,
  OpportunitySupplierFeedback,
  OpportunityUserFeedback,
  LeadTemperature,
} from '../types';
import { monetizationService } from './monetizationService';

const STORAGE_KEY_OPPORTUNITIES = 'qual_e_a_sua_dor:supplier_opportunities';
const STORAGE_KEY_CATEGORY_PRICING = 'qual_e_a_sua_dor:category_pricing';
const STORAGE_KEY_RESOLUTION_STATS = 'qual_e_a_sua_dor:resolution_stats';

export const DEFAULT_CATEGORY_PRICING: CategoryPricingConfig[] = [
  { category: 'Borracharia & Socorro Móvel', baseLeadValue: 18.0, suggestedCommissionPct: 10 },
  { category: 'Autoelétrica & Bateria', baseLeadValue: 22.0, suggestedCommissionPct: 12 },
  { category: 'Chaveiro 24h & Residencial', baseLeadValue: 25.0, suggestedCommissionPct: 12 },
  { category: 'Encanador & SOS Hidráulico', baseLeadValue: 28.0, suggestedCommissionPct: 15 },
  { category: 'Eletricista Residencial & Comercial', baseLeadValue: 28.0, suggestedCommissionPct: 15 },
  { category: 'Desentupidora 24h', baseLeadValue: 35.0, suggestedCommissionPct: 15 },
  { category: 'Mecânica Geral & Guincho', baseLeadValue: 30.0, suggestedCommissionPct: 10 },
  { category: 'Gás & Conveniência Rápida', baseLeadValue: 12.0, suggestedCommissionPct: 8 },
  { category: 'Transporte & Mobilidade', baseLeadValue: 10.0, suggestedCommissionPct: 5 },
  { category: 'Outros Serviços Emergenciais', baseLeadValue: 15.0, suggestedCommissionPct: 10 },
];

export interface LeadQualificationResult {
  isOpportunity: boolean;
  level: LeadQualificationLevel;
  levelLabel: string;
  leadScore: number; // 0-100
  category: string;
  serviceNeeded: string;
  urgency: 'URGENTE' | 'HOJE' | 'AGENDADO';
  estimatedLeadValue: number;
  reason: string;
}

export const opportunityEngine = {
  /**
   * 2. DIFERENCIAR PESQUISA DE OPORTUNIDADE
   * Rigorous classification:
   * 🟢 PESQUISA -> "Quanto custa...", "Como fazer...", curiosidade, informação. Não gera lead!
   * 🟡 INTERESSE -> "Quero saber onde tem...", "Quais tipos...", planejamento futuro.
   * 🟠 NECESSIDADE -> "Preciso de...", "Preciso trocar...", problema concreto que requer prestador.
   * 🔴 OPORTUNIDADE QUENTE -> "Furou agora", "carro parou", "estou preso fora", "cano estourou", emergência imediata.
   */
  classifyIntentAndQualification(
    rawText: string,
    hasLocation: boolean = false
  ): LeadQualificationResult {
    const text = (rawText || '').toLowerCase().trim();

    // 1. Check for pure information / research questions (PESQUISA)
    const isPureInfo =
      text.startsWith('quanto custa') ||
      text.startsWith('qual o preço') ||
      text.startsWith('qual o valor') ||
      text.startsWith('como ') ||
      text.includes('como trocar') ||
      text.includes('como consertar') ||
      text.includes('como funciona') ||
      text.includes('o que é') ||
      text.includes('dicas de') ||
      text.includes('vale a pena');

    // 2. High urgency / emergency triggers (OPORTUNIDADE QUENTE)
    const isEmergency =
      text.includes('agora') ||
      text.includes('urgente') ||
      text.includes('socorro') ||
      text.includes('parado') ||
      text.includes('estou no meio') ||
      text.includes('no acostamento') ||
      text.includes('furou') ||
      text.includes('não liga') ||
      text.includes('estourou') ||
      text.includes('inundando') ||
      text.includes('tranquei') ||
      text.includes('preso do lado de fora') ||
      text.includes('quebrou na fechadura') ||
      text.includes('sem luz na casa toda') ||
      text.includes('curto circuito') ||
      text.includes('fumaça') ||
      text.includes('cheiro de gás');

    // 3. Clear service need (NECESSIDADE)
    const isExplicitNeed =
      text.includes('preciso') ||
      text.includes('chamar') ||
      text.includes('contratar') ||
      text.includes('alguém para') ||
      text.includes('mande um') ||
      text.includes('onde acho') ||
      text.includes('perto de mim') ||
      text.includes('aqui em casa') ||
      text.includes('hoje');

    // Category identification
    let category = 'Outros Serviços Emergenciais';
    let serviceNeeded = 'Serviço Geral';
    let baseValue = 15;

    if (text.includes('pneu') || text.includes('borrach')) {
      category = 'Borracharia & Socorro Móvel';
      serviceNeeded = 'Conserto ou troca de estepe no local';
      baseValue = 18;
    } else if (text.includes('bateria') || (text.includes('carro') && text.includes('não liga')) || text.includes('autoelétr')) {
      category = 'Autoelétrica & Bateria';
      serviceNeeded = 'Socorro de bateria ou autoelétrica';
      baseValue = 22;
    } else if (text.includes('chave') || text.includes('fechadura') || text.includes('tranca')) {
      category = 'Chaveiro 24h & Residencial';
      serviceNeeded = 'Abertura técnica ou confecção de chave';
      baseValue = 25;
    } else if (text.includes('cano') || text.includes('vazamento') || text.includes('encanad') || text.includes('hidráulic')) {
      category = 'Encanador & SOS Hidráulico';
      serviceNeeded = 'Reparo emergencial de vazamento';
      baseValue = 28;
    } else if (text.includes('luz') || text.includes('eletric') || text.includes('disjuntor') || text.includes('tomada') || text.includes('choque')) {
      category = 'Eletricista Residencial & Comercial';
      serviceNeeded = 'Reparo elétrico e curto-circuito';
      baseValue = 28;
    } else if (text.includes('entupiu') || text.includes('desentup') || text.includes('esgoto')) {
      category = 'Desentupidora 24h';
      serviceNeeded = 'Desentupimento mecanizado';
      baseValue = 35;
    } else if (text.includes('guincho') || text.includes('mecânic')) {
      category = 'Mecânica Geral & Guincho';
      serviceNeeded = 'Remoção por guincho ou socorro mecânico';
      baseValue = 30;
    } else if (text.includes('gás') || text.includes('botijão')) {
      category = 'Gás & Conveniência Rápida';
      serviceNeeded = 'Entrega rápida de botijão P13';
      baseValue = 12;
    } else if (text.includes('uber') || text.includes('táxi') || text.includes('corrida') || text.includes('carona') || text.includes('transporte')) {
      category = 'Transporte & Mobilidade';
      serviceNeeded = 'Transporte rápido e econômico';
      baseValue = 10;
    }

    // Determine Qualification Level & Score
    if (isPureInfo && !isEmergency) {
      return {
        isOpportunity: false,
        level: 'PESQUISA',
        levelLabel: '🟢 PESQUISA / INFORMAÇÃO',
        leadScore: hasLocation ? 25 : 15,
        category,
        serviceNeeded,
        urgency: 'AGENDADO',
        estimatedLeadValue: 0,
        reason: 'Usuário buscando apenas esclarecimentos ou estimativas de preço.',
      };
    }

    if (isEmergency) {
      const score = Math.min(98, 80 + (hasLocation ? 15 : 5) + (isExplicitNeed ? 3 : 0));
      return {
        isOpportunity: true,
        level: 'OPORTUNIDADE_QUENTE',
        levelLabel: '🔴 OPORTUNIDADE QUENTE',
        leadScore: score,
        category,
        serviceNeeded,
        urgency: 'URGENTE',
        estimatedLeadValue: baseValue,
        reason: 'Necessidade real com alta urgência e atendimento provável imediatamente.',
      };
    }

    if (isExplicitNeed) {
      const score = Math.min(80, 60 + (hasLocation ? 15 : 5));
      return {
        isOpportunity: true,
        level: 'NECESSIDADE',
        levelLabel: '🟠 NECESSIDADE REAL',
        leadScore: score,
        category,
        serviceNeeded,
        urgency: 'HOJE',
        estimatedLeadValue: baseValue,
        reason: 'Usuário demonstrou clara intenção de contratar solução ou serviço.',
      };
    }

    // Fallback: Interesse geral
    return {
      isOpportunity: false,
      level: 'INTERESSE',
      levelLabel: '🟡 INTERESSE',
      leadScore: 35,
      category,
      serviceNeeded,
      urgency: 'AGENDADO',
      estimatedLeadValue: 0,
      reason: 'Usuário avaliando possibilidades, sem emergência ou contratação imediata.',
    };
  },

  /**
   * Get all opportunities stored
   */
  getOpportunities(): SupplierOpportunity[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return this.seedDefaultOpportunities();
  },

  seedDefaultOpportunities(): SupplierOpportunity[] {
    const defaults: SupplierOpportunity[] = [
      {
        id: 'opp_pneu_01',
        title: 'Pneu Furado na Via Rápida',
        category: 'Borracharia & Socorro Móvel',
        qualificationLevel: 'OPORTUNIDADE_QUENTE',
        leadScore: 94,
        distanceKm: 0.8,
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        urgency: 'URGENTE',
        timeAgo: 'Agora',
        problemSummary: 'Pneu furou agora no acostamento. Veículo com estepe precisa de auxílio para troca rápida.',
        estimatedBudget: 'R$ 70 - R$ 90',
        status: 'NOVA',
        clientName: 'Cliente solicitante',
        clientPhone: '(Contato direto na aceitação)',
        clientAddress: 'Coordenadas via app — aproximação ao local',
        assignedSupplierIds: ['sup_01'],
        maxSuppliers: 3,
        leadValue: 18.0,
        opportunityPrice: 5.0,
        leadTemperature: 'QUENTE',
        isMonetizable: true,
        monetizationModel: 'PAY_PER_LEAD',
        createdAt: new Date().toISOString(),
        history: [
          { status: 'NOVA', timestamp: new Date().toISOString(), note: 'Oportunidade qualificada gerada via IA' },
        ],
      },
      {
        id: 'opp_eletrica_02',
        title: 'Carro Não Liga na Garagem',
        category: 'Autoelétrica & Bateria',
        qualificationLevel: 'OPORTUNIDADE_QUENTE',
        leadScore: 91,
        distanceKm: 1.6,
        neighborhood: 'Consolação',
        city: 'São Paulo',
        urgency: 'URGENTE',
        timeAgo: 'Há 12 min',
        problemSummary: 'Bateria arriada após luz interna ficar acesa. Precisa de socorro de bateria ou chupeta.',
        estimatedBudget: 'R$ 60 - R$ 80',
        status: 'NOVA',
        clientName: 'Cliente solicitante',
        clientPhone: '(Contato direto na aceitação)',
        clientAddress: 'Coordenadas via app — aproximação ao local',
        assignedSupplierIds: ['sup_01'],
        maxSuppliers: 3,
        leadValue: 22.0,
        opportunityPrice: 8.0,
        leadTemperature: 'QUENTE',
        isMonetizable: true,
        monetizationModel: 'PAY_PER_LEAD',
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        history: [
          { status: 'NOVA', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), note: 'Aguardando atendimento' },
        ],
      },
      {
        id: 'opp_chave_03',
        title: 'Chave Trancada dentro do Veículo',
        category: 'Chaveiro 24h & Residencial',
        qualificationLevel: 'OPORTUNIDADE_QUENTE',
        leadScore: 89,
        distanceKm: 2.3,
        neighborhood: 'Cerqueira César',
        city: 'São Paulo',
        urgency: 'URGENTE',
        timeAgo: 'Há 25 min',
        problemSummary: 'Trancou as chaves dentro do carro ao fechar o porta-malas. Necessita de chaveiro com micha técnica.',
        estimatedBudget: 'R$ 120 - R$ 160',
        status: 'ACEITA',
        clientName: 'Cliente solicitante',
        clientPhone: '(Contato direto na aceitação)',
        clientAddress: 'Coordenadas via app — aproximação ao local',
        assignedSupplierIds: ['sup_01'],
        maxSuppliers: 3,
        leadValue: 25.0,
        opportunityPrice: 5.0,
        leadTemperature: 'QUENTE',
        isMonetizable: true,
        monetizationModel: 'PAY_PER_LEAD',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        history: [
          { status: 'NOVA', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
          { status: 'ACEITA', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: 'Fornecedor aceitou o chamado' },
        ],
      },
      {
        id: 'opp_cano_04',
        title: 'Cano Estourado e Registro Travado',
        category: 'Encanador & SOS Hidráulico',
        qualificationLevel: 'OPORTUNIDADE_QUENTE',
        leadScore: 96,
        distanceKm: 3.1,
        neighborhood: 'Pinheiros',
        city: 'São Paulo',
        urgency: 'URGENTE',
        timeAgo: 'Há 40 min',
        problemSummary: 'Vazamento sob a pia da cozinha com risco de estragar armários planejados. Registro geral com folga.',
        estimatedBudget: 'R$ 150 - R$ 220',
        status: 'RESOLVIDA',
        clientName: 'Cliente solicitante',
        clientPhone: '(Contato direto na aceitação)',
        clientAddress: 'Coordenadas via app — aproximação ao local',
        assignedSupplierIds: ['sup_01'],
        maxSuppliers: 3,
        leadValue: 28.0,
        opportunityPrice: 7.0,
        leadTemperature: 'QUENTE',
        isMonetizable: true,
        monetizationModel: 'PAY_PER_LEAD',
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        supplierFeedback: {
          virouAtendimento: true,
          servicoConcluido: true,
          valorServico: 180,
          dataFeedback: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        userFeedback: {
          dorResolvida: true,
          notaAtendimento: 5,
          comentario: 'Chegou rápido e resolveu o vazamento sem quebrar a parede!',
          dataFeedback: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
        history: [
          { status: 'NOVA', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
          { status: 'ACEITA', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
          { status: 'EM_ATENDIMENTO', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
          { status: 'RESOLVIDA', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'Serviço concluído com sucesso' },
        ],
      },
    ];

    try {
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(defaults));
    } catch {
      // ignore
    }
    return defaults;
  },

  /**
   * Save list to storage
   */
  saveOpportunities(list: SupplierOpportunity[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  /**
   * Record when user inputs a problem (increments resolution funnel stats)
   */
  recordPainReported(problemText: string, location?: { cityOrNeighborhood?: string }): SupplierOpportunity | null {
    this.incrementFunnelStat('doresInformadas');

    const qualification = this.classifyIntentAndQualification(problemText, Boolean(location?.cityOrNeighborhood));
    
    if (qualification.level === 'NECESSIDADE' || qualification.level === 'OPORTUNIDADE_QUENTE') {
      this.incrementFunnelStat('necessidadesIdentificadas');
    }

    // Only create opportunity if qualified!
    if (!qualification.isOpportunity) {
      return null;
    }

    this.incrementFunnelStat('oportunidadesGeradas');

    const evalTemp = monetizationService.evaluateLeadTemperature(qualification.leadScore);
    const oppPrice = monetizationService.getPriceForCategory(qualification.category);

    const newOpp: SupplierOpportunity = {
      id: 'opp_' + Date.now(),
      title: qualification.serviceNeeded,
      category: qualification.category,
      qualificationLevel: qualification.level,
      leadScore: qualification.leadScore,
      distanceKm: Number((Math.random() * 2 + 0.5).toFixed(1)),
      neighborhood: location?.cityOrNeighborhood || 'Bairro próximo',
      city: 'Local do Usuário',
      urgency: qualification.urgency,
      timeAgo: 'Agora',
      problemSummary: problemText.length > 140 ? problemText.slice(0, 137) + '...' : problemText,
      status: 'NOVA',
      clientName: 'Cliente solicitante',
      clientPhone: '(Contato direto na aceitação)',
      assignedSupplierIds: ['sup_01'], // Compatible match
      maxSuppliers: 3, // Protection against spam: max 3 suppliers
      leadValue: qualification.estimatedLeadValue,
      opportunityPrice: oppPrice,
      leadTemperature: evalTemp.temperature,
      isMonetizable: evalTemp.isMonetizable,
      monetizationModel: 'PAY_PER_LEAD',
      createdAt: new Date().toISOString(),
      history: [
        {
          status: 'NOVA',
          timestamp: new Date().toISOString(),
          note: `Lead qualificado: score ${qualification.leadScore}/100 (${evalTemp.label})`,
        },
      ],
    };

    const current = this.getOpportunities();
    const updated = [newOpp, ...current];
    this.saveOpportunities(updated);
    this.incrementFunnelStat('fornecedoresNotificados');

    return newOpp;
  },

  /**
   * 7. STATUS WORKFLOW
   * Changes status and records history audit trail
   */
  updateStatus(opportunityId: string, nextStatus: OpportunityStatus, note?: string): SupplierOpportunity[] {
    const list = this.getOpportunities().map((opp) => {
      if (opp.id === opportunityId) {
        const historyEntry = {
          status: nextStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status alterado para ${nextStatus}`,
        };
        return {
          ...opp,
          status: nextStatus,
          history: [...(opp.history || []), historyEntry],
        };
      }
      return opp;
    });

    this.saveOpportunities(list);

    if (nextStatus === 'ACEITA') {
      this.incrementFunnelStat('fornecedoresAceitaram');
    } else if (nextStatus === 'CONTATANDO') {
      this.incrementFunnelStat('contatosRealizados');
    } else if (nextStatus === 'EM_ATENDIMENTO') {
      this.incrementFunnelStat('atendimentosIniciados');
    } else if (nextStatus === 'RESOLVIDA') {
      this.incrementFunnelStat('resolvidos');
    }

    return list;
  },

  /**
   * 8. FEEDBACK DO RESULTADO (FORNECEDOR)
   */
  recordSupplierFeedback(
    opportunityId: string,
    feedback: {
      virouAtendimento: boolean;
      servicoConcluido?: boolean;
      valorServico?: number;
      motivoNaoAtendido?: string;
    }
  ): SupplierOpportunity[] {
    const now = new Date().toISOString();
    const list = this.getOpportunities().map((opp) => {
      if (opp.id === opportunityId) {
        const nextStatus: OpportunityStatus = feedback.servicoConcluido
          ? 'RESOLVIDA'
          : feedback.virouAtendimento
          ? 'EM_ATENDIMENTO'
          : 'NAO_ATENDIDA';

        return {
          ...opp,
          status: nextStatus,
          supplierFeedback: {
            ...feedback,
            dataFeedback: now,
          },
          history: [
            ...(opp.history || []),
            {
              status: nextStatus,
              timestamp: now,
              note: `Feedback Fornecedor: ${feedback.virouAtendimento ? 'Atendimento confirmado' : 'Não atendeu'}`,
            },
          ],
        };
      }
      return opp;
    });

    this.saveOpportunities(list);
    if (feedback.servicoConcluido) {
      this.incrementFunnelStat('resolvidos');
    }
    return list;
  },

  /**
   * 9. FEEDBACK DO USUÁRIO
   */
  recordUserFeedback(
    opportunityId: string,
    feedback: {
      dorResolvida: boolean;
      notaAtendimento?: number;
      comentario?: string;
    }
  ): SupplierOpportunity[] {
    const now = new Date().toISOString();
    const list = this.getOpportunities().map((opp) => {
      if (opp.id === opportunityId || (!opportunityId && opp.status !== 'CANCELADA')) {
        return {
          ...opp,
          userFeedback: {
            ...feedback,
            dataFeedback: now,
          },
        };
      }
      return opp;
    });

    this.saveOpportunities(list);
    if (feedback.dorResolvida) {
      this.incrementFunnelStat('resolvidos');
    }
    return list;
  },

  /**
   * 16. FUNIL & 17. MÉTRICA MAIS IMPORTANTE (TAXA DE RESOLUÇÃO)
   */
  getFunnelMetrics(): AdminOpportunityFunnel {
    let stats = {
      doresInformadas: 142,
      necessidadesIdentificadas: 118,
      oportunidadesGeradas: 86,
      fornecedoresNotificados: 86,
      fornecedoresAceitaram: 74,
      contatosRealizados: 68,
      atendimentosIniciados: 62,
      resolvidos: 58,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY_RESOLUTION_STATS);
      if (stored) {
        stats = { ...stats, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }

    // Dynamic addition from current stored opportunities
    const opportunities = this.getOpportunities();
    const resolvedInStore = opportunities.filter(
      (o) => o.status === 'RESOLVIDA' || o.supplierFeedback?.servicoConcluido || o.userFeedback?.dorResolvida
    ).length;

    const totalResolved = Math.max(stats.resolvidos, resolvedInStore);
    const totalDores = Math.max(stats.doresInformadas, opportunities.length + 50);

    const taxaResolucao = totalDores > 0 ? Number(((totalResolved / totalDores) * 100).toFixed(1)) : 0;

    return {
      ...stats,
      resolvidos: totalResolved,
      doresInformadas: totalDores,
      taxaResolucao,
    };
  },

  incrementFunnelStat(key: keyof Omit<AdminOpportunityFunnel, 'taxaResolucao'>) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RESOLUTION_STATS);
      const stats = stored ? JSON.parse(stored) : {
        doresInformadas: 142,
        necessidadesIdentificadas: 118,
        oportunidadesGeradas: 86,
        fornecedoresNotificados: 86,
        fornecedoresAceitaram: 74,
        contatosRealizados: 68,
        atendimentosIniciados: 62,
        resolvidos: 58,
      };

      stats[key] = (stats[key] || 0) + 1;
      localStorage.setItem(STORAGE_KEY_RESOLUTION_STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  },

  /**
   * 13. VALOR FUTURO DO LEAD & PREÇOS POR CATEGORIA
   */
  getCategoryPricing(): CategoryPricingConfig[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORY_PRICING);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_CATEGORY_PRICING;
  },

  saveCategoryPricing(pricing: CategoryPricingConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY_PRICING, JSON.stringify(pricing));
    } catch {
      // ignore
    }
  },
};
