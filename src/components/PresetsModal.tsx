import React, { useState } from 'react';
import { Layers, X, Sparkles, ArrowRight, Check } from 'lucide-react';
import { ArtConfig, PresetRecipe } from '../types/art';
import { MASTER_PRESETS, DEFAULT_CONFIG } from '../utils/presets';

interface PresetsModalProps {
  config: ArtConfig;
  onApplyPreset: (recipe: PresetRecipe) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  config,
  onApplyPreset,
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(MASTER_PRESETS.map(p => p.category)))];

  const filteredPresets = selectedCategory === 'All'
    ? MASTER_PRESETS
    : MASTER_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Catálogo de Presets Mestres</h2>
              <p className="text-xs text-zinc-400">Obras generativas pré-configuradas com fórmulas matemáticas otimizadas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
          {filteredPresets.map((preset) => {
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onApplyPreset(preset);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/60 hover:bg-zinc-900/90 transition-all cursor-pointer group flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                {/* Visual Gradient Banner */}
                <div className={`h-24 w-full rounded-xl bg-gradient-to-tr ${preset.thumbnailGradient} mb-3 shadow-inner flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <Sparkles className="w-6 h-6 text-white/70 group-hover:scale-125 transition-transform" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors">
                      {preset.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                  <span>Carregar Obra</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
