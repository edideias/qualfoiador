import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { themeRouter } from "./server/themeApi";
import { feedbackRouter } from "./server/feedbackApi";
import { mascotRouter } from "./server/mascotApi";

dotenv.config();

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// In-memory rate limiter: 10 requests per 10 seconds per IP for AI endpoints
const aiRateLimitMap = new Map<string, { count: number; reset: number }>();
const AI_RATE_LIMIT = { max: 10, windowMs: 10_000 };

function aiRateLimit(_req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = _req.ip || _req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = aiRateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    aiRateLimitMap.set(ip, { count: 1, reset: now + AI_RATE_LIMIT.windowMs });
    return next();
  }

  if (entry.count >= AI_RATE_LIMIT.max) {
    return res.status(429).json({
      error: "Limite de requisições por IP excedido. Tente novamente em alguns segundos.",
    });
  }

  entry.count++;
  next();
}

app.use("/api", themeRouter);
app.use("/api", feedbackRouter);
app.use("/api", mascotRouter);

// Apply rate limiting to AI-intensive endpoints
app.use("/api/transcribe-audio", aiRateLimit);
app.use("/api/refine-transcript", aiRateLimit);
app.use("/api/solve-problem", aiRateLimit);
app.use("/api/analyze-physical-pain", aiRateLimit);
app.use("/api/analyze-problem", aiRateLimit);
app.use("/api/chat-problem", aiRateLimit);
app.use("/api/vehicle-guide", aiRateLimit);

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// API: Audio Transcription (WhatsApp style voice note transcription)
app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;

    if (!audioData || typeof audioData !== "string") {
      return res.status(400).json({ error: "Áudio não fornecido ou inválido." });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "Serviço de transcrição por inteligência artificial não configurado no momento.",
      });
    }

    // Clean base64 string if it contains data prefix
    const cleanBase64 = audioData.includes(",")
      ? audioData.split(",")[1]
      : audioData;

    // Normalizing mime types supported by Gemini models
    let normalizedMime = mimeType ? mimeType.split(";")[0].trim().toLowerCase() : "audio/webm";
    if (!normalizedMime || normalizedMime === "video/webm") {
      normalizedMime = "audio/webm";
    }

    const promptText = `Você é um especialista em transcrição fonética e revisão de áudios em Português do Brasil (pt-BR).
Transcreva com máxima precisão o que foi falado no áudio.
REGRAS MANDATÓRIAS:
1. Escreva em Português do Brasil correto, com acentuação e pontuação gramatical adequada (vírgulas, pontos, interrogações).
2. Corrija lapsos comuns de fala (como repetições involuntárias 'é... é...', gaguejos leves ou contrações orais soltas) para que o texto final seja fluído, limpo, natural e claro.
3. Preserve fielmente o vocabulário, termos anatômicos, sintomas e pedidos da pessoa sem alterar o sentido nem inventar nada.
4. Retorne EXCLUSIVAMENTE o texto transcrito e revisado em português, sem notas, sem aspas e sem explicações.`;

    // Try specialized and general multimodal models
    const modelsToTry = [
      "gemini-3.5-transcribe",
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ];

    let transcribedText = "";
    let lastError: unknown = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: normalizedMime,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        });

        if (response.text) {
          transcribedText = response.text.trim();
        } else if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.text) {
              transcribedText += part.text;
            }
          }
          transcribedText = transcribedText.trim();
        }

        if (transcribedText) {
          return res.json({
            text: transcribedText,
            modelUsed: model,
            confidence: 1.0,
          });
        }
      } catch (err: unknown) {
          console.warn(`Tentativa de transcrição com modelo ${model} falhou:`, getErrorMessage(err));
        lastError = err;
      }
    }

    return res.status(500).json({
      error: lastError ? getErrorMessage(lastError) : "Não foi possível transcrever o áudio gravado.",
    });
  } catch (error: unknown) {
    console.error("Erro na transcrição de áudio:", error);
    return res.status(500).json({
         error: getErrorMessage(error),
    });
  }
});

