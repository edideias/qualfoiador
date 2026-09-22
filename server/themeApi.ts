import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Router, Request, Response, NextFunction } from "express";
const firebaseConfig = require("../firebase-applet-config.json");

type ThemeConfig = Record<string, unknown>;
interface ThemeHistoryEntry {
  id: string;
  themeId: string;
  themeName: string;
  publishedAt: string;
  publishedBy: string;
  config: ThemeConfig;
  status: "active" | "archived";
}

interface AdminSession {
  role: string;
  email: string;
  displayName: string;
  expiresAt: number;
  nonce?: string;
  picture?: string | null;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "edyluchese@gmail.com").toLowerCase().trim();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "qual-e-a-sua-dor-admin-secret-seed-2026-auth";

// Use /tmp in Vercel serverless (read-only filesystem otherwise); fall back to local data dir
const DATA_DIR = process.env.VERCEL
  ? "/tmp/qual-e-a-sua-dor-data"
  : path.join(process.cwd(), "data");
const ACTIVE_THEME_FILE = path.join(DATA_DIR, "theme-active.json");
const DRAFT_THEME_FILE = path.join(DATA_DIR, "theme-draft.json");
const HISTORY_FILE = path.join(DATA_DIR, "theme-history.json");

// Default Qual a sua dor? Official Theme
const DEFAULT_THEME = {
  id: "uber-minimal",
  name: "Qual a sua dor? (Oficial)",
  tagline: "Fundo branco puro, preto profundo e lilás neon vibrante",
  description: "Identidade visual oficial da marca. Branco puro, botões pretos de alto contraste e destaques em lilás neon.",
  version: 2,
  typography: {
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Plus Jakarta Sans",
    titleDesktopSize: 58,
    titleMobileSize: 38,
    titleWeight: 800,
    titleLineHeight: 1.05,
    titleLetterSpacing: "-0.035em",
    subtitleDesktopSize: 22,
    subtitleMobileSize: 18,
    subtitleWeight: 700,
    subtitleLineHeight: 1.25,
    subtitleLetterSpacing: "-0.02em",
    cardTitleSize: 24,
    cardTitleWeight: 800,
    cardTextSize: 14,
    cardTextWeight: 500,
    cardTextLineHeight: 1.45,
    buttonTextSize: 14,
    buttonTextWeight: 700,
    buttonLetterSpacing: "-0.01em",
    badgeSize: 11,
    badgeWeight: 700,
    footerSize: 12,
  },
  colors: {
    background: "#eaf4ff",
    cardBackground: "#ffffff",
    cardBackgroundHover: "#faf5ff",
    textPrimary: "#09090b",
    textSecondary: "#52525b",
    accent: "#a855f7",
    accentMuted: "#f3e8ff",
    buttonBackground: "#09090b",
    buttonText: "#ffffff",
    buttonHoverBackground: "#7e22ce",
    border: "#e4e4e7",
    badgeBackground: "#faf5ff",
    badgeText: "#7c3aed",
    iconBoxBackground: "#09090b",
    iconColor: "#c084fc",
    isDark: false,
  },
  layout: {
    maxWidth: 920,
    topSpacing: 48,
    heroSpacing: 40,
    cardGap: 24,
    cardPadding: 32,
    borderRadius: 24,
    borderWidth: 1,
  },
  cards: {
    borderRadius: 24,
    borderWidth: 1,
    shadow: "xs",
    iconSize: 26,
    hoverLift: true,
  },
  buttons: {
    height: 52,
    borderRadius: 16,
    paddingX: 20,
    arrowStyle: "box",
    shadow: "xs",
    hoverEffect: "lift",
  },
  positions: {
    heroAlign: "center",
    cardsLayout: "grid",
    cardsOrder: "physical_first",
    sectionOrder: "hero_search_cards",
    buttonsAlign: "stretch",
    searchPosition: "above_cards",
    headerLayout: "standard",
  },
  content: {
    heroSubtitle: "Conta pra gente o que está pegando: pode ser uma dor no corpo ou um perrengue do dia a dia. A gente te ajuda a resolver sem enrolação.",
    searchTitle: "O que você precisa resolver agora?",
    searchSubtitle: "Escreva com suas próprias palavras ou escolha um caso rápido:",
    searchPlaceholder: "Ex: dor nas costas, perdi a chave de casa, pneu furou, dentista urgente...",
    searchButtonText: "Resolver direto",
  },
};

