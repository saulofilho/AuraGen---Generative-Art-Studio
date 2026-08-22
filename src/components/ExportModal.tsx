import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  FileCode, 
  Check, 
  Loader2, 
  Smartphone, 
  Monitor, 
  Square, 
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ArtConfig, ExportOptions } from '../types/art';
import { renderHighResArtwork, generateSVGArtwork, downloadFile } from '../utils/exportHighRes';

interface ExportModalProps {
  config: ArtConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  config,
  isOpen,
  onClose
}) => {
  const [resolutionTier, setResolutionTier] = useState<'1x' | '2k' | '4k' | '8k' | 'custom'>('4k');
  const [wallpaperPreset, setWallpaperPreset] = useState<'square' | 'mobile' | 'desktop' | 'poster'>('square');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg' | 'json'>('png');
  const [quality, setQuality] = useState(0.95);
  const [customWidth, setCustomWidth] = useState(3840);
  const [customHeight, setCustomHeight] = useState(3840);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('AuraGen Generative Studio');

  const [isExporting, setIsExporting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  if (!isOpen) return null;

  // Compute final dimensions
  const getDimensions = (): { width: number; height: number } => {
    if (resolutionTier === 'custom') {
      return { width: customWidth, height: customHeight };
    }

    let baseScale = 1;
    if (resolutionTier === '1x') baseScale = 1200;
    else if (resolutionTier === '2k') baseScale = 2048;
    else if (resolutionTier === '4k') baseScale = 3840;
    else if (resolutionTier === '8k') baseScale = 7680;

    if (wallpaperPreset === 'square') {
      return { width: baseScale, height: baseScale };
    } else if (wallpaperPreset === 'mobile') {
      // 9:16
      const w = Math.round(baseScale * (9 / 16));
      return { width: w, height: baseScale };
    } else if (wallpaperPreset === 'desktop') {
      // 16:9
      const h = Math.round(baseScale * (9 / 16));
      return { width: baseScale, height: h };
    } else if (wallpaperPreset === 'poster') {
      // 3:4
      const w = Math.round(baseScale * (3 / 4));
      return { width: w, height: baseScale };
    }

    return { width: baseScale, height: baseScale };
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgressPercent(5);
    setProgressStatus('Iniciando pipeline de exportação...');

    const { width, height } = getDimensions();
    const timestamp = Date.now();
    const filename = `auragen-${config.algorithm}-${width}x${height}-${timestamp}`;

    try {
      if (format === 'json') {
        // Export Recipe JSON
        const jsonStr = JSON.stringify(config, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        downloadFile(url, `${filename}.json`);
        URL.revokeObjectURL(url);
      } else if (format === 'svg') {
        // Export SVG Vector
        const svgStr = generateSVGArtwork(config, width, height);
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        downloadFile(url, `${filename}.svg`);
        URL.revokeObjectURL(url);
      } else {
        // High-Res Raster (PNG, JPEG, WebP)
        const options: ExportOptions = {
          width,
          height,
          format,
          quality,
          scaleFactor: resolutionTier === '8k' ? 8 : resolutionTier === '4k' ? 4 : 2,
          includeWatermark,
          watermarkText,
          presetName: config.name
        };

        const dataUrl = await renderHighResArtwork(
          config,
          options,
          (pct, status) => {
            setProgressPercent(pct);
            setProgressStatus(status);
          }
        );

        downloadFile(dataUrl, `${filename}.${format}`);
      }

      // Celebrate success!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: config.palette.colors
      });

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Erro na exportação:', err);
      alert('Houve um erro ao renderizar em alta resolução: ' + (err as Error).message);
      setIsExporting(false);
    }
  };

  const currentDims = getDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Exportação em Ultra Alta Resolução</h2>
              <p className="text-xs text-zinc-400">Renderize imagens nítidas para wallpapers, impressões ou vetores</p>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Resolution Tier Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Resolução Master
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: '1x', label: '1K HD', desc: '1200px (Web)' },
                { id: '2k', label: '2K QHD', desc: '2048px (Tablet)' },
                { id: '4k', label: '4K Ultra', desc: '3840px (Pro)', badge: 'Recomendado' },
                { id: '8k', label: '8K Cinema', desc: '7680px (Fine Art)', badge: 'Ultra HD' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setResolutionTier(tier.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    resolutionTier === tier.id
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {tier.badge}
                    </span>
                  )}
                  <div className="text-sm font-bold text-zinc-100">{tier.label}</div>
                  <div className="text-[11px] text-zinc-400">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Wallpaper / Ratio Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Formato & Proporção de Tela
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'square', label: '1:1 Quadrado', icon: Square, desc: 'Instagram / Arte' },
                { id: 'desktop', label: '16:9 Desktop', icon: Monitor, desc: 'Monitor 4K' },
                { id: 'mobile', label: '9:16 Celular', icon: Smartphone, desc: 'Story & Lockscreen' },
                { id: 'poster', label: '3:4 Pôster', icon: Printer, desc: 'Impressão 300 DPI' },
              ].map((wp) => {
                const Icon = wp.icon;
                const isSel = wallpaperPreset === wp.id;
                return (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaperPreset(wp.id as any)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                      isSel
                        ? 'bg-zinc-850 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-200">{wp.label}</div>
                      <div className="text-[10px] text-zinc-400">{wp.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Formato do Arquivo
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'png', label: 'PNG (Lossless & Alpha)' },
                { id: 'jpeg', label: 'JPEG (Compacto)' },
                { id: 'webp', label: 'WebP (Moderno)' },
                { id: 'svg', label: 'SVG (Vetor Escalável)' },
                { id: 'json', label: 'JSON (Fórmula da Obra)' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    format === fmt.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Final Dimensions Summary Card */}
          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Dimensões Finais Calculadas:</span>
            <span className="text-cyan-400 font-bold">{currentDims.width} × {currentDims.height} px</span>
          </div>

          {/* Progress Bar (Visible while exporting) */}
          {isExporting && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-purple-500/40 space-y-2 shadow-xl animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  {progressStatus}
                </span>
                <span className="text-purple-400 font-mono font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-medium disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            id="btn-confirm-export"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-450 hover:via-purple-450 hover:to-pink-450 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar Imagem ({currentDims.width}x{currentDims.height})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