// API: Refine and format real-time transcript into perfect Brazilian Portuguese
app.post("/api/refine-transcript", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return res.status(400).json({ error: "Texto não fornecido." });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({ refinedText: rawText.trim() });
    }

    const prompt = `Você é um revisor de texto em Português do Brasil (pt-BR).
O texto a seguir foi obtido por reconhecimento de voz em tempo real e pode conter pequenos erros de pontuação, falta de acentos ou contrações fonéticas:

"${rawText.trim()}"

TAREFA:
1. Reescreva em Português do Brasil correto, aplicando a pontuação e acentuação gramatical correta.
2. Mantenha 100% do sentido original, todos os nomes de sintomas, locais anatômicos ou problemas relatados.
3. Não invente nada e não faça resumos nem comentários.
4. Retorne EXCLUSIVAMENTE o texto corrigido final.`;

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.1,
          },
        });
        if (response.text && response.text.trim()) {
          return res.json({ refinedText: response.text.trim() });
        }
      } catch (err) {
        console.warn(`Tentativa com ${model} em refine-transcript falhou:`, err);
      }
    }

    return res.json({ refinedText: rawText.trim() });
    } catch (error: unknown) {
      console.error("Erro no /api/refine-transcript:", error);
      return res.json({ refinedText: req.body?.rawText || "" });
  }
});

