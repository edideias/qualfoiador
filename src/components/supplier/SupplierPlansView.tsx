import React, { useState } from 'react';
import {
  SupplierProfile,
  SupplierPlanType,
  SupplierPreferences,
} from '../../types';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Info,
  Sliders,
  MapPin,
  Flame,
  ArrowRight,
  Zap,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SupplierPlansViewProps {
  profile: SupplierProfile;
  onUpgradePlan: (plan: SupplierPlanType) => void;
  onUpdatePreferences: (prefs: Partial<SupplierPreferences>) => void;
}

export const SupplierPlansView: React.FC<SupplierPlansViewProps> = ({
  profile,
  onUpgradePlan,
  onUpdatePreferences,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState<SupplierPlanType | null>(null);

  // Commercial preferences local state
  const [preferences, setPreferences] = useState<SupplierPreferences>(
    profile.preferences || {
      autoAcceptOpportunities: false,
      maxPricePerOpportunity: 10,
      notificationChannel: 'WHATSAPP',
      maxCoverageRadiusKm: profile.coverageRadiusKm || 15,
      acceptedCategories: [profile.tradeCategory || 'Automotivo'],
    }
  );
  const [prefSavedNotice, setPrefSavedNotice] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences(preferences);
    setPrefSavedNotice(true);
    setTimeout(() => setPrefSavedNotice(false), 3000);
  };

  const handleConfirmPlanChange = () => {
    if (showUpgradeModal) {
      onUpgradePlan(showUpgradeModal);
      setShowUpgradeModal(null);
    }
  };

  return (
    <div id="supplier-plans-view" className="space-y-8 animate-fadeIn">
      {/* 1. HERO COMERCIAL: PROPOSTA DE VALOR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-950 shadow-md">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-950 text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            Estrutura Comercial & Aquisição
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
            Como você ganha clientes com o "Qual é a sua dor?"
          </h2>
          <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">
            Usuários entram diariamente precisando resolver emergências e problemas concretos — pneus furados,
            vazamentos, baterias arriadas ou reparos elétricos. Conectamos seu negócio exatamente no momento em que a
            pessoa precisa da sua solução.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-stone-950">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              Sem taxa de cadastro
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              Sem leilão predatório de anúncios
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              Pague apenas pelo valor gerado
            </span>
          </div>
        </div>
      </div>

      {/* 2. GRID DE PLANOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-950">
            Escolha o Modelo Ideal Para a Sua Operação
          </h3>
          <span className="text-xs text-neutral-500">
            Ambiente de Simulação (Cobranças reais desativadas)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* PLANO 1: BÁSICO */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              profile.plan === 'BASICO'
                ? 'bg-white border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-neutral-950">Plano Básico</h4>
                  <p className="text-xs text-neutral-500">Para começar sem custos fixos</p>
                </div>
                {profile.plan === 'BASICO' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                    Plano Atual
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-neutral-950">R$ 0</span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Pague apenas R$ 3 a R$ 10 pelos leads que quiser atender.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Perfil público cadastrado gratuitamente</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Acesso à carteira de oportunidades locais</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Modelo Pay-As-You-Go com créditos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Raio de atendimento padrão (até 15 km)</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <span>✕ Sem selo de destaque PRO</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {profile.plan === 'BASICO' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-500 text-xs font-bold text-center cursor-default"
                >
                  Plano Ativo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal('BASICO')}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Mudar para Básico
                </button>
              )}
            </div>
          </div>

          {/* PLANO 2: PRO (DESTAQUE) */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
              profile.plan === 'PRO'
                ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                : 'bg-white border-blue-500 shadow-md'
            }`}
          >
            {/* Tag Recomendado */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              Mais Popular ⚡
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-neutral-950 flex items-center gap-1.5">
                    <span>Plano PRO</span>
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </h4>
                  <p className="text-xs text-neutral-500">Para profissionais em expansão</p>
                </div>
                {profile.plan === 'PRO' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Ativo
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-neutral-950">R$ 39,90</span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                <p className="text-[11px] text-blue-700 font-semibold">
                  Sem taxas adicionais por lead recebido.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-700 border-t border-neutral-100 pt-4 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                  <span><strong>Selo PRO Verificado</strong> no perfil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                  <span>Perfil expandido com fotos e serviços ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                  <span>Painel completo de conversão e cálculo de ROI</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                  <span><strong>Raio ampliado de atendimento</strong> (+50 km)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                  <span>Recebimento automático prioritário</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              {profile.plan === 'PRO' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center cursor-default shadow-xs"
                >
                  Plano PRO Ativo ⚡
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal('PRO')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ativar Plano PRO (Simulação)</span>
                </button>
              )}
              <p className="text-[10px] text-neutral-400 text-center">
                *O plano PRO oferece ferramentas e selo, mas nunca altera a relevância neutra de busca para o usuário.
              </p>
            </div>
          </div>

          {/* PLANO 3: EMPRESA */}
          <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 opacity-85 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-neutral-950 flex items-center gap-1.5">
                    <span>Empresa</span>
                    <Building2 className="w-4 h-4 text-neutral-500" />
                  </h4>
                  <p className="text-xs text-neutral-500">Para frotas, redes e franquias</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Em Breve
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-neutral-900">R$ 99,90</span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Não disponível comercialmente ainda.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-500 border-t border-neutral-200 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Múltiplas filiais e atendentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Despacho automatizado de chamados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Integração de API com CRM próprio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Gerente de contas dedicado</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-neutral-200 text-neutral-500 text-xs font-bold text-center cursor-not-allowed"
              >
                Em Desenvolvimento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PREFERÊNCIAS COMERCIAIS & FILTROS DE RECEBIMENTO */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Preferências Comerciais de Recebimento
              </h3>
              <p className="text-xs text-neutral-500">
                Defina como e quais oportunidades seu negócio deseja receber.
              </p>
            </div>
          </div>

          {prefSavedNotice && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
              ✓ Preferências salvas!
            </span>
          )}
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modo de Recebimento */}
            <div className="space-y-2 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <label className="text-xs font-bold text-neutral-900 block">
                Modo de Recebimento de Oportunidades:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="autoAccept"
                    checked={!preferences.autoAcceptOpportunities}
                    onChange={() =>
                      setPreferences((prev) => ({ ...prev, autoAcceptOpportunities: false }))
                    }
                    className="accent-neutral-950"
                  />
                  <span>
                    <strong>Escolha Manual:</strong> Notificar e eu decido quais chamados aceitar.
                  </span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="autoAccept"
                    checked={preferences.autoAcceptOpportunities}
                    onChange={() =>
                      setPreferences((prev) => ({ ...prev, autoAcceptOpportunities: true }))
                    }
                    className="accent-neutral-950"
                  />
                  <span>
                    <strong>Despacho Automático:</strong> Aceitar imediatamente chamados quentes no meu raio.
                  </span>
                </label>
              </div>
            </div>

            {/* Raio Máximo & Preço Máximo */}
            <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-bold text-neutral-900">
                    Raio Máximo de Cobertura:
                  </label>
                  <span className="font-extrabold text-neutral-950">
                    {preferences.maxCoverageRadiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={preferences.maxCoverageRadiusKm}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      maxCoverageRadiusKm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-neutral-950 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>5 km (Bairro)</span>
                  <span>25 km (Cidade)</span>
                  <span>50 km (Metropolitana)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-bold text-neutral-900">
                    Teto Máximo por Oportunidade:
                  </label>
                  <span className="font-extrabold text-emerald-700">
                    R$ {preferences.maxPricePerOpportunity.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={preferences.maxPricePerOpportunity}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      maxPricePerOpportunity: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-neutral-400">
                  Não receber oportunidades com valor de lead superior ao teto configurado.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Salvar Preferências Comerciais
            </button>
          </div>
        </form>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE UPGRADE SIMULADO */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-neutral-900">
                Confirmar Alteração de Plano (Simulação)
              </h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Você selecionou o plano <strong>{showUpgradeModal}</strong>{' '}
              {showUpgradeModal === 'PRO' ? '(R$ 39,90/mês)' : '(R$ 0,00/mês)'}.
            </p>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Ambiente de Teste Comercial
              </p>
              <p className="text-[11px] text-blue-800">
                Nenhum dado bancário será debitado. Esta é uma simulação da experiência de fornecedor no "Qual é a sua dor?".
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(null)}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPlanChange}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Confirmar Ativação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
