/**
 * AuraGen - Generative Art Studio
 * Core Types & Interfaces
 */

export type AlgorithmType = 
  | 'flow_field'
  | 'strange_attractors'
  | 'sacred_geometry'
  | 'fractal_flame'
  | 'reaction_diffusion'
  | 'voronoi_mesh'
  | 'fourier_epicycles';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // Hex codes
  background: string;
  isDark: boolean;
}

// Flow Field Parameters
export interface FlowFieldParams {
  particleCount: number;
  stepLength: number;
  noiseScale: number;
  curlStrength: number;
  noiseType: 'perlin' | 'simplex' | 'curl' | 'vortex';
  octaves: number;
  persistence: number;
  speed: number;
  particleLifetime: number;
  lineWidth: number;
  opacity: number;
  colorMode: 'palette' | 'velocity' | 'angle' | 'radial';
  trailDecay: number; // 0 = permanent trails, >0 = fading
  symmetry: number; // 1 = none, 2, 4, 6, 8 fold symmetry
  bloom: boolean;
}

// Strange Attractors Parameters
export interface StrangeAttractorParams {
  attractorType: 'lorenz' | 'clifford' | 'dejong' | 'aizawa' | 'thomas' | 'bedhead';
  iterations: number;
  dt: number;
  a: number;
  b: number;
  c: number;
  d: number;
  pointSize: number;
  glowRadius: number;
  exposure: number; // log density factor
  colorMapping: 'lyapunov' | 'velocity' | 'z_depth' | 'palette_cycle';
  projection3D: boolean;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  zoom: number;
}

// Sacred Geometry & Harmonograph Parameters
export interface SacredGeometryParams {
  geometryType: 'phyllotaxis' | 'harmonograph' | 'mandala_epicycles' | 'torus_knot';
  elementsCount: number;
  goldenAngleMod: number; // 137.5 + offset
  waveModulation: number;
  pendulumFrequencies: [number, number, number, number];
  pendulumPhases: [number, number, number, number];
  pendulumDamping: number;
  rotationalSymmetry: number;
  harmonics: number;
  lineWidth: number;
  glow: boolean;
  morphSpeed: number;
}

// Fractal Flame Parameters
export interface FractalFlameParams {
  variation: 'linear' | 'sinusoidal' | 'spherical' | 'swirl' | 'horseshoe' | 'polar' | 'heart' | 'disc' | 'julia';
  transformsCount: number;
  iterations: number;
  gamma: number;
  vibrancy: number;
  zoom: number;
  rotation: number;
  symmetry: number;
}

// Reaction Diffusion Parameters
export interface ReactionDiffusionParams {
  feedRate: number; // F (0.01 - 0.09)
  killRate: number; // k (0.04 - 0.07)
  diffusionU: number;
  diffusionV: number;
  iterationsPerFrame: number;
  presetPattern: 'coral' | 'mitosis' | 'solitons' | 'waves' | 'spirals' | 'chaos';
  colorGradientSpread: number;
  specularLighting: boolean;
}

// Voronoi & Delaunay Parameters
export interface VoronoiParams {
  cellCount: number;
  distanceMetric: 'euclidean' | 'manhattan' | 'chebyshev';
  relaxationSteps: number; // Lloyd's relaxation
  renderMode: 'cells' | 'delaunay_mesh' | 'stained_glass' | 'centroids';
  borderWidth: number;
  colorJitter: number;
  warpDistortion: number;
}

// Fourier Epicycles Parameters
export interface FourierParams {
  harmonicsCount: number;
  baseFrequency: number;
  decayRate: number;
  phaseShift: number;
  trailLength: number;
  showRings: boolean;
  showVectors: boolean;
  colorShift: number;
  speed: number;
}

export interface ArtConfig {
  id: string;
  name: string;
  algorithm: AlgorithmType;
  seed: number;
  aspectRatio: AspectRatio;
  palette: ColorPalette;
  backgroundColor: string;
  transparentBackground: boolean;
  blendMode: GlobalCompositeOperation;
  invertColors: boolean;
  flowField: FlowFieldParams;
  strangeAttractor: StrangeAttractorParams;
  sacredGeometry: SacredGeometryParams;
  fractalFlame: FractalFlameParams;
  reactionDiffusion: ReactionDiffusionParams;
  voronoi: VoronoiParams;
  fourier: FourierParams;
}

export interface PresetRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Partial<ArtConfig>;
  thumbnailGradient: string;
}

export interface ExportOptions {
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp' | 'svg';
  quality: number; // 0.1 - 1.0
  scaleFactor: 1 | 2 | 4 | 8; // 1x, 2K, 4K, 8K
  includeWatermark: boolean;
  watermarkText: string;
  presetName: string;
}

export interface SavedArtwork {
  id: string;
  name: string;
  date: string;
  thumbnailDataUrl: string;
  config: ArtConfig;
}

export interface CanvasPointerEvent {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  isDown: boolean;
  mode: 'none' | 'attract' | 'repel' | 'swirl' | 'paint';
}