// API: Action-First Modern Life Problem Solver (5-Layer Response Engine)
app.post("/api/solve-problem", async (req, res) => {
  try {
    const { description, location } = req.body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Descrição do problema é obrigatória." });
    }

    const ai = getAI();
    const cleanDesc = description.trim();

    const prompt = `
Você é o motor central do aplicativo "QUAL A SUA DOR?" — um resolvedor de problemas da vida moderna focado estritamente em AÇÃO IMEDIATA.
O aplicativo NÃO é um blog, buscador genérico ou manual de instruções.

PROBLEMA DO USUÁRIO:
"${cleanDesc}"

LOCALIZAÇÃO DO USUÁRIO:
${location?.cityOrNeighborhood ? `Bairro/Cidade: ${location.cityOrNeighborhood}` : location?.latitude ? `Coordenadas: Lat ${location.latitude}, Lng ${location.longitude}` : "Não informada (propor busca no raio de proximidade)"}

PRINCÍPIO FUNDAMENTAL:
"Qual é a forma mais rápida, simples e útil de fazer essa pessoa sair dessa situação?"
A resposta deve priorizar AÇÃO, não INFORMAÇÃO.
REGRA ABSOLUTA:
- MENOS TEXTO. MAIS SOLUÇÃO. MAIS AÇÃO. MAIS PROXIMIDADE. MENOS ENROLAÇÃO.
- REGRA DOS 5 SEGUNDOS: O usuário deve bater o olho e em 5 segundos entender o problema, o que fazer agora e qual botão apertar.
- NUNCA invente nomes de estabelecimentos fictícios! Indique a categoria exata de busca (ex: "borracharia aberta agora", "chaveiro 24 horas", "distribuidora de gas", "encanador residencial", "eletricista") para que o Google Maps abra com dados 100% reais do usuário.

CLASSIFICAÇÃO DE URGÊNCIA:
- "URGENTE" (pneu furado, carro morreu, chave quebrada, cano estourou, risco iminente)
- "RESOLVER_LOGO" (acabou o gás, eletricista, com fome, imprimir documento, etc.)
- "PODE_ESPERAR" (trocar lâmpada decorativa, planejar rotina, etc.)
Quanto maior a urgência, menor a quantidade de texto!

ESTRUTURA DE RESPOSTA EM 5 CAMADAS (JSON EXCLUSIVO):
Retorne estritamente um JSON no seguinte formato:
{
  "actionSolution": {
    "problemIdentified": "Nome curto do problema (ex: Pneu Furado, Cano Estourou)",
    "urgency": "URGENTE" | "RESOLVER_LOGO" | "PODE_ESPERAR",
    "urgencyLabel": "URGENTE" | "PRECISO RESOLVER LOGO" | "PODE ESPERAR",
    "immediateInstruction": "Uma frase dizendo exatamente o que fazer agora nos primeiros segundos.",
    "immediateSafetySteps": [
      "1. Passo rápido 1",
      "2. Passo rápido 2",
      "3. Passo rápido 3 (opcional, máximo 3 passos curtos)"
    ],
    "primaryAction": {
      "label": "Texto do botão principal (ex: 📍 VER BORRACHARIAS PERTO DE MIM)",
      "actionType": "open_maps" | "call" | "guide",
      "searchQuery": "termo exato para busca no Google Maps (ex: borracharia aberta agora)"
    },
    "serviceCategoryNeeded": "Nome da categoria de serviço (ex: Borracharia, Chaveiro 24h, Distribuidor de Gás)",
    "bestOption": {
      "title": "Título da melhor opção (ex: Borracharia mais próxima)",
      "badge": "Ex: Aberta agora • Rota mais rápida",
      "description": "Descrição em 1 linha do que esse serviço resolve.",
      "actionLabel": "COMO CHEGAR",
      "searchQuery": "termo de busca para rota",
      "estimatedTime": "Ex: 5 a 10 min de deslocamento"
    },
    "alternatives": [
      {
        "title": "Título da alternativa 1",
        "description": "Descrição em 1 linha",
        "actionLabel": "Texto do botão da alternativa",
        "actionType": "maps" | "call" | "guide" | "app",
        "actionPayload": "termo de busca ou id de ação"
      },
      {
        "title": "Título da alternativa 2",
        "description": "Descrição em 1 linha",
        "actionLabel": "Texto do botão da alternativa",
        "actionType": "maps" | "call" | "guide" | "app",
        "actionPayload": "termo de busca ou id de ação"
      }
    ],
    "explanationNote": "Uma dica curta ou explicação discreta (máx 2 linhas) que só será exibida se o usuário quiser.",
    "contextActions": [
      {
        "label": "Ex: 🚨 ESTOU EM LOCAL PERIGOSO / VIA RÁPIDA",
        "variant": "danger" | "warning" | "safe",
        "instruction": "Instrução de segurança imediata.",
        "phone": "número de telefone de emergência se houver (ex: 190, 192, 193)"
      }
    ],
    "locationNeeded": true
  }
}
`;

    if (ai) {
      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed && parsed.actionSolution) {
              return res.json(parsed);
            }
          }
        } catch (mErr: unknown) {
          console.warn(`Tentativa com ${model} em solve-problem falhou, tentando próximo:`, getErrorMessage(mErr));
        }
      }
    }

    // Se a IA não estiver disponível ou falhar, retorna status para o cliente usar o resolvedor local
    return res.json({ fallback: true });
    } catch (error: unknown) {
      console.error("Erro no /api/solve-problem:", error);
      return res.status(500).json({ error: "Erro ao resolver problema." });
  }
});

