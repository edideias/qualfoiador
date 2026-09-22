import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Router, Request, Response } from "express";

// Use /tmp in Vercel serverless (read-only filesystem otherwise)
const DATA_DIR = process.env.VERCEL
  ? "/tmp/qual-e-a-sua-dor-data"
  : path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "reported-solutions.json");

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
export interface ReportedSolution {
  id: string;
  problemDescription: string;
  reportedSolution: {
    title?: string;
    primaryActionLabel?: string;
    searchQuery?: string;
    fullSummary?: string;
  };
  issueType: 'fanciful' | 'unfeasible' | 'unrelated' | 'wrong_service' | 'other';
  issueLabel: string;
  userComment: string;
  suggestedCorrection?: string;
  locationInfo?: string;
  createdAt: string;
  status: 'pending' | 'reviewed';
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readReports(): ReportedSolution[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao ler reported-solutions.json:", e);
    return [];
  }
}

function saveReports(reports: ReportedSolution[]): void {
  ensureDataDir();
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export const feedbackRouter = Router();

// POST: Registrar novo reporte de solução fantasiosa/inviável
feedbackRouter.post("/feedback/report-solution", (req: Request, res: Response) => {
  try {
    const {
      problemDescription,
      reportedSolution,
      issueType,
      issueLabel,
      userComment,
      suggestedCorrection,
      locationInfo,
    } = req.body;

    if (!problemDescription && !reportedSolution) {
      return res.status(400).json({ error: "Dados insuficientes para o relatório." });
    }

    const newReport: ReportedSolution = {
      id: crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      problemDescription: (problemDescription || "Não especificado").toString().slice(0, 500),
      reportedSolution: reportedSolution || {},
      issueType: issueType || 'other',
      issueLabel: issueLabel || 'Problema não especificado',
      userComment: (userComment || "").toString().slice(0, 1000),
      suggestedCorrection: (suggestedCorrection || "").toString().slice(0, 1000),
      locationInfo: locationInfo ? String(locationInfo).slice(0, 200) : undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const currentReports = readReports();
    currentReports.unshift(newReport); // Mais recente no topo
    // Limitar a 500 registros
    const trimmed = currentReports.slice(0, 500);
    saveReports(trimmed);

    console.log(`[REPORTED SOLUTION] Novo reporte registrado: ID ${newReport.id} - Tipo: ${newReport.issueType}`);

    return res.status(201).json({
      success: true,
      reportId: newReport.id,
      message: "Relatório registrado com sucesso para calibração do sistema.",
    });
  } catch (error: unknown) {
    console.error("Erro ao registrar reporte de solução:", error);
    return res.status(500).json({ error: "Falha ao salvar relatório." });
  }
});

// GET: Listar todos os reportes (para o admin)
feedbackRouter.get("/feedback/reported-solutions", (_req: Request, res: Response) => {
  try {
    const reports = readReports();
    return res.json({
      reports,
      total: reports.length,
      pendingCount: reports.filter((r) => r.status === 'pending').length,
    });
  } catch (error: unknown) {
    console.error("Erro ao carregar reportes de soluções:", error);
    return res.status(500).json({ error: "Falha ao carregar relatórios." });
  }
});

// PATCH: Atualizar status do reporte (ex: marcar como revisado)
feedbackRouter.patch("/feedback/reported-solutions/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reports = readReports();
    const index = reports.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Relatório não encontrado." });
    }

    if (status) {
      reports[index].status = status;
    }

    saveReports(reports);
    return res.json({ success: true, report: reports[index] });
  } catch (error: unknown) {
    console.error("Erro ao atualizar reporte:", error);
    return res.status(500).json({ error: "Falha ao atualizar relatório." });
  }
});

// DELETE: Excluir um reporte
feedbackRouter.delete("/feedback/reported-solutions/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reports = readReports();
    const filtered = reports.filter((r) => r.id !== id);

    if (filtered.length === reports.length) {
      return res.status(404).json({ error: "Relatório não encontrado." });
    }

    saveReports(filtered);
    return res.json({ success: true, message: "Relatório removido com sucesso." });
  } catch (error: unknown) {
    console.error("Erro ao deletar reporte:", error);
    return res.status(500).json({ error: "Falha ao deletar relatório." });
  }
});
