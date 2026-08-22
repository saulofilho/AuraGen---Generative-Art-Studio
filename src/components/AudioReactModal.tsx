import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, Music, X, Activity } from 'lucide-react';
import { AudioEngine } from '../utils/audioReactive';

interface AudioReactModalProps {
  audioEngine: AudioEngine;
  isOpen: boolean;
  onClose: () => void;
  onStateChange: () => void;
}

export const AudioReactModal: React.FC<AudioReactModalProps> = ({
  audioEngine,
  isOpen,
  onClose,
  onStateChange
}) => {
  const [currentEnergy, setCurrentEnergy] = useState(0);
  const status = audioEngine.getStatus();

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentEnergy(audioEngine.getEnergy());
    }, 60);
    return () => clearInterval(interval);
  }, [isOpen, audioEngine]);

  if (!isOpen) return null;

  const handleStartSynth = () => {
    audioEngine.startProceduralSynth();
    onStateChange();
  };

  const handleStartMic = async () => {
    await audioEngine.startMic();
    onStateChange();
  };

  const handleStop = () => {
    audioEngine.stop();
    onStateChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Modulação Reativa por Áudio</h2>
              <p className="text-xs text-zinc-400">Harmonize as curvas visuais com música e frequências sonoras</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Energy Visualizer Bar */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Energia da Frequência em Tempo Real</span>
              <span className="text-emerald-400 font-mono font-bold">{(currentEnergy * 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-800 overflow-hidden flex items-center p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-300 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(4, currentEnergy * 100))}%` }}
              />
            </div>
          </div>

          {/* Mode Option 1: Procedural Synth */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Sintetizador Ambiente Generativo</h4>
                <p className="text-[11px] text-zinc-400">Toca acordes calmos pentatônicos procedurais</p>
              </div>
            </div>

            <button
              onClick={status.isSynthActive ? handleStop : handleStartSynth}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                status.isSynthActive
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              {status.isSynthActive ? 'Ativo' : 'Iniciar'}
            </button>
          </div>

          {/* Mode Option 2: Microphone */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Entrada do Microfone</h4>
                <p className="text-[11px] text-zinc-400">Reage à sua voz, palmas ou música ambiente</p>
              </div>
            </div>

            <button
              onClick={status.isMicActive ? handleStop : handleStartMic}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                status.isMicActive
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              {status.isMicActive ? 'Ativo' : 'Conectar'}
            </button>
          </div>

          {/* Turn off button if any active */}
          {(status.isMicActive || status.isSynthActive) && (
            <button
              onClick={handleStop}
              className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
            >
              Desativar Reatividade por Áudio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