// API: Analyze Physical Pain (Clinical AI Engine)
app.post("/api/analyze-physical-pain", async (req, res) => {
  try {
    const { initialDescription, location, intensity, duration, painTypes, frequency, otherSymptoms } = req.body;

    const ai = getAI();
    if (!ai) {
      return res.json({ fallback: true });
    }

    const prompt = `
Você é a inteligência clínica do aplicativo "Qual a sua dor?".
O usuário está relatando uma dor ou desconforto físico.

DADOS RELATADOS:
- Relato inicial livre: "${initialDescription || "Não informado"}"
- Localização no corpo: "${location || "Não informada"}"
- Intensidade (0 a 10): ${intensity ?? 5}
- Duração / início: "${duration || "Não informado"}"
- Tipo de sensação: "${Array.isArray(painTypes) ? painTypes.join(", ") : painTypes || "Não informado"}"
- Frequência: "${frequency || "Não informada"}"
- Outros sintomas perceptíveis: "${Array.isArray(otherSymptoms) ? otherSymptoms.join(", ") : otherSymptoms || "Nenhum"}"

DIRETRIZES DE SAÚDE E SEGURANÇA:
1. NUNCA dê diagnósticos definitivos nem prescreva medicamentos.
2. Seja acolhedor, objetivo, tranquilizador e altamente empático.
3. Se houver sinais de alerta (dor torácica/coração intensa, falta de ar grave, desmaio, dormência súbita na face ou braço, sangramento volumoso ou febre muito alta com dor severa), destaque imediatamente a necessidade de atendimento presencial de urgência.
4. Explique em linguagem clara e humana o que a intensidade, a localização e a duração podem significar em termos de sobrecarga, tensão ou necessidade de investigação.

Retorne EXCLUSIVAMENTE um objeto JSON válido com este formato:
{
  "summaryParagraph": "Parágrafo fluído, organizado e em português natural resumindo exatamente o que a pessoa está sentindo de forma acolhedora e precisa.",
  "interpretationParagraph": "Parágrafo empático interpretando a intensidade, duração e características clínicas relatadas, dando orientações de autocuidado responsável e quando buscar médico.",
  "redFlagAlerts": [
    {
      "title": "Título do sinal de atenção (se houver)",
      "reason": "Por que esse sinal requer cuidado presencial",
      "severity": "urgent" ou "caution"
    }
  ]
}
`;

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed && parsed.summaryParagraph && parsed.interpretationParagraph) {
            return res.json(parsed);
          }
        }
      } catch (err: unknown) {
        console.warn(`Tentativa com ${model} em analyze-physical-pain falhou, tentando próximo:`, getErrorMessage(err));
      }
    }

    return res.json({ fallback: true });
    } catch (error: unknown) {
      console.error("Erro no /api/analyze-physical-pain:", error);
      return res.status(500).json({ error: "Erro ao analisar dor física." });
  }
});