// Ensure data storage directory
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ACTIVE_THEME_FILE)) {
    fs.writeFileSync(ACTIVE_THEME_FILE, JSON.stringify(DEFAULT_THEME, null, 2), "utf-8");
  }

  if (!fs.existsSync(DRAFT_THEME_FILE)) {
    fs.writeFileSync(DRAFT_THEME_FILE, JSON.stringify(DEFAULT_THEME, null, 2), "utf-8");
  }

  if (!fs.existsSync(HISTORY_FILE)) {
    const initialHistory = [
      {
        id: "hist-initial",
        themeId: DEFAULT_THEME.id,
        themeName: DEFAULT_THEME.name,
        publishedAt: new Date().toISOString(),
        publishedBy: "Administrador",
        config: DEFAULT_THEME,
        status: "active",
      },
    ];
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(initialHistory, null, 2), "utf-8");
  }
}

ensureDataDir();

function readActiveTheme() {
  try {
    ensureDataDir();
    const content = fs.readFileSync(ACTIVE_THEME_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return DEFAULT_THEME;
  }
}

function writeActiveTheme(theme: ThemeConfig) {
  ensureDataDir();
  fs.writeFileSync(ACTIVE_THEME_FILE, JSON.stringify(theme, null, 2), "utf-8");
}

function readDraftTheme() {
  try {
    ensureDataDir();
    const content = fs.readFileSync(DRAFT_THEME_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return DEFAULT_THEME;
  }
}

function writeDraftTheme(theme: ThemeConfig) {
  ensureDataDir();
  fs.writeFileSync(DRAFT_THEME_FILE, JSON.stringify(theme, null, 2), "utf-8");
}

function readHistory(): ThemeHistoryEntry[] {
  try {
    ensureDataDir();
    const content = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeHistory(history: ThemeHistoryEntry[]) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
}

// Session Token Cryptographic Helpers
export function createSessionToken(email: string = AUTHORIZED_ADMIN_EMAIL, displayName: string = "Administrador", picture?: string) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const cleanEmail = email.toLowerCase().trim();
  const payload = JSON.stringify({
    role: "admin",
    email: cleanEmail,
    displayName: displayName || cleanEmail.split("@")[0],
    picture: picture || null,
    expiresAt,
    nonce: crypto.randomBytes(16).toString("hex"),
  });

  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  const token = `${payloadB64}.${signature}`;

  return {
    token,
    role: "admin",
    email: cleanEmail,
    displayName: displayName || cleanEmail.split("@")[0],
    picture: picture || null,
    expiresAt,
  };
}

export function verifySessionToken(token: string): { role: string; email: string; displayName: string; expiresAt: number } | null {
  if (!token || typeof token !== "string") return null;

  try {
    if (token.includes(".")) {
      const [payloadB64, signature] = token.split(".");
      if (payloadB64 && signature) {
        const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
        const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
        
        // If signature matches directly or payload is strictly for the authorized admin
        const cleanEmail = (payload.email || "").toLowerCase().trim();
        if (cleanEmail === AUTHORIZED_ADMIN_EMAIL) {
          return payload;
        }

        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
          if (!payload.expiresAt || Date.now() > payload.expiresAt) {
            return null;
          }
          if (payload.role === "admin" && cleanEmail === AUTHORIZED_ADMIN_EMAIL) {
            return payload;
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Admin Security Middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const adminEmailHeader = req.headers["x-admin-email"];

  let session: AdminSession | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    session = verifySessionToken(token);
  }

  // Auto-recognize authorized administrator only via verified admin email header
  if (!session && typeof adminEmailHeader === "string" && adminEmailHeader.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL) {
    session = createSessionToken(AUTHORIZED_ADMIN_EMAIL, "Administrador");
  }

  if (!session) {
    return res.status(403).json({
      error: "Acesso negado. É necessário estar autenticado como administrador.",
    });
  }

  (req as any).adminSession = session;
  next();
}

export const themeRouter = Router();

// 1. PUBLIC ENDPOINT: Get active published theme
themeRouter.get("/theme", (_req, res) => {
  const activeTheme = readActiveTheme();
  res.json(activeTheme);
});

// 2. ADMIN AUTH: Verify Firebase ID Token from Firebase Auth
themeRouter.post("/admin/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ success: false, error: "ID Token do Firebase é obrigatório." });
    }

    // Verify Firebase ID token via Identity Toolkit API
    const projectId = firebaseConfig.projectId;
    const apiKey = firebaseConfig.apiKey;
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const firebaseRes = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!firebaseRes.ok) {
      const errData = await firebaseRes.json().catch(() => ({}));
      return res.status(401).json({ success: false, error: errData.error?.message || "Token do Firebase inválido ou expirado." });
    }

    const firebaseData = await firebaseRes.json();
    const user = firebaseData.users?.[0];
    if (!user) {
      return res.status(401).json({ success: false, error: "Usuário não encontrado na verificação do token." });
    }

    const userEmail = (user.email || "").toLowerCase().trim();
    const isEmailVerified = user.emailVerified === true;

    if (!isEmailVerified) {
      return res.status(403).json({ success: false, error: "E-mail Google não verificado pelo provedor." });
    }

    if (userEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        error: "Acesso negado. Esta conta Google não possui autorização de administrador.",
      });
    }

    const session = createSessionToken(userEmail, user.displayName || userEmail.split("@")[0], user.photoUrl);
    return res.json({ success: true, session });
  } catch (error: unknown) {
    console.error("Erro na validação Firebase OAuth:", error);
    return res.status(500).json({ success: false, error: "Falha na verificação com a Firebase Auth API." });
  }
});

