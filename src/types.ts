/**
 * Types and interfaces for "Qual é a sua dor?"
 * Separates physical_pain and problem_pain domains strictly.
 */

export type AppRoute = '/' | '/dor-fisica' | '/dor-fisica/resultado' | '/dor-problema' | '/dor-problema/resultado' | '/historico' | '/admin' | '/fornecedor';

export interface PhysicalPainAssessment {
  initialDescription: string;
  location: string;
  intensity: number; // 0 to 10
  duration: string;
  durationCustom?: string;
  painTypes: string[];
  frequency: string;
  otherSymptoms: string[];
  otherSymptomsCustom?: string;
  voiceUsed?: boolean;
  completedAt?: string;
}

export interface RedFlagAlert {
  title: string;
  reason: string;
  severity: 'urgent' | 'caution';
}

export interface RedFlagEvaluation {
  hasRedFlags: boolean;
  alerts: RedFlagAlert[];
  urgentRecommendationMessage?: string;
}

export interface PhysicalPainAnalysisResult {
  summaryParagraph: string;
  interpretationParagraph: string;
  redFlags: RedFlagEvaluation;
  visualSummary: {
    location: string;
    intensity: string;
    duration: string;
    painType: string;
    frequency: string;
    otherSymptoms: string;
  };
}

export interface PhysicalPainDraft {
  description: string;
  voiceUsed: boolean;
  createdAt?: string;
  currentStep?: number;
  assessment?: Partial<PhysicalPainAssessment>;
  status: 'draft' | 'answering' | 'completed';
}

export interface ProblemAssessment {
  initialDescription: string;
  frequency: string; // e.g. 'Todo dia', 'Toda semana', etc.
  timeSpent: string; // e.g. '5-15 min', '30-60 min', 'Várias horas'
  area: string; // e.g. 'Trabalho & clientes', 'Finanças & dinheiro', etc.
  priorityGoal: string; // e.g. 'Ganhar horas livres no meu dia'
  voiceUsed?: boolean;
  completedAt?: string;
}

export interface ProblemImpactMetrics {
  monthlyHours: number;
  weeklyOccurrences: number;
  estimatedFinancialCost?: string;
}

export interface ProblemThreePaths {
  automate: {
    title: string;
    tagline: string;
    description: string;
  };
  simplify: {
    title: string;
    tagline: string;
    description: string;
  };
  eliminate: {
    title: string;
    tagline: string;
    description: string;
  };
}

export interface ProblemTransformation {
  today: string;
  withoutPain: string;
}

export interface ImmediateActionPlan {
  title: string;
  timeToExecute: string;
  description: string;
  stepByStep: string[];
}

export interface ReadyTemplate {
  title: string;
  content: string;
}

export interface ActionPlanPhases {
  today: string;
  thisWeek: string;
  nextMonth: string;
}

export type UrgencyLevel = 'URGENTE' | 'RESOLVER_LOGO' | 'PODE_ESPERAR';

export interface ActionAlternative {
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'maps' | 'call' | 'guide' | 'app';
  actionPayload: string;
  phone?: string;
}

export interface ContextSafetyAction {
  label: string;
  variant: 'danger' | 'warning' | 'safe';
  instruction: string;
  actionUrl?: string;
  phone?: string;
}

export interface ProblemActionSolution {
  problemIdentified: string;
  urgency: UrgencyLevel;
  urgencyLabel: string;
  // CAMADA 1 — SOLUÇÃO IMEDIATA (Uma frase dizendo o que fazer agora)
  immediateInstruction: string;
  immediateSafetySteps?: string[];
  // CAMADA 2 — AÇÃO PRINCIPAL
  primaryAction: {
    label: string;
    actionType: 'open_maps' | 'call' | 'guide' | 'emergency' | 'app';
    searchQuery?: string;
    actionPayload?: string;
    phone?: string;
  };
  // CAMADA 3 — MELHOR OPÇÃO
  serviceCategoryNeeded?: string;
  bestOption?: {
    title: string;
    badge: string;
    description: string;
    actionLabel: string;
    searchQuery?: string;
    phone?: string;
    estimatedTime?: string;
  };
  // CAMADA 4 — ALTERNATIVAS
  alternatives: ActionAlternative[];
  // CAMADA 5 — EXPLICAÇÃO (Discreta, recolhida)
  explanationNote?: string;
  // Contexto de Segurança
  contextActions?: ContextSafetyAction[];
  locationNeeded?: boolean;
}

