import React, { useState, useEffect, useRef } from 'react';
import { ArtConfig, SavedArtwork, PresetRecipe } from './types/art';
import { DEFAULT_CONFIG } from './utils/presets';
import { CURATED_PALETTES } from './utils/palettes';
import { AudioEngine } from './utils/audioReactive';
import { Header } from './components/Header';
import { CanvasStage } from './components/CanvasStage';
import { ControlsPanel } from './components/ControlsPanel';
import { PalettePickerModal } from './components/PalettePickerModal';
import { PresetsModal } from './components/PresetsModal';
import { ExportModal } from './components/ExportModal';
import { GalleryModal } from './components/GalleryModal';
import { AudioReactModal } from './components/AudioReactModal';
import { ShortcutsModal } from './components/ShortcutsModal';

export default function App() {
  const [config, setConfig] = useState<ArtConfig>(() => {
    const saved = localStorage.getItem('auragen_current_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CONFIG;
  });

  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>(() => {
    const saved = localStorage.getItem('auragen_gallery');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioActiveKey, setAudioActiveKey] = useState(0);

  // Audio Engine singleton
  const audioEngine = useRef(new AudioEngine());

  // Save current config to localStorage
  useEffect(() => {
    localStorage.setItem('auragen_current_config', JSON.stringify(config));
  }, [config]);

  // Save gallery to localStorage
  useEffect(() => {
    localStorage.setItem('auragen_gallery', JSON.stringify(savedArtworks));
  }, [savedArtworks]);

  // Fullscreen state listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const playBtn = document.getElementById('btn-play-pause');
        playBtn?.click();
      } else if (key === 'r') {
        e.preventDefault();
        handleRandomize();
      } else if (key === 'm') {
        e.preventDefault();
        handleMutate();
      } else if (key === 's') {
        e.preventDefault();
        const snapBtn = document.getElementById('btn-quick-snapshot');
        snapBtn?.click();
      } else if (key === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (key === 'p') {
        e.preventDefault();
        setIsPresetsOpen(prev => !prev);
      } else if (key === 'c') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      } else if (key === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);

  // Randomize generator
  const handleRandomize = () => {
    const newSeed = Math.floor(Math.random() * 999999);
    const randomPalette = CURATED_PALETTES[Math.floor(Math.random() * CURATED_PALETTES.length)];
    
    setConfig(prev => ({
      ...prev,
      seed: newSeed,
      palette: randomPalette,
      backgroundColor: randomPalette.background,
      flowField: {
        ...prev.flowField,
        noiseScale: 1.5 + Math.random() * 6,
        curlStrength: 0.5 + Math.random() * 2.5,
        speed: 1.0 + Math.random() * 3.5,
      },
      strangeAttractor: {
        ...prev.strangeAttractor,
        a: Number((-2.5 + Math.random() * 5).toFixed(2)),
        b: Number((-2.5 + Math.random() * 5).toFixed(2)),
        c: Number((-2.5 + Math.random() * 5).toFixed(2)),
        d: Number((-2.5 + Math.random() * 5).toFixed(2)),
        exposure: Number((0.8 + Math.random() * 1.5).toFixed(2)),
        rotationY: Math.floor(Math.random() * 360)
      },
      sacredGeometry: {
        ...prev.sacredGeometry,
        waveModulation: Number((Math.random() * 3.5).toFixed(1)),
        rotationalSymmetry: [3, 4, 5, 6, 8, 12][Math.floor(Math.random() * 6)]
      },
      fractalFlame: {
        ...prev.fractalFlame,
        vibrancy: Number((0.8 + Math.random() * 1.2).toFixed(2)),
        symmetry: Math.floor(1 + Math.random() * 6)
      },
      voronoi: {
        ...prev.voronoi,
        cellCount: Math.floor(25 + Math.random() * 60),
        warpDistortion: Number((Math.random() * 2.0).toFixed(1))
      }
    }));
  };

  // Mutate gently (±5%)
  const handleMutate = () => {
    const jitter = (val: number, range: number) => val + (Math.random() * 2 - 1) * range;

    setConfig(prev => ({
      ...prev,
      flowField: {
        ...prev.flowField,
        noiseScale: Math.max(0.5, jitter(prev.flowField.noiseScale, 0.4)),
        curlStrength: Math.max(0.2, jitter(prev.flowField.curlStrength, 0.2)),
        speed: Math.max(0.5, jitter(prev.flowField.speed, 0.3)),
      },
      strangeAttractor: {
        ...prev.strangeAttractor,
        a: jitter(prev.strangeAttractor.a, 0.1),
        b: jitter(prev.strangeAttractor.b, 0.1),
        c: jitter(prev.strangeAttractor.c, 0.1),
        d: jitter(prev.strangeAttractor.d, 0.1),
      },
      sacredGeometry: {
        ...prev.sacredGeometry,
        goldenAngleMod: jitter(prev.sacredGeometry.goldenAngleMod, 0.2),
        waveModulation: Math.max(0, jitter(prev.sacredGeometry.waveModulation, 0.3)),
      },
      fractalFlame: {
        ...prev.fractalFlame,
        gamma: Math.max(1.0, jitter(prev.fractalFlame.gamma, 0.15)),
        vibrancy: Math.max(0.5, jitter(prev.fractalFlame.vibrancy, 0.15)),
      },
      voronoi: {
        ...prev.voronoi,
        warpDistortion: Math.max(0, jitter(prev.voronoi.warpDistortion, 0.2))
      }
    }));
  };

  // Quick save to gallery
  const handleQuickSave = () => {
    const canvas = document.getElementById('main-generative-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Create thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 240;
    thumbCanvas.height = 240;
    const thumbCtx = thumbCanvas.getContext('2d');
    if (thumbCtx) {
      thumbCtx.drawImage(canvas, 0, 0, 240, 240);
    }
    const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);

    const newSaved: SavedArtwork = {
      id: `art_${Date.now()}`,
      name: `${config.palette.name} - ${config.algorithm.replace('_', ' ')}`,
      date: new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      thumbnailDataUrl,
      config: JSON.parse(JSON.stringify(config))
    };

    setSavedArtworks(prev => [newSaved, ...prev]);
    setIsGalleryOpen(true);
  };

  // Apply preset
  const handleApplyPreset = (recipe: PresetRecipe) => {
    setConfig(prev => ({
      ...prev,
      ...recipe.config,
      palette: recipe.config.palette || prev.palette,
      backgroundColor: recipe.config.backgroundColor || prev.backgroundColor,
      algorithm: recipe.config.algorithm || prev.algorithm
    }));
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isAudioActive = audioEngine.current.getStatus().isMicActive || audioEngine.current.getStatus().isSynthActive;

  return (
    <div className="flex flex-col w-screen h-screen bg-[#07070B] overflow-hidden text-white select-none font-sans">
      {/* Top Application Header */}
      <Header
        config={config}
        onChangeConfig={setConfig}
        onRandomize={handleRandomize}
        onMutate={handleMutate}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenAudio={() => setIsAudioOpen(true)}
        onOpenHelp={() => setIsShortcutsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isAudioActive={isAudioActive}
      />

      {/* Main Canvas Workspace with Live Rendering */}
      <main className="flex-1 flex relative overflow-hidden">
        <CanvasStage
          config={config}
          onChangeConfig={setConfig}
          audioEngine={audioEngine.current}
          onQuickSave={handleQuickSave}
        />

        {/* Sidebar Controls */}
        <ControlsPanel
          config={config}
          onChangeConfig={setConfig}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </main>

      {/* Modals & Dialogs */}
      <PalettePickerModal
        config={config}
        onChangeConfig={setConfig}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      <PresetsModal
        config={config}
        onApplyPreset={handleApplyPreset}
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
      />

      <ExportModal
        config={config}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <GalleryModal
        savedArtworks={savedArtworks}
        onLoadArtwork={(loadedConfig) => setConfig(loadedConfig)}
        onDeleteArtwork={(id) => setSavedArtworks(prev => prev.filter(a => a.id !== id))}
        onImportRecipe={(importedConfig) => setConfig(importedConfig)}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      <AudioReactModal
        audioEngine={audioEngine.current}
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        onStateChange={() => setAudioActiveKey(k => k + 1)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
