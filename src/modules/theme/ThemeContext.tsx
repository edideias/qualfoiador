import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeConfig } from './types';
import { DEFAULT_THEME } from './templates';
import { themeService, AdminSession } from './themeService';
import { subscribeToActiveTheme } from '../firebase/firestoreService';

interface ThemeContextType {
  effectiveTheme: ThemeConfig;
  activeTheme: ThemeConfig;
  draftTheme: ThemeConfig;
  testTheme: ThemeConfig | null;
  adminSession: AdminSession | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
  setTestTheme: (theme: ThemeConfig | null) => void;
  updateDraft: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
  setDraftTheme: (theme: ThemeConfig) => void;
  saveDraft: () => Promise<void>;
  publishTheme: (themeToPublish?: ThemeConfig) => Promise<void>;
  updateLiveTheme: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
  publishLiveTheme: () => Promise<void>;
  discardLiveChanges: () => void;
  resetToDefault: (templateId?: string) => Promise<void>;
  restoreHistory: (historyId: string) => Promise<void>;
  loginWithGoogleCredential: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleFirebase: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginDirect: (email?: string, directAuth?: boolean) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [effectiveTheme, setEffectiveTheme] = useState<ThemeConfig>(() => themeService.getCurrentEffectiveTheme());
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => themeService.getActiveTheme());
  const [draftTheme, setDraftThemeState] = useState<ThemeConfig>(() => themeService.getDraftTheme());
  const [testTheme, setTestThemeState] = useState<ThemeConfig | null>(() => themeService.getTestTheme());
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => themeService.getAdminSession());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load from server and real-time Firestore sync
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const serverActive = await themeService.fetchServerActiveTheme();
        if (isMounted) {
          setActiveTheme(serverActive);
          const currentTest = themeService.getTestTheme();
          setTestThemeState(currentTest);
          setEffectiveTheme(currentTest || serverActive);
        }
      } catch (err) {
        console.warn('Theme init warning:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    const unsubFirestore = subscribeToActiveTheme((cloudTheme) => {
      if (isMounted && cloudTheme && cloudTheme.id) {
        setActiveTheme(cloudTheme);
        const currentTest = themeService.getTestTheme();
        if (!currentTest) {
          setEffectiveTheme(cloudTheme);
          themeService.applyTheme(cloudTheme);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubFirestore();
    };
  }, []);

  const refreshTheme = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverTheme = await themeService.fetchServerActiveTheme();
      setActiveTheme(serverTheme);
      const currentTest = themeService.getTestTheme();
      setTestThemeState(currentTest);
      setEffectiveTheme(currentTest || serverTheme);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTestTheme = useCallback((theme: ThemeConfig | null) => {
    themeService.setTestTheme(theme);
    setTestThemeState(theme);
    setEffectiveTheme(theme || activeTheme);
  }, [activeTheme]);

  const updateDraft = useCallback((updater: (prev: ThemeConfig) => ThemeConfig) => {
    setDraftThemeState((prev) => {
      const updated = updater(prev);
      themeService.applyTheme(updated);
      if (themeService.getTestTheme()) {
        themeService.setTestTheme(updated);
        setTestThemeState(updated);
        setEffectiveTheme(updated);
      }
      return updated;
    });
  }, []);

  const setDraftTheme = useCallback((theme: ThemeConfig) => {
    setDraftThemeState(theme);
    themeService.applyTheme(theme);
    if (themeService.getTestTheme()) {
      themeService.setTestTheme(theme);
      setTestThemeState(theme);
      setEffectiveTheme(theme);
    }
  }, []);

  const saveDraft = useCallback(async () => {
    const saved = await themeService.adminSaveDraft(draftTheme);
    setDraftThemeState(saved);
  }, [draftTheme]);

  const publishTheme = useCallback(async (themeToPublish?: ThemeConfig) => {
    const target = themeToPublish || draftTheme;
    const result = await themeService.adminPublishTheme(target);
    setActiveTheme(result.active);
    setDraftThemeState(result.draft);
    setTestThemeState(null);
    themeService.setTestTheme(null);
    setEffectiveTheme(result.active);
    themeService.applyTheme(result.active);
  }, [draftTheme]);

  const updateLiveTheme = useCallback((updater: (prev: ThemeConfig) => ThemeConfig) => {
    setEffectiveTheme((current) => {
      const updated = updater(current);
      setDraftThemeState(updated);
      setTestThemeState(updated);
      themeService.setTestTheme(updated);
      return updated;
    });
  }, []);

  const publishLiveTheme = useCallback(async () => {
    const result = await themeService.adminPublishTheme(effectiveTheme);
    setActiveTheme(result.active);
    setDraftThemeState(result.draft);
    setTestThemeState(null);
    themeService.setTestTheme(null);
    setEffectiveTheme(result.active);
  }, [effectiveTheme]);

  const discardLiveChanges = useCallback(() => {
    themeService.setTestTheme(null);
    setTestThemeState(null);
    setEffectiveTheme(activeTheme);
    setDraftThemeState(activeTheme);
  }, [activeTheme]);

  const resetToDefault = useCallback(async (templateId?: string) => {
    const result = await themeService.adminResetTheme(templateId);
    setDraftThemeState(result.draft);
  }, []);

  const restoreHistory = useCallback(async (historyId: string) => {
    const result = await themeService.adminRestoreHistory(historyId);
    setActiveTheme(result.active);
    setDraftThemeState(result.draft);
    setTestThemeState(null);
    setEffectiveTheme(result.active);
  }, []);

  const loginWithGoogleCredential = useCallback(async (idToken: string) => {
    const res = await themeService.adminLoginWithGoogleCredential(idToken);
    if (res.success && res.session) {
      setAdminSession(res.session);
    }
    return res;
  }, []);

  const loginWithGoogleFirebase = useCallback(async () => {
    const res = await themeService.adminLoginWithGoogleFirebase();
    if (res.success && res.session) {
      setAdminSession(res.session);
    }
    return res;
  }, []);

  const loginWithEmail = useCallback(async (email: string) => {
    const res = await themeService.adminVerifyEmail(email);
    if (res.success && res.session) {
      setAdminSession(res.session);
    }
    return res;
  }, []);

  const loginDirect = useCallback(async (email?: string) => {
    return loginWithEmail(email || '');
  }, [loginWithEmail]);

  const logoutAdmin = useCallback(() => {
    themeService.adminLogout();
    setAdminSession(null);
    setTestThemeState(null);
    setEffectiveTheme(activeTheme);
  }, [activeTheme]);

  const isAdmin = Boolean(
    adminSession &&
    adminSession.token &&
    adminSession.email &&
    Date.now() < (adminSession.expiresAt || 0)
  );

  return (
    <ThemeContext.Provider
      value={{
        effectiveTheme,
        activeTheme,
        draftTheme,
        testTheme,
        adminSession,
        isAdmin,
        isLoading,
        refreshTheme,
        setTestTheme,
        updateDraft,
        setDraftTheme,
        saveDraft,
        publishTheme,
        updateLiveTheme,
        publishLiveTheme,
        discardLiveChanges,
        resetToDefault,
        restoreHistory,
        loginWithGoogleCredential,
        loginWithGoogleFirebase,
        loginWithEmail,
        loginDirect,
        logoutAdmin,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
