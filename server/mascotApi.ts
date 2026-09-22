import fs from "fs";
import path from "path";
import { Router } from "express";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// Use /tmp in Vercel serverless (read-only filesystem otherwise)
const DATA_DIR = process.env.VERCEL
  ? "/tmp/qual-e-a-sua-dor-data"
  : path.join(process.cwd(), "data");
const MASCOTS_FILE = path.join(DATA_DIR, "mascots-permanent.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "mascots");

// Garantir que os diretórios existam
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Ler os mascotes permanentes salvos no servidor
export function readPermanentMascots(): Record<string, any> {
  ensureDirs();
  try {
    if (fs.existsSync(MASCOTS_FILE)) {
      const raw = fs.readFileSync(MASCOTS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Erro ao ler mascotes permanentes:", err);
  }
  return {};
}

// Salva imagens base64 como arquivos estáticos no disco para evitar payloads pesados e garantir fixação
function processBase64Images(mascots: Record<string, any>): Record<string, any> {
  ensureDirs();
  const processed: Record<string, any> = { ...mascots };

  for (const [key, item] of Object.entries(processed)) {
    if (item && typeof item === "object") {
      const src = item.customSrc;
      if (typeof src === "string" && src.startsWith("data:image/")) {
        try {
          const matches = src.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const rawExt = matches[1].toLowerCase();
            const ext = rawExt === "jpeg" ? "jpg" : rawExt === "svg+xml" ? "svg" : rawExt;
            const base64Data = matches[2];
            const filename = `mascot_${key}_${Date.now()}.${ext}`;
            const filepath = path.join(UPLOADS_DIR, filename);

            fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
            // Definir caminho estático seguro com timestamp para cache-busting imediato
            processed[key] = {
              ...item,
              customSrc: `/uploads/mascots/${filename}?v=${Date.now()}`,
            };
          }
        } catch (imgErr) {
          console.error(`Erro ao salvar imagem do mascote ${key} em disco:`, imgErr);
        }
      }
    }
  }

  return processed;
}

// Salva os mascotes de forma permanente (imune a republicação de temas)
export function writePermanentMascots(data: Record<string, any>): Record<string, any> {
  ensureDirs();
  const cleaned = processBase64Images(data);
  const tempFile = `${MASCOTS_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(cleaned, null, 2), "utf-8");
  fs.renameSync(tempFile, MASCOTS_FILE);
  return cleaned;
}

export const mascotRouter = Router();

// GET /api/mascots - Retorna os mascotes permanentes cadastrados
mascotRouter.get("/mascots", (_req, res) => {
  try {
    const mascots = readPermanentMascots();
    res.json({ success: true, mascots });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: getErrorMessage(err) || "Erro ao consultar mascotes." });
  }
});

// POST /api/mascots - Atualiza ou adiciona mascotes de forma permanente no servidor
mascotRouter.post("/mascots", (req, res) => {
  try {
    const { mascots } = req.body;
    if (!mascots || typeof mascots !== "object") {
      return res.status(400).json({ success: false, error: "Objeto de mascotes inválido ou ausente." });
    }

    const current = readPermanentMascots();
    const merged = { ...current, ...mascots };
    const saved = writePermanentMascots(merged);

    console.log(`[MascotAPI] Mascotes atualizados e fixados de forma permanente no servidor. Total: ${Object.keys(saved).length}`);
    res.json({ success: true, mascots: saved });
  } catch (err: unknown) {
    console.error("Erro ao salvar mascotes:", err);
    res.status(500).json({ success: false, error: getErrorMessage(err) || "Erro ao salvar mascotes no servidor." });
  }
});

// POST /api/mascots/reset-one - Restaura apenas um mascote específico
mascotRouter.post("/mascots/reset-one", (req, res) => {
  try {
    const { key } = req.body;
    if (!key || typeof key !== "string") {
      return res.status(400).json({ success: false, error: "Chave do mascote não fornecida." });
    }

    const current = readPermanentMascots();
    delete current[key];
    const saved = writePermanentMascots(current);

    res.json({ success: true, mascots: saved });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: getErrorMessage(err) || "Erro ao restaurar mascote." });
  }
});

// POST /api/mascots/reset-all - Restaura todos os mascotes para a arte de fábrica
mascotRouter.post("/mascots/reset-all", (_req, res) => {
  try {
    writePermanentMascots({});
    res.json({ success: true, mascots: {} });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: getErrorMessage(err) || "Erro ao resetar mascotes." });
  }
});
