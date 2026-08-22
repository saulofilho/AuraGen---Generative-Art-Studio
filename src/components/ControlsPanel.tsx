import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Layers, 
  RotateCw, 
  Zap, 
  Eye, 
  Flame, 
  Activity, 
  Grid, 
  Disc,
  X,
  Shuffle
} from 'lucide-react';
import { ArtConfig, AlgorithmType } from '../types/art';

interface ControlsPanelProps {
  config: ArtConfig;
  onChangeConfig: (newConfig: ArtConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  config,
  onChangeConfig,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'colors' | 'scene'>('params');

  if (!isOpen) return null;

  const updateConfig = (updater: (prev: ArtConfig) => ArtConfig) => {
    onChangeConfig(updater(config));
  };

  const handleSeedChange = (newSeed: number) => {
    updateConfig(c => ({ ...c, seed: newSeed }));
  };

  const { algorithm } = config;

  return (
    <aside className="w-full sm:w-96 md:w-[420px] h-[calc(100vh-64px)] border-l border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl flex flex-col z-20 text-white select-none overflow-hidden fixed right-0 top-16 shadow-2xl transition-all">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-100">Estúdio de Parâmetros</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/80 p-1 bg-zinc-900/40">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'params'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Algoritmo
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'colors'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Cores & Render
        </button>
        <button
          onClick={() => setActiveTab('scene')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'scene'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Semente & Cena
        </button>
      </div>

      {/* Scrollable Parameters Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {activeTab === 'params' && (
          <>
            {/* FLOW FIELD PARAMS */}
            {algorithm === 'flow_field' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Tipo de Campo Vetorial</span>
                  <select
                    value={config.flowField.noiseType}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, noiseType: e.target.value as any }
                    }))}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="curl">Curl Noise (Turbulência)</option>
                    <option value="perlin">Perlin Noise Multi-Oitavas</option>
                    <option value="simplex">Simplex 3D Temporal</option>
                    <option value="vortex">Vórtice Espiral</option>
                  </select>
                </div>

                {/* Particle Count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Densidade de Partículas</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.particleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="4000"
                    step="100"
                    value={config.flowField.particleCount}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, particleCount: Number(e.target.value) }
                    }))}
                    className="w-full accent-cyan-500 bg-zinc-800"
                  />
                </div>

                {/* Noise Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Escala de Frequência do Ruído</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.noiseScale.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={config.flowField.noiseScale}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, noiseScale: Number(e.target.value) }
                    }))}
                    className="w-full accent-cyan-500 bg-zinc-800"
                  />
                </div>

                {/* Curl Strength */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Força de Curvatura (Curl)</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.curlStrength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.05"
                    value={config.flowField.curlStrength}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, curlStrength: Number(e.target.value) }
                    }))}
                    className="w-full accent-cyan-500 bg-zinc-800"
                  />
                </div>

                {/* Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Velocidade de Fluxo</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={config.flowField.speed}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, speed: Number(e.target.value) }
                    }))}
                    className="w-full accent-cyan-500 bg-zinc-800"
                  />
                </div>

                {/* Line Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Espessura do Traço</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.lineWidth.toFixed(1)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.2"
                    value={config.flowField.lineWidth}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, lineWidth: Number(e.target.value) }
                    }))}
                    className="w-full accent-cyan-500 bg-zinc-800"
                  />
                </div>

                {/* Rotational Symmetry */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Simetria Rotacional Mandala</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.symmetry}x</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 4, 6, 8, 12].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => updateConfig(c => ({
                          ...c,
                          flowField: { ...c.flowField, symmetry: sym }
                        }))}
                        className={`flex-1 py-1 rounded text-xs font-mono font-medium border ${
                          config.flowField.symmetry === sym
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {sym === 1 ? 'None' : `${sym}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trail Fade / Decay */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Persistência / Decaimento de Rastro</span>
                    <span className="text-cyan-400 font-mono">{config.flowField.trailDecay.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.15"
                    step="0.005"
                    value={config.flowField.trailDecay}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, trailDecay: Number(e.target.value) }
                    }))}
                    className="w-full accent-cyan-500 bg-zinc-800"
                  />
                </div>

                {/* Bloom Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="text-xs text-zinc-300">Glow & Brilho Neon (Bloom)</span>
                  <input
                    type="checkbox"
                    checked={config.flowField.bloom}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      flowField: { ...c.flowField, bloom: e.target.checked }
                    }))}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* STRANGE ATTRACTORS PARAMS */}
            {algorithm === 'strange_attractors' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Atrator Estranho</span>
                  <select
                    value={config.strangeAttractor.attractorType}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      strangeAttractor: { ...c.strangeAttractor, attractorType: e.target.value as any }
                    }))}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="clifford">Clifford Attractor</option>
                    <option value="dejong">De Jong Chaos</option>
                    <option value="lorenz">Lorenz 3D Butterfly</option>
                    <option value="aizawa">Aizawa 3D Spherical</option>
                    <option value="thomas">Thomas Cycloid Chaos</option>
                    <option value="bedhead">Bedhead Attractor</option>
                  </select>
                </div>

                {/* Attractor Coefficients A, B, C, D */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Coeficientes da Equação Diferencial</span>
                  
                  {/* Coeff A */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Parâmetro a:</span>
                      <span className="text-pink-400">{config.strangeAttractor.a.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.05"
                      value={config.strangeAttractor.a}
                      onChange={(e) => updateConfig(c => ({
                        ...c,
                        strangeAttractor: { ...c.strangeAttractor, a: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-zinc-800"
                    />
                  </div>

                  {/* Coeff B */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Parâmetro b:</span>
                      <span className="text-pink-400">{config.strangeAttractor.b.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.05"
                      value={config.strangeAttractor.b}
                      onChange={(e) => updateConfig(c => ({
                        ...c,
                        strangeAttractor: { ...c.strangeAttractor, b: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-zinc-800"
                    />
                  </div>

                  {/* Coeff C */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Parâmetro c:</span>
                      <span className="text-pink-400">{config.strangeAttractor.c.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.05"
                      value={config.strangeAttractor.c}
                      onChange={(e) => updateConfig(c => ({
                        ...c,
                        strangeAttractor: { ...c.strangeAttractor, c: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-zinc-800"
                    />
                  </div>

                  {/* Coeff D */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Parâmetro d:</span>
                      <span className="text-pink-400">{config.strangeAttractor.d.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.05"
                      value={config.strangeAttractor.d}
                      onChange={(e) => updateConfig(c => ({
                        ...c,
                        strangeAttractor: { ...c.strangeAttractor, d: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-zinc-800"
                    />
                  </div>
                </div>

                {/* Exposure / Density */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Exposição & Densidade Logarítmica</span>
                    <span className="text-pink-400 font-mono">{config.strangeAttractor.exposure.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={config.strangeAttractor.exposure}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      strangeAttractor: { ...c.strangeAttractor, exposure: Number(e.target.value) }
                    }))}
                    className="w-full accent-pink-500 bg-zinc-800"
                  />
                </div>

                {/* 3D Rotation Y */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Rotação de Perspectiva 3D</span>
                    <span className="text-pink-400 font-mono">{config.strangeAttractor.rotationY}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={config.strangeAttractor.rotationY}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      strangeAttractor: { ...c.strangeAttractor, rotationY: Number(e.target.value) }
                    }))}
                    className="w-full accent-pink-500 bg-zinc-800"
                  />
                </div>
              </div>
            )}

            {/* SACRED GEOMETRY PARAMS */}
            {algorithm === 'sacred_geometry' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Tipo Geométrico</span>
                  <select
                    value={config.sacredGeometry.geometryType}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      sacredGeometry: { ...c.sacredGeometry, geometryType: e.target.value as any }
                    }))}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="phyllotaxis">Phyllotaxis Espiral de Fibonacci</option>
                    <option value="harmonograph">Harmonógrafo 4 Pêndulos</option>
                    <option value="mandala_epicycles">Mandala Epicíclica N-Fold</option>
                    <option value="torus_knot">Nó Toroidal 3D</option>
                  </select>
                </div>

                {/* Elements count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Número de Elementos / Nódulos</span>
                    <span className="text-amber-400 font-mono">{config.sacredGeometry.elementsCount}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2400"
                    step="50"
                    value={config.sacredGeometry.elementsCount}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      sacredGeometry: { ...c.sacredGeometry, elementsCount: Number(e.target.value) }
                    }))}
                    className="w-full accent-amber-500 bg-zinc-800"
                  />
                </div>

                {/* Wave Modulation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Modulação de Onda Harmônica</span>
                    <span className="text-amber-400 font-mono">{config.sacredGeometry.waveModulation.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5.0"
                    step="0.1"
                    value={config.sacredGeometry.waveModulation}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      sacredGeometry: { ...c.sacredGeometry, waveModulation: Number(e.target.value) }
                    }))}
                    className="w-full accent-amber-500 bg-zinc-800"
                  />
                </div>

                {/* Rotational symmetry */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Simetria Radial Mandala</span>
                    <span className="text-amber-400 font-mono">{config.sacredGeometry.rotationalSymmetry}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="16"
                    step="1"
                    value={config.sacredGeometry.rotationalSymmetry}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      sacredGeometry: { ...c.sacredGeometry, rotationalSymmetry: Number(e.target.value) }
                    }))}
                    className="w-full accent-amber-500 bg-zinc-800"
                  />
                </div>

                {/* Morph Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Velocidade de Morfismo</span>
                    <span className="text-amber-400 font-mono">{config.sacredGeometry.morphSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={config.sacredGeometry.morphSpeed}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      sacredGeometry: { ...c.sacredGeometry, morphSpeed: Number(e.target.value) }
                    }))}
                    className="w-full accent-amber-500 bg-zinc-800"
                  />
                </div>
              </div>
            )}

            {/* FRACTAL FLAME PARAMS */}
            {algorithm === 'fractal_flame' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Variação Não-Linear</span>
                  <select
                    value={config.fractalFlame.variation}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fractalFlame: { ...c.fractalFlame, variation: e.target.value as any }
                    }))}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="swirl">Swirl Vortex</option>
                    <option value="spherical">Spherical Inversion</option>
                    <option value="sinusoidal">Sinusoidal Warp</option>
                    <option value="horseshoe">Horseshoe</option>
                    <option value="polar">Polar Transform</option>
                    <option value="heart">Heart Curve</option>
                    <option value="julia">Julia Set Flame</option>
                  </select>
                </div>

                {/* Transforms count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Matrizes de Transformação Afim</span>
                    <span className="text-orange-400 font-mono">{config.fractalFlame.transformsCount}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={config.fractalFlame.transformsCount}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fractalFlame: { ...c.fractalFlame, transformsCount: Number(e.target.value) }
                    }))}
                    className="w-full accent-orange-500 bg-zinc-800"
                  />
                </div>

                {/* Vibrancy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Vibração & Intensidade de Cor</span>
                    <span className="text-orange-400 font-mono">{config.fractalFlame.vibrancy.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={config.fractalFlame.vibrancy}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fractalFlame: { ...c.fractalFlame, vibrancy: Number(e.target.value) }
                    }))}
                    className="w-full accent-orange-500 bg-zinc-800"
                  />
                </div>

                {/* Symmetry */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Simetria Radial IFS</span>
                    <span className="text-orange-400 font-mono">{config.fractalFlame.symmetry}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={config.fractalFlame.symmetry}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fractalFlame: { ...c.fractalFlame, symmetry: Number(e.target.value) }
                    }))}
                    className="w-full accent-orange-500 bg-zinc-800"
                  />
                </div>
              </div>
            )}

            {/* REACTION-DIFFUSION PARAMS */}
            {algorithm === 'reaction_diffusion' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Padrão Morfogenético</span>
                  <select
                    value={config.reactionDiffusion.presetPattern}
                    onChange={(e) => {
                      const val = e.target.value;
                      let f = 0.0545, k = 0.062;
                      if (val === 'mitosis') { f = 0.0367; k = 0.0649; }
                      else if (val === 'solitons') { f = 0.030; k = 0.062; }
                      else if (val === 'waves') { f = 0.025; k = 0.060; }
                      else if (val === 'spirals') { f = 0.018; k = 0.051; }
                      else if (val === 'chaos') { f = 0.026; k = 0.055; }

                      updateConfig(c => ({
                        ...c,
                        reactionDiffusion: {
                          ...c.reactionDiffusion,
                          presetPattern: val as any,
                          feedRate: f,
                          killRate: k
                        }
                      }));
                    }}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="coral">Coral Orgânico</option>
                    <option value="mitosis">Mitose Celular</option>
                    <option value="solitons">Solítons & Pulsos</option>
                    <option value="waves">Ondas Propagantes</option>
                    <option value="spirals">Espirais Belousov</option>
                    <option value="chaos">Caos Turbulento</option>
                  </select>
                </div>

                {/* Feed Rate F */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Taxa de Alimentação (F):</span>
                    <span className="text-emerald-400">{config.reactionDiffusion.feedRate.toFixed(4)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.09"
                    step="0.001"
                    value={config.reactionDiffusion.feedRate}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      reactionDiffusion: { ...c.reactionDiffusion, feedRate: Number(e.target.value) }
                    }))}
                    className="w-full accent-emerald-500 bg-zinc-800"
                  />
                </div>

                {/* Kill Rate K */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Taxa de Morte (k):</span>
                    <span className="text-emerald-400">{config.reactionDiffusion.killRate.toFixed(4)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.04"
                    max="0.07"
                    step="0.001"
                    value={config.reactionDiffusion.killRate}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      reactionDiffusion: { ...c.reactionDiffusion, killRate: Number(e.target.value) }
                    }))}
                    className="w-full accent-emerald-500 bg-zinc-800"
                  />
                </div>

                {/* Specular lighting */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="text-xs text-zinc-300">Iluminação Especular 3D (Relief)</span>
                  <input
                    type="checkbox"
                    checked={config.reactionDiffusion.specularLighting}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      reactionDiffusion: { ...c.reactionDiffusion, specularLighting: e.target.checked }
                    }))}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* VORONOI & DELAUNAY PARAMS */}
            {algorithm === 'voronoi_mesh' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Modo de Renderização</span>
                  <select
                    value={config.voronoi.renderMode}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      voronoi: { ...c.voronoi, renderMode: e.target.value as any }
                    }))}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="stained_glass">Vitral Cristalino (Stained Glass)</option>
                    <option value="cells">Células Voronoi Puras</option>
                    <option value="delaunay_mesh">Malha Dual Delaunay</option>
                  </select>
                </div>

                {/* Metric */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Métrica de Distância</span>
                  <select
                    value={config.voronoi.distanceMetric}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      voronoi: { ...c.voronoi, distanceMetric: e.target.value as any }
                    }))}
                    className="bg-zinc-900 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700/80 text-zinc-200"
                  >
                    <option value="euclidean">Euclidiana (Orgânica)</option>
                    <option value="manhattan">Manhattan (Geométrica)</option>
                    <option value="chebyshev">Chebyshev (Cúbica)</option>
                  </select>
                </div>

                {/* Cell count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Contagem de Células</span>
                    <span className="text-violet-400 font-mono">{config.voronoi.cellCount}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={config.voronoi.cellCount}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      voronoi: { ...c.voronoi, cellCount: Number(e.target.value) }
                    }))}
                    className="w-full accent-violet-500 bg-zinc-800"
                  />
                </div>

                {/* Domain Warp Distortion */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Distorção Não-Linear de Domínio</span>
                    <span className="text-violet-400 font-mono">{config.voronoi.warpDistortion.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.1"
                    value={config.voronoi.warpDistortion}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      voronoi: { ...c.voronoi, warpDistortion: Number(e.target.value) }
                    }))}
                    className="w-full accent-violet-500 bg-zinc-800"
                  />
                </div>
              </div>
            )}

            {/* FOURIER EPICYCLES PARAMS */}
            {algorithm === 'fourier_epicycles' && (
              <div className="space-y-4">
                {/* Harmonics Count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Número de Harmônicos Phasor</span>
                    <span className="text-sky-400 font-mono">{config.fourier.harmonicsCount}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={config.fourier.harmonicsCount}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fourier: { ...c.fourier, harmonicsCount: Number(e.target.value) }
                    }))}
                    className="w-full accent-sky-500 bg-zinc-800"
                  />
                </div>

                {/* Decay Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Taxa de Decaimento do Raio</span>
                    <span className="text-sky-400 font-mono">{config.fourier.decayRate.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="0.95"
                    step="0.02"
                    value={config.fourier.decayRate}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fourier: { ...c.fourier, decayRate: Number(e.target.value) }
                    }))}
                    className="w-full accent-sky-500 bg-zinc-800"
                  />
                </div>

                {/* Trail Length */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Comprimento do Rastro Orbital</span>
                    <span className="text-sky-400 font-mono">{config.fourier.trailLength}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={config.fourier.trailLength}
                    onChange={(e) => updateConfig(c => ({
                      ...c,
                      fourier: { ...c.fourier, trailLength: Number(e.target.value) }
                    }))}
                    className="w-full accent-sky-500 bg-zinc-800"
                  />
                </div>

                {/* Toggles for rings & vectors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-xs text-zinc-300">Mostrar Órbitas Circulares</span>
                    <input
                      type="checkbox"
                      checked={config.fourier.showRings}
                      onChange={(e) => updateConfig(c => ({
                        ...c,
                        fourier: { ...c.fourier, showRings: e.target.checked }
                      }))}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-xs text-zinc-300">Mostrar Vetores de Conexão</span>
                    <input
                      type="checkbox"
                      checked={config.fourier.showVectors}
                      onChange={(e) => updateConfig(c => ({
                        ...c,
                        fourier: { ...c.fourier, showVectors: e.target.checked }
                      }))}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2">Paleta Atual</span>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <div className="text-xs font-medium text-zinc-200">{config.palette.name}</div>
                <div className="h-6 rounded-lg flex overflow-hidden border border-zinc-700/60">
                  {config.palette.colors.map((hex, i) => (
                    <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Cor do Fundo do Canvas</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig(c => ({ ...c, backgroundColor: e.target.value }))}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig(c => ({ ...c, backgroundColor: e.target.value }))}
                  className="flex-1 bg-zinc-900 text-xs px-3 py-2 rounded-xl border border-zinc-700 text-zinc-200 font-mono"
                />
              </div>
            </div>

            {/* Transparent Background Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div>
                <span className="text-xs text-zinc-200 block font-medium">Fundo Transparente</span>
                <span className="text-[11px] text-zinc-400">Ideal para exportação PNG/SVG e design gráfico</span>
              </div>
              <input
                type="checkbox"
                checked={config.transparentBackground}
                onChange={(e) => updateConfig(c => ({ ...c, transparentBackground: e.target.checked }))}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* SCENE & SEED TAB */}
        {activeTab === 'scene' && (
          <div className="space-y-5">
            {/* Seed Controller */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Semente Procedural</span>
                <button
                  onClick={() => handleSeedChange(Math.floor(Math.random() * 999999))}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Nova Semente</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.seed}
                  onChange={(e) => handleSeedChange(Number(e.target.value) || 0)}
                  className="flex-1 bg-zinc-950 font-mono text-sm px-3 py-2 rounded-xl border border-zinc-700 text-zinc-100"
                />
                <button
                  onClick={() => handleSeedChange((config.seed + 1) % 1000000)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono text-zinc-200 border border-zinc-700"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Proporção da Tela (Aspect Ratio)</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'] as any[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => updateConfig(c => ({ ...c, aspectRatio: r }))}
                    className={`py-2 rounded-xl text-xs font-mono font-medium border ${
                      config.aspectRatio === r
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
