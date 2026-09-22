import {
  ProblemAssessment,
  ProblemPainAnalysisResult,
  ProblemPainDraft,
  ProblemPainRecord,
} from '../../types';
import { problemPainAiService } from '../../services/ai/problemPainAiService';
import { problemSolverService } from '../../services/problemSolverService';

const STORAGE_KEY_DRAFT = 'qual_e_a_sua_dor:problem_pain_draft';
const STORAGE_KEY_ASSESSMENT = 'qual_e_a_sua_dor:problem_pain_current_assessment';
const STORAGE_KEY_ANALYSIS = 'qual_e_a_sua_dor:problem_pain_current_analysis';
const STORAGE_KEY_RECORDS = 'qual_e_a_sua_dor:problem_pain_records';

export const problemPainService = {
  getDraft(): ProblemPainDraft {
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

  saveDraft(draft: ProblemPainDraft): void {
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

  getCurrentAssessment(): ProblemAssessment | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSESSMENT);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  },

  saveCurrentAssessment(assessment: ProblemAssessment): void {
    try {
      localStorage.setItem(STORAGE_KEY_ASSESSMENT, JSON.stringify(assessment));
    } catch {
      // ignore
    }
  },

  getCurrentAnalysis(): ProblemPainAnalysisResult | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ANALYSIS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  },

  saveCurrentAnalysis(analysis: ProblemPainAnalysisResult): void {
    try {
      localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(analysis));
    } catch {
      // ignore
    }
  },

  completeAssessment(assessment: ProblemAssessment): ProblemPainRecord {
    let analysis = problemPainAiService.analyzeProblem(assessment);
    
    // Enrich with actionSolution if missing
    if (!analysis.actionSolution) {
      const fast = problemSolverService.resolveFastTemplate(assessment.initialDescription) ||
        problemSolverService.buildGenericSolution(assessment.initialDescription);
      analysis = {
        ...analysis,
        actionSolution: fast,
      };
    }

    this.saveCurrentAssessment(assessment);
    this.saveCurrentAnalysis(analysis);

    const record: ProblemPainRecord = {
      id: 'prob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
        status: 'submitted',
        assessment,
        createdAt: record.createdAt,
      });
    } catch {
      // ignore
    }

    return record;
  },

  async completeAssessmentWithAI(assessment: ProblemAssessment): Promise<ProblemPainRecord> {
    let analysis = await problemSolverService.solve(assessment);
    this.saveCurrentAssessment(assessment);
    this.saveCurrentAnalysis(analysis);

    const record: ProblemPainRecord = {
      id: 'prob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
        status: 'submitted',
        assessment,
        createdAt: record.createdAt,
      });
    } catch {
      // ignore
    }

    return record;
  },

  getRecords(): ProblemPainRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
