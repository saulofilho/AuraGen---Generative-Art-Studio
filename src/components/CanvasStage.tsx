import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  MousePointer, 
  Magnet, 
  Wind, 
  Move, 
  Radio,
  Gauge
} from 'lucide-react';
import { ArtConfig, AspectRatio, CanvasPointerEvent } from '../types/art';
import { FlowFieldRenderer } from '../algorithms/flowField';
import { StrangeAttractorRenderer } from '../algorithms/strangeAttractor';
import { SacredGeometryRenderer } from '../algorithms/sacredGeometry';
import { FractalFlameRenderer } from '../algorithms/fractalFlame';
import { ReactionDiffusionRenderer } from '../algorithms/reactionDiffusion';
import { VoronoiRenderer } from '../algorithms/voronoiMesh';
import { FourierEpicyclesRenderer } from '../algorithms/fourierEpicycles';
import { AudioEngine } from '../utils/audioReactive';
import { downloadFile } from '../utils/exportHighRes';

interface CanvasStageProps {
  config: ArtConfig;
  onChangeConfig: (newConfig: ArtConfig) => void;
  audioEngine: AudioEngine;
  onQuickSave: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  config,
  onChangeConfig,
  audioEngine,
  onQuickSave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(60);
  const [pointerMode, setPointerMode] = useState<'attract' | 'repel' | 'swirl' | 'none'>('attract');
  const [time, setTime] = useState(0);

  // Persistent algorithm renderer instances
  const flowFieldRenderer = useRef(new FlowFieldRenderer());
  const strangeAttractorRenderer = useRef(new StrangeAttractorRenderer());
  const sacredGeometryRenderer = useRef(new SacredGeometryRenderer());
  const fractalFlameRenderer = useRef(new FractalFlameRenderer());
  const reactionDiffusionRenderer = useRef(new ReactionDiffusionRenderer());
  const voronoiRenderer = useRef(new VoronoiRenderer());
  const fourierRenderer = useRef(new FourierEpicyclesRenderer());

  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  const pointerState = useRef<CanvasPointerEvent>({
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
    isDown: false,
    mode: pointerMode
  });

  // Keep pointer mode ref in sync
  useEffect(() => {
    pointerState.current.mode = pointerMode;
  }, [pointerMode]);

  // Handle canvas sizing according to container and aspect ratio
  const updateCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const contWidth = container.clientWidth;
    const contHeight = container.clientHeight;

    let targetWidth = contWidth;
    let targetHeight = contHeight;