// API: Analyze Problem Pain (Intelligent AI Engine)
app.post("/api/analyze-problem", async (req, res) => {
  try {
    const { description, frequency, timeSpent, area, priorityGoal } = req.body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Descrição do problema é obrigatória." });
    }

    const ai = getAI();
    const prompt = `
Você é a inteligência central do aplicativo "Qual a sua dor?".
O usuário descreveu um problema, atrito ou gargalo que está incomodando, travando ou roubando tempo e energia dele:

DESCRIÇÃO DO USUÁRIO:
"${description}"

INFORMAÇÕES ADICIONAIS:
- Frequência: ${frequency || "Deduza do relato"}
- Tempo consumido: ${timeSpent || "Deduza do relato"}
- Área da vida/negócio: ${area || "Deduza do relato"}
- Principal desejo de alívio: ${priorityGoal || "Deduza do relato"}

SUA MISSÃO:
Não seja genérico, burocrático ou prolixo. O aplicativo tem como propósito agir da melhor forma para AJUDAR DE VERDADE.
Entenda a dor profunda e gere uma análise cirúrgica, empática e altamente prática.

Retorne EXCLUSIVAMENTE um objeto JSON válido, com a seguinte estrutura e tipos exatos:
{
  "painScore": number (de 10 a 100, baseado na urgência, frequência e desgaste mental/financeiro gerado),
  "painLevel": "LEVE" | "MODERADO" | "ALTO" | "CRÍTICO",
  "painLevelExplanation": string (uma frase acolhedora e direta explicando por que essa dor recebeu essa nota),
  "summaryDiscovery": string (o diagnóstico real: qual é a causa invisível e o verdadeiro padrão que está travando o usuário, além do sintoma superficial),
  "impactMetrics": {
    "monthlyHours": number (estimativa realista de horas gastas ou perdidas por mês com esse estresse/problema),
    "weeklyOccurrences": number (vezes que isso incomoda por semana),
    "estimatedFinancialCost": string (ex: "Estimado em R$ 400 a R$ 1.200/mês em retrabalho" se envolver clientes/vendas/finanças, ou "Desgaste de energia vital" se for pessoal)
  },
  "threePaths": {
    "automate": {
      "title": "AUTOMATIZAR & DELEGAR",
      "tagline": string (uma frase resumida do caminho),
      "description": string (ferramentas práticas reais, IA, templates ou delegações específicas para esse problema)
    },
    "simplify": {
      "title": "SIMPLIFICAR O PROCESSO",
      "tagline": string (uma frase resumida do caminho),
      "description": string (uma regra simples de rotina ou critério direto para cortar 80% do atrito sem complicação)
    },
    "eliminate": {
      "title": "ELIMINAR / DIZER NÃO",
      "tagline": string (uma frase resumida do caminho),
      "description": string (o que o usuário deve parar de fazer ou desapegar hoje mesmo com segurança)
    }
  },
  "immediateAction": {
    "title": string (o título da ação imediata que dá alívio em 5 minutos),
    "timeToExecute": string (ex: "5 minutos"),
    "description": string (explicação clara do que fazer agora),
    "stepByStep": [string, string, string] (3 passos diretos para executar agora)
  },
  "readyTemplate": {
    "title": string (ex: "Mensagem pronta para enviar aos clientes", "Regra de ouro para o seu bloco de notas"),
    "content": string (o texto pronto na íntegra para o usuário copiar e colar imediatamente)
  },
  "actionPlan": {
    "today": string (o que fazer hoje para sentir o primeiro alívio),
    "thisWeek": string (o ajuste a fazer nesta semana para o problema não se repetir),
    "nextMonth": string (como garantir que no próximo mês você esteja livre dessa dor)
  },
  "transformation": {
    "today": string (como é o dia a dia vivendo com essa dor),
    "withoutPain": string (como fica a vida, o tempo e a cabeça sem essa dor)
  }
}
`;

    if (ai) {
      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          if (response.text) {
            const data = JSON.parse(response.text);
            if (data.summaryDiscovery && data.threePaths) {
              return res.json(data);
            }
          }
        } catch (modelErr: unknown) {
          console.warn(`Tentativa com ${model} falhou, tentando alternativa:`, modelErr instanceof Error ? modelErr.message : String(modelErr));
        }
      }
    }

    // Expert Fallback Generator (Guarantees immediate, high quality, customized response)
    const textLower = description.toLowerCase();
    const isClient = textLower.includes("cliente") || textLower.includes("whatsapp") || textLower.includes("mensagem");
    const isMoney = textLower.includes("dinheiro") || textLower.includes("finan") || textLower.includes("conta");
    const isTeam = textLower.includes("equipe") || textLower.includes("sócio") || textLower.includes("chefe") || textLower.includes("funcionário");

    const fallbackResponse = {
      painScore: isClient || isMoney ? 74 : 68,
      painLevel: "ALTO",
      painLevelExplanation: "Esse atrito drena sua atenção diária e interrompe a realização do trabalho que realmente importa.",
      summaryDiscovery: isClient
        ? `Seu problema não é atender clientes, mas sim responder as mesmas dúvidas repetitivas sem um filtro ou catálogo de respostas rápidas.`
        : isMoney
        ? `O problema real não é a falta de esforço, mas a ausência de um sistema automático de separação e controle no momento em que o dinheiro entra.`
        : isTeam
        ? `O gargalo real está na falta de acordos operacionais explícitos e critérios de pronto (Definition of Done), forçando retrabalho nas suas costas.`
        : `Você está acumulando tarefas sem um filtro claro de corte. O gargalo real é a ausência de um limite operacional definido.`,
      impactMetrics: {
        monthlyHours: 28,
        weeklyOccurrences: 6,
        estimatedFinancialCost: isClient || isMoney ? "R$ 600 a R$ 1.800/mês em retrabalho" : "Impacto em sono e foco mental",
      },
      threePaths: {
        automate: {
          title: "AUTOMATIZAR & DELEGAR",
          tagline: "Deixar ferramentas inteligentes responderem e filtrarem por você.",
          description: isClient
            ? "Configure mensagens rápidas de saudação e atalhos (/duvidas) no WhatsApp Business, ou uma IA de triagem inicial."
            : "Automatize pagamentos recorrentes e notificações para não gastar tempo conferindo extrato manualmente.",
        },
        simplify: {
          title: "SIMPLIFICAR O PROCESSO",
          tagline: "Fazer o mesmo com muito menos atrito.",
          description: "Crie um roteiro único ou checklist de 3 perguntas que o cliente ou você deve preencher antes de iniciar.",
        },
        eliminate: {
          title: "ELIMINAR / DIZER NÃO",
          tagline: "Parar de fazer o que não deveria mais existir.",
          description: "Elimine reuniões de alinhamento desnecessárias e pare de responder mensagens fora do seu bloco fixo de atendimento.",
        },
      },
      immediateAction: {
        title: "Criar seu primeiro filtro de 5 minutos",
        timeToExecute: "5 minutos",
        description: "Coloque uma barreira saudável entre a sua cabeça e a fonte contínua de interrupções.",
        stepByStep: [
          "Copie a mensagem de alinhamento pronta fornecida abaixo.",
          "Defina um horário fixo no seu dia (ex: 11h e 16h) para tratar essa demanda de uma vez só.",
          "Não responda imediatamente no momento em que a notificação apitar.",
        ],
      },
      readyTemplate: {
        title: "Mensagem pronta de acolhimento e filtro",
        content: `Olá! Para te dar a melhor atenção com agilidade, reuni todas as informações e respostas frequentes aqui. Se precisar de algo específico além disso, me envie os detalhes que respondo no meu horário de retorno hoje!`,
      },
      actionPlan: {
        today: "Aplicar o filtro de 5 minutos e não responder no impulso.",
        thisWeek: "Padronizar as 3 respostas ou etapas que mais se repetem.",
        nextMonth: "Ter essa rotina 100% estabilizada para recuperar suas horas livres.",
      },
      transformation: {
        today: `Você é interrompido constantemente por "${description.slice(0, 60)}...", sentindo-se exausto ao fim do dia.`,
        withoutPain: `Esse fluxo acontece de forma previsível e organizada, liberando sua cabeça para focar em crescimento e descanso.`,
      },
    };

    return res.json(fallbackResponse);
    } catch (error: unknown) {
      console.error("Erro no /api/analyze-problem:", error);
      return res.status(500).json({ error: "Erro ao processar análise." });
  }
});

