import { ThemeConfig, ThemeHistoryEntry, getThemeLayout } from './types';
import { DEFAULT_THEME, ALL_TEMPLATES } from './templates';
import { ensureFontLoaded } from './fontLoader';
import {
  saveActiveThemeToFirestore,
  saveDraftThemeToFirestore,
  loadActiveThemeFromFirestore,
  saveThemeHistoryToFirestore,
} from '../firebase/firestoreService';

const STORAGE_ACTIVE_KEY = 'qual_e_a_sua_dor:theme:active';
const STORAGE_DRAFT_KEY = 'qual_e_a_sua_dor:theme:draft';
const STORAGE_ADMIN_SESSION_KEY = 'qual_e_a_sua_dor:admin:session';
const STORAGE_TEST_THEME_KEY = 'qual_e_a_sua_dor:theme:testing';

export interface AdminSession {
  token: string;
  role?: string;
  displayName?: string;
  email?: string;
  name?: string;
  picture?: string;
  expiresAt: number;
}

class ThemeService {
  private activeTheme: ThemeConfig = DEFAULT_THEME;
  private draftTheme: ThemeConfig = DEFAULT_THEME;
  private testTheme: ThemeConfig | null = null;
  private history: ThemeHistoryEntry[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Try reading cached active theme
    try {
      const cachedActive = localStorage.getItem(STORAGE_ACTIVE_KEY);
      if (cachedActive) {
        this.activeTheme = JSON.parse(cachedActive);
      }
      const cachedDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (cachedDraft) {
        this.draftTheme = JSON.parse(cachedDraft);
      }
      const testCached = sessionStorage.getItem(STORAGE_TEST_THEME_KEY);
      if (testCached) {
        this.testTheme = JSON.parse(testCached);
      }
    } catch {
      // Fallback
    }

    this.applyTheme(this.getCurrentEffectiveTheme());
  }

  public getCurrentEffectiveTheme(): ThemeConfig {
    const t = this.testTheme || this.activeTheme;
    return {
      ...t,
      layout: getThemeLayout(t),
    };
  }

  public getActiveTheme(): ThemeConfig {
    return {
      ...this.activeTheme,
      layout: getThemeLayout(this.activeTheme),
    };
  }

  public getDraftTheme(): ThemeConfig {
    return {
      ...this.draftTheme,
      layout: getThemeLayout(this.draftTheme),
    };
  }

  public getTestTheme(): ThemeConfig | null {
    if (!this.testTheme) return null;
    return {
      ...this.testTheme,
      layout: getThemeLayout(this.testTheme),
    };
  }

  public setTestTheme(theme: ThemeConfig | null) {
    this.testTheme = theme ? { ...theme, layout: getThemeLayout(theme) } : null;
    if (typeof window !== 'undefined') {
      if (this.testTheme) {
        sessionStorage.setItem(STORAGE_TEST_THEME_KEY, JSON.stringify(this.testTheme));
      } else {
        sessionStorage.removeItem(STORAGE_TEST_THEME_KEY);
      }
    }
    this.applyTheme(this.getCurrentEffectiveTheme());
  }

