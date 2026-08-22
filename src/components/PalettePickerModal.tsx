import React from 'react';
import { Palette, X, Plus, Trash2, Check } from 'lucide-react';
import { ArtConfig, ColorPalette } from '../types/art';
import { CURATED_PALETTES, BACKGROUND_PRESETS } from '../utils/palettes';

interface PalettePickerModalProps {
  config: ArtConfig;
  onChangeConfig: (newConfig: ArtConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PalettePickerModal: React.FC<PalettePickerModalProps> = ({
  config,
  onChangeConfig,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleSelectPalette = (palette: ColorPalette) => {
    onChangeConfig({
      ...config,
      palette,
      backgroundColor: palette.background
    });
  };

  const handleColorChange = (index: number, newColor: string) => {
    const updatedColors = [...config.palette.colors];
    updatedColors[index] = newColor;
    onChangeConfig({
      ...config,
      palette: {
        ...config.palette,
        id: 'custom',
        name: 'Personalizada',
        colors: updatedColors
      }
    });
  };

  const handleAddColor = () => {
    if (config.palette.colors.length >= 8) return;
    onChangeConfig({
      ...config,
      palette: {
        ...config.palette,
        id: 'custom',
        name: 'Personalizada',
        colors: [...config.palette.colors, '#ffffff']
      }
    });
  };

  const handleRemoveColor = (index: number) => {
    if (config.palette.colors.length <= 2) return;
    const updatedColors = config.palette.colors.filter((_, i) => i !== index);
    onChangeConfig({
      ...config,
      palette: {
        ...config.palette,
        id: 'custom',
        name: 'Personalizada',
        colors: updatedColors
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Palette className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Paletas de Cores & Harmonias</h2>
              <p className="text-xs text-zinc-400">Selecione harmonias consagradas ou crie um gradiente customizado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Active Palette Custom Editor */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Cores do Gradiente ({config.palette.colors.length} amostras)
              </span>
              <button
                onClick={handleAddColor}
                disabled={config.palette.colors.length >= 8}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Cor</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {config.palette.colors.map((color, index) => (
                <div key={index} className="relative group flex items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700 shadow-sm"
                  />
                  {config.palette.colors.length > 2 && (
                    <button
                      onClick={() => handleRemoveColor(index)}
                      className="absolute -top-1 -right-1 bg-red-600/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Visual gradient preview bar */}
            <div className="h-6 rounded-lg flex overflow-hidden border border-zinc-700/60 mt-2">
              {config.palette.colors.map((hex, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>

          {/* Curated Presets Grid */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Paletas Selecionadas da Coleção
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURATED_PALETTES.map((pal) => {
                const isSelected = config.palette.id === pal.id;
                return (
                  <button
                    key={pal.id}
                    onClick={() => handleSelectPalette(pal)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-zinc-850 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-zinc-200">{pal.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>

                    <div className="h-6 rounded-lg flex overflow-hidden border border-zinc-800 shadow-inner">
                      {pal.colors.map((hex, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Preset Colors */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Fundo Sugerido
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BACKGROUND_PRESETS.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => onChangeConfig({ ...config, backgroundColor: bg.value })}
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-zinc-600"
                    style={{ backgroundColor: bg.value }}
                  />
                  <span className="truncate">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-950">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            Aplicar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