export interface ProblemPainAnalysisResult {
  painScore: number; // 0 to 100
  painLevel: 'LEVE' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  painLevelExplanation: string;
  summaryDiscovery: string;
  impactMetrics: ProblemImpactMetrics;
  threePaths: ProblemThreePaths;
  transformation: ProblemTransformation;
  immediateAction?: ImmediateActionPlan;
  readyTemplate?: ReadyTemplate;
  actionPlan?: ActionPlanPhases;
  // Nova arquitetura orientada à AÇÃO IMEDIATA
  actionSolution?: ProblemActionSolution;
}

export interface ProblemPainDraft {
  description: string;
  voiceUsed: boolean;
  createdAt?: string;
  currentStep?: number;
  assessment?: Partial<ProblemAssessment>;
  status: 'draft' | 'answering' | 'submitted';
}

/**
 * Architecture readiness for upcoming Supabase + AI modules
 */
export interface PhysicalPainRecord {
  id: string;
  userId?: string;
  assessment: PhysicalPainAssessment;
  analysisResult: PhysicalPainAnalysisResult;
  createdAt: string;
}

export interface ProblemPainRecord {
  id: string;
  userId?: string;
  assessment: ProblemAssessment;
  analysisResult: ProblemPainAnalysisResult;
  createdAt: string;
}

/**
 * Módulo 1 - Fornecedor & Prestador de Serviços
 */
export interface SupplierMetrics {
  views: {
    total: number;
    trendPercentage: number; // e.g. +14%
    periodLabel: string;
  };
  contacts: {
    total: number;
    trendPercentage: number;
    periodLabel: string;
  };
  rating: {
    average: number; // e.g. 4.9
    totalReviews: number;
    recommendationRate: number; // e.g. 98%
  };
  responseRate?: number;
  completedServices?: number;
}

export type LeadQualificationLevel = 'PESQUISA' | 'INTERESSE' | 'NECESSIDADE' | 'OPORTUNIDADE_QUENTE';

export type OpportunityStatus =
  | 'NOVA'
  | 'ABERTA'
  | 'ACEITA'
  | 'CONTATANDO'
  | 'EM_ATENDIMENTO'
  | 'EM_ANDAMENTO'
  | 'RESOLVIDA'
  | 'CANCELADA'
  | 'NAO_ATENDIDA';

export interface OpportunitySupplierFeedback {
  virouAtendimento: boolean;
  servicoConcluido?: boolean;
  valorServico?: number;
  motivoNaoAtendido?: string;
  dataFeedback: string;
}

export interface OpportunityUserFeedback {
  dorResolvida: boolean;
  notaAtendimento?: number; // 1 to 5 stars
  comentario?: string;
  dataFeedback: string;
}

export interface OpportunityHistoryEntry {
  status: OpportunityStatus;
  timestamp: string;
  note?: string;
}

export interface SupplierOpportunity {
  id: string;
  title: string;
  category: string;
  qualificationLevel: LeadQualificationLevel;
  leadScore: number; // 0 to 100
  distanceKm: number;
  neighborhood: string;
  city: string;
  urgency: 'URGENTE' | 'HOJE' | 'AGENDADO';
  timeAgo: string;
  problemSummary: string;
  estimatedBudget?: string;
  status: OpportunityStatus;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  assignedSupplierIds: string[];
  maxSuppliers: number; // Anti-spam: max 3
  leadValue: number; // R$ estimado para a categoria
  opportunityPrice?: number; // Preço do lead para o fornecedor
  leadTemperature?: LeadTemperature; // FRIO | MORNO | QUENTE
  isMonetizable?: boolean;
  monetizationModel?: MonetizationModel;
  createdAt: string;
  supplierFeedback?: OpportunitySupplierFeedback;
  userFeedback?: OpportunityUserFeedback;
  dispute?: OpportunityDispute;
  history: OpportunityHistoryEntry[];
}

