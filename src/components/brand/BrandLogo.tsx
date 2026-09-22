import React from 'react';
import { ThemeConfig, getThemeContent } from '../../modules/theme/types';
import { MascotImage } from '../mascot/MascotImage';

interface BrandLogoProps {
  theme?: ThemeConfig;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme,
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const content = getThemeContent(theme);
  const accentColor = theme?.colors?.accent || '#a855f7'; // Neon Lilac default
  const isDark = theme?.colors?.isDark || false;

  // Sizing scale
  const markSize =
    size === 'sm' ? 'w-7 h-7 rounded-lg' : size === 'lg' ? 'w-11 h-11 rounded-2xl' : 'w-8.5 h-8.5 rounded-xl';
  const mascotSize =
    size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
  const prefixSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
  const highlightSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';

  const prefixText = content.headerBrandPrefix || 'Qual a sua';
  const highlightText = content.headerBrandHighlight || 'dor?';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Mascot Companion in Header */}
      <MascotImage
        characterKey="headerTop"
        size={mascotSize}
        borderStyle="glow"
        className="transition-transform group-hover:scale-105"
        alt="Mascote Qual a sua dor?"
      />

      {/* Redesigned Neon Lilac & Black Icon Mark */}
      <div
        className={`relative ${markSize} bg-zinc-950 flex items-center justify-center shrink-0 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all group-hover:shadow-[0_0_18px_rgba(168,85,247,0.45)] group-hover:border-purple-400`}
      >
        {/* Abstract Precision Symbol: Target Pulse & Spark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 text-purple-400"
        >
          {/* Target crosshair / pulse rings */}
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            className="opacity-40"
          />
          {/* Stylized interrogation / acute pinpoint path */}
          <path
            d="M9.5 8.5C9.5 7.12 10.62 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.7 13.6 10.5 12.5 11.5L12 12V13.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing neon pinpoint spark */}
          <circle
            cx="12"
            cy="17"
            r="1.75"
            fill="#c084fc"
            className="animate-pulse shadow-sm"
          />
        </svg>

        {/* Mini corner neon beacon */}
        <span
          style={{ backgroundColor: accentColor }}
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-zinc-950 shadow-[0_0_6px_#a855f7]"
        />
      </div>

      {/* Typography: "Qual a sua dor?" */}
      <div className="flex flex-col">
        <div
          style={{ fontFamily: theme?.typography?.headingFont || 'Plus Jakarta Sans' }}
          className="flex items-baseline gap-1 leading-none tracking-tight"
        >
          <span
            style={{
              color: isDark ? '#f4f4f5' : '#09090b',
            }}
            className={`${prefixSize} font-bold tracking-tight`}
          >
            {prefixText}
          </span>
          <span
            style={{
              color: accentColor,
              textShadow: '0 0 20px rgba(168,85,247,0.3)',
            }}
            className={`${highlightSize} font-black tracking-tight`}
          >
            {highlightText}
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mt-0.5">
            Ação Imediata
          </span>
        )}
      </div>
    </div>
  );
};
