import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThemeConfig } from '../../modules/theme/types';
import { LiveAppPreview } from './LiveAppPreview';
import {
  GripHorizontal,
  X,
  Minimize2,
  Maximize2,
  Eye,
  Sliders,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  SunMedium,
  Layers,
} from 'lucide-react';

interface DraggableLivePreviewProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type SizePreset = 'sm' | 'md' | 'lg';

const SIZES: Record<SizePreset, { width: number; height: number; label: string }> = {
  sm: { width: 340, height: 480, label: 'Pequeno' },
  md: { width: 420, height: 580, label: 'Médio' },
  lg: { width: 520, height: 680, label: 'Grande' },
};

export const DraggableLivePreview: React.FC<DraggableLivePreviewProps> = ({
  theme,
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [sizePreset, setSizePreset] = useState<SizePreset>('md');
  const [isMinimized, setIsMinimized] = useState(false);
  const [opacity, setOpacity] = useState<number>(100); // 100%, 75%, 45%
  const [isHoverSeeThrough, setIsHoverSeeThrough] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCornerMenu, setShowCornerMenu] = useState(false);

  // Position state (null indicates initial position on bottom-right)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentSize = SIZES[sizePreset];

  // Initialize position on bottom-right corner once mounted or resized
  useEffect(() => {
    if (!isOpen) return;

    const initPos = () => {
      if (typeof window === 'undefined') return;
      const margin = 24;
      const targetWidth = isMinimized ? 280 : currentSize.width;
      const targetHeight = isMinimized ? 52 : currentSize.height;

      const defaultX = Math.max(margin, window.innerWidth - targetWidth - margin);
      const defaultY = Math.max(margin, window.innerHeight - targetHeight - margin);

      setPosition((prev) => {
        if (!prev) return { x: defaultX, y: defaultY };
        // Clamp current position within bounds
        const clampedX = Math.min(Math.max(10, prev.x), window.innerWidth - targetWidth - 10);
        const clampedY = Math.min(Math.max(10, prev.y), window.innerHeight - targetHeight - 10);
        return { x: clampedX, y: clampedY };
      });
    };

    initPos();
    window.addEventListener('resize', initPos);
    return () => window.removeEventListener('resize', initPos);
  }, [isOpen, isMinimized, currentSize.width, currentSize.height]);

  // Handle Drag Move
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;

      const targetWidth = isMinimized ? 280 : currentSize.width;
      const targetHeight = isMinimized ? 52 : currentSize.height;

      const newX = clientX - dragStartOffsetRef.current.x;
      const newY = clientY - dragStartOffsetRef.current.y;

      const maxX = Math.max(10, window.innerWidth - targetWidth - 10);
      const maxY = Math.max(10, window.innerHeight - targetHeight - 10);

      const clampedX = Math.min(Math.max(10, newX), maxX);
      const clampedY = Math.min(Math.max(10, newY), maxY);

      setPosition({ x: clampedX, y: clampedY });
    },
    [isMinimized, currentSize.width, currentSize.height]
  );

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header or drag handle, not interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    e.preventDefault();
    isDraggingRef.current = true;

    const currentX = position?.x ?? (window.innerWidth - currentSize.width - 24);
    const currentY = position?.y ?? (window.innerHeight - currentSize.height - 24);

    dragStartOffsetRef.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleDragMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Touch Drag Events
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }

    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      const touch = e.touches[0];

      const currentX = position?.x ?? (window.innerWidth - currentSize.width - 24);
      const currentY = position?.y ?? (window.innerHeight - currentSize.height - 24);

      dragStartOffsetRef.current = {
        x: touch.clientX - currentX,
        y: touch.clientY - currentY,
      };

      const onTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length === 1) {
          handleDragMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
        }
      };

      const onTouchEnd = () => {
        isDraggingRef.current = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };

      document.addEventListener('touchmove', onTouchMove, { passive: true });
      document.addEventListener('touchend', onTouchEnd);
    }
  };

  // Corner Snap
  const snapToCorner = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const margin = 20;
    const targetWidth = isMinimized ? 280 : currentSize.width;
    const targetHeight = isMinimized ? 52 : currentSize.height;

    switch (corner) {
      case 'top-left':
        setPosition({ x: margin, y: 70 });
        break;
      case 'top-right':
        setPosition({ x: window.innerWidth - targetWidth - margin, y: 70 });
        break;
      case 'bottom-left':
        setPosition({ x: margin, y: window.innerHeight - targetHeight - margin });
        break;
      case 'bottom-right':
        setPosition({
          x: window.innerWidth - targetWidth - margin,
          y: window.innerHeight - targetHeight - margin,
        });
        break;
    }
    setShowCornerMenu(false);
  };

  if (!isOpen) return null;

  // Effective Opacity
  const effectiveOpacity = isHoverSeeThrough && isHovered ? 0.35 : opacity / 100;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : 'auto',
        top: position ? `${position.y}px` : 'auto',
        right: position ? 'auto' : '24px',
        bottom: position ? 'auto' : '24px',
        width: isMinimized ? '300px' : `${currentSize.width}px`,
        height: isMinimized ? '52px' : `${currentSize.height}px`,
        opacity: effectiveOpacity,
        zIndex: 9999,
        transition: isDraggingRef.current ? 'none' : 'opacity 0.2s ease, width 0.2s ease, height 0.2s ease',
      }}
      className="shadow-2xl rounded-3xl border-2 border-amber-500/50 bg-stone-950 flex flex-col overflow-hidden select-none"
    >
      {/* 1. DRAGGABLE HEADER BAR */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="px-3.5 py-2.5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing shrink-0"
        title="Clique e arraste para mover a miniatura para qualquer lugar da tela"
      >
        {/* Left: Drag Handle & Title */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1 rounded-md bg-stone-800 text-amber-400 hover:bg-stone-700 transition-colors cursor-grab active:cursor-grabbing">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-black text-white uppercase tracking-wider truncate">
              {isMinimized ? 'Miniatura (Recolhida)' : 'Miniatura Ao Vivo'}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Snap Corner Menu Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCornerMenu(!showCornerMenu);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Mover rapidamente para um dos cantos da tela"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Corner Snap Dropdown */}
            {showCornerMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-44 p-2 bg-stone-900 border border-stone-700 rounded-2xl shadow-xl flex flex-col gap-1 text-xs">
                <span className="text-[10px] font-bold text-stone-400 px-2 py-0.5 uppercase">
                  Mover para o canto:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => snapToCorner('top-left')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowUpLeft className="w-3 h-3" /> Sup. Esq.
                  </button>
                  <button
                    type="button"
                    onClick={() => snapToCorner('top-right')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3 h-3" /> Sup. Dir.
                  </button>
                  <button
                    type="button"
                    onClick={() => snapToCorner('bottom-left')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3 h-3" /> Inf. Esq.
                  </button>
                  <button
                    type="button"
                    onClick={() => snapToCorner('bottom-right')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowDownRight className="w-3 h-3" /> Inf. Dir.
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Opacity Cycle (100% -> 75% -> 45%) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpacity((prev) => (prev === 100 ? 70 : prev === 70 ? 40 : 100));
            }}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              opacity < 100 ? 'bg-amber-500/20 text-amber-300' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title={`Transparência atual: ${opacity}%. Clique para alternar (100%, 70%, 40%) e enxergar os campos de edição embaixo!`}
          >
            <SunMedium className="w-3.5 h-3.5" />
          </button>

          {/* Minimize / Maximize */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title={isMinimized ? 'Expandir miniatura' : 'Recolher para barra flutuante'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Fechar miniatura flutuante"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT (WHEN NOT MINIMIZED) */}
      {!isMinimized && (
        <>
          {/* Sub-toolbar: Size controls and See-through mode */}
          <div className="px-3 py-1.5 bg-stone-900/90 border-b border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400 shrink-0">
            {/* Size Presets */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-stone-500 mr-0.5">Tamanho:</span>
              {(['sm', 'md', 'lg'] as SizePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSizePreset(preset)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    sizePreset === preset
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {preset.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Hover See-Through Toggle */}
            <button
              type="button"
              onClick={() => setIsHoverSeeThrough(!isHoverSeeThrough)}
              className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isHoverSeeThrough
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Quando ativo, a miniatura fica semi-transparente ao passar o mouse para você ler o que está embaixo"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>Ver através</span>
            </button>
          </div>

          {/* Miniature Live App View */}
          <div className="flex-1 overflow-hidden p-2 bg-stone-950">
            <LiveAppPreview theme={theme} onNavigateToTab={onNavigateToTab} />
          </div>
        </>
      )}
    </div>
  );
};
