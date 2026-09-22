import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Wrench, Car, Compass, ChevronRight, Sparkles, MapPin, Phone, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLocation, locationService } from '../../services/locationService';

interface SmartGuideModalProps {
  guidePayload: string;
  guideTitle: string;
  userLocation: UserLocation;
  onClose: () => void;
  onOpenMapsAlternative?: (query: string) => void;
}

interface VehicleGuideData {
  vehicle: string;
  spareLocation: string;
  jackPoints: string;
  boltCount: number;
  hasSpecialNut?: boolean;
  warnings: string[];
  steps: {
    stepNumber: number;
    title: string;
    instruction: string;
    safetyAlert?: string;
  }[];
  postCare: string;
}

const POPULAR_VEHICLES = [
  { label: 'VW Gol / Polo / T-Cross', name: 'Volkswagen Polo / Gol' },
  { label: 'Chevrolet Onix / Tracker', name: 'Chevrolet Onix' },
  { label: 'Fiat Argo / Cronos / Mobi', name: 'Fiat Argo' },
  { label: 'Fiat Strada / Toro (Picape)', name: 'Fiat Strada / Toro' },
  { label: 'Hyundai HB20 / Creta', name: 'Hyundai HB20' },
  { label: 'Toyota Corolla / Yaris', name: 'Toyota Corolla' },
  { label: 'Toyota Hilux (Picape)', name: 'Toyota Hilux' },
  { label: 'Jeep Renegade / Compass', name: 'Jeep Renegade' },
  { label: 'Renault Kwid (3 parafusos)', name: 'Renault Kwid' },
  { label: 'Honda Civic / HR-V / Fit', name: 'Honda HR-V / Civic' },
];

