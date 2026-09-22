/**
 * Service Layer: Problem Pain AI & Analytical Intelligence Architecture
 * 
 * Analyzes business, routine, work and life friction.
 * Calculates Pain Index (Índice de Dor), realistic wasted hours, 
 * contextualizes the 3 Exits (Automatizar, Simplificar, Eliminar),
 * and structures the emotional transformation (Hoje vs. Sem essa dor).
 */

import {
  ProblemAssessment,
  ProblemPainAnalysisResult,
  ProblemImpactMetrics,
  ProblemThreePaths,
  ProblemTransformation,
} from '../../types';

export const problemPainAiService = {
  /**
   * Calculates monthly hours lost realistically without inventing numbers.
   */
  calculateMetrics(assessment: ProblemAssessment): ProblemImpactMetrics {
    const freq = assessment.frequency.toLowerCase();
    const time = assessment.timeSpent.toLowerCase();

    // Occurrences per month & per week
    let occurrencesPerWeek = 1;
    let occurrencesPerMonth = 4;

    if (freq.includes('várias vezes por dia')) {
      occurrencesPerWeek = 15;
      occurrencesPerMonth = 60;
    } else if (freq.includes('todo dia')) {
      occurrencesPerWeek = 5;
      occurrencesPerMonth = 22;
    } else if (freq.includes('toda semana')) {
      occurrencesPerWeek = 2;
      occurrencesPerMonth = 8;
    } else if (freq.includes('algumas vezes por mês')) {
      occurrencesPerWeek = 1;
      occurrencesPerMonth = 3;
    } else {
      occurrencesPerWeek = 1;
      occurrencesPerMonth = 2;
    }

    // Hours per occurrence
    let hoursPerOccurrence = 0.5; // default 30 min
    if (time.includes('5-15 min') || time.includes('alguns minutos')) {
      hoursPerOccurrence = 0.2; // 12 min
    } else if (time.includes('30-60 min') || time.includes('quase uma hora')) {
      hoursPerOccurrence = 0.75; // 45 min
    } else if (time.includes('várias horas')) {
      hoursPerOccurrence = 2.5; // 2.5 hours
    } else if (time.includes('dia inteiro')) {
      hoursPerOccurrence = 6; // 6 hours
    }

    const totalMonthlyHours = Math.max(1, Math.round(occurrencesPerMonth * hoursPerOccurrence));

    // Check if the user's initial description explicitly contains financial numbers (e.g. R$ 500, 2000 reais, etc.)
    let estimatedFinancialCost: string | undefined = undefined;
    const text = assessment.initialDescription;
    const moneyRegex = /(?:R\$\s*|reais\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+)\s*(?:reais|R\$|mil)/i;
    const moneyMatch = text.match(moneyRegex);

    if (moneyMatch) {
      estimatedFinancialCost = `Aproximadamente ${moneyMatch[0]}`;
    }

    return {
      monthlyHours: totalMonthlyHours,
      weeklyOccurrences: occurrencesPerWeek,
      estimatedFinancialCost,
    };
  },

  /**
   * Computes the 0-100 Pain Index (Índice de Dor)
   */
  calculatePainScore(assessment: ProblemAssessment, metrics: ProblemImpactMetrics): {
    score: number;
    level: 'LEVE' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
    explanation: string;
  } {
    let score = 30; // baseline

    // Frequency impact
    const freq = assessment.frequency.toLowerCase();
    if (freq.includes('várias vezes por dia')) score += 28;
    else if (freq.includes('todo dia')) score += 22;
    else if (freq.includes('toda semana')) score += 14;
    else if (freq.includes('algumas vezes por mês')) score += 8;

    // Time impact
    const hours = metrics.monthlyHours;
    if (hours > 30) score += 26;
    else if (hours >= 15) score += 18;
    else if (hours >= 6) score += 12;
    else score += 6;

    // Area criticality
    const area = assessment.area.toLowerCase();
    if (area.includes('trabalho') || area.includes('finanças') || area.includes('clientes')) {
      score += 10;
    } else {
      score += 6;
    }

    score = Math.min(96, Math.max(22, score));

    let level: 'LEVE' | 'MODERADO' | 'ALTO' | 'CRÍTICO' = 'MODERADO';
    let explanation = 'Esse problema causa atritos pontuais, mas ainda tem impacto controlado.';

    if (score >= 82) {
      level = 'CRÍTICO';
      explanation = 'Essa dor consome fatias vitais da sua rotina e representa um gargalo prioritário para ser resolvido.';
    } else if (score >= 68) {
      level = 'ALTO';
      explanation = 'Essa dor está cobrando um preço considerável do seu tempo, foco mental e energia diária.';
    } else if (score >= 45) {
      level = 'MODERADO';
      explanation = 'Essa fricção é recorrente o suficiente para atrapalhar seu rendimento e merecer simplificação.';
    } else {
      level = 'LEVE';
      explanation = 'Um incômodo de baixa frequência que pode ser solucionado com pequenos ajustes operacionais.';
    }

    return { score, level, explanation };
  },

  /**
   * Generates the 3 Exits (Automatizar, Simplificar, Eliminar)
   */
  generateThreePaths(assessment: ProblemAssessment): ProblemThreePaths {
    const textLower = assessment.initialDescription.toLowerCase();
    const area = assessment.area;

    const isCustomerRepetitive =
      textLower.includes('cliente') ||
      textLower.includes('pergunta') ||
      textLower.includes('mensagem') ||
      textLower.includes('responder') ||
      textLower.includes('whatsapp') ||
      textLower.includes('e-mail') ||
      textLower.includes('email');

    const isFinance =
      textLower.includes('pagar') ||
      textLower.includes('cobrança') ||
      textLower.includes('planilha') ||
      textLower.includes('nota') ||
      textLower.includes('dinheiro') ||
      area.includes('Finanças');

    if (isCustomerRepetitive) {
      return {
        automate: {
          title: 'AUTOMATIZAR',
          tagline: 'Deixar a tecnologia fazer isso por você.',
          description:
            'Implementar respostas automáticas inteligentes ou um portal com as dúvidas mais frequentes para que os clientes se atendam sozinhos.',
        },
        simplify: {
          title: 'SIMPLIFICAR',
          tagline: 'Fazer a mesma coisa com muito menos esforço.',
          description:
            'Criar atalhos de teclado e modelos de mensagem pré-aprovados prontos para envio com 1 clique, sem digitar tudo de novo.',
        },
        eliminate: {
          title: 'ELIMINAR',
          tagline: 'Parar de fazer o que não precisa mais existir.',
          description:
            'Antecipar as dúvidas críticas no momento em que o cliente compra ou contrata, eliminando o motivo pelo qual ele entra em contato.',
        },
      };
    }

    if (isFinance) {
      return {
        automate: {
          title: 'AUTOMATIZAR',
          tagline: 'Deixar a tecnologia fazer isso por você.',
          description:
            'Integrar cobranças via link recorrente, conciliação bancária automática e lembretes por mensagem sem toque manual.',
        },
        simplify: {
          title: 'SIMPLIFICAR',
          tagline: 'Fazer a mesma coisa com muito menos esforço.',
          description:
            'Centralizar todas as movimentações em um painel único com regras pré-definidas em vez de planilhas dispersas.',
        },
        eliminate: {
          title: 'ELIMINAR',
          tagline: 'Parar de fazer o que não precisa mais existir.',
          description:
            'Cortar relatórios que ninguém consulta e extinguir modalidades de pagamento manuais que exigem conferência manual de comprovante.',
        },
      };
    }

    // General workflow / personal routine
    return {
      automate: {
        title: 'AUTOMATIZAR',
        tagline: 'Deixar a tecnologia fazer isso por você.',
        description:
          'Utilizar gatilhos e ferramentas digitais para disparar as etapas repetitivas no segundo em que a tarefa começa.',
      },
      simplify: {
        title: 'SIMPLIFICAR',
        tagline: 'Fazer a mesma coisa com muito menos esforço.',
        description:
          'Reduzir as etapas intermediárias à metade, definindo um checklist curto e direto que qualquer pessoa consiga seguir.',
      },
      eliminate: {
        title: 'ELIMINAR',
        tagline: 'Parar de fazer o que não precisa mais existir.',
        description:
          'Questionar a necessidade real de cada etapa. O que aconteceria se você simplesmente parasse de fazer a parte mais demorada?',
      },
    };
  },

  /**
   * Generates the transformation pair (Hoje vs. Sem essa dor)
   */
  generateTransformation(assessment: ProblemAssessment): ProblemTransformation {
    const text = assessment.initialDescription.trim();
    const shortDesc = text.length > 80 ? text.slice(0, 80) + '...' : text;

    return {
      today: `Você gasta tempo e paciência lidando com "${shortDesc}", interrompendo seu fluxo de trabalho repetidamente.`,
      withoutPain: `Esse processo flui no piloto automático ou foi simplificado, liberando suas horas e deixando sua cabeça 100% livre.`,
    };
  },

  /**
   * Main orchestrator (Sync smart heuristic baseline)
   */
  analyzeProblem(assessment: ProblemAssessment): ProblemPainAnalysisResult {
    const metrics = this.calculateMetrics(assessment);
    const { score, level, explanation } = this.calculatePainScore(assessment, metrics);
    const threePaths = this.generateThreePaths(assessment);
    const transformation = this.generateTransformation(assessment);

    const freqClean = assessment.frequency.toLowerCase();
    const areaClean = assessment.area.toLowerCase();

    const summaryDiscovery = `Você está lidando com um problema que acontece ${freqClean}, consome aproximadamente ${metrics.monthlyHours} horas por mês e impacta principalmente ${areaClean}. O gargalo real é a falta de um filtro automático e de limites operacionais claros.`;

    // High value immediate action plan baseline
    const immediateAction = {
      title: 'Definir uma regra de corte e filtro imediato',
      timeToExecute: '5 minutos',
      description: 'Crie uma barreira de proteção entre você e a fonte desse atrito agora mesmo.',
      stepByStep: [
        'Escreva uma frase padrão ou critério único para responder ou tratar essa demanda.',
        'Salve essa mensagem nos atalhos do teclado ou bloco de notas para não digitar mais do zero.',
        'Estabeleça que você só olhará para essa tarefa 1 vez ao dia em um horário fixo.'
      ]
    };

    const readyTemplate = {
      title: 'Mensagem padrão de alinhamento e filtro',
      content: `Olá! Para te atender com máxima agilidade e qualidade, organizei todas as respostas frequentes neste resumo rápido. Por favor dê uma olhada antes e, se ainda restar alguma dúvida pontual, me mande aqui que respondo no meu horário de retorno diário!`
    };

    const actionPlan = {
      today: 'Aplicar o filtro de 5 minutos e não responder mais no calor do momento.',
      thisWeek: 'Reunir as 3 dúvidas ou tarefas mais repetitivas e criar uma resposta automática ou checklist.',
      nextMonth: 'Delegar ou automatizar 100% dessa etapa para recuperar seu tempo livre.'
    };

    return {
      painScore: score,
      painLevel: level,
      painLevelExplanation: explanation,
      summaryDiscovery,
      impactMetrics: metrics,
      threePaths,
      transformation,
      immediateAction,
      readyTemplate,
      actionPlan,
    };
  },

  /**
   * Deep AI Orchestrator (Calls Gemini 3.8 Flash via backend API with instant fallback)
   */
  async analyzeProblemWithAI(assessment: ProblemAssessment): Promise<ProblemPainAnalysisResult> {
    try {
      const response = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: assessment.initialDescription,
          frequency: assessment.frequency,
          timeSpent: assessment.timeSpent,
          area: assessment.area,
          priorityGoal: assessment.priorityGoal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.summaryDiscovery && data.threePaths) {
          return {
            painScore: typeof data.painScore === 'number' ? data.painScore : 65,
            painLevel: data.painLevel || 'ALTO',
            painLevelExplanation: data.painLevelExplanation || 'Impacto significativo na sua energia diária.',
            summaryDiscovery: data.summaryDiscovery,
            impactMetrics: data.impactMetrics || this.calculateMetrics(assessment),
            threePaths: data.threePaths,
            transformation: data.transformation || this.generateTransformation(assessment),
            immediateAction: data.immediateAction,
            readyTemplate: data.readyTemplate,
            actionPlan: data.actionPlan,
          };
        }
      }
    } catch (err) {
      console.warn('Falha ao conectar com API de IA, utilizando motor analítico local:', err);
    }

    // Fallback to rich local heuristic analysis
    return this.analyzeProblem(assessment);
  },

  /**
   * Follow-up chat with AI on the specific problem
   */
  async askFollowUpQuestion(problemDescription: string, userQuestion: string, previousAnalysis: ProblemPainAnalysisResult): Promise<string> {
    try {
      const response = await fetch('/api/chat-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription,
          userQuestion,
          previousAnalysis,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) return data.reply;
      }
    } catch (err) {
      console.warn('Erro ao chamar chat IA:', err);
    }
    return 'Dica prática imediata: comece isolando a parte mais repetitiva do problema e crie um padrão fixo hoje.';
  },
};
