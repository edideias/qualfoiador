import {
  PhysicalPainAssessment,
  PhysicalPainAnalysisResult,
  PhysicalPainDraft,
  PhysicalPainRecord,
} from '../../types';
import { physicalPainAiService } from '../../services/ai/physicalPainAiService';

const STORAGE_KEY_DRAFT = 'qual_e_a_sua_dor:physical_pain_draft';
const STORAGE_KEY_ASSESSMENT = 'qual_e_a_sua_dor:physical_pain_current_assessment';
const STORAGE_KEY_ANALYSIS = 'qual_e_a_sua_dor:physical_pain_current_analysis';
const STORAGE_KEY_RECORDS = 'qual_e_a_sua_dor:physical_pain_records';

export const physicalPainService = {
  getDraft(): PhysicalPainDraft {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      description: '',
      voiceUsed: false,
      status: 'draft',
      currentStep: 0,
    };
  },

  saveDraft(draft: PhysicalPainDraft): void {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    } catch {
      // ignore
    }
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
      localStorage.removeItem(STORAGE_KEY_ASSESSMENT);
      localStorage.removeItem(STORAGE_KEY_ANALYSIS);
    } catch {
      // ignore
    }
  },

  getCurrentAssessment(): PhysicalPainAssessment | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSESSMENT);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  },

  saveCurrentAssessment(assessment: PhysicalPainAssessment): void {
    try {
      localStorage.setItem(STORAGE_KEY_ASSESSMENT, JSON.stringify(assessment));
    } catch {
      // ignore
    }
  },

  getCurrentAnalysis(): PhysicalPainAnalysisResult | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ANALYSIS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  },

  saveCurrentAnalysis(analysis: PhysicalPainAnalysisResult): void {
    try {
      localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(analysis));
    } catch {
      // ignore
    }
  },

  async completeAssessment(assessment: PhysicalPainAssessment): Promise<PhysicalPainRecord> {
    const analysis = await physicalPainAiService.analyzePhysicalPain(assessment);
    this.saveCurrentAssessment(assessment);
    this.saveCurrentAnalysis(analysis);

    const record: PhysicalPainRecord = {
      id: 'phys_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      assessment,
      analysisResult: analysis,
      createdAt: new Date().toISOString(),
    };

    try {
      const list = this.getRecords();
      list.unshift(record);
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(list));
      this.saveDraft({
        description: assessment.initialDescription,
        voiceUsed: false,
        status: 'completed',
        assessment,
        createdAt: record.createdAt,
      });
    } catch {
      // ignore
    }

    return record;
  },

  getRecords(): PhysicalPainRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