// API: Chat / Refinement on Problem
app.post("/api/chat-problem", async (req, res) => {
  try {
    const { problemDescription, userQuestion, previousAnalysis } = req.body;

    if (!userQuestion || typeof userQuestion !== "string") {
      return res.status(400).json({ error: "Pergunta é obrigatória." });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({ error: "Chave de inteligência não configurada." });
    }

    const prompt = `
Você é o assistente do "Qual a sua dor?".
O usuário já analisou seu problema e agora tem uma dúvida ou pediu um aprofundamento.

PROBLEMA ORIGINAL:
"${problemDescription}"

RESUMO DA ANÁLISE:
- Diagnóstico: "${previousAnalysis?.summaryDiscovery || ""}"
- Plano Imediato: "${previousAnalysis?.immediateAction?.title || ""}"

PERGUNTA DO USUÁRIO:
"${userQuestion}"

RESPONDA COM:
- Resposta concisa, empática, prática e direta ao ponto (máximo 3 pequenos parágrafos ou passos pontuais).
- Forneça ações concretas ou exemplos reais (se pediu mensagem, escreva o texto; se pediu ferramenta, cite as melhores gratuitas).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    return res.json({ reply: response.text });
    } catch (error: unknown) {
      console.error("Erro no chat do problema:", error);
      return res.status(500).json({ error: "Erro ao processar resposta.", details: getErrorMessage(error) });
  }
});

// API: Intelligent Vehicle Guide (Tire change, jump start, etc. tailored to make/model/year)
app.post("/api/vehicle-guide", async (req, res) => {
  try {
    const { vehicle, guideType } = req.body;
    const vehicleName = (vehicle && typeof vehicle === "string" ? vehicle.trim() : "Veículo de passeio").slice(0, 80);
    const type = guideType === "jump_start" ? "recarga de bateria com cabo auxiliar (chupeta)" : "troca de pneu furado / estepe";

    const ai = getAI();
    if (ai) {
      const prompt = `
Você é um especialista em mecânica automotiva e assistência rápida para motoristas no Brasil.
O motorista precisa de um guia passo a passo cirúrgico e seguro para: ${type}.
VEÍCULO ESPECÍFICO: "${vehicleName}".

Retorne APENAS um JSON válido com o seguinte formato:
{
  "vehicle": "${vehicleName}",
  "spareLocation": "Onde fica o estepe e ferramentas exatamente neste modelo (ex: assoalho do porta-malas, debaixo da caçamba com catraca traseira, ou se é pneu RunFlat sem estepe)",
  "jackPoints": "Ponto de apoio do macaco neste modelo (entalhe na soleira inferior a cerca de 15-20cm da caixa de roda, reforço metálico do chassi)",
  "boltCount": 4,
  "hasSpecialNut": false,
  "warnings": [
    "Aviso crítico de segurança (ex: desapertar no chão, engatar marcha, freio de mão)"
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Segurança e Sinalização",
      "instruction": "Instrução clara e objetiva",
      "safetyAlert": "Alerta se houver risco"
    },
    {
      "stepNumber": 2,
      "title": "Ferramentas e Estepe",
      "instruction": "Como retirar o estepe neste carro",
      "safetyAlert": ""
    },
    {
      "stepNumber": 3,
      "title": "Afrouxar Parafusos no Chão",
      "instruction": "Girar anti-horário meia volta com roda ainda no solo",
      "safetyAlert": "NUNCA suba o macaco antes de afrouxar!"
    },
    {
      "stepNumber": 4,
      "title": "Posicionar o Macaco e Levantar",
      "instruction": "Encaixar no entalhe da soleira e subir até desencostar 3cm do solo",
      "safetyAlert": ""
    },
    {
      "stepNumber": 5,
      "title": "Troca e Encaixe dos Parafusos à Mão",
      "instruction": "Substituir a roda furada pelo estepe e rosquear com a mão",
      "safetyAlert": ""
    },
    {
      "stepNumber": 6,
      "title": "Descer o Veículo e Aperto em Cruz",
      "instruction": "Descer totalmente e apertar firme em padrão X / Cruz",
      "safetyAlert": "Aperte em cruz para assentar a roda perfeitamente."
    }
  ],
  "postCare": "Calibragem do estepe (ex: 60 PSI se for temporário fino, velocidade máx 80 km/h) e procurar borracharia."
}
`;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Gemini falhou no vehicle-guide, usando guia inteligente pré-configurado:", geminiErr);
      }
    }

    // Fallback inteligente customizado
    const isTruckOrPickup = /hilux|strada|toro|s10|ranger|amarok|l200|oroch/i.test(vehicleName);
    const isRunFlat = /bmw|mini|mercedes/i.test(vehicleName) && !/antigo/i.test(vehicleName);

    return res.json({
      vehicle: vehicleName,
      spareLocation: isTruckOrPickup
        ? "Sob o assoalho da caçamba / chassi traseiro. Utilize a chave de roda com a haste extensora pelo orifício próximo à placa/para-choque traseiro para girar a catraca e descer o pneu até o solo."
        : isRunFlat
        ? "Atenção: A maioria dos modelos modernos dessa marca sai de fábrica com pneus Run-Flat (que rodam furados por até 80 km a 80 km/h) e NÃO possuem estepe físico nem macaco. Verifique se o pneu tem a marcação 'RSC' ou 'RunFlat' na lateral."
        : "No assoalho do porta-malas. Levante o carpete/tampa do fundo e desatarraxe o manípulo plástico giratório no centro da roda para liberar o estepe e o kit de ferramentas.",
      jackPoints: "Na soleira inferior da carroceria, a cerca de 15 a 20 cm da roda afetada. Há uma marcação triangular ou vinco reforçado na chapa onde a canaleta do macaco deve ser encaixada com firmeza.",
      boltCount: /kwid/i.test(vehicleName) ? 3 : isTruckOrPickup ? 6 : 4,
      hasSpecialNut: /renegade|compass|audi|bmw|volvo/i.test(vehicleName),
      warnings: [
        "NUNCA entre debaixo de um veículo sustentado apenas pelo macaco portátil.",
        "NUNCA afrouxe ou aperte com força os parafusos com o carro suspenso no ar.",
        "Coloque o pneu que foi retirado deitado sob a lateral do carro enquanto trabalha: serve como colchão de segurança em caso de queda do macaco.",
      ],
      steps: [
        {
          stepNumber: 1,
          title: "Sinalização e Segurança Total",
          instruction: "Estacione em superfície rígida e plana. Puxe o freio de mão ao máximo e engate 1ª marcha ou modo 'P'. Ligue o pisca-alerta e coloque o triângulo a 30 passos longos (~30 metros) atrás.",
          safetyAlert: "Se estiver no acostamento de rodovia movimentada, todos os passageiros devem aguardar fora do carro, atrás da mureta ou cerca de proteção.",
        },
        {
          stepNumber: 2,
          title: "Retirar o Estepe e a Chave de Roda",
          instruction: isTruckOrPickup
            ? "Pegue as hastes no kit de ferramentas sob o banco ou porta-malas, encaixe no mecanismo do para-choque e desenrole a corrente até o pneu descer."
            : "Abra o porta-malas, retire o assoalho e desrosqueie o fixador central do estepe. Retire a chave de roda e o macaco.",
          safetyAlert: "",
        },
        {
          stepNumber: 3,
          title: "A Regra de Ouro: Afrouxar com o Carro no Chão",
          instruction: "Com a chave de roda, gire os parafusos no sentido anti-horário (para a esquerda) dando apenas MEIA VOLTA em cada um para quebrar a pressão inicial. NÃO tire os parafusos agora.",
          safetyAlert: "O carro precisa estar no chão para que a roda não gire no ar durante o esforço!",
        },
        {
          stepNumber: 4,
          title: "Posicionar o Macaco e Erguer",
          instruction: "Localize o ponto de apoio na soleira (reforço metálico a 15-20cm da roda furada). Encaixe o macaco bem perpendicular ao chão e erga até a roda sair cerca de 3 a 5 cm do solo.",
          safetyAlert: "Certifique-se de que a base do macaco esteja apoiada em chão firme (não em lama ou areia fofa).",
        },
        {
          stepNumber: 5,
          title: "Remover a Roda e Encaixar o Estepe",
          instruction: "Termine de soltar os parafusos com a mão, remova a roda furada (coloque-a deitada sob a longarina do chassi como apoio de segurança). Encaixe o estepe e aperte os parafusos levemente com a mão.",
          safetyAlert: "",
        },
        {
          stepNumber: 6,
          title: "Descer o Veículo e Fazer o Aperto em Cruz (X)",
          instruction: "Gire a manivela do macaco até o carro tocar totalmente o chão e recolha o macaco. Faça o aperto definitivo em padrão de CRUZ / ESTRELA alternado, aplicando força firme com o peso do corpo.",
          safetyAlert: "Apertar em cruz garante que a roda fique alinhada e centrada perfeitamente no cubo.",
        },
      ],
      postCare: "Se o seu estepe for fino (temporário de emergência), respeite a velocidade máxima de 80 km/h e procure uma borracharia próxima para consertar o pneu original.",
    });
    } catch (error: unknown) {
      console.error("Erro no vehicle-guide:", error);
      return res.status(500).json({ error: "Erro ao gerar guia do veículo." });
  }
});

// Periodic cleanup of stale rate-limit entries (prevents unbounded Map growth)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of aiRateLimitMap.entries()) {
    if (now > entry.reset) {
      aiRateLimitMap.delete(ip);
    }
  }
}, 60_000);

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const viteModule = await import("vite");
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

// Export the Express app for Vercel serverless functions
export default app;

// Only start the server if this file is run directly (not imported by Vercel)
const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  startServer();
} else {
  // In Vercel, serve static files from dist at startup (build output)
  const distPath = path.join(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}