export const SmartGuideModal: React.FC<SmartGuideModalProps> = ({
  guidePayload,
  guideTitle,
  userLocation,
  onClose,
  onOpenMapsAlternative,
}) => {
  const isTireGuide = guidePayload === 'passo-a-passo-estepe' || guidePayload.includes('estepe') || guidePayload.includes('pneu');
  const isJumpStartGuide = guidePayload === 'guia-chupeta-bateria' || guidePayload.includes('bateria');
  const isTransportationGuide = guidePayload === 'fuga-tarifa-dinamica' || guidePayload.includes('uber') || guidePayload.includes('transporte');
  const isEnergyGuide = guidePayload === 'concessionarias-energia';
  const isInsuranceGuide = guidePayload.includes('seguro') || guidePayload.includes('reserva');

  const [selectedVehicle, setSelectedVehicle] = useState('Volkswagen Polo / Gol');
  const [customVehicleInput, setCustomVehicleInput] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [guideData, setGuideData] = useState<VehicleGuideData | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'interactive' | 'diagram'>('interactive');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Fetch or generate vehicle guide
  const loadVehicleGuide = async (vehicleName: string, year?: string) => {
    setIsLoadingGuide(true);
    const fullName = `${vehicleName} ${year ? year : ''}`.trim();

    try {
      const res = await fetch('/api/vehicle-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: fullName,
          guideType: isJumpStartGuide ? 'jump_start' : 'tire_change',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGuideData(data);
        setIsLoadingGuide(false);
        return;
      }
    } catch (e) {
      console.warn('Erro ao consultar backend do guia, usando base local:', e);
    }

    // Fallback local caso a rede falhe
    const isPickup = /strada|toro|hilux|s10|ranger|amarok/i.test(fullName);
    const isKwid = /kwid/i.test(fullName);
    const isRunFlat = /bmw|mini/i.test(fullName);

    setGuideData({
      vehicle: fullName || 'Veículo de Passeio Padrão',
      spareLocation: isPickup
        ? 'Sob a caçamba, debaixo do assoalho traseiro. Utilize a chave de roda com a haste metálica extensora no orifício acima do para-choque traseiro para descer a catraca do estepe.'
        : isRunFlat
        ? 'Atenção: A maioria das BMWs e Minis modernos usam pneus Run-Flat (rodam até 80 km a 80 km/h sem ar) e NÃO possuem estepe nem macaco. Se o pneu não tiver estourado a lateral, você pode dirigir até a borracharia mais próxima.'
        : 'No fundo do porta-malas, sob o carpete de assoalho. Desenrosque a porca borboleta plástica central para liberar o estepe e o kit com macaco e chave de roda.',
      jackPoints: 'Na soleira inferior da carroceria, a cerca de 15 a 20 cm da roda afetada. Encaixe a canaleta do macaco diretamente no rebaixo metálico reforçado (nunca no assoalho fino).',
      boltCount: isKwid ? 3 : isPickup ? 6 : 4,
      hasSpecialNut: /renegade|compass|audi|bmw/i.test(fullName),
      warnings: [
        'NUNCA suba o macaco antes de afrouxar os parafusos com a roda no chão.',
        'Engate 1ª marcha ou modo P e puxe o freio de mão com firmeza.',
        'Coloque o estepe ou a roda retirada deitada sob a longarina lateral do carro como colchão de segurança.',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Sinalização e Segurança no Local',
          instruction: 'Pare em local plano e firme. Puxe o freio de mão, engate a 1ª marcha (ou P se automático), ligue o pisca-alerta e posicione o triângulo a cerca de 30 passos (~30 metros) atrás.',
          safetyAlert: 'Em via rápida ou rodovia, mantenha todos os passageiros fora do carro e atrás da defensa/mureta.',
        },
        {
          stepNumber: 2,
          title: 'Retirar o Estepe e Ferramentas',
          instruction: isPickup
            ? 'Pegue o kit de ferramentas (chave de roda e hastes extensoras). Encaixe no orifício da caçamba e gire para descer o estepe até o chão.'
            : 'Abra o porta-malas, levante o assoalho e solte a trava giratória central. Retire o estepe, a chave de roda e o macaco.',
          safetyAlert: '',
        },
        {
          stepNumber: 3,
          title: 'Afrouxar os Parafusos com o Carro no Chão',
          instruction: 'Encaixe a chave de roda nos parafusos. Gire no sentido ANTI-HORÁRIO (para a esquerda) dando apenas MEIA VOLTA para soltar a pressão inicial. NÃO desrosqueie totalmente agora.',
          safetyAlert: 'Atenção Crítica: O carro precisa estar com a roda apoiada no chão. Se erguer antes, a roda vai girar solta e o carro pode cair do macaco.',
        },
        {
          stepNumber: 4,
          title: 'Posicionar o Macaco e Erguer o Veículo',
          instruction: 'Localize o entalhe reforçado na soleira a cerca de 15 a 20 cm da roda furada. Posicione o macaco bem reto e comece a subir a manivela até que a roda desencoste cerca de 3 a 5 cm do solo.',
          safetyAlert: 'Nunca coloque o macaco no assoalho plano ou na lataria plástica.',
        },
        {
          stepNumber: 5,
          title: 'Remover a Roda Furada e Encaixar o Estepe',
          instruction: 'Remova os parafusos frouxos com a mão e puxe a roda furada (deite-a sob o carro como apoio de emergência). Coloque o estepe no cubo, aponte os furos e aperte os parafusos com a mão o quanto conseguir.',
          safetyAlert: '',
        },
        {
          stepNumber: 6,
          title: 'Descer o Carro e Fazer o Aperto em Cruz (X)',
          instruction: 'Gire o macaco no sentido inverso até o carro tocar firmemente o solo e retire o macaco. Faça o aperto definitivo dos parafusos com a chave de roda no padrão EM CRUZ / ESTRELA alternado.',
          safetyAlert: 'Aperto em cruz: Aperte um parafuso e em seguida o oposto diametralmente para assentar a roda perfeitamente sem vibrar.',
        },
      ],
      postCare: 'Se o estepe for temporário (rodinha fina), não ultrapasse 80 km/h. Dirija com calma até a borracharia mais próxima para calibrar e reparar o pneu principal.',
    });
    setIsLoadingGuide(false);
  };

  useEffect(() => {
    if (isTireGuide) {
      loadVehicleGuide(selectedVehicle);
    } else if (isTransportationGuide) {
      setGuideData({
        vehicle: 'Apps de Transporte & Corrida (Uber / 99 / inDrive / Táxi)',
        spareLocation: 'Economia real de 20% a 40% na tarifa de retorno para casa.',
        jackPoints: 'Estratégia de embarque inteligente fora do raio de aglomeração.',
        boltCount: 4,
        warnings: [
          'Nunca peça o carro exatamente na saída de estádios, shoppings ou eventos: ali o algoritmo aplica tarifa dinâmica máxima (1.8x a 2.8x).',
          'Sempre confirme a placa e o modelo do veículo antes de entrar.',
          'Compartilhe a rota em tempo real no WhatsApp com alguém de confiança.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Afaste-se 150 metros da aglomeração (Zerar Tarifa Dinâmica)',
            instruction:
              'Caminhe 1 a 2 quarteirões até uma esquina iluminada ou rua paralela. Os aplicativos usam geofencing (cercas virtuais): dar 150 passos para fora da cerca costuma derrubar o preço de R$ 38 para R$ 22 na hora.',
            safetyAlert: 'Faça isso apenas em vias movimentadas e iluminadas. Se a rua for deserta, fique na portaria do local.',
          },
          {
            stepNumber: 2,
            title: 'Abra os 3 Apps Lado a Lado (Uber, 99 e inDrive)',
            instruction:
              'Compare os preços simultaneamente. O 99 frequentemente aplica cupons automáticos na hora do pedido. No inDrive, você propõe o valor que aceita pagar e motoristas ao redor decidem aceitar.',
          },
          {
            stepNumber: 3,
            title: 'Aguarde 3 a 4 minutos para a primeira onda de carros limpar',
            instruction:
              'Quando muitas pessoas saem ao mesmo tempo, os servidores entram em pico. Aguardar 3 a 5 minutos faz a demanda normalizar e os valores caem abruptamente.',
          },
          {
            stepNumber: 4,
            title: 'Avalie o Táxi Comum em dias de chuva ou pico extremo',
            instruction:
              'Se o Uber estiver acima de 2.0x, o táxi comum (bandeira 1 ou 2 pelo taxímetro) sai MAIS BARATO que o app e tem autorização para rodar nas faixas exclusivas de ônibus, chegando bem mais rápido.',
          },
        ],
        postCare:
          'Se estiver tarde da noite e você estiver sozinho(a), aguarde dentro de uma farmácia 24h, posto ou padaria até o motorista estar a 1 minuto do local.',
      });
    } else if (isEnergyGuide) {
      setGuideData({
        vehicle: 'Rede Elétrica & Concessionárias de Energia',
        spareLocation: 'Canais oficiais de plantão 24h para falta de energia na rua/bairro.',
        jackPoints: 'Verificação do quadro de distribuição e disjuntores da residência.',
        boltCount: 4,
        warnings: [
          'Se houver faísca, fumaça ou fogo no relógio ou disjuntor, desligue a chave geral com calçado emborrachado e acione os Bombeiros (193).',
          'Nunca tente religar cabos rompidos ou caídos na rua.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Checagem de Vizinhança (Rede Externa vs Disjuntor Interno)',
            instruction:
              'Olhe a janela ou rua: se os postes ou vizinhos também estão no escuro, a ocorrência é na rede pública da concessionária. Se apenas a sua casa apagou, o problema é no seu disjuntor interno.',
          },
          {
            stepNumber: 2,
            title: 'Telefones e WhatsApps Diretos de Emergência',
            instruction:
              '• Enel (SP/RJ/CE): 0800 72 72 120 ou WhatsApp (11) 94053-9494\n• CPFL (Paulista/Piratininga): 0800 010 10 10 ou SMS para 27304 com "LUZ"\n• Cemig (MG): Ligue 116 ou WhatsApp (31) 3506-1160\n• Light (RJ): 0800 021 0196\n• Copel (PR): 0800 51 00 116',
          },
          {
            stepNumber: 3,
            title: 'Proteja Aparelhos Eletrônicos Sensíveis',
            instruction:
              'Tire da tomada computadores, televisores e geladeiras. Quando a luz volta, costuma ocorrer um pico de tensão transitório que pode queimar fontes e placas.',
          },
        ],
        postCare: 'Mantenha a geladeira fechada para preservar os alimentos por até 6 horas sem perda térmica.',
      });
    } else if (isInsuranceGuide) {
      setGuideData({
        vehicle: 'Assistência Emergencial do Seguro (Carro / Casa / Cartão)',
        spareLocation: 'Direito a chaveiro, encanador, eletricista e guincho inclusos.',
        jackPoints: 'Economize R$ 150 a R$ 300 acionando a assistência 24h da sua apólice.',
        boltCount: 4,
        warnings: [
          'Muitos consumidores pagam chaveiros particulares caros sem saber que já têm o serviço 100% coberto pelo cartão ou apólice.',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Verifique o Seguro do Cartão de Crédito',
            instruction:
              'Cartões Visa / Mastercard Gold, Platinum e Black oferecem serviços de emergência residencial ou veicular gratuitos. Ligue no telefone atrás do seu cartão.',
          },
          {
            stepNumber: 2,
            title: 'App da Seguradora (Porto, Bradesco, SulAmérica, Allianz)',
            instruction:
              'Abra o app da sua seguradora e clique em "Solicitar Assistência 24h". Em capitais, a moto com chaveiro ou técnico costuma chegar em 30 a 45 minutos.',
          },
        ],
        postCare: 'Guarde sempre o número da apólice no bloco de notas do celular para consultas offline.',
      });
    } else {
      loadVehicleGuide(selectedVehicle);
    }
  }, [isTireGuide, isTransportationGuide, isEnergyGuide, isInsuranceGuide]);

  const handleApplyCustomVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVehicleInput.trim()) return;
    setSelectedVehicle(customVehicleInput.trim());
    loadVehicleGuide(customVehicleInput.trim(), vehicleYear);
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  return (
    <div
      id="smart-guide-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="smart-guide-modal-container"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER DO GUIA */}
        <header className="px-5 py-4 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>{isTireGuide ? 'Guia Inteligente: Trocar Estepe' : guideTitle}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Modo Seguro
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Instruções passo a passo adaptadas para realizar o procedimento sozinho com segurança.
              </p>
            </div>
          </div>

          <button
            id="btn-close-guide-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Fechar guia"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* CORPO SCROLLÁVEL */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-neutral-900">
          {/* SELETOR DE VEÍCULO INTELIGENTE (CASO SEJA GUIA DE PNEU/VEICULAR) */}
          {isTireGuide && (
            <section className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-950">
                  <Car className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Identificação do seu Veículo
                  </span>
                </div>
                <span className="text-[11px] text-amber-800 font-medium">
                  {guideData ? guideData.vehicle : 'Carregando...'}
                </span>
              </div>

              <p className="text-xs text-amber-900">
                Cada veículo tem um ponto específico para apoiar o macaco e posição do estepe. Escolha o seu modelo abaixo ou digite:
              </p>

              {/* Botões rápidos com veículos comuns */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_VEHICLES.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => {
                      setSelectedVehicle(v.name);
                      loadVehicleGuide(v.name);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedVehicle === v.name
                        ? 'bg-amber-400 text-neutral-950 border-amber-500 shadow-2xs font-bold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Input livre para qualquer outro veículo */}
              <form onSubmit={handleApplyCustomVehicle} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Outro modelo (ex: Jeep Renegade, Hilux, Kwid, Corolla...)"
                  value={customVehicleInput}
                  onChange={(e) => setCustomVehicleInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="text"
                  placeholder="Ano (ex: 2021)"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  className="w-24 px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={isLoadingGuide}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isLoadingGuide ? 'Adaptando...' : 'Adaptar Guia'}</span>
                </button>
              </form>
            </section>
          )}

          {/* DETALHES CRÍTICOS DO VEÍCULO SELECIONADO */}
          {guideData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Onde Fica o Estepe & Macaco
                </span>
                <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                  {guideData.spareLocation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Ponto de Encaixe do Macaco
                </span>
                <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                  {guideData.jackPoints}
                </p>
              </div>
            </div>
          )}

          {/* SELETOR DE MODO: PASSO A PASSO x ESQUEMA VISUAL */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveStepTab('interactive')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  activeStepTab === 'interactive'
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Passo a Passo
              </button>
              <button
                type="button"
                onClick={() => setActiveStepTab('diagram')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${
                  activeStepTab === 'diagram'
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>Esquemas Visuais & Ilustrações</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </button>
            </div>

            <span className="text-xs text-neutral-500 font-medium">
              {Object.values(completedSteps).filter(Boolean).length} de {guideData?.steps.length || 6} passos marcados
            </span>
          </div>

          {/* TAB 1: LISTA INTERATIVA DE PASSOS COM CHECKBOX */}
          {activeStepTab === 'interactive' && (
            <div className="space-y-3">
              {guideData?.steps.map((st) => {
                const isChecked = !!completedSteps[st.stepNumber];
                return (
                  <div
                    key={st.stepNumber}
                    onClick={() => toggleStepCompleted(st.stepNumber)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-300/80 shadow-2xs'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Marcar passo ${st.stepNumber}`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-neutral-300 text-neutral-600'
                      }`}
                    >
                      {isChecked ? '✓' : st.stepNumber}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-bold ${
                            isChecked ? 'text-emerald-950 line-through opacity-80' : 'text-neutral-950'
                          }`}
                        >
                          Passo {st.stepNumber}: {st.title}
                        </h4>
                        {st.safetyAlert && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Atenção
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isChecked ? 'text-neutral-500' : 'text-neutral-700'
                        }`}
                      >
                        {st.instruction}
                      </p>

                      {st.safetyAlert && (
                        <p className="text-xs text-red-700 font-semibold bg-red-50/80 p-2 rounded-lg border border-red-100 mt-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{st.safetyAlert}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ESQUEMA VISUAL TÉCNICO VETORIAL (SVG Didático) */}
          {activeStepTab === 'diagram' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* DIAGRAMA 1: PONTO DO MACACO NA SOLEIRA */}
              <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Ilustração 1: Ponto de Apoio Correto na Soleira
                  </h4>
                  <span className="text-[11px] text-neutral-400">Nunca apoie no assoalho fino</span>
                </div>

                <div className="py-2 flex flex-col items-center justify-center">
                  <svg
                    viewBox="0 0 400 130"
                    className="w-full max-w-md h-auto"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Linha da Carroceria / Lateral */}
                    <path
                      d="M20 50 Q100 45 180 45 T380 50"
                      stroke="#737373"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* Rebaixo / Chapa da Soleira Reforçada */}
                    <rect x="140" y="45" width="120" height="12" rx="3" fill="#fbbf24" />
                    <text x="200" y="38" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                      PONTO REFORÇADO (ENTALHE)
                    </text>

                    {/* Seta indicadora */}
                    <path d="M200 65 L200 78" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                    <polygon points="196,78 204,78 200,84" fill="#f59e0b" />

                    {/* Cabeça do Macaco com Canaleta */}
                    <rect x="182" y="86" width="36" height="10" rx="2" fill="#e5e5e5" />
                    <path d="M196 86 L196 90 M204 86 L204 90" stroke="#171717" strokeWidth="2" />
                    {/* Corpo em Losango do Macaco Pantográfico */}
                    <polygon
                      points="200,96 230,112 200,126 170,112"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      fill="#262626"
                    />
                    {/* Parafuso central do macaco */}
                    <line x1="165" y1="112" x2="235" y2="112" stroke="#e5e5e5" strokeWidth="2" />

                    {/* Indicadores de Distância */}
                    <text x="80" y="80" fill="#a3a3a3" fontSize="9" textAnchor="middle">
                      Caixa de Roda
                    </text>
                    <line x1="100" y1="65" x2="140" y2="65" stroke="#a3a3a3" strokeWidth="1" />
                    <text x="120" y="60" fill="#a3a3a3" fontSize="8" textAnchor="middle">
                      ~15-20 cm
                    </text>
                  </svg>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Abaixe-se e sinta com os dedos o vinco metálico duplo na soleira. O macaco tem uma fenda (canaleta) feita sob medida para engatar nesse ressalto.
                </p>
              </div>

              {/* DIAGRAMA 2: SEQUÊNCIA DE APERTO EM CRUZ (X) */}
              <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Ilustração 2: Sequência de Aperto / Desaperto em Cruz
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {guideData?.boltCount === 5 ? 'Padrão Estrela (5 Furos)' : 'Padrão Cruz (4 Furos)'}
                  </span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row items-center justify-around gap-4">
                  {/* Roda 4 Furos */}
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-neutral-400 mb-2">
                      Roda 4 Parafusos (Gol, Onix, HB20, Argo)
                    </span>
                    <svg viewBox="0 0 140 140" className="w-32 h-32" fill="none">
                      {/* Aro */}
                      <circle cx="70" cy="70" r="62" stroke="#525252" strokeWidth="5" />
                      <circle cx="70" cy="70" r="38" fill="#262626" stroke="#404040" strokeWidth="2" />
                      <circle cx="70" cy="70" r="14" fill="#171717" />

                      {/* Linhas Cruzadas */}
                      <line x1="70" y1="36" x2="70" y2="104" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="36" y1="70" x2="104" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

                      {/* Parafuso 1 (Topo) */}
                      <circle cx="70" cy="36" r="9" fill="#fbbf24" />
                      <text x="70" y="40" fill="#171717" fontSize="11" fontWeight="bold" textAnchor="middle">1</text>

                      {/* Parafuso 2 (Base) */}
                      <circle cx="70" cy="104" r="9" fill="#fbbf24" />
                      <text x="70" y="108" fill="#171717" fontSize="11" fontWeight="bold" textAnchor="middle">2</text>

                      {/* Parafuso 3 (Esquerda) */}
                      <circle cx="36" cy="70" r="9" fill="#fbbf24" />
                      <text x="36" y="74" fill="#171717" fontSize="11" fontWeight="bold" textAnchor="middle">3</text>

                      {/* Parafuso 4 (Direita) */}
                      <circle cx="104" cy="70" r="9" fill="#fbbf24" />
                      <text x="104" y="74" fill="#171717" fontSize="11" fontWeight="bold" textAnchor="middle">4</text>
                    </svg>
                    <span className="text-[10px] text-amber-300 mt-1 font-semibold">Ordem: 1 → 2 → 3 → 4 (Em X)</span>
                  </div>

                  {/* Roda 5 Furos */}
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-neutral-400 mb-2">
                      Roda 5 Parafusos (Corolla, Renegade, Compass, SUVs)
                    </span>
                    <svg viewBox="0 0 140 140" className="w-32 h-32" fill="none">
                      {/* Aro */}
                      <circle cx="70" cy="70" r="62" stroke="#525252" strokeWidth="5" />
                      <circle cx="70" cy="70" r="38" fill="#262626" stroke="#404040" strokeWidth="2" />
                      <circle cx="70" cy="70" r="14" fill="#171717" />

                      {/* Traçado estrela 5 pontas */}
                      <path
                        d="M70 34 L88 100 L38 58 L102 58 L52 100 Z"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />

                      {/* 5 Parafusos */}
                      <circle cx="70" cy="34" r="8" fill="#fbbf24" />
                      <text x="70" y="38" fill="#171717" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>

                      <circle cx="104" cy="58" r="8" fill="#fbbf24" />
                      <text x="104" y="62" fill="#171717" fontSize="10" fontWeight="bold" textAnchor="middle">3</text>

                      <circle cx="88" cy="100" r="8" fill="#fbbf24" />
                      <text x="88" y="104" fill="#171717" fontSize="10" fontWeight="bold" textAnchor="middle">5</text>

                      <circle cx="52" cy="100" r="8" fill="#fbbf24" />
                      <text x="52" y="104" fill="#171717" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>

                      <circle cx="36" cy="58" r="8" fill="#fbbf24" />
                      <text x="36" y="62" fill="#171717" fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
                    </svg>
                    <span className="text-[10px] text-amber-300 mt-1 font-semibold">Ordem: 1 → 2 → 3 → 4 → 5 (Estrela)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-800/80 text-xs text-neutral-300 flex items-center justify-between">
                  <span>🔄 <strong>Soltar:</strong> Sentido Anti-horário (←)</span>
                  <span>🔄 <strong>Apertar:</strong> Sentido Horário (→)</span>
                </div>
              </div>
            </div>
          )}

          {/* RECOMENDAÇÃO PÓS-TROCA */}
          {guideData?.postCare && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Aviso Pós-Troca:</strong> {guideData.postCare}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER DO MODAL — PLANO B SE NÃO CONSEGUIR */}
        <footer className="px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-500 text-center sm:text-left">
            <span>Está tendo dificuldade com parafusos travados ou piso instável?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Fechar Guia
            </button>

            <button
              type="button"
              id="btn-guide-call-help"
              onClick={() => {
                onClose();
                if (onOpenMapsAlternative) {
                  onOpenMapsAlternative('borracharia socorro movel guincho 24 horas');
                } else {
                  const url = locationService.buildGoogleMapsSearchUrl('borracharia socorro movel', userLocation);
                  window.open(url, '_blank');
                }
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Chamar Socorro Próximo</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
