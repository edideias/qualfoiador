/**
 * Serviço de Conselhos Visuais e Ergonômicos (Visual Advice Service)
 * Fornece diretrizes ilustradas, posturas recomendadas, indicação de compressas
 * (frio vs calor) e o que NÃO fazer para alívio seguro de dores no corpo.
 */

export interface ThermalAdvice {
  type: 'gelo' | 'calor' | 'alternado' | 'nenhum';
  title: string;
  durationMinutes: number;
  reason: string;
  howToApply: string;
  caution: string;
}

export interface PostureAdvice {
  title: string;
  description: string;
  iconType: 'rest' | 'posture' | 'elevation' | 'breath';
}

export interface MovementAdvice {
  action: 'do' | 'dont';
  title: string;
  description: string;
}

export interface VisualAdviceData {
  regionKey: string;
  regionName: string;
  headline: string;
  thermal: ThermalAdvice;
  postures: PostureAdvice[];
  dosAndDonts: MovementAdvice[];
  redFlagReminder: string;
}

const REGION_ADVICE_DATABASE: Record<string, Partial<VisualAdviceData>> = {
  cabeca: {
    regionName: 'Cabeça / Têmporas / Nuca',
    headline: 'Alívio para Tensão Cefálica e Cervical',
    thermal: {
      type: 'gelo',
      title: 'Compressa Fria na Testa ou Nuca',
      durationMinutes: 15,
      reason: 'Ajuda na vasoconstrição e reduz a sensação latejante ou inflamatória.',
      howToApply: 'Bolsa de gelo envolvida em toalha fina colocada na testa ou base da nuca por 15 minutos em ambiente escuro e silencioso.',
      caution: 'Evite luzes fortes e telas durante a aplicação.',
    },
    postures: [
      {
        title: 'Ambiente de Penumbra e Silêncio',
        description: 'Reduza luminosidade e ruídos. Deite-se com a cabeça levemente apoiada sem forçar a curvatura da nuca.',
        iconType: 'rest',
      },
      {
        title: 'Relaxamento de Mandíbula e Ombros',
        description: 'Mantenha os dentes ligeiramente desencostados e a língua no céu da boca para destravar a musculatura da face.',
        iconType: 'posture',
      },
    ],
    dosAndDonts: [
      {
        action: 'do',
        title: 'Beba um copo de água fresca',
        description: 'A desidratação branda é um dos maiores gatilhos silenciosos de dor de cabeça.',
      },
      {
        action: 'dont',
        title: 'Não aperte os olhos em frente ao celular',
        description: 'A luz azul e o foco forçado pioram a contração dos músculos retro-oculares.',
      },
    ],
    redFlagReminder: 'Se a dor for súbita ("a pior dor da vida"), acompanhada de confusão, fala arrastada ou febre alta com rigidez de nuca, vá à emergência.',
  },

  pescoco: {
    regionName: 'Pescoço e Trapézio',
    headline: 'Descompressão Cervical e Alívio de Torcicolo',
    thermal: {
      type: 'calor',
      title: 'Calor Úmido ou Bolsa Morna',
      durationMinutes: 15,
      reason: 'O calor suave estimula o fluxo sanguíneo local e relaxa o espasmo muscular do trapézio.',
      howToApply: 'Bolsa de água morna ou toalha aquecida sobre os ombros e pescoço por 15 a 20 minutos.',
      caution: 'Verifique a temperatura para não queimar a pele sensível da nuca.',
    },
    postures: [
      {
        title: 'Alinhamento do Queixo com o Peito',
        description: 'Evite a cabeça projetada para frente ("pescoço de texto"). Recolha sutilmente o queixo criando um alinhamento neutro.',
        iconType: 'posture',
      },
      {
        title: 'Apoio de Travesseiro Médio',
        description: 'Ao deitar, garanta que o pescoço fique em linha reta com a coluna, nem hiperestendido nem curvado.',
        iconType: 'rest',
      },
    ],
    dosAndDonts: [
      {
        action: 'do',
        title: 'Giro suave dos ombros para trás',
        description: 'Faça 5 círculos lentos com os ombros para trás enquanto respira profundamente.',
      },
      {
        action: 'dont',
        title: 'Não "estale" o pescoço bruscamente',
        description: 'Movimentos bruscos de torção podem pinçar raízes nervosas inflamadas.',
      },
    ],
    redFlagReminder: 'Dor irradiando com choque, formigamento ou perda de força no braço deve ser avaliada por ortopedista/neurologista.',
  },

  lombar: {
    regionName: 'Coluna Lombar / Costas',
    headline: 'Descompressão da Coluna e Alívio da Lombar',
    thermal: {
      type: 'calor',
      title: 'Bolsa de Calor Morna',
      durationMinutes: 20,
      reason: 'Diminui a rigidez nos músculos paravertebrais e alivia a sensação de "trava" nas costas.',
      howToApply: 'Aplique calor morno na região lombar por 15 a 20 minutos deitado de lado ou de barriga para cima com apoio sob os joelhos.',
      caution: 'Em caso de trauma/queda recente nas últimas 48h, prefira gelo.',
    },
    postures: [
      {
        title: 'Posição de Gravidade Zero no Chão',
        description: 'Deite de costas no tapete com as pernas apoiadas em uma cadeira ou sofá (joelhos a 90°). Isso zera a pressão sobre os discos vertebrais.',
        iconType: 'rest',
      },
      {
        title: 'Travesseiro entre os Joelhos',
        description: 'Se for deitar de lado, coloque um travesseiro firme entre as pernas para manter o quadril perfeitamente alinhado.',
        iconType: 'elevation',
      },
    ],
    dosAndDonts: [
      {
        action: 'do',
        title: 'Levante-se usando as pernas e braços',
        description: 'Ao sair da cama ou sofá, vire primeiro de lado e empurre o corpo com os braços, sem dobrar a coluna para a frente.',
      },
      {
        action: 'dont',
        title: 'Não dobre a coluna para pegar peso no chão',
        description: 'Sempre dobre os joelhos e mantenha o objeto colado ao corpo se precisar levantar algo.',
      },
    ],
    redFlagReminder: 'Perda de controle de urina/fezes, dormência na virilha ou fraqueza na perna exigem avaliação médica urgente.',
  },

  ombros: {
    regionName: 'Ombro e Braço',
    headline: 'Proteção do Manguito e Alívio Articular',
    thermal: {
      type: 'gelo',
      title: 'Gelo na Região da Articulação',
      durationMinutes: 15,
      reason: 'Controla a inflamação de tendões (tendinite/bursite) e alivia a queimação.',
      howToApply: 'Compressa fria na lateral e topo do ombro por 15 minutos, 2 a 3 vezes ao dia.',
      caution: 'Sempre use uma toalha para proteger a pele do contato direto.',
    },
    postures: [
      {
        title: 'Descanso do Braço com Almofada',
        description: 'Sentado, coloque uma pequena almofada sob o cotovelo do braço dolorido para tirar o peso do ombro.',
        iconType: 'elevation',
      },
    ],
    dosAndDonts: [
      {
        action: 'do',
        title: 'Mantenha o braço apoiado',
        description: 'Ao usar computador ou descansar, apoie o antebraço na mesa ou no braço da poltrona.',
      },
      {
        action: 'dont',
        title: 'Não durma em cima do ombro dolorido',
        description: 'A compressão prolongada reduz o fluxo sanguíneo e agrava o processo inflamatório.',
      },
    ],
    redFlagReminder: 'Dor no ombro esquerdo acompanhada de aperto no peito, falta de ar ou suor frio é emergência cardiovascular (ligue 192).',
  },

  joelho: {
    regionName: 'Joelhos e Pernas',
    headline: 'Protocolo de Elevação e Alívio Articular',
    thermal: {
      type: 'gelo',
      title: 'Crioterapia (Gelo por 15 min)',
      durationMinutes: 15,
      reason: 'Reduz o edema (inchaço), acalma a cápsula articular e amortece o sinal de dor.',
      howToApply: 'Bolsa de gelo envolvida em toalha cobrindo o joelho com a perna estendida e repousada.',
      caution: 'Não ultrapasse 20 minutos seguidos.',
    },
    postures: [
      {
        title: 'Elevação da Perna com Almofadas',
        description: 'Deite-se e posicione a perna dolorida sobre 2 travesseiros, mantendo o joelho ligeiramente acima do nível do coração.',
        iconType: 'elevation',
      },
    ],
    dosAndDonts: [
      {
        action: 'do',
        title: 'Descarga gradual de peso',
        description: 'Evite longas caminhadas ou escadas enquanto houver dor aguda ou sensação de falseio.',
      },
      {
        action: 'dont',
        title: 'Não fique em pé parado por longos períodos',
        description: 'A postura estática acumula líquido e aumenta a pressão patelofemoral.',
      },
    ],
    redFlagReminder: 'Impossibilidade total de apoiar o pé no chão, joelho bloqueado ou deformação visível exigem raio-X/pronto-socorro.',
  },

  padrao: {
    regionName: 'Região Muscular / Articular Geral',
    headline: 'Orientações Gerais de Conforto e Repouso',
    thermal: {
      type: 'gelo',
      title: 'Compressa Protetora de 15 Minutos',
      durationMinutes: 15,
      reason: 'Ajuda a diminuir a hipersensibilidade local e o estímulo inflamatório.',
      howToApply: 'Bolsa fria com proteção de pano por 15 minutos na área dolorida.',
      caution: 'Se a dor for crônica e rígida sem inchaço, compressa morna pode ser mais confortável.',
    },
    postures: [
      {
        title: 'Posição Anatômica Neutra',
        description: 'Busque acomodar o corpo de forma que nenhum músculo fique tensionado ou esticado além do ponto de relaxamento.',
        iconType: 'rest',
      },
    ],
    dosAndDonts: [
      {
        action: 'do',
        title: 'Respeite o sinal de dor do corpo',
        description: 'A dor é um mecanismo de freio; interrompa atividades que aumentem a intensidade do desconforto.',
      },
      {
        action: 'dont',
        title: 'Não faça automedicação exagerada',
        description: 'Anti-inflamatórios em excesso podem sobrecarregar rins e estômago sem tratar a causa real.',
      },
    ],
    redFlagReminder: 'Dores intensas contínuas, associadas a febre, perda de peso involuntária ou dormência devem ser investigadas clinicamente.',
  },
};