  public applyTheme(theme: ThemeConfig) {
    if (typeof document === 'undefined') return;

    // Load fonts
    ensureFontLoaded(theme.typography.headingFont);
    ensureFontLoaded(theme.typography.bodyFont);

    const root = document.documentElement;

    // Colors
    root.style.setProperty('--theme-bg', theme.colors.background);
    root.style.setProperty('--theme-card-bg', theme.colors.cardBackground);
    root.style.setProperty('--theme-card-bg-hover', theme.colors.cardBackgroundHover);
    root.style.setProperty('--theme-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-accent-muted', theme.colors.accentMuted);
    root.style.setProperty('--theme-btn-bg', theme.colors.buttonBackground);
    root.style.setProperty('--theme-btn-text', theme.colors.buttonText);
    root.style.setProperty('--theme-btn-hover', theme.colors.buttonHoverBackground);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-badge-bg', theme.colors.badgeBackground);
    root.style.setProperty('--theme-badge-text', theme.colors.badgeText);
    root.style.setProperty('--theme-icon-box-bg', theme.colors.iconBoxBackground);
    root.style.setProperty('--theme-icon-color', theme.colors.iconColor);

    // Fonts
    root.style.setProperty('--theme-font-heading', `'${theme.typography.headingFont}', system-ui, -apple-system, sans-serif`);
    root.style.setProperty('--theme-font-body', `'${theme.typography.bodyFont}', system-ui, -apple-system, sans-serif`);

    // Dimensions
    root.style.setProperty('--theme-card-radius', `${theme.cards.borderRadius}px`);
    root.style.setProperty('--theme-card-border-width', `${theme.cards.borderWidth}px`);
    root.style.setProperty('--theme-btn-radius', `${theme.buttons.borderRadius}px`);
    root.style.setProperty('--theme-btn-height', `${theme.buttons.height}px`);
    root.style.setProperty('--theme-btn-padding-x', `${theme.buttons.paddingX}px`);

    // Layout & Spacing
    const layout = getThemeLayout(theme);
    root.style.setProperty('--theme-layout-max-width', `${layout.maxWidth}px`);
    root.style.setProperty('--theme-layout-top-spacing', `${layout.topSpacing}px`);
    root.style.setProperty('--theme-layout-bottom-spacing', `${layout.bottomSpacing ?? 64}px`);
    root.style.setProperty('--theme-layout-hero-spacing', `${layout.heroSpacing}px`);
    root.style.setProperty('--theme-layout-search-spacing', `${layout.searchSpacing ?? 28}px`);
    root.style.setProperty('--theme-layout-card-gap', `${layout.cardGap}px`);
    root.style.setProperty('--theme-layout-card-padding', `${layout.cardPadding}px`);
    root.style.setProperty('--theme-layout-card-content-gap', `${layout.cardContentGap ?? 16}px`);
    root.style.setProperty('--theme-layout-container-padding-x', `${layout.containerPaddingX ?? 24}px`);
    root.style.setProperty('--theme-layout-footer-spacing', `${layout.footerSpacing ?? 32}px`);

    // Dynamic background on body
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.textPrimary;
  }

