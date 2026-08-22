import { ArtConfig, PresetRecipe } from '../types/art';
import { CURATED_PALETTES } from './palettes';

export const DEFAULT_CONFIG: ArtConfig = {
  id: 'default',
  name: 'Cosmic Streamlines',
  algorithm: 'flow_field',
  seed: 481516,
  aspectRatio: '1:1',
  palette: CURATED_PALETTES[0], // Cyber Neon
  backgroundColor: '#090A10',
  transparentBackground: false,
  blendMode: 'source-over',
  invertColors: false,
  flowField: {
    particleCount: 1400,
    stepLength: 4,
    noiseScale: 3.5,
    curlStrength: 1.2,
    noiseType: 'curl',
    octaves: 4,
    persistence: 0.5,
    speed: 2.2,
    particleLifetime: 120,
    lineWidth: 1.5,
    opacity: 0.85,
    colorMode: 'angle',
    trailDecay: 0.03,
    symmetry: 1,
    bloom: true
  },
  strangeAttractor: {
    attractorType: 'clifford',
    iterations: 250000,
    dt: 0.015,
    a: -1.4,
    b: 1.6,
    c: 1.0,
    d: 0.7,
    pointSize: 1,
    glowRadius: 10,
    exposure: 1.2,
    colorMapping: 'lyapunov',
    projection3D: true,
    rotationX: 20,
    rotationY: 45,
    rotationZ: 0,
    zoom: 1.1
  },
  sacredGeometry: {
    geometryType: 'phyllotaxis',
    elementsCount: 900,
    goldenAngleMod: 0,
    waveModulation: 1.5,
    pendulumFrequencies: [3, 4, 3, 5],
    pendulumPhases: [0, Math.PI / 4, Math.PI / 2, 0],
    pendulumDamping: 0.2,
    rotationalSymmetry: 6,
    harmonics: 5,
    lineWidth: 1.8,
    glow: true,
    morphSpeed: 1.0
  },
  fractalFlame: {
    variation: 'swirl',
    transformsCount: 4,
    iterations: 350000,
    gamma: 2.2,
    vibrancy: 1.2,
    zoom: 1.0,
    rotation: 0,
    symmetry: 3
  },
  reactionDiffusion: {
    feedRate: 0.0545,
    killRate: 0.062,
    diffusionU: 1.0,
    diffusionV: 0.5,
    iterationsPerFrame: 12,
    presetPattern: 'coral',
    colorGradientSpread: 1.4,
    specularLighting: true
  },
  voronoi: {
    cellCount: 45,
    distanceMetric: 'euclidean',
    relaxationSteps: 3,
    renderMode: 'stained_glass',
    borderWidth: 1.5,
    colorJitter: 0.4,
    warpDistortion: 0.8
  },
  fourier: {
    harmonicsCount: 6,
    baseFrequency: 1,
    decayRate: 0.75,
    phaseShift: 45,
    trailLength: 600,
    showRings: true,
    showVectors: true,
    colorShift: 1.5,
    speed: 1.2
  }
};

