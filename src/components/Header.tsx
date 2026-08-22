import React from 'react';
import { 
  Sparkles, 
  Dices, 
  Wand2, 
  Palette, 
  Sliders, 
  Download, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  HelpCircle,
  Layers
} from 'lucide-react';
import { AlgorithmType, ArtConfig } from '../types/art';

interface HeaderProps {
  config: ArtConfig;
  onChangeConfig: (newConfig: ArtConfig) => void;
  onRandomize: () => void;
  onMutate: () => void;
  onOpenPresets: () => void;
  onOpenPalette: () => void;
  onOpenExport: () => void;
  onOpenGallery: () => void;
  onOpenAudio: () => void;
  onOpenHelp: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isAudioActive: boolean;
}

const ALGORITHM_LABELS: Record<AlgorithmType, { label: string; shortDesc: string; icon: string }> = {
  flow_field: { label: 'Flow Fields', shortDesc: 'Turbulência & Ruído Curl', icon: '🌊' },
  strange_attractors: { label: 'Strange Attractors', shortDesc: 'Teoria do Caos & Lorenz', icon: '🌀' },
  sacred_geometry: { label: 'Geometria Sagrada', shortDesc: 'Phyllotaxis & Harmonógrafo', icon: '✨' },
  fractal_flame: { label: 'Fractal Flame', shortDesc: 'Iterated Function Systems (IFS)', icon: '🔥' },
  reaction_diffusion: { label: 'Reação-Difusão', shortDesc: 'Morfogênese Turing Gray-Scott', icon: '🦠' },
  voronoi_mesh: { label: 'Voronoi & Delaunay', shortDesc: 'Cristalização & Malha', icon: '💎' },
  fourier_epicycles: { label: 'Harmônicos Fourier', shortDesc: 'Epiciclos & Trapping Orbital', icon: '🪐' }
};

export const Header: React.FC<HeaderProps> = ({
  config,
  onChangeConfig,
  onRandomize,
  onMutate,
  onOpenPresets,
  onOpenPalette,
  onOpenExport,
  onOpenGallery,
  onOpenAudio,
  onOpenHelp,
  onToggleSidebar,
  isSidebarOpen,
  isFullscreen,
  onToggleFullscreen,
  isAudioActive
}) => {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 sticky top-0 text-white select-none">
      {/* Brand & Algorithm Selector */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-100 flex items-center gap-1.5">
              AuraGen <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">STUDIO</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Arte Generativa Abstrata</p>
          </div>
        </div>

        {/* Algorithm Dropdown */}
        <div className="relative">
          <select
            id="algorithm-select"
            value={config.algorithm}
            onChange={(e) => {
              onChangeConfig({
                ...config,
                algorithm: e.target.value as AlgorithmType
              });
            }}
            className="appearance-none bg-zinc-900/90 hover:bg-zinc-850 text-zinc-200 text-xs sm:text-sm font-medium pl-3 pr-8 py-2 rounded-xl border border-zinc-700/60 hover:border-zinc-500 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            {Object.entries(ALGORITHM_LABELS).map(([key, val]) => (
              <option key={key} value={key} className="bg-zinc-900 text-zinc-200">
                {val.icon} {val.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Center Action Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Presets Button */}
        <button
          id="btn-presets"
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/60 transition-all active:scale-95"
          title="Ver Catálogo de Presets"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        {/* Randomize Button */}
        <button
          id="btn-randomize"
          onClick={onRandomize}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-cyan-500/30 hover:border-cyan-400/50 transition-all active:scale-95 shadow-sm"
          title="Gerar Nova Semente Aleatória (Espaço)"
        >
          <Dices className="w-3.5 h-3.5 text-cyan-400 animate-spin-once" />
          <span className="hidden sm:inline">Sortear</span>
        </button>

        {/* Mutate Button */}
        <button
          id="btn-mutate"
          onClick={onMutate}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/60 transition-all active:scale-95"
          title="Mutar Parâmetros Levemente (M)"
        >
          <Wand2 className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Mutar</span>
        </button>

        {/* Color Palette Button */}
        <button
          id="btn-palette"
          onClick={onOpenPalette}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/60 transition-all active:scale-95"
          title="Paletas de Cores & Fundo"
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex -space-x-1 items-center">
            {config.palette.colors.slice(0, 3).map((c, i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: c }} />
            ))}
          </div>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Audio Reactive */}
        <button
          id="btn-audio-reactive"
          onClick={onOpenAudio}
          className={`p-2 rounded-xl border text-xs transition-all active:scale-95 ${
            isAudioActive 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20' 
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700/60'
          }`}
          title="Áudio Reativo & Sintetizador Ambiente"
        >
          {isAudioActive ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Gallery / Saved */}
        <button
          id="btn-gallery"
          onClick={onOpenGallery}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all active:scale-95"
          title="Obras Salvas & Fórmulas"
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
        </button>

        {/* Export High-Res CTA */}
        <button
          id="btn-export-highres"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-450 hover:via-purple-450 hover:to-pink-450 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-all active:scale-95"
          title="Exportar em Alta Resolução (8K, 4K, PNG, SVG)"
        >
          <Download className="w-4 h-4" />
          <span>Exportar <span className="hidden lg:inline">HD</span></span>
        </button>

        {/* Fullscreen */}
        <button
          id="btn-fullscreen"
          onClick={onToggleFullscreen}
          className="hidden sm:flex p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-all active:scale-95"
          title="Tela Cheia"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Shortcuts / Help */}
        <button
          id="btn-help"
          onClick={onOpenHelp}
          className="hidden lg:flex p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-all active:scale-95"
          title="Atalhos & Instruções GitHub"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Toggle Sidebar Controls */}
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl border text-xs transition-all active:scale-95 ${
            isSidebarOpen 
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60'
          }`}
          title="Painel de Controles"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
