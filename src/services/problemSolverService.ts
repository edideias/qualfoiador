/**
 * Problem Solver Service: Core action-first resolution engine for real-world modern life emergencies.
 * Strictly adheres to:
 * - LESS TEXT, MORE SOLUTION, MORE ACTION, MORE PROXIMITY, MORE CONTEXT.
 * - 5-Second Rule: Understand problem, immediate instruction, best option, main action button.
 * - 5-Layer Response Architecture:
 *   1. Solução Imediata (frase direta + passos rápidos)
 *   2. Ação Principal (botão grande para executar)
 *   3. Melhor Opção (serviço mais próximo / aberto agora)
 *   4. Alternativas (máximo 2 a 3)
 *   5. Explicação (discreta / recolhida)
 */

import { ProblemActionSolution, ProblemAssessment, ProblemPainAnalysisResult, UrgencyLevel } from '../types';
import { locationService } from './locationService';
import { opportunityEngine } from './opportunityEngine';

export const problemSolverService = {
  /**
   * Deterministic Fast Resolution catalog for common real-life emergencies.
   * Matches keywords instantly (<1ms) so the user gets action without waiting.
   */
  resolveFastTemplate(description: string): ProblemActionSolution | null {
    const text = description.toLowerCase().trim();

    // 1. PNEU FURADO
    if (text.includes('pneu') && (text.includes('fur') || text.includes('vazio') || text.includes('rasg') || text.includes('aro') || text.includes('calibr'))) {
      return {
        problemIdentified: 'Pneu Furado',
        urgency: 'URGENTE',
        urgencyLabel: 'URGENTE',
        immediateInstruction: 'Pare em local plano e seguro imediatamente. Não continue rodando se o pneu estiver vazio para não destruir a roda.',
        immediateSafetySteps: [
          '1. Pare em local seguro e plano, puxe o freio de mão.',
          '2. Ligue o pisca-alerta e coloque o triângulo a pelo menos 30 passos (30 metros).',
          '3. Não continue rodando com o pneu no aro.',
        ],
        primaryAction: {
          label: '📍 VER BORRACHARIAS PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'borracharia aberta agora',
        },
        serviceCategoryNeeded: 'Borracharia',
        bestOption: {
          title: 'Borracharia mais próxima',
          badge: 'Aberta agora • Socorro rápido',
          description: 'Conserto de furo, troca de estepe ou socorro móvel.',
          actionLabel: 'COMO CHEGAR',
          searchQuery: 'borracharia aberta agora',
          estimatedTime: '5 a 10 min de deslocamento',
        },
        alternatives: [
          {
            title: 'Chamar Guincho / Assistência do Seguro',
            description: 'Se estiver sem estepe, chave de roda ou em local perigoso.',
            actionLabel: 'Ligar para Seguradora / Guincho',
            actionType: 'maps',
            actionPayload: 'guincho auto socorro 24 horas',
          },
          {
            title: 'Trocar o Estepe Sozinho',
            description: 'Afrouxe os parafusos no chão, suba o macaco, troque e aperte em cruz.',
            actionLabel: 'Ver passo a passo rápido',
            actionType: 'guide',
            actionPayload: 'passo-a-passo-estepe',
          },
          {
            title: 'Comprar Spray Selante / Reparador',
            description: 'Vendido em postos de combustível para encher temporariamente.',
            actionLabel: 'Postos de combustível próximos',
            actionType: 'maps',
            actionPayload: 'posto de combustivel com conveniencia',
          },
        ],
        contextActions: [
          {
            label: '🚨 ESTOU EM LOCAL PERIGOSO / VIA RÁPIDA',
            variant: 'danger',
            instruction: 'Fique fora do veículo e atrás da defensa metálica ou mureta. Ligue para o socorro da rodovia ou Polícia Rodoviária (191 / 190).',
            phone: '190',
          },
          {
            label: '🚗 ESTOU EM LOCAL SEGURO',
            variant: 'safe',
            instruction: 'Excelente. Pode abrir a rota para a borracharia ou trocar o estepe com tranquilidade.',
          },
        ],
        explanationNote: 'Rodar mais de 50 metros com pneu vazio corta a borracha interna e amassa o aro, multiplicando o custo do conserto.',
        locationNeeded: true,
      };
    }

    // 2. CARRO NÃO LIGA / BATERIA
    if ((text.includes('carro') || text.includes('veiculo') || text.includes('moto')) && (text.includes('não liga') || text.includes('morreu') || text.includes('bateria') || text.includes('arranque') || text.includes('engasga'))) {
      return {
        problemIdentified: 'Carro Não Liga / Bateria Arriada',
        urgency: 'URGENTE',
        urgencyLabel: 'URGENTE',
        immediateInstruction: 'Não force a chave seguidamente para não queimar o motor de arranque. 90% das falhas repentinas decorrem de bateria descarregada.',
        immediateSafetySteps: [
          '1. Verifique se o painel acende ou pisca fraco e se ouve um estalo metálico (sinal de bateria).',
          '2. Desligue faróis, ar-condicionado e rádio para poupar qualquer carga residual.',
          '3. Peça auxílio de bateria móvel (delivery de bateria) ou autoelétrica.',
        ],
        primaryAction: {
          label: '📍 AUTOELÉTRICA / DELIVERY DE BATERIA PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'auto eletrica bateria entrega rapida',
        },
        serviceCategoryNeeded: 'Autoelétrica & Bateria',
        bestOption: {
          title: 'Delivery de Bateria Automotiva',
          badge: 'Instalação no local em 30-40 min',
          description: 'Testam sua bateria atual e instalam uma nova onde você estiver.',
          actionLabel: 'CHAMAR SOCORRO / BATERIA',
          searchQuery: 'baterias automotivas socorro 24h',
          estimatedTime: '30 a 45 min de espera',
        },
        alternatives: [
          {
            title: 'Fazer Chupeta (Cabo Auxiliar)',
            description: 'Conecte positivo com positivo (+) e negativo no terra do carro parado.',
            actionLabel: 'Buscar cabo ou ajuda próxima',
            actionType: 'guide',
            actionPayload: 'guia-chupeta-bateria',
          },
          {
            title: 'Chamar Guincho 24 Horas',
            description: 'Se o motor de arranque gira forte mas o carro não pega (problema de combustível/injeção).',
            actionLabel: 'Guinchos próximos',
            actionType: 'maps',
            actionPayload: 'guincho 24 horas',
          },
        ],
        contextActions: [
          {
            label: '🚨 BLOQUEANDO O TRÂNSITO / VIA MOVIMENTADA',
            variant: 'danger',
            instruction: 'Coloque em ponto morto e peça ajuda para empurrar até a guia. Ligue pisca-alerta.',
            phone: '190',
          },
        ],
        explanationNote: 'Baterias automotivas duram em média de 2 a 3 anos e costumam falhar sem aviso prévio em dias de variação de temperatura.',
        locationNeeded: true,
      };
    }

    // 3. PERDI MINHA CHAVE / CHAVEIRO / CHAVE QUEBROU
    if (text.includes('chave') || text.includes('fechadura') || text.includes('trancad') || text.includes('tranquei') || text.includes('cadeado')) {
      return {
        problemIdentified: 'Chave Perdida / Quebrada na Fechadura',
        urgency: 'URGENTE',
        urgencyLabel: 'URGENTE',
        immediateInstruction: 'Não tente enfiar arames, grampos ou facas: você pode travar os pinos do miolo e encarecer o conserto. Chame um chaveiro 24h.',
        immediateSafetySteps: [
          '1. Verifique se não há panela ligada no fogo, ferro elétrico ou criança/pet sozinho no imóvel.',
          '2. Se houver fogo ou risco iminente de vida, ligue imediatamente para os Bombeiros (193).',
          '3. Se a chave quebrou no miolo, não empurre o pedaço para dentro.',
        ],
        primaryAction: {
          label: '📍 CHAVEIROS 24H PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'chaveiro 24 horas atendimento em domicilio',
        },
        serviceCategoryNeeded: 'Chaveiro 24 Horas',
        bestOption: {
          title: 'Chaveiro Móvel 24 Horas',
          badge: 'Atendimento a domicílio',
          description: 'Abertura residencial, automotiva, confecção de chave e extração de miolo.',
          actionLabel: 'CHAMAR CHAVEIRO',
          searchQuery: 'chaveiro residencial e automotivo perto de mim',
          estimatedTime: '15 a 30 min para chegada',
        },
        alternatives: [
          {
            title: 'Verificar Cópia Reserva',
            description: 'Parente, cônjuge, síndico, zelador ou imobiliária guardam cópia?',
            actionLabel: 'Pensar em quem tem cópia',
            actionType: 'guide',
            actionPayload: 'checar-copia-reserva',
          },
          {
            title: 'Chaveiro Automotivo Especializado',
            description: 'Para chaves codificadas ou presença que ficaram dentro do carro.',
            actionLabel: 'Chaveiros automotivos',
            actionType: 'maps',
            actionPayload: 'chaveiro automotivo codificado',
          },
        ],
        contextActions: [
          {
            label: '🚨 RISCO IMEDIATO (FOGO OU CRIANÇA PRESA)',
            variant: 'danger',
            instruction: 'Acione o Corpo de Bombeiros imediatamente no 193. Eles têm arrombamento técnico de emergência.',
            phone: '193',
          },
        ],
        explanationNote: 'Chaveiros profissionais abrem a maioria das fechaduras comuns em menos de 3 minutos usando michas sem danificar a porta.',
        locationNeeded: true,
      };
    }

    // 4. ACABOU O GÁS
    if (text.includes('gás') || text.includes('gas') || text.includes('botijao') || text.includes('botijão')) {
      return {
        problemIdentified: 'Acabou o Gás de Cozinha',
        urgency: 'RESOLVER_LOGO',
        urgencyLabel: 'PRECISO RESOLVER LOGO',
        immediateInstruction: 'Feche o regulador (registro) do botijão agora para segurança e peça a entrega com o distribuidor mais próximo.',
        immediateSafetySteps: [
          '1. Gire a borboleta do regulador para a posição fechada.',
          '2. Não deite nem sacuda o botijão (isso puxa impurezas que entopem o fogão e causam risco de chama alta).',
          '3. Peça a troca pelo distribuidor com entrega mais rápida.',
        ],
        primaryAction: {
          label: '📍 DISTRIBUIDORAS DE GÁS PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'distribuidora de gas entrega rapida',
        },
        serviceCategoryNeeded: 'Depósito de Gás (P13)',
        bestOption: {
          title: 'Depósito de Gás mais próximo',
          badge: 'Entrega em domicílio • 20-30 min',
          description: 'Traga botijão novo e leva o vazio. Aceita Pix/Cartão na maquininha.',
          actionLabel: 'PEDIR GÁS AGORA',
          searchQuery: 'gas de cozinha entrega rapida',
          estimatedTime: '20 a 30 min de entrega',
        },
        alternatives: [
          {
            title: 'Pedir por Aplicativo de Entrega',
            description: 'iFood, Zé Delivery, Rappi ou app direto (Ultragaz, Supergasbras, Liquigás).',
            actionLabel: 'Abrir apps de delivery',
            actionType: 'app',
            actionPayload: 'apps-gas',
          },
          {
            title: 'Refeição de Emergência',
            description: 'Usar micro-ondas, air fryer ou pedir comida pronta se estiver no meio do almoço/jantar.',
            actionLabel: 'Restaurantes rápidos próximos',
            actionType: 'maps',
            actionPayload: 'restaurantes e lanchonetes entrega rapida',
          },
        ],
        explanationNote: 'Um botijão P13 padrão pesa 13kg de GLP. O peso bruto cheio é de ~28kg.',
        locationNeeded: true,
      };
    }

    // 5. CANO ESTOUROU / VAZAMENTO
    if (text.includes('cano') || text.includes('estourou') || text.includes('vazamento') || text.includes('inundando') || text.includes('alagando') || text.includes('hidráulic') || text.includes('hidraulico')) {
      return {
        problemIdentified: 'Cano Estourou / Vazamento Severo',
        urgency: 'URGENTE',
        urgencyLabel: 'URGENTE',
        immediateInstruction: 'FECHE O REGISTRO GERAL DE ÁGUA DA CASA IMEDIATAMENTE antes de qualquer outra coisa.',
        immediateSafetySteps: [
          '1. Feche o registro geral (fica perto do hidrômetro/relógio da rua, no banheiro ou na lavanderia).',
          '2. Se a água estiver próxima a tomadas ou fiação elétrica, desligue o disjuntor geral de energia.',
          '3. Abra as torneiras de baixo para esvaziar a pressão residual dos canos.',
        ],
        primaryAction: {
          label: '📍 ENCANADORES / SOS HIDRÁULICO PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'encanador 24 horas desentupidora vazamento',
        },
        serviceCategoryNeeded: 'Encanador Emergencial',
        bestOption: {
          title: 'Encanador Profissional / SOS Vazamento',
          badge: 'Atendimento emergencial',
          description: 'Reparo de cano PVC/PPR, troca de registros e contenção de infiltrações.',
          actionLabel: 'CHAMAR ENCANADOR',
          searchQuery: 'encanador residencial perto de mim',
          estimatedTime: '20 a 40 min',
        },
        alternatives: [
          {
            title: 'Reparo Temporário de Emergência',
            description: 'Com o registro fechado, envolva o furo com tira de borracha (câmara de ar) e aperte com abraçadeira ou arame.',
            actionLabel: 'Materiais de construção próximos',
            actionType: 'maps',
            actionPayload: 'loja de materiais de construcao aberta agora',
          },
          {
            title: 'Seguro Residencial / Cartão de Crédito',
            description: 'Muitos cartões e apólices incluem encanador gratuito 24h sem custo de visita.',
            actionLabel: 'Verificar assistência residencial',
            actionType: 'guide',
            actionPayload: 'assistencia-residencial-seguro',
          },
        ],
        contextActions: [
          {
            label: '⚡ ÁGUA ENTRANDO EM CONTATO COM ELETRICIDADE',
            variant: 'danger',
            instruction: 'Desligue a chave geral no quadro de força AGORA. Risco grave de choque fatal.',
          },
        ],
        explanationNote: 'Fechar o registro corta 100% da pressão em menos de 10 segundos e evita danos ao piso e móveis.',
        locationNeeded: true,
      };
    }

    // 6. ELETRICISTA / CURTO-CIRCUITO / SEM LUZ
    if (text.includes('eletricista') || text.includes('curto') || text.includes('disjuntor') || text.includes('fiação') || text.includes('cheiro de queimado') || text.includes('tomada')) {
      return {
        problemIdentified: 'Problema Elétrico / Curto-Circuito',
        urgency: 'RESOLVER_LOGO',
        urgencyLabel: 'PRECISO RESOLVER LOGO',
        immediateInstruction: 'Desligue o disjuntor do circuito com defeito no quadro de força. Se houver faíscas ou fumaça, desligue a chave geral.',
        immediateSafetySteps: [
          '1. Não toque em fios desencapados nem mexa em aparelhos molhados.',
          '2. Se houver cheiro de queimado, desligue o disjuntor principal imediatamente.',
          '3. Em caso de fogo elétrico, NUNCA jogue água (use extintor de pó químico ou abafe).',
        ],
        primaryAction: {
          label: '📍 ELETRICISTAS PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'eletricista residencial 24 horas',
        },
        serviceCategoryNeeded: 'Eletricista Residencial',
        bestOption: {
          title: 'Eletricista Credenciado mais próximo',
          badge: 'Atendimento rápido • Diagnóstico de carga',
          description: 'Troca de disjuntores, chuveiros, fiação e reparo de curto-circuito.',
          actionLabel: 'COMO CHEGAR / CONTATAR',
          searchQuery: 'eletricista instalador perto de mim',
          estimatedTime: '20 a 45 min',
        },
        alternatives: [
          {
            title: 'Verificar se a Falta de Luz é no Bairro Todo',
            description: 'Olhe se os vizinhos ou postes da rua têm luz. Se o bairro estiver sem luz, o problema é na rede da concessionária.',
            actionLabel: 'Telefones de concessionárias (Enel, Light, Cemig, Copel)',
            actionType: 'guide',
            actionPayload: 'concessionarias-energia',
          },
          {
            title: 'Comprar Disjuntor / Fios / Lâmpada',
            description: 'Lojas de materiais elétricos abertas no seu raio de proximidade.',
            actionLabel: 'Materiais elétricos próximos',
            actionType: 'maps',
            actionPayload: 'materiais eletricos perto de mim',
          },
        ],
        contextActions: [
          {
            label: '🚨 FOGO ATIVO OU FAÍSCAS CONTÍNUAS',
            variant: 'danger',
            instruction: 'Desligue o relógio geral e saia do ambiente. Acione o 193 (Bombeiros).',
            phone: '193',
          },
        ],
        explanationNote: 'Disjuntores desarmam para salvar a sua casa de incêndios: se ele desarmou de novo ao religar, há sobrecarga ou curto real na linha.',
        locationNeeded: true,
      };
    }

    // 7. ESTOU COM FOME
    if (text.includes('fome') || text.includes('almoço') || text.includes('jantar') || text.includes('lanche') || text.includes('comer') || text.includes('comida')) {
      return {
        problemIdentified: 'Fome / Preciso Comer Agora',
        urgency: 'RESOLVER_LOGO',
        urgencyLabel: 'PRECISO RESOLVER LOGO',
        immediateInstruction: 'Veja as opções mais rápidas abertas a menos de 500 metros ou peça entrega imediata com menor tempo de espera.',
        immediateSafetySteps: [
          '1. Para comer em até 10 minutos: vá a pé até padarias, lanchonetes ou mercados próximos.',
          '2. Para receber onde está: filtre restaurantes no app de delivery por menor tempo de entrega (menos de 30 min).',
        ],
        primaryAction: {
          label: '📍 RESTAURANTES E LANCHONETES ABERTOS AGORA',
          actionType: 'open_maps',
          searchQuery: 'restaurantes lanchonetes abertos agora',
        },
        serviceCategoryNeeded: 'Alimentação Rápida',
        bestOption: {
          title: 'Padaria ou Lanchonete mais próxima',
          badge: 'Aberta agora • Pronta entrega',
          description: 'Lanches rápidos, prato feito, salgados e refeições imediatas.',
          actionLabel: 'VER NO MAPA',
          searchQuery: 'padaria lanchonete refeicao rapida perto de mim',
          estimatedTime: 'A pé em 5 a 10 min',
        },
        alternatives: [
          {
            title: 'Supermercado ou Mercado de Bairro',
            description: 'Frutas, pães, marmitas prontas e snacks rápidos sem fila de restaurante.',
            actionLabel: 'Mercados próximos',
            actionType: 'maps',
            actionPayload: 'supermercado mercado aberto agora',
          },
          {
            title: 'Delivery Express (iFood / Rappi / Zé Delivery)',
            description: 'Peça pratos rápidos com filtros de entrega ultrarrápida.',
            actionLabel: 'Abrir Delivery',
            actionType: 'app',
            actionPayload: 'abrir-delivery',
          },
        ],
        explanationNote: 'Evite pedir pratos assados ou elaborados quando a urgência for alta; prefira pratos montados e lanches de balcão.',
        locationNeeded: true,
      };
    }

    // 8. PRECISO IMPRIMIR UM DOCUMENTO
    if (text.includes('imprimir') || text.includes('impressão') || text.includes('impressao') || text.includes('xerox') || text.includes('copiadora') || text.includes('gráfica') || text.includes('grafica') || text.includes('papelaria')) {
      return {
        problemIdentified: 'Impressão de Documento Urgente',
        urgency: 'RESOLVER_LOGO',
        urgencyLabel: 'PRECISO RESOLVER LOGO',
        immediateInstruction: 'Localize a gráfica rápida ou papelaria mais próxima e salve seu documento em PDF no WhatsApp para envio rápido.',
        immediateSafetySteps: [
          '1. Salve o arquivo em PDF no celular (evita desconfiguração de fontes).',
          '2. Veja a papelaria/gráfica mais próxima e confirme que está aberta agora.',
          '3. Pergunte no balcão o e-mail ou WhatsApp para enviar o PDF direto da fila.',
        ],
        primaryAction: {
          label: '📍 PAPELARIAS E GRÁFICAS PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'grafica rapida papelaria impressao xerox aberta agora',
        },
        serviceCategoryNeeded: 'Papelaria / Gráfica Rápida',
        bestOption: {
          title: 'Gráfica Rápida / Papelaria mais próxima',
          badge: 'Impressão na hora via WhatsApp/Pen Drive',
          description: 'Impressão PB, colorida, digitalização e cópias de documentos.',
          actionLabel: 'COMO CHEGAR',
          searchQuery: 'papelaria grafica impressao de documentos',
          estimatedTime: '5 a 10 min de deslocamento',
        },
        alternatives: [
          {
            title: 'Cartórios, Lan Houses e Correios',
            description: 'Muitos cartórios e agências de correios oferecem serviço de impressão e cópia no local.',
            actionLabel: 'Ver cartórios e correios próximos',
            actionType: 'maps',
            actionPayload: 'cartorio correios lan house xerox',
          },
          {
            title: 'Portarias e Coworkings Próximos',
            description: 'Recepções de prédios comerciais ou coworkings costumam imprimir 1 ou 2 folhas avulsas por gentileza ou pequena taxa.',
            actionLabel: 'Coworkings próximos',
            actionType: 'maps',
            actionPayload: 'coworking espaco de trabalho',
          },
        ],
        explanationNote: 'Sempre exporte como PDF antes de enviar para gráficas para garantir que margens e assinaturas fiquem idênticas ao original.',
        locationNeeded: true,
      };
    }

    // 9. FARMÁCIA / REMÉDIO URGENTE
    if (text.includes('farmácia') || text.includes('farmacia') || text.includes('remédio') || text.includes('remedio') || text.includes('drogaria') || text.includes('medicamento')) {
      return {
        problemIdentified: 'Farmácia / Medicamento Urgente',
        urgency: 'RESOLVER_LOGO',
        urgencyLabel: 'PRECISO RESOLVER LOGO',
        immediateInstruction: 'Localize a farmácia ou drogaria mais próxima aberta agora. Se precisar de delivery rápido, ligue diretamente antes de se deslocar.',
        immediateSafetySteps: [
          '1. Leve documento com foto e receita médica caso o medicamento seja controlado.',
          '2. Confira o horário de fechamento antes de ir a pé à noite.',
        ],
        primaryAction: {
          label: '📍 FARMÁCIAS ABERTAS AGORA PERTO DE MIM',
          actionType: 'open_maps',
          searchQuery: 'farmacia drogaria aberta agora 24 horas',
        },
        serviceCategoryNeeded: 'Drogaria 24 Horas',
        bestOption: {
          title: 'Farmácia mais próxima',
          badge: 'Aberta agora • Medicamentos e primeiros socorros',
          description: 'Remédios de uso contínuo, analgésicos, curativos e aferição de pressão.',
          actionLabel: 'COMO CHEGAR',
          searchQuery: 'farmacia aberta agora',
          estimatedTime: '3 a 7 min',
        },
        alternatives: [
          {
            title: 'Farmácia 24 Horas (Plantão Noturno)',
            description: 'Para atendimentos na madrugada ou receitas controladas fora de horário comercial.',
            actionLabel: 'Farmácias 24 horas',
            actionType: 'maps',
            actionPayload: 'farmacia 24 horas plantao',
          },
          {
            title: 'Delivery de Medicamentos por App (Rappi / Drogasil / Pague Menos)',
            description: 'Entrega na porta em 30 a 50 minutos.',
            actionLabel: 'Apps de farmácia',
            actionType: 'app',
            actionPayload: 'apps-farmacia',
          },
        ],
        explanationNote: 'Medicamentos tarja preta e antibióticos exigem retenção da receita física original.',
        locationNeeded: true,
      };
    }

    // 10. UBER / TRANSPORTE / CARONA / VOLTAR PRA CASA / TÁXI
    if (
      text.includes('uber') ||
      text.includes('99') ||
      text.includes('taxi') ||
      text.includes('táxi') ||
      text.includes('carona') ||
      text.includes('corrida') ||
      text.includes('voltar pra casa') ||
      text.includes('ir pra casa') ||
      text.includes('ir embora') ||
      text.includes('transporte') ||
      text.includes('indrive')
    ) {
      return {
        problemIdentified: 'Transporte Rápido / Corrida Econômica',
        urgency: 'RESOLVER_LOGO',
        urgencyLabel: 'PRECISO RESOLVER LOGO',
        immediateInstruction:
          'Compare UberX vs 99Pop vs inDrive agora. Fora de saídas congestionadas, o 99 e inDrive costumam sair 20% a 40% mais baratos que o Uber com tarifa dinâmica.',
        immediateSafetySteps: [
          '1. Não peça o carro bem na saída de eventos, shoppings ou esquinas lotadas (a tarifa dinâmica triplica ali).',
          '2. Ande 100 a 150 metros até uma rua paralela ou esquina iluminada para zerar o multiplicador dinâmico.',
          '3. Abra o 99 e o inDrive: no inDrive você propõe o valor que aceita pagar e motoristas aceitam na hora.',
        ],
        primaryAction: {
          label: '🚗 COMPARAR APPS DE CORRIDA AGORA',
          actionType: 'app',
          actionPayload: 'comparar-uber-99',
          searchQuery: 'ponto de taxi credenciado perto de mim',
        },
        serviceCategoryNeeded: 'Transporte de Passageiros & Aplicativo',
        bestOption: {
          title: '99Pop / UberX / inDrive (Comparação Direta)',
          badge: 'Menor preço • Chegada em 3-6 min',
          description: 'Abra os aplicativos lado a lado. Em horários de pico ou chuva, o inDrive permite ofertar o preço.',
          actionLabel: 'ABRIR APPS DE TRANSPORTE',
          searchQuery: 'ponto de taxi credenciado perto de mim',
          estimatedTime: '3 a 6 min de espera',
        },
        alternatives: [
          {
            title: '99 (Pop / Negocia)',
            description: 'Geralmente 15% a 30% mais barato que o Uber em horários de pico, com cupons automáticos.',
            actionLabel: 'Abrir 99 no celular',
            actionType: 'app',
            actionPayload: 'https://99app.com',
          },
          {
            title: 'inDrive (Você Propõe o Preço)',
            description: 'Coloque o valor justo que você quer pagar e motoristas próximos aceitam ou contrapropoem.',
            actionLabel: 'Abrir inDrive',
            actionType: 'app',
            actionPayload: 'https://indrive.com',
          },
          {
            title: 'Dica Prática: Fuga da Tarifa Dinâmica',
            description: 'Técnica simples para economizar até R$ 20 mudando apenas 1 quarteirão seu ponto de embarque.',
            actionLabel: 'Ver técnica anti-dinâmica',
            actionType: 'guide',
            actionPayload: 'fuga-tarifa-dinamica',
          },
          {
            title: 'Ponto de Táxi Credenciado (Preço Fixo de Taxímetro)',
            description: 'Com dinâmica do Uber acima de 2.0x, o táxi comum no taxímetro fica mais barato e anda em faixa exclusiva.',
            actionLabel: 'Ver pontos de táxi próximos',
            actionType: 'maps',
            actionPayload: 'ponto de taxi credenciado',
          },
        ],
        contextActions: [
          {
            label: '🚨 ME SINTO INSEGURO(A) NA RUA / ÁREA ESCURA',
            variant: 'danger',
            instruction:
              'Entre imediatamente em um estabelecimento iluminado (posto de combustível, farmácia, padaria ou restaurante) e solicite o embarque para lá.',
          },
        ],
        explanationNote:
          'Os algoritmos de apps de corrida cobram até o dobro por geofence (cerca virtual de alta demanda). Afastar-se 150 metros zera o multiplicador dinâmico.',
        locationNeeded: true,
      };
    }

    // Não casou com nenhum template determinístico fixo -> usará IA ou resolvedor contextual dinâmico
    return null;
  },

  /**
   * Universal Contextual Solver: Analyzes ANY problem description
   * and maps it to the 5-layer response architecture.
   */
  buildGenericSolution(description: string): ProblemActionSolution {
    const text = description.trim();
    const textLower = text.toLowerCase();

    // Determine Urgency
    let urgency: UrgencyLevel = 'PODE_ESPERAR';
    let urgencyLabel = 'PODE ESPERAR';

    const isUrgent =
      textLower.includes('urgente') ||
      textLower.includes('socorro') ||
      textLower.includes('perigo') ||
      textLower.includes('fogo') ||
      textLower.includes('quebrou') ||
      textLower.includes('parou') ||
      textLower.includes('preso') ||
      textLower.includes('acidente') ||
      textLower.includes('dor forte') ||
      textLower.includes('sangr');

    const isMedium =
      textLower.includes('preciso') ||
      textLower.includes('hoje') ||
      textLower.includes('rápido') ||
      textLower.includes('rapido') ||
      textLower.includes('estragou') ||
      textLower.includes('bloqueado') ||
      textLower.includes('sem sinal');

    if (isUrgent) {
      urgency = 'URGENTE';
      urgencyLabel = 'URGENTE';
    } else if (isMedium || text.length < 30) {
      urgency = 'RESOLVER_LOGO';
      urgencyLabel = 'PRECISO RESOLVER LOGO';
    }

    // Primary action and search query detection
    const query = `${text.slice(0, 40)} perto de mim`;

    return {
      problemIdentified: text.length > 50 ? `${text.slice(0, 47)}...` : text,
      urgency,
      urgencyLabel,
      immediateInstruction: `Identificamos a sua situação. A forma mais rápida de sair desse travamento é focar na ação direta agora.`,
      immediateSafetySteps: [
        '1. Isole a causa imediata do incômodo e não tome decisões precipitadas.',
        '2. Execute o primeiro passo de contenção agora.',
        '3. Acione o suporte ou serviço mais próximo caso não resolva em 10 minutos.',
      ],
      primaryAction: {
        label: `📍 ENCONTRAR SERVIÇO OU LOCAL PRÓXIMO`,
        actionType: 'open_maps',
        searchQuery: query,
      },
      serviceCategoryNeeded: 'Serviço Especializado',
      bestOption: {
        title: 'Opção mais recomendada',
        badge: 'Mais rápida e direta',
        description: `Conexão direta com estabelecimentos ou profissionais que resolvem "${text.slice(0, 35)}".`,
        actionLabel: 'VER NO MAPA',
        searchQuery: query,
        estimatedTime: 'Verificação em tempo real',
      },
      alternatives: [
        {
          title: 'Solução Imediata Sozinho',
          description: 'Corte a dependência externa e faça a versão simplificada do processo.',
          actionLabel: 'Ação rápida',
          actionType: 'guide',
          actionPayload: 'acao-individual',
        },
        {
          title: 'Buscar Ajuda Profissional Próxima',
          description: 'Encontre profissionais e serviços abertos no seu bairro agora.',
          actionLabel: 'Locais recomendados',
          actionType: 'maps',
          actionPayload: query,
        },
      ],
      explanationNote: 'Ao priorizar a ação em vez de acumular informações teóricas, você economiza tempo e energia mental.',
      locationNeeded: true,
    };
  },

  /**
   * Main entry point: Resolves problem with the fastest path:
   * 1. Fast catalog (0ms)
   * 2. Server AI API (/api/solve-problem)
   * 3. Robust contextual fallback
   */
  async solve(assessment: ProblemAssessment): Promise<ProblemPainAnalysisResult> {
    const rawDescription = assessment.initialDescription.trim();

    // 1. Try Fast Catalog
    const fastSolution = this.resolveFastTemplate(rawDescription);
    let finalSolution = fastSolution;

    // 2. If not in catalog, call backend AI
    if (!finalSolution) {
      try {
        const res = await fetch('/api/solve-problem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: rawDescription,
            location: locationService.getStoredLocation(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.actionSolution) {
            finalSolution = data.actionSolution;
          }
        }
      } catch (e) {
        console.warn('API solve-problem falhou, usando fallback inteligente:', e);
      }
    }

    // 3. Fallback to contextual generator if needed
    if (!finalSolution) {
      finalSolution = this.buildGenericSolution(rawDescription);
    }

    // Connect to Opportunity Engine: Record pain report and qualify opportunity
    try {
      opportunityEngine.recordPainReported(rawDescription, locationService.getStoredLocation());
    } catch (err) {
      console.warn('Erro ao registrar no motor de oportunidades:', err);
    }

    // Build the complete compatible ProblemPainAnalysisResult
    const painScore = finalSolution.urgency === 'URGENTE' ? 88 : finalSolution.urgency === 'RESOLVER_LOGO' ? 68 : 42;
    const painLevel = finalSolution.urgency === 'URGENTE' ? 'CRÍTICO' : finalSolution.urgency === 'RESOLVER_LOGO' ? 'ALTO' : 'MODERADO';

    return {
      painScore,
      painLevel,
      painLevelExplanation: `Classificado como ${finalSolution.urgencyLabel}: prioridade absoluta em ação imediata.`,
      summaryDiscovery: finalSolution.immediateInstruction,
      impactMetrics: {
        monthlyHours: finalSolution.urgency === 'URGENTE' ? 12 : 24,
        weeklyOccurrences: 4,
      },
      threePaths: {
        automate: {
          title: 'RESOLVER AGORA',
          tagline: finalSolution.primaryAction.label,
          description: finalSolution.immediateInstruction,
        },
        simplify: {
          title: 'MELHOR OPÇÃO LOCAL',
          tagline: finalSolution.bestOption?.title || 'Serviço mais próximo',
          description: finalSolution.bestOption?.description || '',
        },
        eliminate: {
          title: 'ALTERNATIVAS',
          tagline: 'Outros caminhos viáveis',
          description: finalSolution.alternatives.map((a) => a.title).join(' • '),
        },
      },
      transformation: {
        today: `Travado agora pelo problema: "${rawDescription.slice(0, 50)}..."`,
        withoutPain: `Situação resolvida com rapidez e segurança, liberando seu dia.`,
      },
      immediateAction: {
        title: finalSolution.primaryAction.label,
        timeToExecute: 'Imediato',
        description: finalSolution.immediateInstruction,
        stepByStep: finalSolution.immediateSafetySteps || [
          'Execute a ação principal.',
          'Consulte as opções de rota e estabelecimentos abertos.',
          'Resolva a pendência e retome sua rotina.',
        ],
      },
      actionSolution: finalSolution,
    };
  },
};