export const MASTER_PRESETS: PresetRecipe[] = [
  {
    id: 'preset_cyber_flow',
    name: 'Cybernetic Flow',
    description: 'Turbulent curl noise streamlines with electric neon spectrum',
    category: 'Flow Fields',
    thumbnailGradient: 'from-cyan-500 via-fuchsia-500 to-indigo-600',
    config: {
      algorithm: 'flow_field',
      palette: CURATED_PALETTES[0],
      backgroundColor: '#070814',
      flowField: {
        ...DEFAULT_CONFIG.flowField,
        noiseType: 'curl',
        curlStrength: 1.6,
        particleCount: 1600,
        colorMode: 'angle',
        trailDecay: 0.02,
        symmetry: 1
      }
    }
  },
  {
    id: 'preset_mandala_vortex',
    name: 'Cosmic Mandala',
    description: '6-fold symmetric rotational particle vortex with soft bloom',
    category: 'Flow Fields',
    thumbnailGradient: 'from-amber-400 via-rose-500 to-purple-800',
    config: {
      algorithm: 'flow_field',
      palette: CURATED_PALETTES[1],
      backgroundColor: '#080312',
      flowField: {
        ...DEFAULT_CONFIG.flowField,
        noiseType: 'vortex',
        particleCount: 1200,
        symmetry: 6,
        colorMode: 'radial',
        trailDecay: 0.04,
        bloom: true
      }
    }
  },
  {
    id: 'preset_clifford_dream',
    name: 'Clifford Chaos Veil',
    description: 'High-density strange attractor with Lyapunov phase coloring',
    category: 'Chaos Theory',
    thumbnailGradient: 'from-purple-600 via-pink-500 to-amber-400',
    config: {
      algorithm: 'strange_attractors',
      palette: CURATED_PALETTES[6], // Thermal
      backgroundColor: '#05000E',
      strangeAttractor: {
        ...DEFAULT_CONFIG.strangeAttractor,
        attractorType: 'clifford',
        a: -1.7,
        b: 1.8,
        c: -1.9,
        d: -0.4,
        exposure: 1.4,
        colorMapping: 'lyapunov'
      }
    }
  },
  {
    id: 'preset_lorenz_nebula',
    name: 'Lorenz Butterfly 3D',
    description: 'Atmospheric convection chaos rendered in glowing 3D perspective',
    category: 'Chaos Theory',
    thumbnailGradient: 'from-blue-600 via-teal-400 to-emerald-300',
    config: {
      algorithm: 'strange_attractors',
      palette: CURATED_PALETTES[3], // Bioluminescence
      backgroundColor: '#020910',
      strangeAttractor: {
        ...DEFAULT_CONFIG.strangeAttractor,
        attractorType: 'lorenz',
        iterations: 350000,
        dt: 0.008,
        exposure: 1.5,
        projection3D: true,
        rotationX: 25,
        rotationY: 60,
        zoom: 1.4
      }
    }
  },
  {
    id: 'preset_golden_sun',
    name: 'Phyllotaxis Fibonacci',
    description: 'Golden angle distribution with dynamic wave modulation',
    category: 'Sacred Geometry',
    thumbnailGradient: 'from-amber-300 via-yellow-500 to-stone-900',
    config: {
      algorithm: 'sacred_geometry',
      palette: CURATED_PALETTES[5], // Monolith gold
      backgroundColor: '#0D0D10',
      sacredGeometry: {
        ...DEFAULT_CONFIG.sacredGeometry,
        geometryType: 'phyllotaxis',
        elementsCount: 1100,
        waveModulation: 2.2,
        goldenAngleMod: 0,
        glow: true
      }
    }
  },
  {
    id: 'preset_harmonograph_pendulum',
    name: 'Quad Harmonograph',
    description: 'Simulated 4-pendulum physical resonance decay curve',
    category: 'Sacred Geometry',
    thumbnailGradient: 'from-pink-500 via-purple-500 to-indigo-500',
    config: {
      algorithm: 'sacred_geometry',
      palette: CURATED_PALETTES[7], // Pastel
      backgroundColor: '#0A0814',
      sacredGeometry: {
        ...DEFAULT_CONFIG.sacredGeometry,
        geometryType: 'harmonograph',
        pendulumFrequencies: [2.01, 3.0, 3.01, 2.0],
        pendulumPhases: [0, Math.PI / 3, Math.PI / 2, Math.PI / 6],
        pendulumDamping: 0.15,
        lineWidth: 1.6
      }
    }
  },
  {
    id: 'preset_fractal_swirl',
    name: 'Solar Flame IFS',
    description: 'Iterated function flame with multi-variation swirl chaos',
    category: 'Fractal Flames',
    thumbnailGradient: 'from-red-600 via-orange-500 to-yellow-300',
    config: {
      algorithm: 'fractal_flame',
      palette: CURATED_PALETTES[2], // Solar flare
      backgroundColor: '#0C0300',
      fractalFlame: {
        ...DEFAULT_CONFIG.fractalFlame,
        variation: 'swirl',
        transformsCount: 5,
        symmetry: 4,
        gamma: 2.4,
        vibrancy: 1.3
      }
    }
  },
  {
    id: 'preset_turing_coral',
    name: 'Turing Bio-Morph',
    description: 'Gray-Scott reaction-diffusion organic coral morphogenesis',
    category: 'Reaction-Diffusion',
    thumbnailGradient: 'from-emerald-400 via-teal-600 to-blue-900',
    config: {
      algorithm: 'reaction_diffusion',
      palette: CURATED_PALETTES[3], // Bioluminescence
      backgroundColor: '#020C14',
      reactionDiffusion: {
        ...DEFAULT_CONFIG.reactionDiffusion,
        feedRate: 0.0545,
        killRate: 0.062,
        presetPattern: 'coral',
        specularLighting: true
      }
    }
  },
  {
    id: 'preset_voronoi_glass',
    name: 'Crystalline Cathedral',
    description: 'Relaxed Voronoi cells with domain warping & stained glass glow',
    category: 'Voronoi & Meshes',
    thumbnailGradient: 'from-blue-500 via-indigo-600 to-violet-800',
    config: {
      algorithm: 'voronoi_mesh',
      palette: CURATED_PALETTES[0],
      backgroundColor: '#050711',
      voronoi: {
        ...DEFAULT_CONFIG.voronoi,
        cellCount: 55,
        renderMode: 'stained_glass',
        warpDistortion: 1.2,
        borderWidth: 1.5
      }
    }
  },
  {
    id: 'preset_fourier_epicycles',
    name: 'Quantum Epicycles',
    description: 'Fourier harmonic rotating orbital phasors with light trapping',
    category: 'Fourier Epicycles',
    thumbnailGradient: 'from-cyan-400 via-sky-500 to-fuchsia-500',
    config: {
      algorithm: 'fourier_epicycles',
      palette: CURATED_PALETTES[9], // Vaporwave
      backgroundColor: '#0D0818',
      fourier: {
        ...DEFAULT_CONFIG.fourier,
        harmonicsCount: 7,
        decayRate: 0.72,
        trailLength: 800,
        showRings: true
      }
    }
  }
];
