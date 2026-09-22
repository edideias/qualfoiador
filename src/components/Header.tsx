import React from 'react';
import { AppRoute } from '../types';
import { ArrowLeft, ShieldCheck, History } from 'lucide-react';
import { useTheme } from '../modules/theme/ThemeContext';
import { getThemeContent, getThemePositions, getThemeVisibility, getThemeLayout } from '../modules/theme/types';
import { BrandLogo } from './brand/BrandLogo';

interface HeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const isHome = currentRoute === '/';
  const { effectiveTheme, isAdmin } = useTheme();
  const t = effectiveTheme;
  const content = getThemeContent(t);
  const positions = getThemePositions(t);
  const visibility = getThemeVisibility(t);

  const layout = getThemeLayout(t);
  const logoSize = t.typography.headerLogoSize || 14;
  const menuSize = t.typography.menuTextSize || 12;

  const isCentered = positions.headerLayout === 'centered';
  const isMinimal = positions.headerLayout === 'minimal';

  // Determine if supplier button should show in the header
  const supplierPos = positions.headerSupplierPosition || 'footer_only';
  const shouldShowSupplierInHeader =
    visibility.showHeaderSupplierBtn !== false &&
    !isMinimal &&
    (supplierPos === 'header_only' || supplierPos === 'both');

  return (
    <header
      id="main-header"
      style={{
        backgroundColor: `${t.colors.background}f0`,
        borderColor: t.colors.border,
      }}
      className="w-full backdrop-blur-md sticky top-0 z-40 transition-all border-b"
    >
      <div
        style={{ maxWidth: `${layout.maxWidth}px` }}
        className={`mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center ${
          isCentered ? 'justify-center relative' : 'justify-between'
        }`}
      >
        {/* Brand / Logo */}
        {visibility.showHeaderBrand !== false && (
          <button
            id="btn-brand-home"
            type="button"
            onClick={() => onNavigate('/')}
            className={`flex items-center text-left group transition-all active:scale-[0.98] focus:outline-none cursor-pointer ${
              isCentered ? 'mx-auto' : ''
            }`}
          >
            <BrandLogo theme={t} size="md" />
          </button>
        )}

        {/* Action / Context Badge */}
        {!isHome ? (
          <div className={`flex items-center gap-2 ${isCentered ? 'absolute right-4 sm:right-6' : ''}`}>
            {currentRoute !== '/fornecedor' && shouldShowSupplierInHeader && (
              <button
                id="btn-nav-supplier"
                type="button"
                onClick={() => onNavigate('/fornecedor')}
                style={{ fontSize: `${menuSize}px` }}
                className="hidden sm:inline-flex items-center gap-1 py-1.5 px-3 rounded-full font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <span>{content.headerSupplierText}</span>
              </button>
            )}
            <button
              id="btn-back-home"
              type="button"
              onClick={() => onNavigate('/')}
              style={{
                backgroundColor: t.colors.cardBackground,
                borderColor: t.colors.border,
                color: t.colors.textPrimary,
                fontSize: `${menuSize}px`,
              }}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full font-semibold border hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Voltar ao início</span>
            </button>
          </div>
        ) : (
          <div className={`flex items-center gap-3 ${isCentered ? 'absolute right-4 sm:right-6' : ''}`}>
            <button
              id="btn-header-history"
              type="button"
              onClick={() => onNavigate('/historico')}
              title="Meu Histórico de Dores"
              style={{ fontSize: `${menuSize}px` }}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full font-semibold text-neutral-600 hover:text-neutral-950 border border-neutral-200 hover:bg-neutral-100 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-neutral-500" />
              <span>Histórico</span>
            </button>
            {shouldShowSupplierInHeader && (
              <button
                id="btn-header-supplier"
                type="button"
                onClick={() => onNavigate('/fornecedor')}
                style={{ fontSize: `${menuSize}px` }}
                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-full font-semibold text-neutral-600 hover:text-neutral-950 border border-neutral-200 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <span>{content.headerSupplierText}</span>
              </button>
            )}
            {visibility.showHeaderAdminBtn !== false && (
              <button
                id="btn-header-admin"
                type="button"
                onClick={() => onNavigate('/admin')}
                title={isAdmin ? "Painel Admin (Conectado)" : "Acessar Painel Admin"}
                style={{ fontSize: `${menuSize}px` }}
                className={`inline-flex items-center gap-1 py-1.5 px-2.5 rounded-full font-semibold border transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                    : 'text-neutral-500 hover:text-neutral-950 border-neutral-200/80 hover:bg-neutral-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </button>
            )}
            {content.headerBadgeVisible && visibility.showHeaderBadge !== false && !isMinimal && (
              <div
                style={{
                  backgroundColor: t.colors.badgeBackground,
                  borderColor: t.colors.border,
                  color: t.colors.badgeText,
                  fontSize: `${t.typography.badgeSize}px`,
                  fontWeight: t.typography.badgeWeight,
                }}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xs"
              >
                <span
                  style={{ backgroundColor: t.colors.accent }}
                  className="w-1.5 h-1.5 rounded-full"
                />
                <span>{content.headerBadgeText}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};