  /**
   * Fetch active theme from server and Firestore (public)
   */
  public async fetchServerActiveTheme(): Promise<ThemeConfig> {
    // 1. Tenta carregar da nuvem (Firestore) primeiro
    try {
      const firestoreTheme = await loadActiveThemeFromFirestore();
      if (firestoreTheme && firestoreTheme.id) {
        this.activeTheme = firestoreTheme;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(firestoreTheme));
        }
        if (!this.testTheme) {
          this.applyTheme(firestoreTheme);
        }
        return firestoreTheme;
      }
    } catch {
      // continua para fallback do express
    }

    try {
      const res = await fetch('/api/theme');
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          this.activeTheme = data;
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(data));
          }
          if (!this.testTheme) {
            this.applyTheme(data);
          }
          // Garante sincronização no Firestore
          saveActiveThemeToFirestore(data).catch(() => {});
          return data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch server theme, using local default:', err);
    }
    return this.activeTheme;
  }

  // ================= ADMIN AUTH & SESSIONS =================

  public getAdminSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
      if (!raw) return null;
      const session: AdminSession = JSON.parse(raw);
      if (!session.token || !session.email || (session.expiresAt && Date.now() > session.expiresAt)) {
        localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public setAdminSession(session: AdminSession | null) {
    if (typeof window === 'undefined') return;
    if (session && session.token && session.email) {
      localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
    }
  }

  public async adminLoginWithGoogleCredential(idToken: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
    try {
      const res = await fetch('/api/admin/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Autenticação Google recusada.' };
      }

      this.setAdminSession(data.session);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão com o servidor.' };
    }
  }

  public async adminVerifyEmail(email: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Acesso negado. Apenas o administrador autorizado possui permissão.' };
      }

      this.setAdminSession(data.session);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao autenticar com o servidor.' };
    }
  }

  public async adminDirectVerify(email?: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
    return this.adminVerifyEmail(email || '');
  }

  public adminLogout() {
    this.setAdminSession(null);
    this.setTestTheme(null);
  }

  // ================= ADMIN THEME MANAGEMENT =================

  private getAuthHeaders(): Record<string, string> {
    const session = this.getAdminSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.token || ''}`,
    };
    if (session?.email) {
      headers['x-admin-email'] = session.email;
    }
    return headers;
  }

  public async adminFetchThemeData(): Promise<{ active: ThemeConfig; draft: ThemeConfig; history: ThemeHistoryEntry[] }> {
    try {
      const res = await fetch('/api/admin/theme', {
        headers: this.getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        this.activeTheme = data.active || DEFAULT_THEME;
        this.draftTheme = data.draft || DEFAULT_THEME;
        this.history = data.history || [];

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(this.activeTheme));
          localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(this.draftTheme));
        }

        return data;
      }
    } catch (err) {
      console.warn('Fetch theme data from server failed, using cached values:', err);
    }

    return {
      active: this.activeTheme,
      draft: this.draftTheme,
      history: this.history,
    };
  }

  public async adminSaveDraft(draft: ThemeConfig): Promise<ThemeConfig> {
    const normalizedDraft = {
      ...draft,
      layout: getThemeLayout(draft),
    };
    // 1. Instant local persistence & DOM update
    this.draftTheme = normalizedDraft;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(this.draftTheme));
    }
    this.applyTheme(normalizedDraft);

    // 2. Sync to Firestore
    saveDraftThemeToFirestore(normalizedDraft).catch(() => {});

    // 3. Sync to server
    try {
      const res = await fetch('/api/admin/theme/draft', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ draft: normalizedDraft }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.draft) {
          this.draftTheme = {
            ...data.draft,
            layout: getThemeLayout(data.draft),
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(this.draftTheme));
          }
        }
      }
    } catch (err) {
      console.warn('Draft sync warning (saved locally):', err);
    }

    return this.draftTheme;
  }

  public async adminPublishTheme(theme: ThemeConfig): Promise<{ active: ThemeConfig; draft: ThemeConfig; history: ThemeHistoryEntry[] }> {
    const normalizedTheme = {
      ...theme,
      layout: getThemeLayout(theme),
    };
    // 1. Instant full application in DOM & storage
    this.activeTheme = normalizedTheme;
    this.draftTheme = normalizedTheme;
    this.setTestTheme(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(this.activeTheme));
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(this.draftTheme));
    }
    this.applyTheme(this.activeTheme);

    // 2. Sync to Firestore
    saveActiveThemeToFirestore(this.activeTheme).catch(() => {});
    saveThemeHistoryToFirestore({
      id: `hist_${Date.now()}`,
      themeId: theme.id,
      themeName: theme.name,
      publishedAt: new Date().toISOString(),
      publishedBy: this.getAdminSession()?.email || 'admin',
      config: theme,
      status: 'active',
    }).catch(() => {});

    // 3. Sync to server
    try {
      const res = await fetch('/api/admin/theme/publish', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ theme }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.active) {
          this.activeTheme = data.active;
          this.draftTheme = data.draft || data.active;
          this.history = data.history || [];
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(this.activeTheme));
            localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(this.draftTheme));
          }
          this.applyTheme(this.activeTheme);
          return data;
        }
      }
    } catch (err) {
      console.warn('Publish server sync notice (applied and saved locally):', err);
    }

    return {
      active: this.activeTheme,
      draft: this.draftTheme,
      history: this.history,
    };
  }

  public async adminResetTheme(themeId?: string): Promise<{ active: ThemeConfig; draft: ThemeConfig }> {
    const res = await fetch('/api/admin/theme/reset', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ themeId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao restaurar padrão');
    }

    const data = await res.json();
    this.draftTheme = data.draft;
    return data;
  }

  public async adminRestoreHistory(historyId: string): Promise<{ active: ThemeConfig; draft: ThemeConfig; history: ThemeHistoryEntry[] }> {
    const res = await fetch('/api/admin/theme/restore-history', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ historyId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao restaurar versão do histórico');
    }

    const data = await res.json();
    this.activeTheme = data.active;
    this.draftTheme = data.draft;
    this.history = data.history;
    this.setTestTheme(null);
    this.applyTheme(this.activeTheme);
    return data;
  }
}

export const themeService = new ThemeService();
