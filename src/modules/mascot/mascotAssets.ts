/**
 * Mascot Asset Registry - "Qual a sua dor?"
 * Contém o mascote "Pai" (principal) e as 9 variações ilustrativas distribuídas
 * de forma inteligente e contextual pelas seções do aplicativo.
 */

import {
  saveMascotsToFirestore,
  loadMascotsFromFirestore,
  subscribeToMascots,
} from '../firebase/firestoreService';

export interface MascotCharacter {
  id: string;
  name: string;
  description: string;
  defaultSrc: string;
  fallbackSrc?: string;
  context: 'hero_pai' | 'header_brand' | 'dor_fisica' | 'dor_problema' | 'audio_modal' | 'zen_relief' | 'action_triumph' | 'supplier' | 'mobile_quick' | 'feedback';
}

export const MASCOT_REGISTRY: Record<string, MascotCharacter> = {
  // 1. O "PAI" DAS IMAGENS (Principal) - Deve aparecer grande em cima de "Qual a sua dor?"
  paiHero: {
    id: 'paiHero',
    name: 'Mascote Pai (Principal)',
    description: 'Personagem principal dando tchauzinho amigável com ponto de interrogação brilhante no peito.',
    defaultSrc: '/assets/characters/mascot_pai_hero.jpg',
    fallbackSrc: '/suador1.png',
    context: 'hero_pai',
  },

  // 2. Cabeçalho / Barra Superior ao lado da Logo
  headerTop: {
    id: 'headerTop',
    name: 'Mascote Topo (Badge da Logo)',
    description: 'Busto compacto do mascote acompanhando a marca "Qual a sua dor?" no cabeçalho.',
    defaultSrc: '/assets/characters/mascot_header_top.jpg',
    context: 'header_brand',
  },

  // 3. Card Dor Física / Anamnese
  pondering: {
    id: 'pondering',
    name: 'Mascote Curioso / Pensativo',
    description: 'Mãozinha no queixo analisando sintomas e entendendo onde dói.',
    defaultSrc: '/assets/characters/mascot_pondering.jpg',
    context: 'dor_fisica',
  },

  // 4. Card Dor de Problema / Vida Prática
  laptopWork: {
    id: 'laptopWork',
    name: 'Mascote no Computador',
    description: 'Sentado com laptop, resolvendo pendências práticas, serviços e emergências.',
    defaultSrc: '/assets/characters/mascot_laptop_work.jpg',
    context: 'dor_problema',
  },

  // 5. Sucesso / Feedback / Avaliações
  thumbsUp: {
    id: 'thumbsUp',
    name: 'Mascote Positivo (Joinha & Check)',
    description: 'Polegar para cima com check luminoso no peito, simbolizando problema resolvido.',
    defaultSrc: '/assets/characters/mascot_thumbs_up.jpg',
    context: 'feedback',
  },

  // 6. Alívio de Dor Física / Relaxamento & Zen
  meditatingZen: {
    id: 'meditatingZen',
    name: 'Mascote Zen Meditando',
    description: 'Postura de lótus, olhos fechados e serenidade total. Simboliza alívio e bem-estar.',
    defaultSrc: '/assets/characters/mascot_meditating_zen.jpg',
    context: 'zen_relief',
  },

  // 7. Modal de Áudio / Entrada de Voz
  listeningAudio: {
    id: 'listeningAudio',
    name: 'Mascote Ouvindo com Atenção',
    description: 'Mãozinhas no rosto atento ouvindo o relato falado do usuário.',
    defaultSrc: '/assets/characters/mascot_listening_audio.jpg',
    context: 'audio_modal',
  },

  // 8. Vitória / Solução Rápida Imediata
  triumphJump: {
    id: 'triumphJump',
    name: 'Mascote Salto de Vitória',
    description: 'Pulando com punho cerrado e energia, para soluções concluídas com rapidez.',
    defaultSrc: '/assets/characters/mascot_triumph_jump.jpg',
    context: 'action_triumph',
  },

  // 9. Área do Fornecedor / Prestadores
  confidentSupplier: {
    id: 'confidentSupplier',
    name: 'Mascote Confiante (Braços Cruzados)',
    description: 'Postura firme e profissional para profissionais autônomos e fornecedores.',
    defaultSrc: '/assets/characters/mascot_confident_supplier.jpg',
    context: 'supplier',
  },

  // 10. Busca Rápida / Celular / Emergência Móvel
  holdingPhone: {
    id: 'holdingPhone',
    name: 'Mascote no Celular',
    description: 'Segurando smartphone com atenção, pronto para chamados e buscas imediatas.',
    defaultSrc: '/assets/characters/mascot_holding_phone.jpg',
    context: 'mobile_quick',
  },
};

