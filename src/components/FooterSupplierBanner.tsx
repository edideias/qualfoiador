import React from 'react';
import { ArrowRight, Briefcase, Sparkles, Building2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../modules/theme/ThemeContext';
import { getThemeContent, getThemeVisibility, getThemeLayout } from '../modules/theme/types';
import { AppRoute } from '../types';

interface FooterSupplierBannerProps {
  onNavigate: (route: AppRoute) => void;
}

export const FooterSupplierBanner: React.FC<FooterSupplierBannerProps> = ({ onNavigate }) => {
  const { effectiveTheme } = useTheme();
  const t = effectiveTheme;
  const content = getThemeContent(t);
  const visibility = getThemeVisibility(t);
  const layout = getThemeLayout(t);

  // If explicitly hidden via Admin visibility settings, do not render
  if (visibility.showFooterSupplierBanner === false) {
    return null;
  }

  const isDark = t.colors.isDark;

  return (
    <section
      id="footer-supplier-banner"
      style={{
        maxWidth: `${layout.maxWidth}px`,
        marginTop: `${layout.footerSpacing ?? 32}px`,
        marginBottom: `${layout.footerSpacing ?? 32}px`,
        paddingLeft: `${layout.containerPaddingX ?? 24}px`,
        paddingRight: `${layout.containerPaddingX ?? 24}px`,
      }}
      className="w-full mx-auto"
      aria-label="Área de Fornecedores e Parceiros"
    >
      <div
        style={{
          borderRadius: `${t.cards.borderRadius}px`,
          borderWidth: `${t.cards.borderWidth}px`,
          borderColor: isDark ? '#27272a' : '#e4e4e7',
          backgroundColor: isDark ? '#18181b' : '#fafafa',
        }}
        className="p-6 sm:p-8 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md group"
      >
        {/* Subtle decorative background glow */}
        <div
          style={{
            backgroundColor: `${t.colors.accent}15`,
          }}
          className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{content.footerSupplierBadgeText || 'Para Prestadores & Especialistas'}</span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontFamily: t.typography.headingFont,
                color: t.colors.textPrimary,
              }}
              className="text-lg sm:text-xl font-extrabold tracking-tight"
            >
              {content.footerSupplierTitle || 'Você é médico, especialista ou prestador de serviços?'}
            </h3>

            {/* Subtitle */}
            <p
              style={{
                color: t.colors.textSecondary,
              }}
              className="text-xs sm:text-sm leading-relaxed"
            >
              {content.footerSupplierSubtitle ||
                'Conecte-se a pessoas com dores reais que precisam de atendimento e resolução imediata na sua região.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center">
            <button
              id="btn-footer-go-supplier"
              type="button"
              onClick={() => onNavigate('/fornecedor')}
              style={{
                borderRadius: `${t.buttons.borderRadius}px`,
                backgroundColor: t.colors.buttonBackground,
                color: t.colors.buttonText,
                fontFamily: t.typography.headingFont,
                fontSize: `${t.typography.buttonTextSize || 14}px`,
                fontWeight: t.typography.buttonTextWeight || 700,
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold"
            >
              <Briefcase className="w-4 h-4" />
              <span>{content.footerSupplierButtonText || 'Acessar Área do Fornecedor'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
