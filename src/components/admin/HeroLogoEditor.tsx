import React from 'react';
import { ThemeHeroLogo } from '../../modules/theme/types';
import { MascotImage } from '../mascot/MascotImage';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  MoveVertical,
  Activity,
  Upload,
  Check,
  Zap,
  Sliders,
  Shield,
  Layers,
  Wind,
} from 'lucide-react';

interface HeroLogoEditorProps {
  heroLogo: ThemeHeroLogo;
  onChange: (updated: ThemeHeroLogo) => void;
  onOpenMascotUpload?: () => void;
}

export const HeroLogoEditor: React.FC<HeroLogoEditorProps> = ({
  heroLogo,
  onChange,
  onOpenMascotUpload,
}) => {
  const frameStyle = heroLogo.frameStyle || 'none';
  const size = heroLogo.size || 190;
  const floatingAnimation = heroLogo.floatingAnimation !== false;
  const animationDuration = heroLogo.animationDuration || 3.5;
  const animationAmplitude = heroLogo.animationAmplitude ?? 8;
  const pulseEffect = !!heroLogo.pulseEffect;
  const rotateEffect = !!heroLogo.rotateEffect;
  const shadowGlow = !!heroLogo.shadowGlow;

  const updateField = <K extends keyof ThemeHeroLogo>(field: K, value: ThemeHeroLogo[K]) => {
    onChange({
      ...heroLogo,
      [field]: value,
    });
  };

  const handleResetToSolta = () => {
    onChange({
      frameStyle: 'none',
      size: 190,
      floatingAnimation: true,
      animationDuration: 3.5,
      animationAmplitude: 8,
      pulseEffect: false,
      rotateEffect: false,
      shadowGlow: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* Mini Preview Box com Status */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-stone-800 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
          <Sparkles className="w-3 h-3" />
          <span>Prévia ao Vivo do Logo/Mascote</span>
        </div>

        <div className="absolute top-2.5 right-3">
          <button
            type="button"
            onClick={handleResetToSolta}
            className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1 bg-stone-800/80 hover:bg-stone-700 px-2 py-0.5 rounded-lg border border-stone-700/60 transition-colors cursor-pointer"
            title="Restaurar padrão solto sem quadro"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Padrão Solto</span>
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="w-full flex items-center justify-center min-h-[160px] py-4 mt-2">
          <MascotImage
            characterKey="paiHero"
            customPixelSize={Math.min(size, 170)} // limit preview box height nicely
            floatingAnimation={floatingAnimation}
            animationDuration={animationDuration}
            animationAmplitude={animationAmplitude}
            pulseEffect={pulseEffect}
            rotateEffect={rotateEffect}
            shadowGlow={shadowGlow}
            borderStyle={frameStyle}
            withGlow={frameStyle === 'glow'}
            alt="Prévia Mascote"
          />
        </div>

        <div className="w-full flex items-center justify-between pt-2 border-t border-stone-800 text-[11px] text-stone-400">
          <span>
            Quadro: <strong className="text-amber-400 capitalize">{frameStyle === 'none' ? 'Solta (Sem Quadro)' : frameStyle}</strong>
          </span>
          <span>
            Tamanho: <strong className="text-amber-400">{size}px</strong>
          </span>
          <span>
            Movimento: <strong className="text-amber-400">{floatingAnimation ? `${animationDuration}s (${animationAmplitude}px)` : 'Parado'}</strong>
          </span>
        </div>
      </div>

      {/* 1. SELETOR DE ESTILO DO QUADRO / MOLDURA */}
      <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-extrabold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Estilo do Quadro / Moldura</span>
          </label>
          {frameStyle === 'none' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
              ✓ Solta / Transparente
            </span>
          )}
        </div>
        <p className="text-[11px] text-stone-400">
          Escolha se deseja a logo totalmente solta (livre, sem nenhum quadrado em volta) ou dentro de uma moldura personalizada.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {/* Opção Solta / Sem Quadro */}
          <button
            type="button"
            onClick={() => updateField('frameStyle', 'none')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              frameStyle === 'none'
                ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">✨ Solta (Sem Quadro)</span>
              {frameStyle === 'none' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <span className="text-[10px] text-stone-400 leading-tight">
              Imagem livre, transparente e flutuando sem nenhum quadrado.
            </span>
          </button>

          {/* Opção Glow */}
          <button
            type="button"
            onClick={() => updateField('frameStyle', 'glow')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              frameStyle === 'glow'
                ? 'bg-purple-500/15 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/30'
                : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">🟣 Quadro com Brilho</span>
              {frameStyle === 'glow' && <Check className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            <span className="text-[10px] text-stone-400 leading-tight">
              Quadro arredondado com iluminação neon roxa suave.
            </span>
          </button>

          {/* Opção Card */}
          <button
            type="button"
            onClick={() => updateField('frameStyle', 'card')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              frameStyle === 'card'
                ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">⬜ Card Branco</span>
              {frameStyle === 'card' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <span className="text-[10px] text-stone-400 leading-tight">
              Card tradicional com fundo branco e sombra elegante.
            </span>
          </button>

          {/* Opção Círculo */}
          <button
            type="button"
            onClick={() => updateField('frameStyle', 'circle')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              frameStyle === 'circle'
                ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">⚪ Moldura Circular</span>
              {frameStyle === 'circle' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <span className="text-[10px] text-stone-400 leading-tight">
              Fundo redondo com aro fino de destaque.
            </span>
          </button>

          {/* Opção Sutil */}
          <button
            type="button"
            onClick={() => updateField('frameStyle', 'subtle')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              frameStyle === 'subtle'
                ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">▫️ Borda Suave</span>
              {frameStyle === 'subtle' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <span className="text-[10px] text-stone-400 leading-tight">
              Borda fina e minimalista em tom neutro.
            </span>
          </button>
        </div>
      </div>

      {/* 2. TAMANHO E ESCALA DA IMAGEM */}
      <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-extrabold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tamanho e Escala da Imagem</span>
          </label>
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 font-mono font-bold text-xs">
            {size}px
          </span>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="90"
            max="360"
            step="5"
            value={size}
            onChange={(e) => updateField('size', Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>Pequeno (90px)</span>
            <span>Padrão (190px)</span>
            <span>Grande (360px)</span>
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Presets:</span>
          {[
            { label: 'P (120px)', val: 120 },
            { label: 'M (190px)', val: 190 },
            { label: 'G (250px)', val: 250 },
            { label: 'XG (320px)', val: 320 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => updateField('size', preset.val)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                size === preset.val
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTROLE DE MOVIMENTOS & ANIMAÇÃO */}
      <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="font-extrabold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <MoveVertical className="w-3.5 h-3.5 text-amber-400" />
            <span>Movimento & Animação (Sobe e Desce)</span>
          </label>
          <button
            type="button"
            onClick={() => updateField('floatingAnimation', !floatingAnimation)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              floatingAnimation
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>{floatingAnimation ? 'Ativo' : 'Pausado'}</span>
          </button>
        </div>

        {floatingAnimation ? (
          <div className="space-y-3 pt-1">
            {/* Velocidade / Duração */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-300 font-medium">Velocidade da Flutuação:</span>
                <span className="text-amber-400 font-mono font-bold">{animationDuration}s</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="6.0"
                step="0.2"
                value={animationDuration}
                onChange={(e) => updateField('animationDuration', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Rápido (1.2s)</span>
                <span>Natural (3.5s)</span>
                <span>Suave / Zen (6.0s)</span>
              </div>
            </div>

            {/* Amplitude / Distância */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-300 font-medium">Distância do Sobe e Desce:</span>
                <span className="text-amber-400 font-mono font-bold">{animationAmplitude}px</span>
              </div>
              <input
                type="range"
                min="3"
                max="22"
                step="1"
                value={animationAmplitude}
                onChange={(e) => updateField('animationAmplitude', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Sutil (3px)</span>
                <span>Equilibrado (8px)</span>
                <span>Marcante (22px)</span>
              </div>
            </div>

            {/* Efeitos Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-stone-800">
              {/* Respiração / Pulso */}
              <button
                type="button"
                onClick={() => updateField('pulseEffect', !pulseEffect)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  pulseEffect
                    ? 'bg-purple-500/15 border-purple-500 text-white'
                    : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Respiração</span>
                  {pulseEffect && <Check className="w-3 h-3 text-purple-400" />}
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5">Pulsa suavemente</span>
              </button>

              {/* Rotação Leve */}
              <button
                type="button"
                onClick={() => updateField('rotateEffect', !rotateEffect)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  rotateEffect
                    ? 'bg-purple-500/15 border-purple-500 text-white'
                    : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Balanço</span>
                  {rotateEffect && <Check className="w-3 h-3 text-purple-400" />}
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5">Inclina levemente</span>
              </button>

              {/* Sombra de Silhueta */}
              <button
                type="button"
                onClick={() => updateField('shadowGlow', !shadowGlow)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  shadowGlow
                    ? 'bg-purple-500/15 border-purple-500 text-white'
                    : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Sombra Real</span>
                  {shadowGlow && <Check className="w-3 h-3 text-purple-400" />}
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5">Sombra de profundidade</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-stone-400 italic">
            O movimento de flutuação está desativado. A logo ficará fixa no topo.
          </p>
        )}
      </div>

      {/* 4. TROCAR IMAGEM / ATALHO DIRETO */}
      {onOpenMascotUpload && (
        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-purple-200 block text-xs">
                Trocar Imagem do Mascote Principal
              </span>
              <span className="text-[10px] text-purple-400 block">
                Envie um arquivo PNG/WebP com fundo transparente para o melhor resultado solto.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenMascotUpload}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            Gerenciar Mascote
          </button>
        </div>
      )}
    </div>
  );
};