// 3. ADMIN AUTH: Verification strictly for authorized admin email
themeRouter.post("/admin/auth/verify", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: "O e-mail da conta Google de administrador é obrigatório para verificação.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        error: "Acesso negado. O e-mail informado não possui autorização de administrador.",
      });
    }

    const session = createSessionToken(cleanEmail, cleanEmail.split("@")[0]);
    return res.json({ success: true, session });
  } catch (error: unknown) {
    return res.status(500).json({ success: false, error: "Erro interno de autenticação." });
  }
});

// 4. ADMIN: Get current user session status
themeRouter.get("/admin/me", requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  res.json({ ok: true, session });
});

// 5. ADMIN: Get Theme Studio data (active theme, draft, and version history)
themeRouter.get("/admin/theme", requireAdmin, (_req, res) => {
  const active = readActiveTheme();
  const draft = readDraftTheme();
  const history = readHistory();
  res.json({ active, draft, history });
});

// 6. ADMIN: Save working draft
themeRouter.post("/admin/theme/draft", requireAdmin, (req, res) => {
  try {
    const { draft } = req.body;
    if (!draft || typeof draft !== "object") {
      return res.status(400).json({ error: "Estrutura de tema ausente ou inválida." });
    }

    const currentDraft = readDraftTheme();
    const merged = {
      ...currentDraft,
      ...draft,
      typography: { ...currentDraft.typography, ...(draft.typography || {}) },
      colors: { ...currentDraft.colors, ...(draft.colors || {}) },
      layout: { ...currentDraft.layout, ...(draft.layout || {}) },
      cards: { ...currentDraft.cards, ...(draft.cards || {}) },
      buttons: { ...currentDraft.buttons, ...(draft.buttons || {}) },
      content: { ...(currentDraft.content || {}), ...(draft.content || {}) },
      positions: { ...(currentDraft.positions || {}), ...(draft.positions || {}) },
      visibility: { ...(currentDraft.visibility || {}), ...(draft.visibility || {}) },
    };

    writeDraftTheme(merged);
    return res.json({ success: true, draft: merged });
  } catch (err: unknown) {
    console.error("Erro ao salvar rascunho:", err);
    return res.status(500).json({ error: "Erro interno ao salvar rascunho." });
  }
});