    const ratio = config.aspectRatio;
    if (ratio === '1:1') {
      const minDim = Math.min(contWidth, contHeight) - 32;
      targetWidth = Math.max(300, minDim);
      targetHeight = Math.max(300, minDim);
    } else if (ratio === '16:9') {
      const availW = contWidth - 32;
      const availH = contHeight - 32;
      if (availW / (16 / 9) <= availH) {
        targetWidth = availW;
        targetHeight = availW / (16 / 9);
      } else {
        targetHeight = availH;
        targetWidth = availH * (16 / 9);
      }
    } else if (ratio === '9:16') {
      const availW = contWidth - 32;
      const availH = contHeight - 32;
      if (availH * (9 / 16) <= availW) {
        targetHeight = availH;
        targetWidth = availH * (9 / 16);
      } else {
        targetWidth = availW;
        targetHeight = availW / (9 / 16);
      }
    } else if (ratio === '4:3') {
      const availW = contWidth - 32;
      const availH = contHeight - 32;
      if (availW / (4 / 3) <= availH) {
        targetWidth = availW;
        targetHeight = availW / (4 / 3);
      } else {
        targetHeight = availH;
        targetWidth = availH * (4 / 3);
      }
    } else if (ratio === '3:4') {
      const availW = contWidth - 32;
      const availH = contHeight - 32;
      if (availH * (3 / 4) <= availW) {
        targetHeight = availH;
        targetWidth = availH * (3 / 4);
      } else {
        targetWidth = availW;
        targetHeight = availW / (3 / 4);
      }
    } else if (ratio === '21:9') {
      const availW = contWidth - 32;
      const availH = contHeight - 32;
      if (availW / (21 / 9) <= availH) {
        targetWidth = availW;
        targetHeight = availW / (21 / 9);
      } else {
        targetHeight = availH;
        targetWidth = availH * (21 / 9);
      }
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(targetWidth * dpr);
    canvas.height = Math.floor(targetHeight * dpr);
    canvas.style.width = `${Math.floor(targetWidth)}px`;
    canvas.style.height = `${Math.floor(targetHeight)}px`;

    // Reinitialize algorithm renderers with new dimensions
    flowFieldRenderer.current.init(canvas.width, canvas.height, config);
    strangeAttractorRenderer.current.init(canvas.width, canvas.height);
    fractalFlameRenderer.current.init(canvas.width, canvas.height);
    reactionDiffusionRenderer.current.init(canvas.width, canvas.height, config);
    voronoiRenderer.current.init(canvas.width, canvas.height, config);
    fourierRenderer.current.reset();
  }, [config]);

  // ResizeObserver on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [updateCanvasDimensions]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let localTime = time;

    const renderLoop = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // FPS tracking
      frameCountRef.current++;
      if (now - lastFpsUpdateRef.current >= 600) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      if (isPlaying) {
        localTime += delta;
        setTime(localTime);
      }

      const audioEnergy = audioEngine.getEnergy();

      // Algorithm dispatch
      const { algorithm } = config;

      if (algorithm === 'flow_field') {
        flowFieldRenderer.current.step(ctx, config, localTime, pointerState.current, audioEnergy);
      } else if (algorithm === 'strange_attractors') {
        strangeAttractorRenderer.current.render(ctx, config, localTime);
      } else if (algorithm === 'sacred_geometry') {
        sacredGeometryRenderer.current.render(ctx, config, localTime);
      } else if (algorithm === 'fractal_flame') {
        fractalFlameRenderer.current.render(ctx, config, localTime);
      } else if (algorithm === 'reaction_diffusion') {
        reactionDiffusionRenderer.current.step(ctx, config, pointerState.current);
      } else if (algorithm === 'voronoi_mesh') {
        voronoiRenderer.current.render(ctx, config, localTime, pointerState.current);
      } else if (algorithm === 'fourier_epicycles') {
        fourierRenderer.current.render(ctx, config, localTime);
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [config, isPlaying, audioEngine, time]);

  // Reset algorithm state (e.g. on seed change or clear)
  const handleResetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!config.transparentBackground) {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    flowFieldRenderer.current.init(canvas.width, canvas.height, config);
    reactionDiffusionRenderer.current.resetGrid(config);
    voronoiRenderer.current.init(canvas.width, canvas.height, config);
    fourierRenderer.current.reset();
    setTime(0);
  };

  // Instant Snapshot Download
  const handleQuickSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    downloadFile(dataUrl, `auragen-${config.algorithm}-${Date.now()}.png`);
  };

  // Pointer event handlers with coordinate normalization
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    pointerState.current = {
      x,
      y,
      normalizedX: x / canvas.width,
      normalizedY: y / canvas.height,
      isDown: true,
      mode: pointerMode
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    pointerState.current.x = x;
    pointerState.current.y = y;
    pointerState.current.normalizedX = x / canvas.width;
    pointerState.current.normalizedY = y / canvas.height;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
    pointerState.current.isDown = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative flex-1 w-full h-full flex items-center justify-center bg-[#07070b] overflow-hidden p-2 sm:p-4 select-none"
    >
      {/* Background Subtle Ambient Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${config.palette.colors[0] || '#4f46e5'} 0%, transparent 65%)`
        }}
      />

      {/* Main Canvas Element with Smooth Shadow & Border */}
      <div className="relative z-10 flex items-center justify-center max-w-full max-h-full">
        <canvas
          id="main-generative-canvas"
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="rounded-2xl shadow-2xl shadow-black/80 border border-zinc-800/80 cursor-crosshair touch-none transition-shadow duration-300 hover:border-zinc-700"
        />
      </div>

      {/* Floating Canvas HUD - Top Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/70 text-xs text-zinc-300 font-mono shadow-lg">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Gauge className="w-3.5 h-3.5" />
          <span>{fps} FPS</span>
        </div>
        <span className="text-zinc-700">|</span>
        <span className="text-zinc-400 text-[11px]">Seed: #{config.seed}</span>
        <span className="text-zinc-700 hidden sm:inline">|</span>
        <span className="text-zinc-400 text-[11px] hidden sm:inline">{config.aspectRatio}</span>
      </div>

      {/* Floating Canvas HUD - Top Right Aspect Ratio Selector */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md p-1 rounded-xl border border-zinc-800/70 shadow-lg">
        {(['1:1', '16:9', '9:16', '4:3', '21:9'] as AspectRatio[]).map((ratio) => (
          <button
            key={ratio}
            onClick={() => onChangeConfig({ ...config, aspectRatio: ratio })}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
              config.aspectRatio === ratio
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* Floating Bottom Canvas Controls Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-zinc-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-800/80 shadow-2xl text-white">
        {/* Play/Pause Button */}
        <button
          id="btn-play-pause"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 transition-all active:scale-95"
          title={isPlaying ? 'Pausar Animação' : 'Continuar Animação'}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Clear / Reset Stage */}
        <button
          id="btn-reset-canvas"
          onClick={handleResetCanvas}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all active:scale-95"
          title="Limpar e Reiniciar Canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        {/* Pointer Mode: Attract */}
        <button
          id="btn-mode-attract"
          onClick={() => setPointerMode('attract')}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            pointerMode === 'attract'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700/60'
          }`}
          title="Interação do Cursor: Atrair"
        >
          <Magnet className="w-4 h-4" />
        </button>

        {/* Pointer Mode: Repel */}
        <button
          id="btn-mode-repel"
          onClick={() => setPointerMode('repel')}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            pointerMode === 'repel'
              ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm shadow-pink-500/20'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700/60'
          }`}
          title="Interação do Cursor: Repelir"
        >
          <Wind className="w-4 h-4" />
        </button>

        {/* Pointer Mode: Swirl Vortex */}
        <button
          id="btn-mode-swirl"
          onClick={() => setPointerMode('swirl')}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            pointerMode === 'swirl'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/20'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700/60'
          }`}
          title="Interação do Cursor: Vórtice / Redemoinho"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        {/* Quick Snapshot PNG */}
        <button
          id="btn-quick-snapshot"
          onClick={handleQuickSnapshot}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 text-xs font-medium transition-all active:scale-95"
          title="Captura Rápida Instantânea (S)"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Captura</span>
        </button>

        {/* Save to Local Favorites */}
        <button
          id="btn-save-favorite"
          onClick={onQuickSave}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-zinc-700/60 text-xs font-medium transition-all active:scale-95"
          title="Salvar Obra na Galeria"
        >
          <span className="text-amber-400">★</span>
          <span className="hidden sm:inline">Salvar</span>
        </button>
      </div>
    </div>
  );
};
