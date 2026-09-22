/**
 * Theme and Design Token Types for "Qual é a sua dor?"
 */

export interface ThemeTypography {
  headingFont: string; // e.g., 'Manrope', 'Plus Jakarta Sans', 'Inter', 'Sora', 'Outfit', etc.
  bodyFont: string;
  titleDesktopSize: number; // px (32 - 84)
  titleMobileSize: number; // px (24 - 60)
  titleWeight: number; // 400 - 900
  titleLineHeight: number; // 1.0 - 1.4
  titleLetterSpacing: string; // e.g., '-0.035em', '0em', '0.02em'
  subtitleDesktopSize: number; // px (16 - 36)
  subtitleMobileSize: number; // px (14 - 28)
  subtitleWeight: number; // 400 - 800
  subtitleLineHeight: number; // 1.1 - 1.6
  subtitleLetterSpacing: string;
  cardTitleSize: number; // px (18 - 36)
  cardTitleWeight: number; // 600 - 900
  cardTextSize: number; // px (12 - 22)
  cardTextWeight: number; // 400 - 600
  cardTextLineHeight: number; // 1.2 - 1.7
  buttonTextSize: number; // px (12 - 24)
  buttonTextWeight: number; // 600 - 900
  buttonLetterSpacing: string;
  badgeSize: number; // px (10 - 18)
  badgeWeight: number; // 600 - 800
  footerSize: number; // px (11 - 16)
  headerLogoSize?: number; // px (12 - 24)
  menuTextSize?: number; // px (10 - 18)
}

export interface ThemeColors {
  background: string; // e.g. '#fafaf9'
  cardBackground: string; // e.g. '#ffffff'
  cardBackgroundHover: string;
  textPrimary: string; // e.g. '#0c0a09'
  textSecondary: string; // e.g. '#57534e'
  accent: string; // e.g. '#f59e0b'
  accentMuted: string; // e.g. '#fef3c7'
  buttonBackground: string; // e.g. '#0c0a09'
  buttonText: string; // e.g. '#ffffff'
  buttonHoverBackground: string;
  border: string; // e.g. '#e7e5e4'
  badgeBackground: string; // e.g. '#f5f5f4'
  badgeText: string; // e.g. '#44403c'
  iconBoxBackground: string; // e.g. '#f5f5f4'
  iconColor: string; // e.g. '#1c1917'
  isDark: boolean;
}

export interface ThemeLayout {
  maxWidth: number; // px (720 - 1300)
  topSpacing: number; // px (8 - 120)
  bottomSpacing?: number; // px (16 - 120)
  heroSpacing: number; // px (12 - 80)
  searchSpacing?: number; // px (12 - 64)
  cardGap: number; // px (8 - 48)
  cardPadding: number; // px (12 - 56)
  cardContentGap?: number; // px (8 - 36)
  containerPaddingX?: number; // px (12 - 48)
  footerSpacing?: number; // px (16 - 80)
  borderRadius: number; // px (0 - 40)
  borderWidth: number; // px (1 - 4)
  density?: 'compact' | 'balanced' | 'spacious' | 'airy';
  mobileAdaptive?: boolean;
}

export interface ThemeCards {
  borderRadius: number; // px
  borderWidth: number; // px
  shadow: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  iconSize: number; // px (18 - 36)
  hoverLift: boolean;
}

export interface ThemeButtons {
  height: number; // px (44 - 64)
  borderRadius: number; // px (0 - 32)
  paddingX: number; // px (12 - 32)
  arrowStyle: 'classic' | 'box' | 'subtle' | 'none';
  shadow: 'none' | 'xs' | 'sm' | 'md';
  hoverEffect: 'lift' | 'darken' | 'glow' | 'scale';
  alignment?: 'stretch' | 'left' | 'center' | 'right';
}

export interface ThemeContent {
  headerBrandPrefix?: string;
  headerBrandHighlight?: string;
  headerSupplierText?: string;
  headerBadgeText?: string;
  headerBadgeVisible?: boolean;

  heroBadgeText?: string;
  heroBadgeSecondaryText?: string;
  heroTitlePrefix?: string;
  heroTitleHighlight?: string;
  heroSubtitle?: string;

  cardPhysicalTitle?: string;
  cardPhysicalDesc?: string;
  cardPhysicalBadge?: string;
  cardPhysicalButton?: string;

