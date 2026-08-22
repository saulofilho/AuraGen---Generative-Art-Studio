import React from 'react';
import { Bookmark, X, Trash2, ArrowRight, Upload, Download, Sparkles } from 'lucide-react';
import { ArtConfig, SavedArtwork } from '../types/art';
import { downloadFile } from '../utils/exportHighRes';

interface GalleryModalProps {
  savedArtworks: SavedArtwork[];
  onLoadArtwork: (config: ArtConfig) => void;
  onDeleteArtwork: (id: string) => void;
  onImportRecipe: (config: ArtConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  savedArtworks,
  onLoadArtwork,
  onDeleteArtwork,
  onImportRecipe,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.algorithm && json.palette) {
          onImportRecipe(json);
          onClose();
        } else {
          alert('Arquivo de fórmula inválido.');
        }
      } catch {
        alert('Erro ao carregar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Galeria de Obras Salvas</h2>
              <p className="text-xs text-zinc-400">Suas criações persistidas localmente e fórmulas importáveis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium cursor-pointer text-zinc-300 hover:text-white transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Importar JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {savedArtworks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Nenhuma obra salva ainda</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Clique no botão "★ Salvar" na barra inferior do canvas para armazenar suas fórmulas favoritas aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedArtworks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 overflow-hidden flex flex-col justify-between group shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={item.thumbnailDataUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between">
                      <button
                        onClick={() => {
                          onLoadArtwork(item.config);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1 shadow-md"
                      >
                        <span>Carregar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteArtwork(item.id)}
                        className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{item.name}</h4>
                      <span className="text-[10px] text-zinc-500">{item.date}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                      <span className="capitalize">{item.config.algorithm.replace('_', ' ')}</span>
                      <span className="font-mono">#{item.config.seed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