export interface CategoryPricingConfig {
  category: string;
  baseLeadValue: number; // R$ valor do lead
  suggestedCommissionPct: number;
}

export type SupplierPlanType = 'BASICO' | 'PRO' | 'EMPRESA';
export type MonetizationModel = 'GRATUITO' | 'PRO' | 'PAY_PER_LEAD' | 'HIBRIDO';
export type LeadTemperature = 'FRIO' | 'MORNO' | 'QUENTE';

export interface SupplierPlan {
  id: SupplierPlanType;
  name: string;
  priceMonthly: number;
  badge?: string;
  features: string[];
  isActive: boolean;
  isAvailableForPurchase: boolean;
  comingSoon?: boolean;
}

export interface SupplierWalletTransaction {
  id: string;
  date: string;
  type: 'CREDITO_PROMO' | 'RECARGA_TESTE' | 'CONSUMO_LEAD' | 'ESTORNO_DISPUTA';
  amount: number;
  description: string;
  opportunityId?: string;
}

export interface SupplierWallet {
  balance: number; // Saldo em R$
  totalRecharged: number;
  totalSpent: number;
  transactions: SupplierWalletTransaction[];
}

export type DisputeReason =
  | 'INVALIDA'
  | 'CATEGORIA_ERRADA'
  | 'LOCALIZACAO_INCORRETA'
  | 'CLIENTE_NAO_SOLICITOU'
  | 'DUPLICADA'
  | 'SPAM';

export interface OpportunityDispute {
  id: string;
  opportunityId: string;
  supplierId: string;
  reason: DisputeReason;
  details: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  refundAmount: number;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

export interface MonetizationSettings {
  monetizationActive: boolean;
  billingActive: boolean; // Inicialmente false (sem cobrança real)
  proMonthlyPrice: number; // Padrão: 39.90
  minLeadScoreToMonetize: number; // Padrão: 70
  maxSuppliersPerOpportunity: number; // Padrão: 3
  dailySupplierLeadCap: number; // Padrão: 10
  monthlySupplierLeadCap: number; // Padrão: 100
  futureCommissionPct: number; // Padrão: 10
  enabledModels: {
    free: boolean;
    pro: boolean;
    payAsYouGo: boolean;
    hybrid: boolean;
  };
}

export interface SupplierPreferences {
  receiveMode: 'AUTO' | 'MANUAL';
  acceptedCategories: string[];
  maxLeadPrice: number;
  maxDistanceKm: number;
  onlyUrgent: boolean;
}

export interface BusinessPerformanceMetrics {
  views: number;
  opportunities: number;
  contacts: number;
  resolved: number;
  potentialRevenueGenerated: number;
  totalInvested: number;
  conversionRate: number;
  estimatedROI: number;
}

export interface AdminBusinessMetrics {
  totalRevenue: number;
  activeSubscriptions: number;
  totalOpportunities: number;
  monetizableOpportunities: number;
  potentialValueGenerated: number;
  proSuppliersCount: number;
  creditsUsed: number;
  customerAcquisitionCostEst: number;
  valueGeneratedPerSupplier: number;
  averageRevenuePerSupplier: number;
  opportunitiesPerSupplier: number;
  conversionRate: number;
  resolutionRate: number;
}

export interface AdminOpportunityFunnel {
  doresInformadas: number;
  necessidadesIdentificadas: number;
  oportunidadesGeradas: number;
  fornecedoresNotificados: number;
  fornecedoresAceitaram: number;
  contatosRealizados: number;
  atendimentosIniciados: number;
  resolvidos: number;
  taxaResolucao: number; // Porcentagem de resolução (Métrica Principal)
}

export interface SupplierServiceItem {
  id: string;
  name: string;
  category: string;
  priceFrom: string;
  estimatedTime: string;
  active: boolean;
  isEmergency24h?: boolean;
}

export interface SupplierProfile {
  id: string;
  businessName: string;
  tradeCategory: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  coverageRadiusKm: number;
  operatingHours: string;
  isAvailableNow: boolean;
  isEmergencyService: boolean;
  verifiedBadge: boolean;
  plan: SupplierPlanType;
  wallet: SupplierWallet;
  preferences: SupplierPreferences;
  isSponsored?: boolean;
  sponsoredBudgetDaily?: number;
}