export const MASCOT_STORAGE_KEY = 'qual_e_a_sua_dor:mascot_custom_config_v1';

let isServerSyncInitialized = false;

// Inicializa a sincronização com o servidor e Firestore de forma assíncrona e segura
export function initMascotPersistence(): void {
  if (typeof window === 'undefined' || isServerSyncInitialized) return;
  isServerSyncInitialized = true;

  // 1. Tenta carregar do Firestore (nuvem permanente)
  loadMascotsFromFirestore()
    .then((cloudMascots) => {
      if (cloudMascots && Object.keys(cloudMascots).length > 0) {
        localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(cloudMascots));
        window.dispatchEvent(new CustomEvent('mascot_updated'));
      }
    })
    .catch(() => {});

  // 2. Inscreve-se para sincronização em tempo real via Firestore
  try {
    subscribeToMascots((cloudMascots) => {
      if (cloudMascots && Object.keys(cloudMascots).length > 0) {
        localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(cloudMascots));
        window.dispatchEvent(new CustomEvent('mascot_updated'));
      }
    });
  } catch (err) {
    console.warn('Firestore mascot listener aviso:', err);
  }

  // 3. Fallback do backend express
  fetch('/api/mascots')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.mascots && Object.keys(data.mascots).length > 0) {
        localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(data.mascots));
        window.dispatchEvent(new CustomEvent('mascot_updated'));
      } else {
        const localRaw = localStorage.getItem(MASCOT_STORAGE_KEY);
        if (localRaw) {
          try {
            const localObj = JSON.parse(localRaw);
            if (Object.keys(localObj).length > 0) {
              fetch('/api/mascots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mascots: localObj }),
              }).catch(() => {});
              saveMascotsToFirestore(localObj).catch(() => {});
            }
          } catch {
            // ignore
          }
        }
      }
    })
    .catch((err) => {
      console.warn('Servidor local de mascotes offline, operando via cache e Firestore:', err);
    });
}

// Inicia automaticamente no carregamento
if (typeof window !== 'undefined') {
  setTimeout(() => initMascotPersistence(), 100);
}

export function getStoredMascots(): Record<string, MascotCharacter> {
  try {
    const raw = localStorage.getItem(MASCOT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...MASCOT_REGISTRY, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao ler mascotes salvos:', e);
  }
  return { ...MASCOT_REGISTRY };
}

export async function saveStoredMascots(updated: Record<string, MascotCharacter>): Promise<Record<string, MascotCharacter>> {
  try {
    // 1. Atualização instantânea no cache local
    localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mascot_updated'));

    // 2. Persistência definitiva na nuvem (Firestore)
    saveMascotsToFirestore(updated).catch((err) => {
      console.warn('Erro ao salvar mascotes no Firestore:', err);
    });

    // 3. Persistência definitiva no servidor (imune a republicações)
    const res = await fetch('/api/mascots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mascots: updated }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.mascots) {
        localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(data.mascots));
        window.dispatchEvent(new CustomEvent('mascot_updated'));
        return { ...MASCOT_REGISTRY, ...data.mascots };
      }
    }
  } catch (e) {
    console.error('Erro ao persistir mascotes no servidor:', e);
  }
  return updated;
}

export async function resetSingleStoredMascot(key: string): Promise<void> {
  try {
    const current = getStoredMascots();
    delete current[key];
    localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('mascot_updated'));

    await fetch('/api/mascots/reset-one', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
  } catch (e) {
    console.error(`Erro ao resetar mascote ${key}:`, e);
  }
}

export async function resetStoredMascots(): Promise<void> {
  try {
    localStorage.removeItem(MASCOT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('mascot_updated'));

    await fetch('/api/mascots/reset-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Erro ao resetar mascotes:', e);
  }
}
