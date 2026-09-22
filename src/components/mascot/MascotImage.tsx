import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MASCOT_REGISTRY, getStoredMascots } from '../../modules/mascot/mascotAssets';

export interface MascotImageProps {
  characterKey: keyof typeof MASCOT_REGISTRY;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  customPixelSize?: number;
  className?: string;
  floatingAnimation?: boolean;
  animationDuration?: number;
  animationAmplitude?: number;
  pulseEffect?: boolean;
  rotateEffect?: boolean;
  shadowGlow?: boolean;
  withGlow?: boolean;
  borderStyle?: 'none' | 'subtle' | 'glow' | 'circle' | 'card';
  alt?: string;
  onClick?: () => void;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-36 h-36',
  hero: 'w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72',
};

export const MascotImage: React.FC<MascotImageProps> = ({
  characterKey,
  size = 'md',
  customPixelSize,
  className = '',
  floatingAnimation = false,
  animationDuration = 3.5,
  animationAmplitude = 8,
  pulseEffect = false,
  rotateEffect = false,
  shadowGlow = false,
  withGlow = false,
  borderStyle = 'none',
  alt,
  onClick,
}) => {
  const [registry, setRegistry] = useState(() => getStoredMascots());
  const character = registry[characterKey] || MASCOT_REGISTRY[characterKey] || MASCOT_REGISTRY.paiHero;
  const [imgSrc, setImgSrc] = useState<string>(character.defaultSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getStoredMascots();
      setRegistry(updated);
      const updatedChar = updated[characterKey] || MASCOT_REGISTRY[characterKey];
      if (updatedChar) {
        setImgSrc(updatedChar.defaultSrc);
        setHasError(false);
      }
    };
    window.addEventListener('mascot_updated', handleUpdate);
    return () => window.removeEventListener('mascot_updated', handleUpdate);
  }, [characterKey]);

  useEffect(() => {
    const current = registry[characterKey] || MASCOT_REGISTRY[characterKey];
    if (current) {
      setImgSrc(current.defaultSrc);
      setHasError(false);
    }
  }, [characterKey, registry]);

  const handleError = () => {
    if (character.fallbackSrc && imgSrc !== character.fallbackSrc) {
      setImgSrc(character.fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  const glowStyle = withGlow
    ? 'shadow-[0_0_30px_rgba(168,85,247,0.35)] ring-2 ring-purple-500/30'
    : '';

  // Quando borderStyle === 'none', a imagem fica totalmente SOLTA (sem quadrado, sem fundo branco, sem borda)
  const borderClasses =
    borderStyle === 'circle'
      ? 'bg-white rounded-full overflow-hidden border-2 border-purple-500/30 shadow-md p-1'
      : borderStyle === 'glow'
      ? 'bg-white/95 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-[0_0_24px_rgba(168,85,247,0.25)] p-2'
      : borderStyle === 'card'
      ? 'bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xl p-2.5'
      : borderStyle === 'subtle'
      ? 'bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm p-1'
      : 'bg-transparent border-0 shadow-none'; // SOLTA: totalmente livre de quadro

  const dropShadowFilter = shadowGlow ? 'drop-shadow(0 12px 18px rgba(0,0,0,0.18))' : undefined;

  const sizeStyle: React.CSSProperties = customPixelSize
    ? { width: `${customPixelSize}px`, height: `${customPixelSize}px` }
    : {};

  const sizeClass = customPixelSize ? '' : SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const content = (
    <div
      style={{
        ...sizeStyle,
        filter: dropShadowFilter,
      }}
      className={`relative shrink-0 select-none flex items-center justify-center transition-all ${sizeClass} ${borderClasses} ${glowStyle} ${className}`}
      onClick={onClick}
    >
      {!hasError ? (
        <img
          src={imgSrc}
          alt={alt || character.name}
          onError={handleError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none"
          loading="eager"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 rounded-2xl text-purple-400 p-2 text-center text-[10px] font-bold">
          <span>{character.name}</span>
        </div>
      )}
    </div>
  );

  if (floatingAnimation) {
    const yValues = [0, -Math.abs(animationAmplitude), 0];
    const scaleValues = pulseEffect ? [1, 1.04, 1] : undefined;
    const rotateValues = rotateEffect ? [-1.5, 1.5, -1.5] : undefined;

    return (
      <motion.div
        animate={{
          y: yValues,
          ...(scaleValues ? { scale: scaleValues } : {}),
          ...(rotateValues ? { rotate: rotateValues } : {}),
        }}
        transition={{
          duration: Math.max(0.8, animationDuration),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="inline-block"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
