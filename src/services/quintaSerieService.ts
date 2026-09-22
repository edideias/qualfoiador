/**
 * Detecção e Gerenciamento do "Modo 5ª Série" 🎒
 * Identifica quando a pessoa está fazendo trocadilhos infantis, piadas de duplo sentido ou zombarias.
 */

export interface QuintaSerieCheckResult {
  isQuintaSerie: boolean;
  matchedTrigger?: string;
  suggestedJokeResponse?: string;
}

const QUINTA_SERIE_TRIGGERS: { pattern: RegExp; response: string; triggerName: string }[] = [
  {
    pattern: /\b(?:pav[eê]|pacum[eê]|pra\s*ver|pra\s*comer)\b/i,
    triggerName: 'Trocadilho do pavê',
    response: 'É pavê, pacumê e pra parar de graça! Mas conta aí: você tem alguma dor de verdade ou só veio testar a paciência do app? 😂',
  },
  {
    pattern: /\b(?:m[aá]rio|que\s*m[aá]rio|qual\s*m[aá]rio)\b/i,
    triggerName: 'Piadinha do Mário',
    response: 'Aquele que conserta o encanamento quando estoura o cano, né espertinho? Já conhecemos essa desde 1994! 🍄',
  },
  {
    pattern: /\b(?:na\s*volta\s*a\s*gente\s*compra)\b/i,
    triggerName: 'Frase de mãe clássica',
    response: 'Essa desculpa de mãe não cola aqui! Bora resolver o que você precisa agora sem enrolação.',
  },
  {
    pattern: /\b(?:dor\s*de\s*cotovelo|dor\s*no\s*chifre|dor\s*de\s*corno|dor\s*na\s*consci[eê]ncia)\b/i,
    triggerName: 'Dores figuradas da zoeira',
    response: 'Eita! Essa dor aí não tem remédio na farmácia não, só um banho gelado e água com açúcar. Quer falar sério de dor no corpo ou vida prática?',
  },
  {
    pattern: /\b(?:rola|pinto|bilau|bunda|cu\b|piroca|piroquinha|peido|peidei|caguei|bosta|merda|pum)\b/i,
    triggerName: 'Palavrões ou termos da quinta série',
    response: 'Alerta de maturidade nível recreio do colégio acionado! 🚨 A gente até ri, mas se você precisar resolver um perrengue real, estamos aqui.',
  },
  {
    pattern: /\b(?:tua\s*m[aã]e|sua\s*m[aã]e|teu\s*pai|seu\s*pai)\b/i,
    triggerName: 'Provocação de quinta série',
    response: 'Deixa as mães em paz! Fala sério: qual é a dor ou problema real que você quer resolver hoje?',
  },
  {
    pattern: /\b(?:teste|testando\s*1\s*2\s*3|blablabla|asdf|kkkk|hahaha|rsrsrs)\b/i,
    triggerName: 'Testando zoeira pura',
    response: 'Microfone testado com 100% de sucesso! Agora manda a real do que está pegando no seu dia.',
  },
  {
    pattern: /\b(?:que\s*horas\s*s[aã]o|hora\s*de\s*ver\s*o\s*passarinho)\b/i,
    triggerName: 'Hora do passarinho',
    response: 'Hora de tomar vergonha na cara e cuidar da saúde ou dos boletos! Brincadeiras à parte, como posso te ajudar?',
  },
];

export function detectQuintaSerie(input: string): QuintaSerieCheckResult {
  const text = (input || '').trim();
  if (!text) {
    return { isQuintaSerie: false };
  }

  for (const item of QUINTA_SERIE_TRIGGERS) {
    if (item.pattern.test(text)) {
      return {
        isQuintaSerie: true,
        matchedTrigger: item.triggerName,
        suggestedJokeResponse: item.response,
      };
    }
  }

  // Double check short playful inputs
  if (/^(kkk+|hahaha+|rsrs+|lol|zoeira|kkkkk)$/i.test(text.replace(/\s+/g, ''))) {
    return {
      isQuintaSerie: true,
      matchedTrigger: 'Risada vazia',
      suggestedJokeResponse: 'Rir é o melhor remédio, mas conta: tem algum perrengue real rolando ou só veio dar risada?',
    };
  }

  return { isQuintaSerie: false };
}