/**
 * Retorna as orientações visuais e ergonômicas adequadas com base na localização informada
 */
export function getVisualAdviceForLocation(locationRaw: string): VisualAdviceData {
  const loc = (locationRaw || '').toLowerCase();

  let matchedKey = 'padrao';
  if (loc.includes('cabeça') || loc.includes('cabeca') || loc.includes('têmpora') || loc.includes('olho')) {
    matchedKey = 'cabeca';
  } else if (loc.includes('pescoço') || loc.includes('pescoco') || loc.includes('nuca') || loc.includes('cervical') || loc.includes('trapézio')) {
    matchedKey = 'pescoco';
  } else if (loc.includes('costas') || loc.includes('lombar') || loc.includes('coluna') || loc.includes('dorsal')) {
    matchedKey = 'lombar';
  } else if (loc.includes('ombro') || loc.includes('braço') || loc.includes('braco') || loc.includes('clavícula')) {
    matchedKey = 'ombros';
  } else if (loc.includes('joelho') || loc.includes('perna') || loc.includes('coxa') || loc.includes('tornozelo') || loc.includes('pé')) {
    matchedKey = 'joelho';
  }

  const data = REGION_ADVICE_DATABASE[matchedKey] || REGION_ADVICE_DATABASE.padrao;

  return {
    regionKey: matchedKey,
    regionName: data.regionName || locationRaw || 'Região Afetada',
    headline: data.headline || 'Orientações de Alívio e Conforto',
    thermal: data.thermal || REGION_ADVICE_DATABASE.padrao.thermal!,
    postures: data.postures || REGION_ADVICE_DATABASE.padrao.postures!,
    dosAndDonts: data.dosAndDonts || REGION_ADVICE_DATABASE.padrao.dosAndDonts!,
    redFlagReminder: data.redFlagReminder || REGION_ADVICE_DATABASE.padrao.redFlagReminder!,
  };
}
