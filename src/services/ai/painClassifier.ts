/**
 * Universal Pain Intent Classifier & Extractor:
 * Accurately determines if the user's reported pain/need is:
 * 1. 'physical' - Body pain, health symptoms, physical discomfort, injuries, illness
 * 2. 'problem'  - Modern life emergency, breakdown, work bottleneck, financial stress, practical service
 */

export interface PainClassification {
  type: 'physical' | 'problem';
  confidence: number;
  extractedLocation?: string;
  suggestedIntensity?: number;
  extractedKeywords: string[];
}

// Extensive anatomical and clinical markers
const PHYSICAL_BODY_PARTS = [
  'dor', 'dores', 'doendo', 'dói', 'doeu', 'doido',
  'cabeça', 'cabeca', 'enxaqueca', 'nuca', 'fronte', 'têmpora',
  'costas', 'lombar', 'coluna', 'cervical', 'dorsal', 'omoplata',
  'peito', 'tórax', 'torácica', 'coração', 'seio', 'mamilo',
  'barriga', 'abdômen', 'estômago', 'estomago', 'ventre', 'umbigo', 'fígado', 'rins',
  'pescoço', 'pescoco', 'ombro', 'ombros', 'clavícula', 'trapézio',
  'braço', 'braco', 'cotovelo', 'antebraço', 'pulso', 'punho', 'mão', 'dedo', 'dedos',
  'perna', 'pernas', 'joelho', 'joelhos', 'coxa', 'panturrilha', 'canela', 'tornozelo', 'pé', 'pes', 'calcanhar',
  'garganta', 'ouvido', 'orelha', 'olho', 'olhos', 'dente', 'dentes', 'gengiva', 'mandíbula', 'maxilar',
  'boca', 'língua', 'costela', 'bacia', 'quadril', 'virilha', 'ciático', 'ciatico',
];

const PHYSICAL_SYMPTOMS = [
  'febre', 'náusea', 'enjoo', 'tontura', 'falta de ar', 'cansaço', 'fadiga',
  'pontada', 'queimação', 'queimando', 'pressão', 'aperto', 'cólica', 'colica',
  'inchaço', 'inchado', 'inflamação', 'inflamado', 'sangramento', 'sangrando',
  'formigamento', 'dormência', 'dormencia', 'choque', 'latejando', 'pulsando',
  'tosse', 'coriza', 'espirro', 'vômito', 'vomito', 'diarreia', 'prisão de ventre',
  'azar', 'ferida', 'machucado', 'torção', 'luxação', 'fratura', 'quebrei', 'bati',
  'queimadura', 'alergia', 'coceira', 'mancha', 'nódulo', 'caroço',
];

// Practical, logistical and mechanical emergency markers
const PRACTICAL_PROBLEM_KEYWORDS = [
  'pneu', 'borracharia', 'borracheiro', 'estepe', 'macaco',
  'carro', 'moto', 'veículo', 'motor', 'bateria', 'chupeta', 'arriou', 'guincho',
  'mecânico', 'mecanico', 'freio', 'radiador', 'gasolina', 'combustível',
  'chaveiro', 'chave', 'fechadura', 'trancado', 'trancada', 'cadeado',
  'cano', 'vazamento', 'encanador', 'pia', 'vaso', 'ralo', 'inundou', 'esgoto',
  'luz', 'eletricista', 'disjuntor', 'curto', 'fiação', 'tomada', 'chuveiro',
  'gás', 'botijão', 'fogão', 'geladeira', 'máquina',
  'internet', 'roteador', 'wi-fi', 'computador', 'celular', 'tela quebrada',
  'uber', '99', 'táxi', 'ônibus', 'corrida',
  'cliente', 'whatsapp', 'vendas', 'dinheiro', 'dívida', 'reunião', 'chefe', 'sócio',
  'trabalho', 'empresa', 'processo', 'contrato', 'nota fiscal',
];

export function classifyPainIntent(input: string): PainClassification {
  const text = (input || '').toLowerCase().trim();
  if (!text) {
    return { type: 'problem', confidence: 0.5, extractedKeywords: [] };
  }

  let physicalScore = 0;
  let problemScore = 0;
  const matchedKeywords: string[] = [];
  let detectedLocation: string | undefined;

  // 1. Direct body parts check
  for (const part of PHYSICAL_BODY_PARTS) {
    if (text.includes(part)) {
      physicalScore += 2;
      matchedKeywords.push(part);
      if (!detectedLocation && part !== 'dor' && part !== 'dores' && part !== 'doendo' && part !== 'dói') {
        detectedLocation = part.charAt(0).toUpperCase() + part.slice(1);
      }
    }
  }

  // 2. Physical symptoms check
  for (const symptom of PHYSICAL_SYMPTOMS) {
    if (text.includes(symptom)) {
      physicalScore += 2.5;
      matchedKeywords.push(symptom);
    }
  }

  // 3. Problem & service markers check
  for (const problemWord of PRACTICAL_PROBLEM_KEYWORDS) {
    if (text.includes(problemWord)) {
      problemScore += 3;
      matchedKeywords.push(problemWord);
    }
  }

  // Deduce intensity if user mentioned numbers like "dor 8", "nível 9", "muito forte"
  let suggestedIntensity: number | undefined;
  const intensityMatch = text.match(/(?:dor|nível|nota|grau)\s*([0-9]|10)/i);
  if (intensityMatch && intensityMatch[1]) {
    suggestedIntensity = parseInt(intensityMatch[1], 10);
  } else if (text.includes('insuportável') || text.includes('muito forte') || text.includes('gritando')) {
    suggestedIntensity = 9;
  } else if (text.includes('forte')) {
    suggestedIntensity = 7;
  } else if (text.includes('moderada')) {
    suggestedIntensity = 5;
  } else if (text.includes('leve') || text.includes('chatinha')) {
    suggestedIntensity = 3;
  }

  // Decision
  if (physicalScore > problemScore && physicalScore >= 2) {
    return {
      type: 'physical',
      confidence: Math.min(1.0, 0.6 + physicalScore * 0.1),
      extractedLocation: detectedLocation,
      suggestedIntensity,
      extractedKeywords: matchedKeywords,
    };
  }

  return {
    type: 'problem',
    confidence: Math.min(1.0, 0.6 + problemScore * 0.1),
    extractedKeywords: matchedKeywords,
  };
}
