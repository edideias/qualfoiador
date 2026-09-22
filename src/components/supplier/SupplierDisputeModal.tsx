import React, { useState } from 'react';
import { SupplierOpportunity, DisputeReason } from '../../types';
import { Scale, X, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SupplierDisputeModalProps {
  opportunity: SupplierOpportunity;
  onClose: () => void;
  onSubmit: (reason: DisputeReason, details: string) => void;
}

export const SupplierDisputeModal: React.FC<SupplierDisputeModalProps> = ({
  opportunity,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<DisputeReason>('INVALIDA');
  const [details, setDetails] = useState('');

  const cost = opportunity.opportunityPrice || 5.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason, details);
  };

  const reasonOptions: { id: DisputeReason; label: string; desc: string }[] = [
    {
      id: 'INVALIDA',
      label: 'Contato Inválido / Trote',
      desc: 'Telefone não existe, não atende ou não reconhece o pedido.',
    },
    {
      id: 'CLIENTE_NAO_SOLICITOU',
      label: 'Cliente já resolveu ou desistiu',
      desc: 'Ao contatar, cliente informou que já havia resolvido antes do envio.',
    },
    {
      id: 'CATEGORIA_ERRADA',
      label: 'Categoria incompatível',
      desc: 'O serviço solicitado não corresponde ao que você oferece.',
    },
    {
      id: 'LOCALIZACAO_INCORRETA',
      label: 'Fora do raio ou endereço falso',
      desc: 'Distância física incompatível com a localização declarada.',
    },
    {
      id: 'DUPLICADA',
      label: 'Chamado duplicado',
      desc: 'Mesmo usuário enviou o mesmo chamado repetido.',
    },
    {
      id: 'SPAM',
      label: 'Spam ou tentativa comercial',
      desc: 'Não se trata de uma dor real de consumidor.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900">
                Contestar / Disputar Lead
              </h3>
              <p className="text-[11px] text-neutral-500">
                Política de proteção comercial do fornecedor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opportunity Card Preview */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900">Chamado: {opportunity.title}</span>
            <span className="font-black text-emerald-700">
              Valor do Lead: R$ {cost.toFixed(2)}
            </span>
          </div>
          <p className="text-neutral-600 text-[11px]">{opportunity.problemSummary}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-900 block">
              Qual foi o problema com esta oportunidade?
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {reasonOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                    reason === opt.id
                      ? 'bg-amber-50/60 border-amber-400 text-amber-950 font-medium'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="disputeReason"
                    value={opt.id}
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id)}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <span className="font-bold block">{opt.label}</span>
                    <span className="text-[11px] text-neutral-500">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-900 block">
              Detalhes adicionais (opcional):
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ex: Liguei 3 vezes e o número deu como inexistente no WhatsApp."
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Guarantee Note */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Garantia de Qualidade:</strong> Se o chamado for considerado inválido ou impróprio, o valor integral de <strong>R$ {cost.toFixed(2)}</strong> será creditado de volta na sua carteira de oportunidades.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Enviar Contestação & Pedir Estorno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
