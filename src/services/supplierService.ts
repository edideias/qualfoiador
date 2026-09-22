import {
  SupplierMetrics,
  SupplierOpportunity,
  SupplierServiceItem,
  SupplierProfile,
  OpportunityStatus,
  SupplierPlanType,
  SupplierPreferences,
  DisputeReason,
} from '../types';
import { opportunityEngine } from './opportunityEngine';
import { monetizationService } from './monetizationService';

const STORAGE_KEY_PROFILE = 'qual_e_a_sua_dor:supplier_profile';
const STORAGE_KEY_SERVICES = 'qual_e_a_sua_dor:supplier_services';

const DEFAULT_PROFILE: SupplierProfile = {
  id: 'sup_01',
  businessName: 'SOS Pneus & Socorro Mecânico 24h',
  tradeCategory: 'Borracharia & Socorro Automotivo',
  phone: '(11) 98765-4321',
  whatsapp: '11987654321',
  email: 'atendimento@sospneus24h.com.br',
  address: 'Av. Paulista, 1500',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  coverageRadiusKm: 15,
  operatingHours: '24 Horas (Plantão Noturno)',
  isAvailableNow: true,
  isEmergencyService: true,
  verifiedBadge: true,
  plan: 'BASICO',
  wallet: {
    balance: 50.0,
    totalRecharged: 50.0,
    totalSpent: 10.0,
    transactions: [],
  },
  preferences: {
    receiveMode: 'AUTO',
    acceptedCategories: ['Borracharia & Socorro Móvel', 'Autoelétrica & Bateria', 'Mecânica Geral & Guincho'],
    maxLeadPrice: 15.0,
    maxDistanceKm: 20,
    onlyUrgent: false,
  },
  isSponsored: false,
  sponsoredBudgetDaily: 0,
};

const DEFAULT_SERVICES: SupplierServiceItem[] = [
  {
    id: 'srv_1',
    name: 'Troca e Reparo de Pneu no Local (Móvel)',
    category: 'Automotivo',
    priceFrom: 'R$ 70,00',
    estimatedTime: '20-35 min',
    active: true,
    isEmergency24h: true,
  },
  {
    id: 'srv_2',
    name: 'Recarga de Bateria / Chupeta de Emergência',
    category: 'Automotivo',
    priceFrom: 'R$ 60,00',
    estimatedTime: '15-25 min',
    active: true,
    isEmergency24h: true,
  },
  {
    id: 'srv_3',
    name: 'Guincho Rápido até Oficina Mais Próxima',
    category: 'Transporte & Guincho',
    priceFrom: 'R$ 150,00',
    estimatedTime: '30-45 min',
    active: true,
    isEmergency24h: true,
  },
  {
    id: 'srv_4',
    name: 'Abertura de Veículo Trancado (Chaveiro)',
    category: 'Chaveiro Automotivo',
    priceFrom: 'R$ 120,00',
    estimatedTime: '20 min',
    active: true,
    isEmergency24h: true,
  },
];

export const supplierService = {
  getProfile(): SupplierProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  },

  updateProfile(updates: Partial<SupplierProfile>): SupplierProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  toggleAvailability(): boolean {
    const profile = this.getProfile();
    const nextState = !profile.isAvailableNow;
    this.updateProfile({ isAvailableNow: nextState });
    return nextState;
  },

  getMetrics(period: 'today' | 'week' | 'month' = 'week'): SupplierMetrics {
    if (period === 'today') {
      return {
        views: {
          total: 84,
          trendPercentage: 22,
          periodLabel: 'hoje',
        },
        contacts: {
          total: 12,
          trendPercentage: 35,
          periodLabel: 'hoje',
        },
        rating: {
          average: 4.9,
          totalReviews: 128,
          recommendationRate: 98,
        },
        responseRate: 97,
        completedServices: 9,
      };
    }

    if (period === 'month') {
      return {
        views: {
          total: 2140,
          trendPercentage: 18,
          periodLabel: 'neste mês',
        },
        contacts: {
          total: 295,
          trendPercentage: 24,
          periodLabel: 'neste mês',
        },
        rating: {
          average: 4.9,
          totalReviews: 128,
          recommendationRate: 98,
        },
        responseRate: 96,
        completedServices: 240,
      };
    }

    // Default: 'week'
    return {
      views: {
        total: 512,
        trendPercentage: 14,
        periodLabel: 'últimos 7 dias',
      },
      contacts: {
        total: 68,
        trendPercentage: 19,
        periodLabel: 'últimos 7 dias',
      },
      rating: {
        average: 4.9,
        totalReviews: 128,
        recommendationRate: 98,
      },
      responseRate: 96,
      completedServices: 54,
    };
  },

  getServices(): SupplierServiceItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SERVICES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_SERVICES;
  },

  toggleServiceStatus(id: string): SupplierServiceItem[] {
    const services = this.getServices().map((srv) =>
      srv.id === id ? { ...srv, active: !srv.active } : srv
    );
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(services));
    } catch {
      // ignore
    }
    return services;
  },

  saveService(service: SupplierServiceItem): SupplierServiceItem[] {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === service.id);
    let updated: SupplierServiceItem[];
    if (index >= 0) {
      updated = [...services];
      updated[index] = service;
    } else {
      updated = [service, ...services];
    }
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  getOpportunities(): SupplierOpportunity[] {
    return opportunityEngine.getOpportunities();
  },

  acceptOpportunity(id: string): SupplierOpportunity[] {
    return opportunityEngine.updateStatus(id, 'ACEITA', 'Fornecedor aceitou a oportunidade no painel');
  },

  updateOpportunityStatus(id: string, status: OpportunityStatus, note?: string): SupplierOpportunity[] {
    return opportunityEngine.updateStatus(id, status, note);
  },

  recordSupplierFeedback(
    id: string,
    feedback: {
      virouAtendimento: boolean;
      servicoConcluido?: boolean;
      valorServico?: number;
      motivoNaoAtendido?: string;
    }
  ): SupplierOpportunity[] {
    return opportunityEngine.recordSupplierFeedback(id, feedback);
  },

  getWallet() {
    return monetizationService.getWallet();
  },

  rechargeWallet(amount: number) {
    return monetizationService.rechargeWalletTest(amount);
  },

  upgradePlan(plan: SupplierPlanType): SupplierProfile {
    const updated = this.updateProfile({ plan });
    return updated;
  },

  updatePreferences(preferences: Partial<SupplierPreferences>): SupplierProfile {
    const current = this.getProfile();
    const updated = this.updateProfile({
      preferences: { ...current.preferences, ...preferences },
    });
    return updated;
  },

  submitDispute(opportunityId: string, reason: DisputeReason, details: string, refundAmount: number) {
    return monetizationService.createDispute(
      opportunityId,
      this.getProfile().id,
      reason,
      details,
      refundAmount
    );
  },
};