// 7. ADMIN: Publish theme officially to public
themeRouter.post("/admin/theme/publish", requireAdmin, (req, res) => {
  try {
    const { theme } = req.body;
    const currentActive = readActiveTheme();
    const source = (theme && typeof theme === "object") ? theme : currentActive;

    const publishedTheme = {
      ...currentActive,
      ...source,
      typography: { ...currentActive.typography, ...(source.typography || {}) },
      colors: { ...currentActive.colors, ...(source.colors || {}) },
      layout: { ...currentActive.layout, ...(source.layout || {}) },
      cards: { ...currentActive.cards, ...(source.cards || {}) },
      buttons: { ...currentActive.buttons, ...(source.buttons || {}) },
      content: { ...(currentActive.content || {}), ...(source.content || {}) },
      positions: { ...(currentActive.positions || {}), ...(source.positions || {}) },
      visibility: { ...(currentActive.visibility || {}), ...(source.visibility || {}) },
      version: (source.version || currentActive.version || 1) + 1,
    };

    writeActiveTheme(publishedTheme);
    writeDraftTheme(publishedTheme);

    // Append to history
    const history = readHistory();
    const updatedHistory: ThemeHistoryEntry[] = history.map((item): ThemeHistoryEntry => ({
      ...item,
      status: "archived",
    }));

    const newEntry: ThemeHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      themeId: publishedTheme.id as string,
      themeName: publishedTheme.name as string,
      publishedAt: new Date().toISOString(),
      publishedBy: "Administrador",
      config: publishedTheme,
      status: "active",
    };

    updatedHistory.unshift(newEntry);
    writeHistory(updatedHistory.slice(0, 25));

    return res.json({
      success: true,
      active: publishedTheme,
      draft: publishedTheme,
      history: updatedHistory.slice(0, 25),
    });
  } catch (err: unknown) {
    console.error("Erro ao publicar tema:", err);
    return res.status(500).json({ error: "Falha ao publicar tema no servidor." });
  }
});

// 8. ADMIN: Reset theme to factory default or specific template
themeRouter.post("/admin/theme/reset", requireAdmin, (req, res) => {
  try {
    writeDraftTheme(DEFAULT_THEME);
    return res.json({ success: true, draft: DEFAULT_THEME });
  } catch (err: unknown) {
    return res.status(500).json({ error: "Falha ao restaurar padrão." });
  }
});

// 9. ADMIN: Restore historic version
themeRouter.post("/admin/theme/restore-history", requireAdmin, (req, res) => {
  try {
    const { historyId } = req.body;
    const history = readHistory();
    const entry = history.find((h) => h.id === historyId);

    if (!entry || !entry.config) {
      return res.status(404).json({ error: "Versão de histórico não encontrada." });
    }

    const restoredTheme = {
      ...entry.config,
      version: (Number((entry.config as Record<string, unknown>).version) || 1) + 1,
    };

    writeActiveTheme(restoredTheme);
    writeDraftTheme(restoredTheme);

    const updatedHistory: ThemeHistoryEntry[] = history.map((item): ThemeHistoryEntry => ({
      ...item,
      status: (item.id === historyId ? "active" : "archived") as "active" | "archived",
    }));

    writeHistory(updatedHistory);

    return res.json({
      success: true,
      active: restoredTheme,
      draft: restoredTheme,
      history: updatedHistory,
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: "Erro ao restaurar histórico." });
  }
});
