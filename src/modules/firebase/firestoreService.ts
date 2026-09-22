import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ThemeConfig, ThemeHistoryEntry } from '../theme/types';
import { MascotCharacter } from '../mascot/mascotAssets';

const COLLECTION_CONFIG = 'app_config';
const DOC_ACTIVE_THEME = 'theme_active';
const DOC_DRAFT_THEME = 'theme_draft';

const COLLECTION_MASCOTS = 'mascot_customizations';
const COLLECTION_HISTORY = 'theme_history';
const COLLECTION_REPORTS = 'reported_solutions';

/**
 * Salva o tema ativo publicado diretamente no Firestore para persistência global
 */
export async function saveActiveThemeToFirestore(theme: ThemeConfig): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_CONFIG, DOC_ACTIVE_THEME);
    await setDoc(docRef, {
      ...theme,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('[Firestore] Tema ativo publicado e sincronizado na nuvem com sucesso.');
    return true;
  } catch (err) {
    console.warn('[Firestore] Falha ao sincronizar tema ativo no Firestore:', err);
    return false;
  }
}

/**
 * Salva o rascunho de tema no Firestore
 */
export async function saveDraftThemeToFirestore(draft: ThemeConfig): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_CONFIG, DOC_DRAFT_THEME);
    await setDoc(docRef, {
      ...draft,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Falha ao sincronizar rascunho no Firestore:', err);
    return false;
  }
}

/**
 * Carrega o tema ativo do Firestore
 */
export async function loadActiveThemeFromFirestore(): Promise<ThemeConfig | null> {
  try {
    const docRef = doc(db, COLLECTION_CONFIG, DOC_ACTIVE_THEME);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ThemeConfig;
    }
  } catch (err) {
    console.warn('[Firestore] Falha ao carregar tema ativo do Firestore:', err);
  }
  return null;
}

/**
 * Inscreve-se para receber atualizações do tema ativo em tempo real
 */
export function subscribeToActiveTheme(callback: (theme: ThemeConfig) => void): () => void {
  try {
    const docRef = doc(db, COLLECTION_CONFIG, DOC_ACTIVE_THEME);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const theme = snap.data() as ThemeConfig;
        callback(theme);
      }
    }, (error) => {
      console.warn('[Firestore] Erro no listener do tema ativo:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Não foi possível registrar listener do tema:', err);
    return () => {};
  }
}

/**
 * Salva todos os mascotes customizados permanentemente no Firestore
 */
export async function saveMascotsToFirestore(mascots: Record<string, MascotCharacter>): Promise<boolean> {
  try {
    const entries = Object.entries(mascots);
    await Promise.all(
      entries.map(async ([key, char]) => {
        const docRef = doc(db, COLLECTION_MASCOTS, key);
        await setDoc(docRef, {
          key,
          name: char.name || key,
          description: char.description || '',
          defaultSrc: char.defaultSrc,
          fallbackSrc: char.fallbackSrc || '',
          context: char.context || '',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin',
        }, { merge: true });
      })
    );
    console.log('[Firestore] Todos os mascotes sincronizados no Firestore com sucesso.');
    return true;
  } catch (err) {
    console.warn('[Firestore] Falha ao sincronizar mascotes no Firestore:', err);
    return false;
  }
}

/**
 * Carrega todos os mascotes customizados do Firestore
 */
export async function loadMascotsFromFirestore(): Promise<Record<string, MascotCharacter> | null> {
  try {
    const colRef = collection(db, COLLECTION_MASCOTS);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const mascots: Record<string, MascotCharacter> = {};
      snap.forEach((d) => {
        const data = d.data();
        if (data.key && data.defaultSrc) {
          mascots[data.key] = {
            id: data.key,
            name: data.name || data.key,
            description: data.description || '',
            defaultSrc: data.defaultSrc,
            fallbackSrc: data.fallbackSrc,
            context: data.context,
          };
        }
      });
      if (Object.keys(mascots).length > 0) {
        return mascots;
      }
    }
  } catch (err) {
    console.warn('[Firestore] Falha ao carregar mascotes do Firestore:', err);
  }
  return null;
}

/**
 * Inscreve-se para receber atualizações de mascotes em tempo real
 */
export function subscribeToMascots(callback: (mascots: Record<string, MascotCharacter>) => void): () => void {
  try {
    const colRef = collection(db, COLLECTION_MASCOTS);
    const unsubscribe = onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const mascots: Record<string, MascotCharacter> = {};
        snap.forEach((d) => {
          const data = d.data();
          if (data.key && data.defaultSrc) {
            mascots[data.key] = {
              id: data.key,
              name: data.name || data.key,
              description: data.description || '',
              defaultSrc: data.defaultSrc,
              fallbackSrc: data.fallbackSrc,
              context: data.context,
            };
          }
        });
        if (Object.keys(mascots).length > 0) {
          callback(mascots);
        }
      }
    }, (err) => {
      console.warn('[Firestore] Erro no listener de mascotes:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Não foi possível registrar listener de mascotes:', err);
    return () => {};
  }
}

/**
 * Grava entrada de histórico de temas
 */
export async function saveThemeHistoryToFirestore(entry: ThemeHistoryEntry): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_HISTORY, entry.id);
    await setDoc(docRef, {
      ...entry,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Firestore] Falha ao registrar histórico no Firestore:', err);
  }
}

/**
 * Salva relatório de solução / dor enviado pelo usuário
 */
export async function saveReportedSolutionToFirestore(report: {
  id: string;
  problemTitle: string;
  solutionTitle: string;
  reason: string;
  details?: string;
  reportedAt: string;
}): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_REPORTS, report.id);
    await setDoc(docRef, {
      ...report,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[Firestore] Falha ao salvar relatório no Firestore:', err);
    return false;
  }
}
