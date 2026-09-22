/**
 * Service Layer: Physical Pain AI & Clinical Information Architecture
 * 
 * Prepares the application for future LLM integration (OpenAI, Gemini, etc.)
 * while providing robust, deterministic local evaluations and safe clinical phrasing today.
 * 
 * STRICT RULES:
 * - NO diagnosis of medical diseases
 * - NO asserting that the user has a specific condition
 * - NO prescription of medications or treatments
 * - Clear identification of red flags requiring urgent evaluation
 */

import {
  PhysicalPainAssessment,
  PhysicalPainAnalysisResult,
  RedFlagEvaluation,
  RedFlagAlert,
} from '../../types';

export interface QuestionDefinition {
  id: keyof PhysicalPainAssessment | string;
  category: 'location' | 'intensity' | 'duration' | 'type' | 'frequency' | 'symptoms' | 'custom';
  title: string;
  subtitle?: string;
  optional?: boolean;
}

export const physicalPainAiService = {
  /**
   * Future hook for LLM-driven follow up questions based on initial description.
   * Currently returns the standard, proven clinical sequence.
   */
  async generateFollowUpQuestions(_initialDescription: string): Promise<QuestionDefinition[]> {
    return [
      {
        id: 'location',
        category: 'location',
        title: 'Onde você sente essa dor?',
        subtitle: 'Você pode indicar a região do corpo com suas palavras.',
      },
      {
        id: 'intensity',
        category: 'intensity',
        title: 'De 0 a 10, quanto está doendo agora?',
        subtitle: '0 = nenhuma dor e 10 = a pior dor imaginável.',
      },
      {
        id: 'duration',
        category: 'duration',
        title: 'Há quanto tempo você sente isso?',
        subtitle: 'Ajuda a entender se o quadro é recente ou já dura algum tempo.',
      },
      {
        id: 'painTypes',
        category: 'type',
        title: 'Como você descreveria essa dor?',
        subtitle: 'Escolha uma ou mais características que melhor combinem com a sensação.',
        optional: true,
      },
      {
        id: 'frequency',
        category: 'frequency',
        title: 'Essa dor acontece:',
        subtitle: 'Como essa sensação se comporta ao longo do dia.',
      },
      {
        id: 'otherSymptoms',
        category: 'symptoms',
        title: 'Você percebeu alguma outra coisa junto com essa dor?',
        subtitle: 'Selecione se houver outros sinais perceptíveis.',
        optional: true,
      },
    ];
  },

  /**
   * Evaluates potential red flags based on symptoms, description, and intensity.
   */
  evaluateRedFlags(assessment: PhysicalPainAssessment): RedFlagEvaluation {
    const alerts: RedFlagAlert[] = [];
    const textLower = (assessment.initialDescription + ' ' + assessment.location).toLowerCase();
    const symptoms = assessment.otherSymptoms || [];

    // Check chest pain
    const chestKeywords = ['peito', 'tórax', 'torácica', 'precordial', 'coração'];
    const hasChestPain = chestKeywords.some((k) => textLower.includes(k));

    // 1. Falta de ar
    if (symptoms.includes('Falta de ar') || textLower.includes('falta de ar') || textLower.includes('dificuldade para respirar')) {
      alerts.push({
        title: 'Dificuldade respiratória relatada',
        reason: 'Falta de ar ou aperto para respirar acompanhando dor é um sinal que requer avaliação rápida.',
        severity: 'urgent',
      });
    }

    // 2. Dor no peito intensa ou de início súbito
    if (hasChestPain && (assessment.intensity >= 6 || textLower.includes('súbita') || textLower.includes('aperto'))) {
      alerts.push({
        title: 'Dor na região torácica / peito',
        reason: 'Desconforto ou dor torácica significativa exige investigação presencial imediata.',
        severity: 'urgent',
      });
    }

    // 3. Sangramento importante
    if (symptoms.includes('Sangramento') || textLower.includes('sangrando') || textLower.includes('hemorragia')) {
      alerts.push({
        title: 'Sangramento associado',
        reason: 'A presença de sangramento em conjunto com dor merece atenção médica presencial com rapidez.',
        severity: 'urgent',
      });
    }

    // 4. Sinais neurológicos (Tontura severa, desmaio, fraqueza súbita, fala)
    const neuroKeywords = ['desmaio', 'desmaiei', 'apaguei', 'confusão', 'fala arrastada', 'não sinto o braço', 'boca torta', 'fraqueza súbita'];
    if (neuroKeywords.some((k) => textLower.includes(k)) || symptoms.includes('Tontura') && assessment.intensity >= 8) {
      alerts.push({
        title: 'Sinais neurológicos ou perda de consciência',
        reason: 'Sintomas como desmaio, fraqueza repentina ou confusão são sinais críticos de alerta.',
        severity: 'urgent',
      });
    }

    // 5. Dor extrema / súbita
    if (assessment.intensity >= 9) {
      alerts.push({
        title: 'Intensidade muito alta (grau ' + assessment.intensity + '/10)',
        reason: 'Uma dor classificada próxima à intensidade máxima possível demanda alívio e checagem profissional urgente.',
        severity: 'urgent',
      });
    }

    // 6. Febre associada a dor intensa
    if (symptoms.includes('Febre') && assessment.intensity >= 7) {
      alerts.push({
        title: 'Febre associada a dor de intensidade alta',
        reason: 'A combinação de febre com dor intensa pode indicar processo infeccioso ou inflamatório agudo.',
        severity: 'caution',
      });
    }

    const hasRedFlags = alerts.length > 0;
    const hasUrgent = alerts.some((a) => a.severity === 'urgent');

    return {
      hasRedFlags,
      alerts,
      urgentRecommendationMessage: hasUrgent
        ? 'As informações que você relatou podem indicar que é importante procurar atendimento médico rapidamente.'
        : undefined,
    };
  },

  /**
   * Generates a neutral, informative user summary of the reported pain.
   */
  generatePhysicalPainSummary(assessment: PhysicalPainAssessment): string {
    const loc = assessment.location.trim() || 'região não especificada';
    const intensity = assessment.intensity;
    const duration = assessment.duration === 'Outro' && assessment.durationCustom
      ? assessment.durationCustom.trim()
      : assessment.duration || 'duração não detalhada';

    const types = assessment.painTypes && assessment.painTypes.length > 0
      ? assessment.painTypes.join(', ').toLowerCase()
      : 'não especificado';

    const freq = assessment.frequency ? assessment.frequency.toLowerCase() : 'frequência variável';

    let otherSymptomsText = '';
    const validSymptoms = (assessment.otherSymptoms || []).filter((s) => s !== 'Nenhum desses');
    if (validSymptoms.length > 0) {
      const extraCustom = assessment.otherSymptomsCustom ? ` (${assessment.otherSymptomsCustom})` : '';
      otherSymptomsText = ` Também foram observados outros sinais: ${validSymptoms.join(', ').toLowerCase()}${extraCustom}.`;
    } else {
      otherSymptomsText = ' Nenhum outro sintoma adicional foi assinalado.';
    }

    return `Você relatou uma dor em ${loc} de intensidade ${intensity}/10, presente há aproximadamente ${duration.toLowerCase()}, descrita como ${types} e que ocorre de forma ${freq}.${otherSymptomsText}`;
  },

  /**
   * Generates informative, non-diagnostic educational interpretation.
   */
  generatePhysicalPainInterpretation(
    assessment: PhysicalPainAssessment,
    redFlags: RedFlagEvaluation
  ): string {
    const intensity = assessment.intensity;
    const duration = assessment.duration.toLowerCase();

    const parts: string[] = [];

    // Intensity interpretation
    if (intensity <= 3) {
      parts.push(
        'Uma dor de intensidade leve a moderada pode ser reflexo de sobrecargas posturais, tensões musculares transitórias ou processos leves.'
      );
    } else if (intensity <= 6) {
      parts.push(
        'Uma dor de intensidade moderada que gera incômodo contínuo merece ser acompanhada com atenção, principalmente se estiver interferindo no descanso ou no trabalho.'
      );
    } else {
      parts.push(
        'Uma dor de intensidade forte a severa gera sobrecarga física e estresse no organismo, justificando buscar orientação profissional especializada.'
      );
    }

    // Duration & evolution
    if (duration.includes('menos de 1 hora') || duration.includes('algumas horas') || duration.includes('1 dia')) {
      parts.push(
        'Como o início é recente, observar a evolução nas próximas horas é fundamental para notar se há piora rápida, estabilidade ou alívio.'
      );
    } else if (duration.includes('semanas') || duration.includes('meses')) {
      parts.push(
        'Sintomas que persistem por semanas ou meses deixam de ser transitórios e se beneficiam de uma investigação médica estruturada para identificar a causa e restabelecer sua qualidade de vida.'
      );
    } else {
      parts.push(
        'Se o quadro estiver recorrente ou persistente há dias sem melhora espontânea, a avaliação clínica permite investigar os fatores envolvidos com precisão.'
      );
    }

    // Context summary
    if (redFlags.hasRedFlags) {
      parts.push(
        'Devido a características como a intensidade ou a presença de sinais associados apontados no relato, a orientação prioritária é priorizar uma checagem médica presencial.'
      );
    } else {
      parts.push(
        'Caso perceba novos sintomas, piora progressiva ou se a dor começar a limitar suas atividades habituais, procure um profissional de saúde habilitado.'
      );
    }

    return parts.join(' ');
  },

  /**
   * Main analysis method called when completing physical pain assessment.
   * Leverages Gemini 3.8 Flash server-side AI with robust local clinical fallback.
   */
  async analyzePhysicalPain(assessment: PhysicalPainAssessment): Promise<PhysicalPainAnalysisResult> {
    const localRedFlags = this.evaluateRedFlags(assessment);
    const localSummary = this.generatePhysicalPainSummary(assessment);
    const localInterpretation = this.generatePhysicalPainInterpretation(assessment, localRedFlags);

    const validSymptoms = (assessment.otherSymptoms || []).filter((s) => s !== 'Nenhum desses');
    const otherSymptomsDisplay = validSymptoms.length > 0
      ? validSymptoms.join(', ') + (assessment.otherSymptomsCustom ? ` (${assessment.otherSymptomsCustom})` : '')
      : 'Nenhum informado';

    const durationDisplay = assessment.duration === 'Outro' && assessment.durationCustom
      ? assessment.durationCustom
      : assessment.duration || 'Não informado';

    const painTypesDisplay = assessment.painTypes && assessment.painTypes.length > 0
      ? assessment.painTypes.join(', ')
      : 'Não informado';

    let finalSummary = localSummary;
    let finalInterpretation = localInterpretation;
    let finalRedFlags = localRedFlags;

    // Call server AI endpoint
    try {
      const response = await fetch('/api/analyze-physical-pain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialDescription: assessment.initialDescription,
          location: assessment.location,
          intensity: assessment.intensity,
          duration: assessment.duration,
          painTypes: assessment.painTypes,
          frequency: assessment.frequency,
          otherSymptoms: assessment.otherSymptoms,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && !data.fallback && data.summaryParagraph && data.interpretationParagraph) {
          finalSummary = data.summaryParagraph;
          finalInterpretation = data.interpretationParagraph;

          // Merge red flags if AI detected urgent alerts
          if (Array.isArray(data.redFlagAlerts) && data.redFlagAlerts.length > 0) {
            const mergedAlerts = [...localRedFlags.alerts];
            for (const aiAlert of data.redFlagAlerts) {
              if (!mergedAlerts.some((a) => a.title.toLowerCase() === aiAlert.title.toLowerCase())) {
                mergedAlerts.push(aiAlert);
              }
            }
            finalRedFlags = {
              hasRedFlags: mergedAlerts.length > 0,
              highestSeverity: mergedAlerts.some((a) => a.severity === 'urgent')
                ? 'urgent'
                : mergedAlerts.length > 0
                ? 'caution'
                : 'none',
              alerts: mergedAlerts,
            };
          }
        }
      }
    } catch (e) {
      console.warn('Fallback para análise clínica local determinística:', e);
    }

    return {
      summaryParagraph: finalSummary,
      interpretationParagraph: finalInterpretation,
      redFlags: finalRedFlags,
      visualSummary: {
        location: assessment.location || 'Não informada',
        intensity: `${assessment.intensity}/10`,
        duration: durationDisplay,
        painType: painTypesDisplay,
        frequency: assessment.frequency || 'Não informada',
        otherSymptoms: otherSymptomsDisplay,
      },
    };
  },
};
