import React from 'react';
import { HelpCircle, X, Command, Sparkles, Github, Globe } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Espaço', action: 'Pausar ou Continuar Animação' },
    { key: 'R', action: 'Gerar Nova Semente Aleatória' },
    { key: 'M', action: 'Mutar Parâmetros Levemente (±5%)' },
    { key: 'S', action: 'Captura Rápida em PNG (Snapshot)' },
    { key: 'E', action: 'Abrir Modal de Exportação Ultra HD' },
    { key: 'P', action: 'Catálogo de Presets Mestres' },
    { key: 'C', action: 'Editor de Paletas de Cores' },
    { key: 'F', action: 'Alternar Tela Cheia (Fullscreen)' },
    { key: 'Clique + Arraste', action: 'Interagir com Partículas (Atrair/Repelir/Vórtice)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Guia de Uso & Atalhos</h2>
              <p className="text-xs text-zinc-400">Controles rápidos e informações do estúdio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Shortcuts Grid */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Atalhos de Teclado
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shortcuts.map((sc, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-400">{sc.action}</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono font-bold border border-zinc-700">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Algorithms summary */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2 text-xs leading-relaxed text-zinc-400">
            <h4 className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Algoritmos Matemáticos Integrados
            </h4>
            <p>
              O <strong className="text-zinc-200">AuraGen</strong> inclui motores de cálculo dedicados para:
              <strong className="text-zinc-300"> Curl & Perlin Flow Fields</strong>,
              <strong className="text-zinc-300"> Clifford, Lorenz & De Jong Strange Attractors</strong>,
              <strong className="text-zinc-300"> Phyllotaxis & Harmonógrafos</strong>,
              <strong className="text-zinc-300"> Fractal Flames IFS</strong>,
              <strong className="text-zinc-300"> Morfogênese Turing Reaction-Diffusion</strong>,
              <strong className="text-zinc-300"> Cristalização Voronoi / Delaunay</strong> e
              <strong className="text-zinc-300"> Harmônicos Orbitais de Fourier</strong>.
            </p>
          </div>

          {/* GitHub Pages Readiness */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 text-xs text-zinc-400">
            <h4 className="text-indigo-300 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Compatibilidade com GitHub Pages & Mobile
            </h4>
            <p>
              O projeto possui caminhos de asset relativos (`base: './'`), pipeline de exportação estática (`npm run build`) e design 100% responsivo para mobile, tablets e desktops de alta densidade (retina).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
