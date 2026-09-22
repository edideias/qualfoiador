import React from 'react';
import { ThemeConfig, ThemeVisibility, getThemeVisibility } from '../../modules/theme/types';
import { Eye, EyeOff, Layout, Sparkles, Sliders, Check, Shield } from 'lucide-react';

interface VisibilityEditorProps {
  theme: ThemeConfig;
  onChange: (updater: (prev: ThemeConfig) => ThemeConfig) => void;
}

export const VisibilityEditor: React.FC<VisibilityEditorProps> = ({ theme, onChange }) => {
  const visibility = getThemeVisibility(theme);

  const updateVisibility = (field: keyof ThemeVisibility, val: boolean) => {
    onChange((prev) => ({
      ...prev,
      visibility: {
        ...getThemeVisibility(prev),
        [field]: val,
      },
    }));
  };

  const sections = [
    {
      title: '🛡️ Acesso & Botões Administrativos',
      description: 'Controle a exibição de botões e atalhos administrativos na interface pública.',
      items: [
        {
          key: 'showHeaderAdminBtn' as keyof ThemeVisibility,
          label: 'Botão "Admin" no Cabeçalho',
          desc: 'Exibe o botão de acesso rápido ao painel administrativo no topo da página',
        },
        {
          key: 'showFloatingAdminWidget' as keyof ThemeVisibility,
          label: 'Botões Flutuantes no Canto da Tela (Live Admin & Mascotes)',
          desc: 'Exibe os botões de edição rápida ao vivo e troca de mascotes no canto inferior',
        },
      ],
    },
    {
      title: '🐾 Mascotes & Elementos Gráficos',
      description: 'Ligue ou desligue ilustrações de mascotes no app para um visual mais lúdico ou mais sóbrio.',
      items: [
        {
          key: 'showMascotsGlobal' as keyof ThemeVisibility,
          label: 'Chave Geral: Todos os Mascotes e Ilustrações',
          desc: 'Interruptor mestre para exibir ou esconder todas as artes de mascotes do sistema',
        },
        {
          key: 'showMascotHero' as keyof ThemeVisibility,
          label: 'Mascote Principal no Hero ("Pai" centralizado)',
          desc: 'Personagem ilustrativo grande com efeito flutuante acima do título principal',
        },
        {
          key: 'showMascotCards' as keyof ThemeVisibility,
          label: 'Mascotes Ilustrativos nos Cards de Entrada',
          desc: 'Mini-mascotes exibidos nos cards de Dor Física e Dor de Problema',
        },
        {
          key: 'showMascotAudioModal' as keyof ThemeVisibility,
          label: 'Mascote no Modal de Gravação de Áudio',
          desc: 'Personagem animado ouvindo o relato de voz no popup de microfone',
        },
      ],
    },
    {
      title: '🏷️ Cabeçalho e Barra Superior',
      description: 'Elementos de marca, identificação e menu no topo do site.',
      items: [
        {
          key: 'showHeaderBrand' as keyof ThemeVisibility,
          label: 'Logotipo & Nome da Marca',
          desc: 'Exibe o ícone e texto "QUAL É A SUA DOR?" no topo',
        },
        {
          key: 'showHeaderBadge' as keyof ThemeVisibility,
          label: 'Tag / Badge de Status',
          desc: 'Etiqueta "Sem cadastro inicial" ao lado do menu',
        },
        {
          key: 'showHeaderSupplierBtn' as keyof ThemeVisibility,
          label: 'Botão "Área do Fornecedor"',
          desc: 'Acesso rápido para médicos, prestadores e parceiros',
        },
      ],
    },
    {
      title: '✨ Seção de Apresentação (Hero)',
      description: 'Mensagem de boas-vindas e introdução ao usuário.',
      items: [
        {
          key: 'showHeroBadge' as keyof ThemeVisibility,
          label: 'Badge de Resposta Imediata',
          desc: 'Exibe o selo "Leva menos de 1 minuto • 100% privado"',
        },
        {
          key: 'showHeroTitle' as keyof ThemeVisibility,
          label: 'Título Principal ("QUAL É A SUA DOR?")',
          desc: 'Frase de impacto destacada no centro/topo',
        },
        {
          key: 'showHeroSubtitle' as keyof ThemeVisibility,
          label: 'Subtítulo Explicativo',
          desc: 'Texto orientando a escolher o tipo de incômodo',
        },
      ],
    },
    {
      title: '🎴 Cards e Botões de Entrada Principal',
      description: 'Opções primárias para o usuário iniciar o direcionamento.',
      items: [
        {
          key: 'showCardPhysical' as keyof ThemeVisibility,
          label: 'Card Completo: Dor Física (Corpo & Saúde)',
          desc: 'Exibe o card dedicado para dores no corpo, coluna, cabeça',
        },
        {
          key: 'showCardPhysicalIcon' as keyof ThemeVisibility,
          label: 'Ícone de Pulso/Atividade do Card Físico',
          desc: 'Exibe o ícone em destaque no canto superior do card físico',
        },
        {
          key: 'showCardPhysicalBadge' as keyof ThemeVisibility,
          label: 'Tag / Badge do Card Dor Física',
          desc: 'Selo "Avaliação Rápida" dentro do card físico',
        },
        {
          key: 'showCardPhysicalButton' as keyof ThemeVisibility,
          label: 'Botão de Ação do Card Dor Física',
          desc: 'Botão "Começar avaliação da dor"',
        },
        {
          key: 'showCardProblem' as keyof ThemeVisibility,
          label: 'Card Completo: Dor de Problema (Vida & Rotina)',
          desc: 'Exibe o card para emergências práticas, carro, casa, serviço',
        },
        {
          key: 'showCardProblemIcon' as keyof ThemeVisibility,
          label: 'Ícone de Raio/Emergência do Card de Problema',
          desc: 'Exibe o ícone em destaque no canto superior do card de problemas',
        },
        {
          key: 'showCardProblemBadge' as keyof ThemeVisibility,
          label: 'Tag / Badge do Card Dor de Problema',
          desc: 'Selo "Solução Direta" dentro do card de problema',
        },
        {
          key: 'showCardProblemButton' as keyof ThemeVisibility,
          label: 'Botão de Ação do Card Dor de Problema',
          desc: 'Botão "Avaliar meu problema agora"',
        },
      ],
    },
    {
      title: '🎙️ Busca de Emergências, Áudio e Rodapé',
      description: 'Barra de resolução imediata, botões de áudio e mensagens de confiança.',
      items: [
        {
          key: 'showSearchSection' as keyof ThemeVisibility,
          label: 'Seção de Busca de Emergências Imediatas',
          desc: 'Barra com campo de texto e botão de resolução rápida',
        },
        {
          key: 'showAudioInputButton' as keyof ThemeVisibility,
          label: 'Botões de Gravação de Áudio & Voz',
          desc: 'Botão de microfone na barra de busca e banner de voz instantânea',
        },
        {
          key: 'showSearchChips' as keyof ThemeVisibility,
          label: 'Chips / Botões de Casos Rápidos',
          desc: 'Atalhos: Pneu furado, Chaveiro 24h, Cano estourado, Dentista...',
        },
        {
          key: 'showFooterNotice' as keyof ThemeVisibility,
          label: 'Aviso de Privacidade e Confiança no Rodapé',
          desc: 'Texto "Privado • Sem cadastro inicial • Responda do seu jeito"',
        },
        {
          key: 'showFooterSupplierBanner' as keyof ThemeVisibility,
          label: 'Banner / Chamada do Fornecedor no Rodapé',
          desc: 'Card destacado no rodapé convidando médicos, prestadores e parceiros',
        },
        {
          key: 'showFooterSection' as keyof ThemeVisibility,
          label: 'Seção Completa do Rodapé',
          desc: 'Área inferior inteira do rodapé da aplicação',
        },
      ],
    },
  ];

  return (
    <div id="visibility-editor-section" className="space-y-6">
      {/* Section Header */}
      <div className="pb-3 border-b border-stone-800">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-400" />
          <span>Visibilidade dos Elementos na Tela</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Oculte ou exiba qualquer elemento do site em tempo real. Veja as alterações instantaneamente no simulador ao lado.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4"
          >
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">
                {sec.title}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">{sec.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {sec.items.map((item) => {
                const isVisible = (visibility as any)[item.key] !== false;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-stone-700 transition-all gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-200">
                          {item.label}
                        </span>
                        {isVisible ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-stone-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateVisibility(item.key, !isVisible)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isVisible
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700 hover:text-white'
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Visível</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                          <span>Oculto</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