  cardProblemTitle?: string;
  cardProblemDesc?: string;
  cardProblemBadge?: string;
  cardProblemButton?: string;

  searchTitle?: string;
  searchSubtitle?: string;
  searchPlaceholder?: string;
  searchButtonText?: string;

  footerNotice?: string;

  // Banner / Badge de Fornecedor no Rodapé
  footerSupplierTitle?: string;
  footerSupplierSubtitle?: string;
  footerSupplierButtonText?: string;
  footerSupplierBadgeText?: string;
}

export interface ThemeVisibility {
  // Cabeçalho e Controles de Acesso
  showHeaderBrand?: boolean;
  showHeaderBadge?: boolean;
  showHeaderSupplierBtn?: boolean;
  showHeaderAdminBtn?: boolean;

  // Controles Flutuantes do Admin
  showFloatingAdminWidget?: boolean;

  // Mascotes e Elementos Gráficos
  showMascotsGlobal?: boolean;
  showMascotHero?: boolean;
  showMascotCards?: boolean;
  showMascotAudioModal?: boolean;

  // Seção Principal (Hero)
  showHeroBadge?: boolean;
  showHeroTitle?: boolean;
  showHeroSubtitle?: boolean;

  // Cards e Elementos Internos
  showCardPhysical?: boolean;
  showCardProblem?: boolean;
  showCardPhysicalIcon?: boolean;
  showCardProblemIcon?: boolean;
  showCardPhysicalBadge?: boolean;
  showCardProblemBadge?: boolean;
  showCardPhysicalButton?: boolean;
  showCardProblemButton?: boolean;

  // Busca, Áudio e Rodapé
  showSearchSection?: boolean;
  showAudioInputButton?: boolean;
  showSearchChips?: boolean;
  showFooterNotice?: boolean;
  showFooterSection?: boolean;
  showFooterSupplierBanner?: boolean;
}

export interface ThemePositions {
  heroAlign?: 'center' | 'left' | 'right';
  cardsLayout?: 'grid' | 'stack';
  cardsOrder?: 'physical_first' | 'problem_first';
  sectionOrder?: 'hero_cards_search' | 'hero_search_cards' | 'search_hero_cards';
  buttonsAlign?: 'stretch' | 'left' | 'center' | 'right';
  searchPosition?: 'above_cards' | 'below_cards';
  headerLayout?: 'standard' | 'minimal' | 'centered';
  headerSupplierPosition?: 'header_only' | 'footer_only' | 'both' | 'none';
}

export interface ThemeHeroLogo {
  frameStyle?: 'none' | 'glow' | 'card' | 'circle' | 'subtle';
  size?: number;
  floatingAnimation?: boolean;
  animationDuration?: number;
  animationAmplitude?: number;
  pulseEffect?: boolean;
  rotateEffect?: boolean;
  shadowGlow?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  version: number;
  typography: ThemeTypography;
  colors: ThemeColors;
  layout: ThemeLayout;
  cards: ThemeCards;
  buttons: ThemeButtons;
  content?: ThemeContent;
  positions?: ThemePositions;
  visibility?: ThemeVisibility;
  heroLogo?: ThemeHeroLogo;
}

export const DEFAULT_THEME_CONTENT: Required<ThemeContent> = {
  headerBrandPrefix: 'Qual a sua',
  headerBrandHighlight: 'dor?',
  headerSupplierText: 'Área do Fornecedor',
  headerBadgeText: 'Direto ao ponto • Sem cadastro',
  headerBadgeVisible: true,

  heroBadgeText: 'Leva menos de 1 minuto',
  heroBadgeSecondaryText: '100% privado',
  heroTitlePrefix: 'Qual a sua',
  heroTitleHighlight: 'dor?',
  heroSubtitle: 'Conta pra gente o que está pegando: pode ser uma dor no corpo ou um perrengue do dia a dia. A gente te ajuda a resolver sem enrolação.',

  cardPhysicalTitle: 'Dor Física',
  cardPhysicalDesc: 'No corpo, muscular, coluna, cabeça ou desconforto geral.',
  cardPhysicalBadge: 'Avaliação Rápida',
  cardPhysicalButton: 'Começar avaliação da dor',

  cardProblemTitle: 'Dor de Problema',
  cardProblemDesc: 'Dificuldade na vida prática, emergência, carro, casa ou serviço.',
  cardProblemBadge: 'Solução Direta',
  cardProblemButton: 'Avaliar meu problema agora',

  searchTitle: 'O que você precisa resolver agora?',
  searchSubtitle: 'Escreva com suas próprias palavras ou escolha um caso rápido:',
  searchPlaceholder: 'Ex: dor nas costas, perdi a chave de casa, pneu furou, dentista urgente...',
  searchButtonText: 'Resolver direto',

  footerNotice: 'Privado • Sem cadastro inicial • Responda do seu jeito',

  footerSupplierTitle: 'Você é médico, especialista ou prestador de serviços?',
  footerSupplierSubtitle: 'Conecte-se a pessoas com dores reais que precisam de atendimento e resolução imediata na sua região.',
  footerSupplierButtonText: 'Acessar Área do Fornecedor',
  footerSupplierBadgeText: 'Oportunidades Abertas',
};

export const DEFAULT_THEME_POSITIONS: Required<ThemePositions> = {
  heroAlign: 'center',
  cardsLayout: 'grid',
  cardsOrder: 'physical_first',
  sectionOrder: 'hero_search_cards',
  buttonsAlign: 'stretch',
  searchPosition: 'above_cards',
  headerLayout: 'standard',
  headerSupplierPosition: 'footer_only',
};

export const DEFAULT_THEME_VISIBILITY: Required<ThemeVisibility> = {
  showHeaderBrand: true,
  showHeaderBadge: true,
  showHeaderSupplierBtn: false,
  showHeaderAdminBtn: true,

  showFloatingAdminWidget: true,

  showMascotsGlobal: true,
  showMascotHero: true,
  showMascotCards: true,
  showMascotAudioModal: true,

  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,

  showCardPhysical: true,
  showCardProblem: true,
  showCardPhysicalIcon: true,
  showCardProblemIcon: true,
  showCardPhysicalBadge: true,
  showCardProblemBadge: true,
  showCardPhysicalButton: true,
  showCardProblemButton: true,

  showSearchSection: true,
  showAudioInputButton: true,
  showSearchChips: true,

  showFooterNotice: true,
  showFooterSection: true,
  showFooterSupplierBanner: true,
};

export const DEFAULT_THEME_HERO_LOGO: Required<ThemeHeroLogo> = {
  frameStyle: 'none', // Solta por padrão (sem o quadrado!)
  size: 190,
  floatingAnimation: true,
  animationDuration: 3.5,
  animationAmplitude: 8,
  pulseEffect: false,
  rotateEffect: false,
  shadowGlow: false,
};

export function getThemeContent(theme?: ThemeConfig | null): Required<ThemeContent> {
  return {
    ...DEFAULT_THEME_CONTENT,
    ...(theme?.content || {}),
  };
}

export function getThemePositions(theme?: ThemeConfig | null): Required<ThemePositions> {
  return {
    ...DEFAULT_THEME_POSITIONS,
    ...(theme?.positions || {}),
  };
}

export function getThemeVisibility(theme?: ThemeConfig | null): Required<ThemeVisibility> {
  return {
    ...DEFAULT_THEME_VISIBILITY,
    ...(theme?.visibility || {}),
  };
}

export const DEFAULT_THEME_LAYOUT: Required<ThemeLayout> = {
  maxWidth: 920,
  topSpacing: 48,
  bottomSpacing: 64,
  heroSpacing: 40,
  searchSpacing: 28,
  cardGap: 24,
  cardPadding: 32,
  cardContentGap: 16,
  containerPaddingX: 24,
  footerSpacing: 32,
  borderRadius: 24,
  borderWidth: 1,
  density: 'balanced',
  mobileAdaptive: true,
};

export function getThemeLayout(theme?: ThemeConfig | null): Required<ThemeLayout> {
  return {
    ...DEFAULT_THEME_LAYOUT,
    ...(theme?.layout || {}),
  };
}

export function getThemeHeroLogo(theme?: ThemeConfig | null): Required<ThemeHeroLogo> {
  return {
    ...DEFAULT_THEME_HERO_LOGO,
    ...(theme?.heroLogo || {}),
  };
}

export interface ThemeHistoryEntry {
  id: string;
  themeId: string;
  themeName: string;
  publishedAt: string;
  publishedBy: string;
  config: ThemeConfig;
  status: 'active' | 'archived';
}
